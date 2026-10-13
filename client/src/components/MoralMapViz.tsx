import { useState } from 'react';
import type { MoralMapEntry, PerspectiveReveal, PlayerResult } from '../store/gameStore';

const CATEGORY_CONFIG: Record<MoralMapEntry['category'], { icon: string; color: string; label: string }> = {
  help: { icon: '🤝', color: '#22c55e', label: 'Helped Others' },
  harm: { icon: '💔', color: '#ef4444', label: 'Harmful Action' },
  dilemma: { icon: '⚖️', color: '#a855f7', label: 'Moral Dilemma' },
  trade: { icon: '💱', color: '#f59e0b', label: 'Trade/Exchange' },
  obligation: { icon: '🔗', color: '#3b82f6', label: 'Hidden Obligation' },
  fortune: { icon: '🍀', color: '#14b8a6', label: 'Fortune Event' },
};

const CLASS_LABELS: Record<string, { label: string; color: string }> = {
  'working': { label: 'Working Class', color: '#f97316' },
  'lower-middle': { label: 'Lower Middle Class', color: '#f59e0b' },
  'middle': { label: 'Middle Class', color: '#3b82f6' },
  'upper-middle': { label: 'Upper Middle Class', color: '#8b5cf6' },
  'privileged': { label: 'Privileged', color: '#22c55e' },
  'unknown': { label: 'Unknown', color: '#94a3b8' },
};

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  'The Altruist': 'Consistently chose others over self, building genuine community',
  'The Community Builder': 'Invested in relationships and mutual support networks',
  'The Principled Survivor': 'Held to convictions even when survival was at stake',
  'The Pragmatist': 'Made practical choices, balancing ethics with necessity',
  'The Lone Wolf': 'Navigated the city independently, relying on no one',
  'The Desperate': 'Survival instincts overrode ethical considerations',
  'The Self-Preservationist': 'Prioritized personal survival above community ties',
  'The Shrewd Ally': 'Built trust strategically while keeping personal interests safe',
  'The Tested Soul': 'Faced many moral tests and emerged with character intact',
  'The Survivor': 'Found their own path through the city\'s challenges',
};

function KarmaTimeline({ entries, totalTicks }: { entries: MoralMapEntry[]; totalTicks: number }) {
  if (entries.length === 0) return null;

  const width = 100;
  const height = 60;
  const padding = { top: 8, bottom: 8, left: 4, right: 4 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxTick = totalTicks || Math.max(...entries.map(e => e.tick), 1);

  const points = entries.map(e => ({
    x: padding.left + (e.tick / maxTick) * plotW,
    y: padding.top + plotH / 2 - (e.karmaAfter / 100) * (plotH / 2),
    entry: e,
  }));

  const pathD = points.reduce((acc, p, i) => {
    return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, '');

  const zeroY = padding.top + plotH / 2;

  return (
    <div style={{ width: '100%', aspectRatio: '5/2' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        <line x1={padding.left} y1={zeroY} x2={width - padding.right} y2={zeroY}
          stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" strokeDasharray="1,1" />
        <text x={padding.left} y={padding.top + 3} fill="rgba(255,255,255,0.3)" fontSize="2.5">+100</text>
        <text x={padding.left} y={height - padding.bottom} fill="rgba(255,255,255,0.3)" fontSize="2.5">-100</text>

        <defs>
          <linearGradient id="karmaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {points.length > 1 && (
          <path d={`${pathD} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`}
            fill="url(#karmaGrad)" opacity="0.3" />
        )}

        <path d={pathD} fill="none" stroke="#a78bfa" strokeWidth="0.6" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1"
            fill={CATEGORY_CONFIG[p.entry.category]?.color || '#94a3b8'}
            stroke="rgba(0,0,0,0.3)" strokeWidth="0.2" />
        ))}
      </svg>
    </div>
  );
}

function DecisionWeightRadar({ weights }: { weights: PerspectiveReveal['decisionWeights'] }) {
  const dims = [
    { key: 'groupLoyalty', label: 'Loyalty', angle: -90 },
    { key: 'selfPreservation', label: 'Self', angle: -18 },
    { key: 'principledAction', label: 'Principle', angle: 54 },
    { key: 'statusAnxiety', label: 'Status', angle: 126 },
    { key: 'communityDuty', label: 'Duty', angle: 198 },
  ] as const;

  const cx = 50, cy = 50, maxR = 38;

  function polarToXY(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPoints = dims.map(d => {
    const val = (weights[d.key] || 5) / 10;
    return polarToXY(d.angle, val * maxR);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div style={{ width: '100%', maxWidth: '200px', margin: '0 auto', aspectRatio: '1' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        {gridLevels.map(level => {
          const gridPath = dims.map((d, i) => {
            const p = polarToXY(d.angle, level * maxR);
            return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
          }).join(' ') + ' Z';
          return <path key={level} d={gridPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />;
        })}

        {dims.map(d => {
          const end = polarToXY(d.angle, maxR);
          return <line key={d.key} x1={cx} y1={cy} x2={end.x} y2={end.y}
            stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />;
        })}

        <path d={dataPath} fill="rgba(168,85,247,0.15)" stroke="#a855f7" strokeWidth="0.6" />

        {dims.map(d => {
          const labelPos = polarToXY(d.angle, maxR + 8);
          return (
            <text key={d.key} x={labelPos.x} y={labelPos.y}
              textAnchor="middle" dominantBaseline="central"
              fill="rgba(255,255,255,0.5)" fontSize="3.5" fontWeight="600">
              {d.label}
            </text>
          );
        })}

        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#a855f7" stroke="rgba(0,0,0,0.3)" strokeWidth="0.3" />
        ))}
      </svg>
    </div>
  );
}

export function MoralMap({ result, totalTicks }: { result: PlayerResult; totalTicks: number }) {
  const entries = result.moralMap || [];
  const perspective = result.perspective;

  if (!perspective && entries.length === 0) return null;

  const positiveActions = entries.filter(e => e.karmaShift > 0).length;
  const negativeActions = entries.filter(e => e.karmaShift < 0).length;
  const neutralActions = entries.filter(e => e.karmaShift === 0).length;

  const categoryCounts = entries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{
      padding: '24px', borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(59,130,246,0.06))',
      border: '1px solid rgba(168,85,247,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <span style={{ fontSize: '20px' }}>🗺️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#c4b5fd' }}>Moral Map</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            The ethical landscape of your journey
          </div>
        </div>
      </div>

      {/* Archetype badge */}
      {perspective && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 16px', borderRadius: '12px',
          background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
          marginBottom: '16px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(59,130,246,0.3))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0,
          }}>
            {perspective.karma > 40 ? '😇' : perspective.karma > 0 ? '🤔' : perspective.karma > -20 ? '😐' : '😈'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#e9d5ff' }}>
              {perspective.moralArchetype}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {ARCHETYPE_DESCRIPTIONS[perspective.moralArchetype] || 'A unique path through the city'}
            </div>
          </div>
        </div>
      )}

      {/* Karma timeline */}
      {entries.length > 0 && (
        <div style={{
          padding: '12px', borderRadius: '10px',
          background: 'rgba(0,0,0,0.15)', marginBottom: '14px',
        }}>
          <div style={{
            fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '6px',
          }}>
            Karma Over Time
          </div>
          <KarmaTimeline entries={entries} totalTicks={totalTicks} />
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '16px',
            marginTop: '6px',
          }}>
            <span style={{ fontSize: '11px', color: '#22c55e' }}>+{positiveActions} good</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{neutralActions} neutral</span>
            <span style={{ fontSize: '11px', color: '#ef4444' }}>{negativeActions} harmful</span>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(categoryCounts).length > 0 && (
        <div style={{
          display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px',
        }}>
          {Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => {
              const config = CATEGORY_CONFIG[cat as MoralMapEntry['category']];
              if (!config) return null;
              return (
                <div key={cat} style={{
                  padding: '4px 10px', borderRadius: '12px',
                  background: `${config.color}15`, border: `1px solid ${config.color}30`,
                  fontSize: '11px', color: config.color, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <span>{config.icon}</span> {config.label}: {count}
                </div>
              );
            })}
        </div>
      )}

      {/* Final karma indicator */}
      {perspective && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 14px', borderRadius: '10px',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Final Karma
            </div>
            <div style={{
              height: '6px', borderRadius: '3px',
              background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', left: '50%', top: 0, bottom: 0,
                width: '1px', background: 'rgba(255,255,255,0.2)',
              }} />
              <div style={{
                height: '100%', borderRadius: '3px',
                width: `${Math.abs(perspective.karma) / 2}%`,
                marginLeft: perspective.karma >= 0 ? '50%' : `${50 - Math.abs(perspective.karma) / 2}%`,
                background: perspective.karma >= 0
                  ? 'linear-gradient(90deg, #94a3b8, #22c55e)'
                  : 'linear-gradient(90deg, #ef4444, #94a3b8)',
                transition: 'width 1s ease',
              }} />
            </div>
          </div>
          <div style={{
            fontWeight: 700, fontSize: '18px',
            color: perspective.karma > 20 ? '#22c55e' : perspective.karma < -20 ? '#ef4444' : '#94a3b8',
            fontVariantNumeric: 'tabular-nums',
            minWidth: '40px', textAlign: 'right',
          }}>
            {perspective.karma > 0 ? '+' : ''}{perspective.karma}
          </div>
        </div>
      )}
    </div>
  );
}

export function PerspectiveRevealPanel({ results, myPlayerId }: {
  results: PlayerResult[];
  myPlayerId: string;
}) {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const playersWithPerspective = results.filter(r => r.perspective);
  if (playersWithPerspective.length === 0) return null;

  return (
    <div style={{
      padding: '24px', borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(34,197,94,0.06))',
      border: '1px solid rgba(59,130,246,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>🔓</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#93c5fd' }}>
            Perspective Revealed
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            The hidden forces that shaped each player's choices
          </div>
        </div>
      </div>

      <div style={{
        fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
        padding: '12px 14px', borderRadius: '10px',
        background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)',
        marginBottom: '16px', fontStyle: 'italic',
      }}>
        During the game, each player's background, hidden obligations, and inner pressures were invisible.
        Now you can see the full picture — the constraints and values that drove every decision.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {playersWithPerspective.map(r => {
          const p = r.perspective!;
          const isMe = r.playerId === myPlayerId;
          const isExpanded = expandedPlayer === r.playerId;
          const classInfo = CLASS_LABELS[p.socialClass] || CLASS_LABELS['unknown'];

          return (
            <div key={r.playerId} style={{
              borderRadius: '12px', overflow: 'hidden',
              border: `1px solid ${isMe ? 'rgba(245,200,66,0.25)' : 'var(--border)'}`,
              background: isMe ? 'rgba(245,200,66,0.03)' : 'var(--bg-card)',
            }}>
              <button
                onClick={() => setExpandedPlayer(isExpanded ? null : r.playerId)}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${classInfo.color}30, ${classInfo.color}15)`,
                  border: `2px solid ${classInfo.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', flexShrink: 0,
                }}>
                  {p.karma > 40 ? '😇' : p.karma > 0 ? '🤔' : p.karma > -20 ? '😐' : '😈'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {r.playerName}
                    </span>
                    {isMe && <span style={{ fontSize: '10px', color: '#f5c842' }}>(you)</span>}
                    <span style={{
                      fontSize: '9px', padding: '1px 6px', borderRadius: '4px',
                      background: `${classInfo.color}15`, color: classInfo.color, fontWeight: 600,
                    }}>
                      {classInfo.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {r.personaName} — {p.moralArchetype}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 700,
                    color: p.karma > 20 ? '#22c55e' : p.karma < -20 ? '#ef4444' : '#94a3b8',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {p.karma > 0 ? '+' : ''}{p.karma}
                  </div>
                  <span style={{
                    fontSize: '10px', color: 'var(--text-muted)',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}>▼</span>
                </div>
              </button>

              {isExpanded && (
                <div style={{
                  borderTop: '1px solid var(--border)',
                  padding: '16px',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                }}>
                  {/* Backstory */}
                  <div>
                    <div style={{
                      fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px',
                    }}>
                      Hidden Backstory
                    </div>
                    <div style={{
                      fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7,
                      padding: '12px 14px', borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      borderLeft: '3px solid rgba(59,130,246,0.4)',
                    }}>
                      {p.backstory}
                    </div>
                  </div>

                  {/* Decision weights radar */}
                  <div>
                    <div style={{
                      fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px',
                    }}>
                      Decision Priorities
                    </div>
                    <DecisionWeightRadar weights={p.decisionWeights} />
                  </div>

                  {/* Community identity */}
                  <div style={{
                    padding: '10px 14px', borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Community Identity
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {p.communityIdentity}
                    </div>
                    {p.dilemmaProfile && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                        "{p.dilemmaProfile}"
                      </div>
                    )}
                  </div>

                  {/* Hidden obligations */}
                  {p.hiddenObligations.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px',
                      }}>
                        Hidden Obligations {p.obligationsFired.length > 0 && (
                          <span style={{ color: '#f59e0b' }}>
                            ({p.obligationsFired.length} triggered)
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {p.hiddenObligations.map((obl, i) => {
                          const wasFired = p.obligationsFired.includes(obl);
                          return (
                            <div key={i} style={{
                              padding: '8px 12px', borderRadius: '6px',
                              background: wasFired ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${wasFired ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                              fontSize: '12px', color: 'var(--text-secondary)',
                              display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                              <span style={{ fontSize: '12px' }}>{wasFired ? '🔴' : '⚪'}</span>
                              {obl}
                              {wasFired && (
                                <span style={{
                                  marginLeft: 'auto', fontSize: '9px',
                                  color: '#ef4444', fontWeight: 600,
                                }}>
                                  TRIGGERED
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Political pressures */}
                  {p.politicalPressures.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px',
                      }}>
                        Political & Social Pressures
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {p.politicalPressures.map((pressure, i) => (
                          <span key={i} style={{
                            padding: '3px 8px', borderRadius: '4px',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            fontSize: '11px', color: '#f87171',
                          }}>
                            {pressure}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cross-perspective insight */}
      {playersWithPerspective.length > 1 && (
        <div style={{
          marginTop: '16px', padding: '14px 16px', borderRadius: '10px',
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
        }}>
          <div style={{
            fontSize: '10px', color: '#22c55e', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '8px',
          }}>
            Perspective Takeaway
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {generateCrossPerspectiveInsight(playersWithPerspective)}
          </div>
        </div>
      )}
    </div>
  );
}

function generateCrossPerspectiveInsight(results: PlayerResult[]): string {
  const perspectives = results.map(r => r.perspective!);
  const classes = [...new Set(perspectives.map(p => p.socialClass))];
  const karmas = perspectives.map(p => p.karma);
  const maxKarma = Math.max(...karmas);
  const minKarma = Math.min(...karmas);
  const spread = maxKarma - minKarma;

  if (classes.length >= 3) {
    return 'Players from very different social backgrounds navigated the same city — each facing unique pressures invisible to the others. ' +
      'The choices that seemed obvious to one persona were often impossible for another.';
  }

  if (spread > 60) {
    return 'The karma gap between players reveals how dramatically different strategies emerged from different starting positions. ' +
      'The same city created vastly different moral landscapes depending on who you were.';
  }

  const avgKarma = karmas.reduce((a, b) => a + b, 0) / karmas.length;
  if (avgKarma > 30) {
    return 'Most players found ways to help others despite their constraints — a reminder that compassion is not just a privilege of the comfortable. ' +
      'Even those with the hardest obligations chose connection.';
  }

  if (avgKarma < -10) {
    return 'The city pushed most players toward self-preservation. Before judging, consider: each persona carried hidden obligations and pressures that made generosity genuinely costly. ' +
      'Understanding why someone acts selfishly is the first step past judgment.';
  }

  return 'Each player carried invisible burdens — obligations, social pressures, and inner conflicts — ' +
    'that silently shaped every decision. Understanding those hidden forces is the heart of empathy.';
}
