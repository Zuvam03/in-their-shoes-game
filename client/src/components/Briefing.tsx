import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLocationById } from '../game/mapData';

// Animated trait bar that fills from 0
function TraitBar({ label, value, delay, active }: {
  label: string; value: number; delay: number; active: boolean;
}) {
  const hue = value * 12;
  return (
    <div style={{
      opacity: active ? 1 : 0,
      transform: active ? 'translateX(0)' : 'translateX(-10px)',
      transition: `all 0.4s ease ${delay}ms`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {value}/10
        </span>
      </div>
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          width: active ? `${value * 10}%` : '0%',
          background: `hsl(${hue}deg 70% 50%)`,
          transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay + 200}ms`,
        }} />
      </div>
    </div>
  );
}

type BriefingPhase = 0 | 1 | 2 | 3 | 4 | 5;

export default function Briefing() {
  const { myPlayer, dismissBriefing } = useGameStore();
  const [phase, setPhase] = useState<BriefingPhase>(0);
  const [nameText, setNameText] = useState('');
  const [titleText, setTitleText] = useState('');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3400),
      setTimeout(() => setPhase(5), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Typewriter for persona name
  useEffect(() => {
    if (phase < 1 || !myPlayer) return;
    const full = myPlayer.persona.name;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setNameText(full.slice(0, i));
      if (i >= full.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [phase >= 1, myPlayer?.persona.name]);

  // Typewriter for title
  useEffect(() => {
    if (phase < 1 || !myPlayer) return;
    const full = myPlayer.persona.title;
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setTitleText(full.slice(0, i));
        if (i >= full.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(timer);
  }, [phase >= 1, myPlayer?.persona.title]);

  if (!myPlayer) return null;

  const persona = myPlayer.persona;
  const mission = myPlayer.mission;
  const startLocation = getLocationById(myPlayer.state.location);

  const traitLabels: Record<string, string> = {
    analyticalThinking: 'Analytical',
    emotionalSensitivity: 'Empathy',
    appetite: 'Appetite',
    workOrientation: 'Work Drive',
    spendingStyle: 'Spending',
    socialOrientation: 'Social',
    riskTolerance: 'Risk Tolerance',
    resilience: 'Resilience',
    adaptability: 'Adaptability',
    cooperation: 'Cooperation',
  };

  const sectionStyle = (minPhase: BriefingPhase, delay = 0): React.CSSProperties => ({
    opacity: phase >= minPhase ? 1 : 0,
    transform: phase >= minPhase ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
  });

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '20px',
      overflowY: 'auto', position: 'relative',
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 50% 30% at 50% 10%, rgba(245,200,66,0.04) 0%, transparent 100%),
          radial-gradient(ellipse 40% 40% at 80% 80%, rgba(168,85,247,0.03) 0%, transparent 100%)
        `,
      }} />

      <div style={{
        maxWidth: '680px', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '20px',
        position: 'relative', zIndex: 1,
        paddingBottom: '40px',
      }}>
        {/* Phase 0: "CLASSIFIED" stamp */}
        <div style={{
          textAlign: 'center',
          opacity: phase >= 0 ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '4px',
            border: '2px solid rgba(245,200,66,0.3)',
            opacity: phase >= 0 ? 1 : 0,
            transform: phase >= 0 ? 'scale(1) rotate(-1deg)' : 'scale(1.5) rotate(-5deg)',
            transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#f5c842',
              animation: 'pulse 1.5s infinite',
            }} />
            <span style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.3em',
              color: 'rgba(245,200,66,0.7)', textTransform: 'uppercase',
            }}>
              Personnel Dossier
            </span>
          </div>
        </div>

        {/* Phase 1: Character name reveal */}
        <div style={{
          textAlign: 'center',
          ...sectionStyle(1),
        }}>
          <div style={{
            fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px',
          }}>
            Your Character
          </div>
          <h1 style={{
            fontSize: 'clamp(26px, 6vw, 34px)', fontWeight: 800,
            color: '#f5c842', margin: 0, lineHeight: 1.2,
            minHeight: '40px',
            textShadow: '0 0 30px rgba(245,200,66,0.2)',
          }}>
            {nameText}
            {nameText.length < persona.name.length && (
              <span style={{ animation: 'cursorBlink 0.8s step-end infinite', color: '#f5c842' }}>|</span>
            )}
          </h1>
          <div style={{
            color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px',
            minHeight: '22px',
          }}>
            {titleText}
          </div>
        </div>

        {/* Phase 2: Backstory */}
        <div style={{
          padding: '20px', borderRadius: '14px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          ...sectionStyle(2),
        }}>
          <div style={{
            fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px',
          }}>
            Background
          </div>
          <p style={{
            color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0, fontSize: '14px',
          }}>
            {persona.backstory}
          </p>
        </div>

        {/* Traits with animated bars */}
        <div style={{
          padding: '20px', borderRadius: '14px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          ...sectionStyle(2, 200),
        }}>
          <div style={{
            fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px',
          }}>
            Character Traits
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.entries(persona.traits).map(([key, value], i) => (
              <TraitBar
                key={key}
                label={traitLabels[key] || key}
                value={value as number}
                delay={i * 80}
                active={phase >= 2}
              />
            ))}
          </div>
        </div>

        {/* Phase 3: Strengths & Vulnerabilities */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
          ...sectionStyle(3),
        }}>
          <div style={{
            padding: '16px', borderRadius: '12px',
            background: 'rgba(34, 197, 94, 0.04)',
            border: '1px solid rgba(34, 197, 94, 0.15)',
          }}>
            <div style={{
              fontWeight: 700, color: 'var(--accent-green)', fontSize: '12px',
              marginBottom: '10px', letterSpacing: '0.1em',
            }}>
              STRENGTHS
            </div>
            {persona.strengths.map((s, i) => (
              <div key={i} style={{
                fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px',
                display: 'flex', alignItems: 'flex-start', gap: '6px',
                opacity: phase >= 3 ? 1 : 0,
                transition: `opacity 0.4s ease ${i * 100}ms`,
              }}>
                <span style={{ color: 'var(--accent-green)', flexShrink: 0 }}>+</span>
                {s}
              </div>
            ))}
          </div>
          <div style={{
            padding: '16px', borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
          }}>
            <div style={{
              fontWeight: 700, color: 'var(--accent-red)', fontSize: '12px',
              marginBottom: '10px', letterSpacing: '0.1em',
            }}>
              VULNERABILITIES
            </div>
            {persona.vulnerabilities.map((v, i) => (
              <div key={i} style={{
                fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px',
                display: 'flex', alignItems: 'flex-start', gap: '6px',
                opacity: phase >= 3 ? 1 : 0,
                transition: `opacity 0.4s ease ${i * 100 + 200}ms`,
              }}>
                <span style={{ color: 'var(--accent-red)', flexShrink: 0 }}>-</span>
                {v}
              </div>
            ))}
          </div>
        </div>

        {/* Phase 4: Mission */}
        <div style={{
          padding: '24px', borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(245,200,66,0.06) 0%, rgba(249,115,22,0.03) 100%)',
          border: '1px solid rgba(245,200,66,0.15)',
          position: 'relative', overflow: 'hidden',
          ...sectionStyle(4),
        }}>
          {/* Subtle glow */}
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            fontSize: '10px', color: 'rgba(245,200,66,0.7)', fontWeight: 800,
            letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '10px',
            position: 'relative',
          }}>
            Your Mission
          </div>
          <h2 style={{
            fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800,
            color: '#f5c842', marginBottom: '10px',
            position: 'relative',
          }}>
            {mission.definition.title}
          </h2>
          <p style={{
            color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px',
            fontSize: '14px', position: 'relative',
          }}>
            {mission.definition.narrative}
          </p>

          <div style={{
            fontSize: '11px', fontWeight: 700, marginBottom: '8px',
            color: 'var(--text-primary)', letterSpacing: '0.1em',
            position: 'relative',
          }}>
            OBJECTIVES
          </div>
          {mission.objectives.map((obj, i) => (
            <div key={obj.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              marginBottom: '8px', padding: '10px 12px', borderRadius: '8px',
              background: obj.optional ? 'rgba(255,255,255,0.02)' : 'rgba(245,200,66,0.04)',
              border: `1px solid ${obj.optional ? 'rgba(255,255,255,0.04)' : 'rgba(245,200,66,0.1)'}`,
              opacity: phase >= 4 ? 1 : 0,
              transform: phase >= 4 ? 'translateX(0)' : 'translateX(-15px)',
              transition: `all 0.5s ease ${i * 120}ms`,
              position: 'relative',
            }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${obj.optional ? 'var(--text-muted)' : '#f5c842'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '1px',
              }}>
                {!obj.optional && (
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#f5c842',
                  }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{obj.description}</div>
                {obj.optional && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Optional objective
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Starting info */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
          ...sectionStyle(4, 300),
        }}>
          {[
            { label: 'Starting Location', value: startLocation?.name || myPlayer.state.location, color: 'var(--accent-blue)' },
            { label: 'Starting Cash', value: `₹${myPlayer.state.cash}`, color: 'var(--accent-green)' },
            { label: 'Energy', value: `${myPlayer.state.energy}%`, color: 'var(--accent-yellow)' },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '12px 8px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontWeight: 700, color: s.color, fontSize: '15px' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Social Context */}
        {persona.socialContext && (
          <div style={{
            padding: '20px', borderRadius: '14px',
            background: 'rgba(168,85,247,0.03)',
            border: '1px solid rgba(168,85,247,0.12)',
            ...sectionStyle(5),
          }}>
            <div style={{
              fontWeight: 700, color: 'var(--accent-purple)', fontSize: '12px',
              marginBottom: '12px', letterSpacing: '0.15em',
            }}>
              SOCIAL CONTEXT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                padding: '10px 12px', borderRadius: '8px',
                background: 'rgba(168,85,247,0.04)',
              }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Class</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {persona.socialContext.class}
                </div>
              </div>
              <div style={{
                padding: '10px 12px', borderRadius: '8px',
                background: 'rgba(168,85,247,0.04)',
              }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Community</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {persona.socialContext.communityIdentity}
                </div>
              </div>
            </div>
            {persona.socialContext.insightLines && persona.socialContext.insightLines.length > 0 && (
              <div style={{
                padding: '12px 14px', borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)',
                borderLeft: '3px solid rgba(168,85,247,0.3)',
                fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7,
                fontStyle: 'italic',
              }}>
                "{persona.socialContext.insightLines[0]}"
              </div>
            )}
          </div>
        )}

        {/* Trait Interactions */}
        {persona.traitInteractions && persona.traitInteractions.length > 0 && (
          <div style={{
            padding: '16px', borderRadius: '12px',
            background: 'rgba(59,130,246,0.03)',
            border: '1px solid rgba(59,130,246,0.12)',
            ...sectionStyle(5, 200),
          }}>
            <div style={{
              fontWeight: 700, color: 'var(--accent-blue)', fontSize: '12px',
              marginBottom: '10px', letterSpacing: '0.15em',
            }}>
              TRAIT DYNAMICS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {persona.traitInteractions.slice(0, 3).map((t, i) => (
                <div key={i} style={{
                  fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5,
                  padding: '8px 10px', borderRadius: '8px',
                  background: 'rgba(59,130,246,0.03)',
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                }}>
                  <span style={{ color: 'var(--accent-blue)', flexShrink: 0, fontSize: '10px', marginTop: '2px' }}>&#x26A1;</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div style={{
          padding: '16px', borderRadius: '12px',
          background: 'rgba(59,130,246,0.03)',
          border: '1px solid rgba(59,130,246,0.10)',
          ...sectionStyle(5, 400),
        }}>
          <div style={{
            fontWeight: 700, color: 'var(--accent-blue)', fontSize: '12px',
            marginBottom: '10px', letterSpacing: '0.15em',
          }}>
            QUICK TIPS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <div>Press <b>1-8</b> to switch tabs</div>
            <div>Keep hunger and hydration low</div>
            <div>Click map locations to travel</div>
            <div>Help others to build trust</div>
            <div>Watch your cash and energy</div>
            <div>Chat with other players</div>
          </div>
        </div>

        {/* Enter the City button */}
        <div style={{ ...sectionStyle(5, 600) }}>
          <button
            onClick={dismissBriefing}
            style={{
              padding: '18px 32px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #f5c842, #f97316)',
              color: '#000', fontWeight: 800, fontSize: '16px',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(245, 200, 66, 0.3), 0 0 0 1px rgba(245,200,66,0.15)',
              width: '100%',
              position: 'relative', overflow: 'hidden',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 32px rgba(245, 200, 66, 0.45), 0 0 0 1px rgba(245,200,66,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(245, 200, 66, 0.3), 0 0 0 1px rgba(245,200,66,0.15)';
            }}
          >
            Enter the City
          </button>
          <div style={{
            textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '10px',
          }}>
            Take your time — the game starts when you're ready
          </div>
        </div>
      </div>
    </div>
  );
}
