import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import type { PerformanceInsight, Player } from '../store/gameStore';
import { playGameEnd } from '../game/sounds';
import { ACHIEVEMENTS } from '../game/achievements';
import ResultsShareCard from './ResultsShareCard';
import { saveGameRecord } from './GameHistory';

// Animated counter hook — counts from 0 to target with easing
function useCounter(target: number, duration: number, startDelay: number, active: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    }, startDelay);
    return () => { clearTimeout(timeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, startDelay, active]);

  return value;
}

// Confetti particle system
function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f5c842', '#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#14b8a6'];

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      w: number; h: number; color: string; rotation: number;
      rotSpeed: number; life: number; maxLife: number; gravity: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.3,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 14 - 4,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: 120 + Math.random() * 80,
        gravity: 0.12 + Math.random() * 0.06,
      });
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.life++;
        if (p.life > p.maxLife) continue;
        alive = true;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  if (!active) return null;
  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 200, pointerEvents: 'none',
    }} />
  );
}

// Reveal phase type
type RevealPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export default function ResultsScreen() {
  const { matchResult, mySocketId, myPlayer, room, playAgain, soundEnabled } = useGameStore();
  const [phase, setPhase] = useState<RevealPhase>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [narrativeText, setNarrativeText] = useState('');
  const savedRef = useRef(false);

  // Save game record
  useEffect(() => {
    if (savedRef.current || !matchResult) return;
    savedRef.current = true;
    const my = matchResult.playerResults.find(r => r.playerId === mySocketId);
    if (my) {
      saveGameRecord({
        date: new Date().toISOString(),
        personaName: my.personaName,
        missionTitle: my.missionTitle,
        missionStatus: my.missionStatus,
        score: my.score,
        rank: my.rank,
        totalPlayers: matchResult.playerResults.length,
        dilemmaCount: my.dilemmasResolved.length,
        helpedCount: my.cooperationCount,
        duration: matchResult.matchDurationActual,
      });
    }
  }, [matchResult, mySocketId]);

  // Staged reveal timeline
  useEffect(() => {
    if (!matchResult) return;
    if (soundEnabled) playGameEnd();

    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => setPhase(3), 3800),
      setTimeout(() => setPhase(4), 5200),
      setTimeout(() => setPhase(5), 6200),
      setTimeout(() => setPhase(6), 7200),
    ];

    // Confetti on win
    const isWinner = mySocketId === matchResult.winnerId;
    if (isWinner) {
      timers.push(setTimeout(() => setShowConfetti(true), 2000));
    }

    return () => timers.forEach(clearTimeout);
  }, [matchResult, soundEnabled, mySocketId]);

  // Typewriter narrative
  const myResult = matchResult?.playerResults.find(r => r.playerId === mySocketId);
  useEffect(() => {
    if (phase < 3 || !myResult?.narrative) return;
    const full = myResult.narrative;
    let i = 0;
    const interval = setInterval(() => {
      i += 2;
      setNarrativeText(full.slice(0, i));
      if (i >= full.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [phase >= 3, myResult?.narrative]);

  if (!matchResult) return null;

  const earnedAchievements = myPlayer ? ACHIEVEMENTS.filter(a => {
    try { return a.check(myPlayer, room?.tick || matchResult.totalTicks); } catch { return false; }
  }) : [];

  const { playerResults, winnerName, highlightEvents } = matchResult;
  const isWinner = mySocketId === matchResult.winnerId;
  const myScore = myResult?.score || 0;
  const myRank = myResult?.rank || 0;
  const totalPlayers = playerResults.length;

  // Animated counters
  const scoreCount = useCounter(myScore, 1800, 0, phase >= 3);
  const trustCount = useCounter(myResult?.socialTrust || 0, 1200, 200, phase >= 3);
  const communityCount = useCounter(Math.abs(myResult?.communityImpact || 0), 1200, 400, phase >= 3);

  const statusColors: Record<string, string> = {
    completed: '#22c55e', partial: '#f5c842', failed: '#ef4444', active: '#94a3b8'
  };

  const statusLabels: Record<string, string> = {
    completed: 'COMPLETED', partial: 'PARTIAL', failed: 'FAILED', active: 'ACTIVE'
  };

  const sectionStyle = (minPhase: RevealPhase, delay = 0): React.CSSProperties => ({
    opacity: phase >= minPhase ? 1 : 0,
    transform: phase >= minPhase ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
  });

  return (
    <div style={{
      width: '100%', height: '100%',
      overflowY: phase >= 4 ? 'auto' : 'hidden',
      background: 'var(--bg-primary)',
      position: 'relative',
    }}>
      <ConfettiCanvas active={showConfetti} />

      {/* Phase 0: Cinematic fade-in overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'var(--bg-primary)',
        opacity: phase >= 1 ? 0 : 1,
        transition: 'opacity 1.2s ease',
        pointerEvents: phase >= 1 ? 'none' : 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          textAlign: 'center',
          opacity: phase >= 0 ? 1 : 0,
          transform: phase >= 0 ? 'scale(1)' : 'scale(0.9)',
          transition: 'all 0.8s ease 0.3s',
        }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.4em', color: 'var(--text-muted)',
            textTransform: 'uppercase', marginBottom: '12px',
          }}>
            In Their Shoes
          </div>
          <div style={{
            fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: 800,
            background: 'linear-gradient(135deg, #f5c842, #f97316)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.15em',
          }}>
            MATCH COMPLETE
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '800px', margin: '0 auto',
        padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '24px',
        position: 'relative', zIndex: 1,
      }}>

        {/* === PHASE 1: Winner Banner === */}
        <div style={{
          padding: '32px 24px', borderRadius: '20px',
          background: isWinner
            ? 'linear-gradient(135deg, rgba(245,200,66,0.2) 0%, rgba(249,115,22,0.12) 50%, rgba(245,200,66,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          border: `1px solid ${isWinner ? 'rgba(245,200,66,0.35)' : 'rgba(59,130,246,0.25)'}`,
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          ...sectionStyle(1),
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
            width: '300px', height: '300px', borderRadius: '50%',
            background: isWinner
              ? 'radial-gradient(circle, rgba(245,200,66,0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Floating particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${2 + i % 3}px`, height: `${2 + i % 3}px`,
              borderRadius: '50%',
              background: isWinner ? 'rgba(245,200,66,0.4)' : 'rgba(59,130,246,0.3)',
              left: `${10 + i * 12}%`,
              top: `${15 + (i * 20) % 70}%`,
              animation: `dilemmaFloat ${5 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              pointerEvents: 'none',
            }} />
          ))}

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '48px', marginBottom: '12px',
              filter: isWinner ? 'drop-shadow(0 0 20px rgba(245,200,66,0.5))' : 'none',
            }}>
              {isWinner ? '🏆' : '🏙️'}
            </div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.3em', color: 'var(--text-muted)',
              textTransform: 'uppercase', marginBottom: '8px',
            }}>
              {isWinner ? 'VICTORY' : 'GAME OVER'}
            </div>
            {winnerName ? (
              <>
                <h1 style={{
                  fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800,
                  color: isWinner ? '#f5c842' : 'var(--text-primary)',
                  margin: 0, lineHeight: 1.3,
                }}>
                  {isWinner ? 'You win!' : `${winnerName} wins!`}
                </h1>
                {isWinner && (
                  <div style={{
                    color: '#22c55e', marginTop: '8px', fontWeight: 600, fontSize: '14px',
                    animation: 'fadeInUp 0.6s ease 0.3s both',
                  }}>
                    Outstanding work, survivor.
                  </div>
                )}
              </>
            ) : (
              <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Game Over</h1>
            )}
            <div style={{
              marginTop: '12px', color: 'var(--text-muted)', fontSize: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
            }}>
              <span>Duration: {Math.floor(matchResult.matchDurationActual / 60)}m {matchResult.matchDurationActual % 60}s</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>{totalPlayers} player{totalPlayers !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* === PHASE 2: Rank & Score Reveal === */}
        {myResult && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '20px', alignItems: 'center',
            padding: '24px', borderRadius: '16px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            ...sectionStyle(2),
          }}>
            {/* Rank circle */}
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: `conic-gradient(
                ${statusColors[myResult.missionStatus]} ${(myScore / 100) * 360}deg,
                rgba(255,255,255,0.05) 0deg
              )`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              animation: phase >= 2 ? 'rankPulse 2s ease infinite' : 'none',
            }}>
              <div style={{
                width: '76px', height: '76px', borderRadius: '50%',
                background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <div style={{
                  fontSize: '28px', fontWeight: 800,
                  color: myRank === 1 ? '#f5c842' : 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  #{myRank}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                  of {totalPlayers}
                </div>
              </div>
            </div>

            {/* Score + stats */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: 'clamp(32px, 6vw, 44px)', fontWeight: 800,
                  background: 'linear-gradient(135deg, #f5c842, #f97316)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {scoreCount}
                </span>
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {myResult.personaName} — {myResult.missionTitle}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: '20px',
                background: `${statusColors[myResult.missionStatus]}18`,
                border: `1px solid ${statusColors[myResult.missionStatus]}33`,
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: statusColors[myResult.missionStatus],
                  boxShadow: `0 0 8px ${statusColors[myResult.missionStatus]}`,
                }} />
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  color: statusColors[myResult.missionStatus],
                  letterSpacing: '0.1em',
                }}>
                  MISSION {statusLabels[myResult.missionStatus] || 'ENDED'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* === PHASE 3: Journey Narrative (typewriter) === */}
        {myResult && (
          <div style={{
            padding: '20px 24px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.04))',
            border: '1px solid rgba(139,92,246,0.15)',
            ...sectionStyle(3),
          }}>
            <div style={{
              fontSize: '10px', letterSpacing: '0.2em', color: 'var(--accent-purple)',
              textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700,
            }}>
              Your Journey
            </div>
            <p style={{
              fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8,
              margin: 0, minHeight: '40px',
            }}>
              {narrativeText}
              {narrativeText.length < (myResult.narrative?.length || 0) && (
                <span style={{ animation: 'cursorBlink 0.8s step-end infinite' }}>|</span>
              )}
            </p>
            {/* Quick stats row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px', marginTop: '16px',
              opacity: phase >= 3 ? 1 : 0,
              transition: 'opacity 0.6s ease 0.8s',
            }}>
              <MiniStat label="Social Trust" value={trustCount} color="var(--accent-green)" />
              <MiniStat
                label="Community"
                value={communityCount}
                prefix={(myResult.communityImpact || 0) >= 0 ? '+' : '-'}
                color={(myResult.communityImpact || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}
              />
              <MiniStat label="Helped Others" value={myResult.cooperationCount} color="var(--accent-teal)" />
            </div>
          </div>
        )}

        {/* === PHASE 4: Animated Score Breakdown === */}
        {myResult?.scoreBreakdown && (
          <div style={{
            padding: '24px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(249,115,22,0.05))',
            border: '1px solid rgba(245,200,66,0.2)',
            ...sectionStyle(4),
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px',
            }}>
              <span style={{ fontSize: '20px' }}>📊</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent-yellow)' }}>
                  Score Breakdown
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  How your {myResult.scoreBreakdown.total} points were earned
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <AnimatedScoreRow label="Mission Objectives" value={myResult.scoreBreakdown.missionPoints} max={60}
                description="Complete required objectives" color="#f5c842" delay={0} active={phase >= 4} />
              <AnimatedScoreRow label="Optional Objectives" value={myResult.scoreBreakdown.optionalBonus} max={30}
                description="Bonus for optional completions" color="#a78bfa" delay={150} active={phase >= 4} />
              <AnimatedScoreRow label="Cash Remaining" value={myResult.scoreBreakdown.cashBonus} max={20}
                description="1 pt per ₹10 at game end" color="#22c55e" delay={300} active={phase >= 4} />
              <AnimatedScoreRow label="Social Trust" value={myResult.scoreBreakdown.trustBonus} max={50}
                description="Built by helping others" color="#3b82f6" delay={450} active={phase >= 4} />
              <AnimatedScoreRow label="Community Impact" value={myResult.scoreBreakdown.communityBonus} max={50}
                description="Positive community choices" color="#10b981" delay={600} active={phase >= 4} />
            </div>
          </div>
        )}

        {/* === PHASE 5: Performance, Persona Lens, Dilemmas === */}
        {myResult?.performanceInsights && myResult.performanceInsights.length > 0 && (
          <div style={{ ...sectionStyle(5) }}>
            <div style={{
              padding: '24px', borderRadius: '14px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <span style={{ fontSize: '20px' }}>🎯</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>Performance Analysis</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Strengths, improvements, and tips
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myResult.performanceInsights.map((insight, i) => (
                  <InsightRow key={i} insight={insight} delay={i * 100} active={phase >= 5} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Persona Lens */}
        {myResult?.personaLens && myResult.personaLens.length > 0 && (
          <div style={{ ...sectionStyle(5, 200) }}>
            <div style={{
              padding: '24px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.06))',
              border: '1px solid rgba(139,92,246,0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '20px' }}>🔍</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#a78bfa' }}>
                    Persona Lens: {myResult.personaName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Why does this persona make these decisions?
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myResult.personaLens.map((line, i) => (
                  <div key={i} style={{
                    padding: '14px 16px', borderRadius: '10px',
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.15)',
                    fontSize: '14px', color: '#c4b5fd', lineHeight: 1.7,
                    borderLeft: '3px solid rgba(139,92,246,0.5)',
                    opacity: phase >= 5 ? 1 : 0,
                    transform: phase >= 5 ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `all 0.5s ease ${300 + i * 150}ms`,
                  }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dilemma Choices */}
        {myResult?.dilemmasResolved && myResult.dilemmasResolved.length > 0 && (
          <div style={{ ...sectionStyle(5, 400) }}>
            <div style={{
              padding: '20px', borderRadius: '14px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>
                Social Dilemmas Faced
              </div>
              {myResult.dilemmasResolved.map((d, i) => (
                <div key={i} style={{
                  padding: '12px 14px', borderRadius: '10px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  marginBottom: '8px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  opacity: phase >= 5 ? 1 : 0,
                  transform: phase >= 5 ? 'translateY(0)' : 'translateY(10px)',
                  transition: `all 0.4s ease ${500 + i * 120}ms`,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{d.dilemmaTitle}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>You chose:</span>
                      <span style={{
                        color: '#fbbf24', background: 'rgba(251,191,36,0.1)',
                        padding: '2px 8px', borderRadius: '10px', fontWeight: 600,
                      }}>
                        {d.choiceLabel}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                    T+{d.tick}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PHASE 6: Achievements, Comparison, All Players, Highlights === */}
        {earnedAchievements.length > 0 && (
          <div style={{ ...sectionStyle(6) }}>
            <div style={{
              padding: '20px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(168,85,247,0.06))',
              border: '1px solid rgba(245,200,66,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '20px' }}>🏅</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>Achievements Earned</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {earnedAchievements.length} of {ACHIEVEMENTS.length} unlocked
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                {earnedAchievements.map((a, i) => (
                  <div key={a.id} style={{
                    padding: '10px 12px', borderRadius: '10px',
                    background: 'rgba(245,200,66,0.08)',
                    border: '1px solid rgba(245,200,66,0.15)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    opacity: phase >= 6 ? 1 : 0,
                    transform: phase >= 6 ? 'scale(1)' : 'scale(0.8)',
                    transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms`,
                  }}>
                    <span style={{ fontSize: '18px' }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{a.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{a.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              {earnedAchievements.length < ACHIEVEMENTS.length && (
                <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  {ACHIEVEMENTS.length - earnedAchievements.length} more to discover...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Score Comparison */}
        {playerResults.length > 1 && (
          <div style={{ ...sectionStyle(6, 200) }}>
            <div style={{
              padding: '20px', borderRadius: '14px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>Score Comparison</div>
              {playerResults.map((r, idx) => {
                const isMe = r.playerId === mySocketId;
                return (
                  <div key={r.playerId} style={{
                    marginBottom: '10px',
                    opacity: phase >= 6 ? 1 : 0,
                    transform: phase >= 6 ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `all 0.5s ease ${300 + idx * 120}ms`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: isMe ? 700 : 400,
                        color: isMe ? 'var(--accent-yellow)' : 'var(--text-secondary)',
                      }}>
                        #{r.rank} {r.playerName} {isMe ? '(you)' : ''}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
                        {r.score}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '4px',
                        width: phase >= 6 ? `${r.score}%` : '0%',
                        background: isMe
                          ? 'linear-gradient(90deg, #f5c842, #f97316)'
                          : `hsl(${r.playerName.charCodeAt(0) * 7}deg 50% 45%)`,
                        transition: `width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${400 + idx * 120}ms`,
                      }} />
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {r.personaName} — {r.missionTitle} ({r.missionStatus})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Players */}
        <div style={{ ...sectionStyle(6, 400) }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>All Players</h2>
          {playerResults.map((result, idx) => (
            <PlayerCard key={result.playerId} result={result} isMe={result.playerId === mySocketId}
              isWinner={result.playerId === matchResult.winnerId} statusColors={statusColors}
              phase={phase} idx={idx} />
          ))}
        </div>

        {/* Walk in Their Shoes */}
        {playerResults.length > 1 && (
          <div style={{ ...sectionStyle(6, 600) }}>
            <div style={{
              padding: '20px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(168,85,247,0.06))',
              border: '1px solid rgba(59,130,246,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '20px' }}>👟</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>Walk in Their Shoes</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    How did each persona's background shape their journey?
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {playerResults.map(r => (
                  <div key={r.playerId} style={{
                    padding: '14px', borderRadius: '10px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>{r.playerName}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>as {r.personaName}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: '4px', fontSize: '10px',
                          background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)',
                        }}>
                          Helped {r.cooperationCount}
                        </span>
                        <span style={{
                          padding: '2px 6px', borderRadius: '4px', fontSize: '10px',
                          background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)',
                        }}>
                          Dilemmas {r.dilemmasResolved.length}
                        </span>
                      </div>
                    </div>
                    {r.dilemmasResolved.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {r.dilemmasResolved.map((d, i) => (
                          <div key={i} style={{
                            padding: '3px 8px', borderRadius: '12px', fontSize: '10px',
                            background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontWeight: 600,
                          }}>
                            {d.dilemmaTitle}: {d.choiceLabel}
                          </div>
                        ))}
                      </div>
                    )}
                    {r.personaLens && r.personaLens.length > 0 && (
                      <div style={{
                        marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)',
                        fontStyle: 'italic', lineHeight: 1.5,
                        paddingLeft: '8px', borderLeft: '2px solid rgba(139,92,246,0.3)',
                      }}>
                        {r.personaLens[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Match Highlights */}
        {highlightEvents.length > 0 && (
          <div style={{ ...sectionStyle(6, 800) }}>
            <div style={{
              padding: '20px', borderRadius: '14px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '14px', fontSize: '16px' }}>Match Highlights</h3>
              {highlightEvents.map(evt => (
                <div key={evt.id} style={{
                  padding: '8px 12px', borderRadius: '8px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)',
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginRight: '8px' }}>
                    T+{evt.tick}s
                  </span>
                  {evt.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Card */}
        <div style={{ ...sectionStyle(6, 1000) }}>
          <ResultsShareCard />
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '24px',
          ...sectionStyle(6, 1200),
        }}>
          <button
            onClick={() => {
              if (!myResult) return;
              const text = [
                `🏙️ Kolkata City Survival — Results`,
                ``,
                `I played as ${myResult.personaName}`,
                `Mission: ${myResult.missionTitle} (${myResult.missionStatus})`,
                `Score: ${myResult.score}/100 | Rank: #${myResult.rank}/${playerResults.length}`,
                `Social Trust: ${myResult.socialTrust} | Community: ${myResult.communityImpact >= 0 ? '+' : ''}${myResult.communityImpact}`,
                `Helped ${myResult.cooperationCount} player(s) | Faced ${myResult.dilemmasResolved.length} dilemma(s)`,
                ``,
                myResult.dilemmasResolved.length > 0
                  ? `Dilemma choices: ${myResult.dilemmasResolved.map(d => `${d.dilemmaTitle} → ${d.choiceLabel}`).join(', ')}`
                  : '',
                ``,
                `"${myResult.narrative}"`,
                ``,
                `🎮 In Their Shoes — Walk a mile in someone else's life`,
              ].filter(Boolean).join('\n');
              navigator.clipboard?.writeText(text);
            }}
            style={{
              flex: 1, padding: '14px', borderRadius: '12px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px',
            }}
          >
            📋 Copy Results
          </button>
          <button
            onClick={playAgain}
            style={{
              flex: 2, padding: '14px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #f5c842, #f97316)',
              color: '#000', fontWeight: 700, fontSize: '15px',
              boxShadow: '0 4px 20px rgba(245,200,66,0.3)',
            }}
          >
            Play Again
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rankPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,200,66,0.2); }
          50% { box-shadow: 0 0 0 8px rgba(245,200,66,0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function MiniStat({ label, value, color, prefix }: {
  label: string; value: number; color: string; prefix?: string;
}) {
  return (
    <div style={{
      textAlign: 'center', padding: '10px 8px', borderRadius: '10px',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{
        fontWeight: 700, fontSize: '20px', color,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {prefix || ''}{value}
      </div>
    </div>
  );
}

function AnimatedScoreRow({ label, value, max, description, color, delay, active }: {
  label: string; value: number; max: number; description: string;
  color: string; delay: number; active: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const count = useCounter(value, 1000, delay, active);

  return (
    <div style={{
      padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-secondary)',
      opacity: active ? 1 : 0,
      transform: active ? 'translateX(0)' : 'translateX(-20px)',
      transition: `all 0.5s ease ${delay}ms`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '14px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
          {count > 0 ? '+' : ''}{count} pts
        </span>
      </div>
      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          width: active ? `${pct}%` : '0%',
          background: color,
          transition: `width 1s cubic-bezier(0.22, 1, 0.36, 1) ${delay + 200}ms`,
        }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{description}</div>
    </div>
  );
}

function InsightRow({ insight, delay, active }: {
  insight: PerformanceInsight; delay: number; active: boolean;
}) {
  const config = {
    strength: { icon: '✅', label: 'Strength', border: 'rgba(34,197,94,0.3)', bg: 'rgba(34,197,94,0.06)', color: '#4ade80' },
    weakness: { icon: '⚠️', label: 'Improve', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.06)', color: '#f87171' },
    tip: { icon: '💡', label: 'Tip', border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.06)', color: '#60a5fa' },
  }[insight.category];

  return (
    <div style={{
      padding: '12px 14px', borderRadius: '10px',
      background: config.bg, border: `1px solid ${config.border}`,
      borderLeft: `3px solid ${config.color}`,
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      opacity: active ? 1 : 0,
      transform: active ? 'translateX(0)' : 'translateX(-15px)',
      transition: `all 0.4s ease ${delay}ms`,
    }}>
      <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{config.icon}</span>
      <div>
        <div style={{
          fontSize: '10px', color: config.color, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px',
        }}>
          {config.label}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {insight.text}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ result, isMe, isWinner, statusColors, phase, idx }: {
  result: any; isMe: boolean; isWinner: boolean;
  statusColors: Record<string, string>; phase: RevealPhase; idx: number;
}) {
  const statusIcons: Record<string, string> = {
    completed: '✅', partial: '◑', failed: '❌', active: '⏳',
  };

  return (
    <div style={{
      padding: '18px', borderRadius: '12px',
      background: isMe ? 'rgba(245,200,66,0.05)' : 'var(--bg-card)',
      border: `1px solid ${isMe ? 'rgba(245,200,66,0.2)' : 'var(--border)'}`,
      marginBottom: '12px',
      opacity: phase >= 6 ? 1 : 0,
      transform: phase >= 6 ? 'translateY(0)' : 'translateY(15px)',
      transition: `all 0.5s ease ${500 + idx * 100}ms`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: `hsl(${result.playerName.charCodeAt(0) * 7}deg 60% 40%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#fff',
            }}>
              #{result.rank}
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>{result.playerName}</span>
            {isMe && <span style={{ color: 'var(--accent-yellow)', fontSize: '11px' }}>(you)</span>}
            {isWinner && <span style={{ color: 'var(--accent-yellow)', fontSize: '11px' }}>🏆 Winner</span>}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{result.personaName}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '20px', marginBottom: '4px',
            background: `${statusColors[result.missionStatus]}22`,
            color: statusColors[result.missionStatus], fontSize: '12px', fontWeight: 600,
          }}>
            {statusIcons[result.missionStatus]} {result.missionStatus}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {result.missionTitle}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '10px' }}>
        {[
          { label: 'Health', val: result.finalState.health, color: 'var(--accent-red)' },
          { label: 'Energy', val: result.finalState.energy, color: 'var(--accent-yellow)' },
          { label: 'Mood', val: result.finalState.mood, color: 'var(--accent-purple)' },
          { label: 'Cash', val: null, text: `₹${result.finalState.cash}`, color: 'var(--accent-green)' },
          { label: 'Trust', val: result.socialTrust, color: 'var(--accent-teal)' },
          { label: 'Score', val: result.score, color: 'var(--accent-yellow)' },
        ].map(({ label, val, text, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
            {val !== null && val !== undefined ? (
              <>
                <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', marginBottom: '2px' }}>
                  <div style={{ height: '100%', borderRadius: '2px', width: `${val}%`, background: color }} />
                </div>
                <div style={{ fontSize: '11px', color, fontWeight: 600 }}>{Math.round(val)}</div>
              </>
            ) : (
              <div style={{ fontSize: '11px', color, fontWeight: 600 }}>{text}</div>
            )}
          </div>
        ))}
      </div>

      <p style={{
        fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6,
        padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)',
      }}>
        {result.narrative}
      </p>

      {result.majorDecisions.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div style={{
            fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Key Actions
          </div>
          {result.majorDecisions.slice(0, 3).map((d: string, i: number) => (
            <div key={i} style={{
              fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px',
              paddingLeft: '8px', borderLeft: '2px solid var(--border)',
            }}>
              {d}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

