import { useGameStore } from '../store/gameStore';
import type { PerformanceInsight } from '../store/gameStore';

export default function ResultsScreen() {
  const { matchResult, mySocketId, playAgain } = useGameStore();
  if (!matchResult) return null;

  const { playerResults, winnerName, highlightEvents } = matchResult;
  const myResult = playerResults.find(r => r.playerId === mySocketId);

  const statusColors: Record<string, string> = {
    completed: 'var(--accent-green)',
    partial: 'var(--accent-yellow)',
    failed: 'var(--accent-red)',
    active: 'var(--text-muted)'
  };

  const statusIcons: Record<string, string> = {
    completed: '✅',
    partial: '◑',
    failed: '❌',
    active: '⏳'
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      overflowY: 'auto', background: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Winner banner */}
        <div style={{
          padding: '28px', borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(245,200,66,0.15), rgba(249,115,22,0.1))',
          border: '1px solid rgba(245,200,66,0.3)',
          textAlign: 'center'
        }} className="fade-in">
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Match Complete
          </div>
          {winnerName ? (
            <>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
                {winnerName} wins!
              </h1>
              {mySocketId === matchResult.winnerId && (
                <div style={{ color: 'var(--accent-green)', marginTop: '8px', fontWeight: 600 }}>
                  That's you! Excellent work.
                </div>
              )}
            </>
          ) : (
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Game Over</h1>
          )}
          <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Duration: {Math.floor(matchResult.matchDurationActual / 60)}m {matchResult.matchDurationActual % 60}s
          </div>
        </div>

        {/* My result summary */}
        {myResult && (
          <div style={{
            padding: '20px', borderRadius: '14px',
            background: 'var(--bg-card)', border: '1px solid var(--border)'
          }}>
            <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '16px' }}>Your Journey</div>
            <p style={{
              color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.7,
              marginBottom: '16px', padding: '12px', borderRadius: '8px',
              background: 'var(--bg-secondary)'
            }}>
              {myResult.narrative}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <StatCard label="Final Score" value={`${myResult.score}/100`} color="var(--accent-yellow)" />
              <StatCard label="Rank" value={`#${myResult.rank}`} color="var(--accent-blue)" />
              <StatCard label="Social Trust" value={`${myResult.socialTrust}`} color="var(--accent-green)" />
              <StatCard label="Community" value={`${myResult.communityImpact >= 0 ? '+' : ''}${myResult.communityImpact}`}
                color={myResult.communityImpact >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'} />
            </div>
          </div>
        )}

        {/* Score Breakdown */}
        {myResult?.scoreBreakdown && (
          <div style={{
            padding: '24px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(249,115,22,0.05))',
            border: '1px solid rgba(245,200,66,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
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
              <ScoreRow label="Mission Objectives" value={myResult.scoreBreakdown.missionPoints} max={60}
                description="Complete required objectives to earn up to 60 pts" color="#f5c842" />
              <ScoreRow label="Optional Objectives" value={myResult.scoreBreakdown.optionalBonus} max={30}
                description="10 pts per optional objective completed" color="#a78bfa" />
              <ScoreRow label="Cash Remaining" value={myResult.scoreBreakdown.cashBonus} max={20}
                description="1 pt per ₹10 remaining at game end" color="#22c55e" />
              <ScoreRow label="Social Trust" value={myResult.scoreBreakdown.trustBonus} max={50}
                description="Half your trust score — built by helping others" color="#3b82f6" />
              <ScoreRow label="Community Impact" value={myResult.scoreBreakdown.communityBonus} max={50}
                description="Points from positive community choices" color="#10b981" />
            </div>
          </div>
        )}

        {/* Performance Analysis */}
        {myResult?.performanceInsights && myResult.performanceInsights.length > 0 && (
          <div style={{
            padding: '24px', borderRadius: '14px',
            background: 'var(--bg-card)', border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>Performance Analysis</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  What went well, what to improve, and tips for next time
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {myResult.performanceInsights.map((insight, i) => (
                <InsightRow key={i} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* Persona Lens */}
        {myResult && myResult.personaLens && myResult.personaLens.length > 0 && (
          <div style={{
            padding: '24px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.06))',
            border: '1px solid rgba(139,92,246,0.25)'
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
                  borderLeft: '3px solid rgba(139,92,246,0.5)'
                }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dilemma Choices Made */}
        {myResult && myResult.dilemmasResolved && myResult.dilemmasResolved.length > 0 && (
          <div style={{
            padding: '20px', borderRadius: '14px',
            background: 'var(--bg-card)', border: '1px solid var(--border)'
          }}>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>
              Social Dilemmas Faced
            </div>
            {myResult.dilemmasResolved.map((d, i) => (
              <div key={i} style={{
                padding: '12px 14px', borderRadius: '10px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{d.dilemmaTitle}</div>
                  <div style={{
                    fontSize: '12px', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span>You chose:</span>
                    <span style={{
                      color: '#fbbf24', background: 'rgba(251,191,36,0.1)',
                      padding: '2px 8px', borderRadius: '10px', fontWeight: 600
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
        )}

        {/* All players */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>All Players</h2>
          {playerResults.map(result => (
            <div
              key={result.playerId}
              style={{
                padding: '18px', borderRadius: '12px',
                background: result.playerId === mySocketId ? 'rgba(245,200,66,0.05)' : 'var(--bg-card)',
                border: `1px solid ${result.playerId === mySocketId ? 'rgba(245,200,66,0.2)' : 'var(--border)'}`,
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: `hsl(${result.playerName.charCodeAt(0) * 7}deg 60% 40%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, color: '#fff'
                    }}>
                      #{result.rank}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{result.playerName}</span>
                    {result.playerId === mySocketId && (
                      <span style={{ color: 'var(--accent-yellow)', fontSize: '11px' }}>(you)</span>
                    )}
                    {result.playerId === matchResult.winnerId && (
                      <span style={{ color: 'var(--accent-yellow)', fontSize: '11px' }}>🏆 Winner</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{result.personaName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 8px', borderRadius: '20px', marginBottom: '4px',
                    background: `${statusColors[result.missionStatus]}22`,
                    color: statusColors[result.missionStatus], fontSize: '12px', fontWeight: 600
                  }}>
                    {statusIcons[result.missionStatus]} {result.missionStatus}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {result.missionTitle}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '10px' }}>
                {[
                  { label: 'Health', val: result.finalState.health, color: 'var(--accent-red)' },
                  { label: 'Energy', val: result.finalState.energy, color: 'var(--accent-yellow)' },
                  { label: 'Mood', val: result.finalState.mood, color: 'var(--accent-purple)' },
                  { label: 'Cash', val: null, text: `₹${result.finalState.cash}`, color: 'var(--accent-green)' },
                  { label: 'Trust', val: result.socialTrust, color: 'var(--accent-teal)' },
                  { label: 'Score', val: result.score, color: 'var(--accent-yellow)' }
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

              {/* Narrative */}
              <p style={{
                fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6,
                padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)'
              }}>
                {result.narrative}
              </p>

              {/* Major decisions */}
              {result.majorDecisions.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Key Actions
                  </div>
                  {result.majorDecisions.slice(0, 3).map((d, i) => (
                    <div key={i} style={{
                      fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px',
                      paddingLeft: '8px', borderLeft: '2px solid var(--border)'
                    }}>
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Highlight events */}
        {highlightEvents.length > 0 && (
          <div style={{
            padding: '20px', borderRadius: '14px',
            background: 'var(--bg-card)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: '14px', fontSize: '16px' }}>Match Highlights</h3>
            {highlightEvents.map(evt => (
              <div key={evt.id} style={{
                padding: '8px 12px', borderRadius: '8px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginRight: '8px' }}>
                  T+{evt.tick}s
                </span>
                {evt.description}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={playAgain}
          style={{
            padding: '14px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #f5c842, #f97316)',
            color: '#000', fontWeight: 700, fontSize: '15px',
            marginBottom: '24px'
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: '10px', borderRadius: '8px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '20px', color }}>{value}</div>
    </div>
  );
}

function ScoreRow({ label, value, max, description, color }: {
  label: string; value: number; max: number; description: string; color: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '14px', fontWeight: 700, color }}>
          {value > 0 ? '+' : ''}{value} pts
        </span>
      </div>
      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '3px', width: `${pct}%`,
          background: color, transition: 'width 0.8s ease'
        }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{description}</div>
    </div>
  );
}

function InsightRow({ insight }: { insight: PerformanceInsight }) {
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
      display: 'flex', alignItems: 'flex-start', gap: '10px'
    }}>
      <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{config.icon}</span>
      <div>
        <div style={{ fontSize: '10px', color: config.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
          {config.label}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {insight.text}
        </div>
      </div>
    </div>
  );
}
