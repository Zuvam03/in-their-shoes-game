import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import type { PlayerResult, MatchResult } from '../store/gameStore';

function generateHeadline(winner: PlayerResult | undefined, result: MatchResult): string {
  if (!winner) return 'CITY SURVIVES ANOTHER DAY AS STRANGERS NAVIGATE ITS STREETS';
  const status = winner.missionStatus;
  if (status === 'completed') {
    return `${winner.personaName.toUpperCase()} TRIUMPHS: "${winner.missionTitle}" COMPLETED IN DRAMATIC FASHION`;
  }
  if (status === 'partial') {
    return `BITTERSWEET VICTORY: ${winner.personaName.toUpperCase()} LEADS DESPITE UNFINISHED MISSION`;
  }
  return `${winner.personaName.toUpperCase()} EMERGES AS TOP SURVIVOR AMID CITY CHALLENGES`;
}

function generateSubHeadline(winner: PlayerResult | undefined, result: MatchResult): string {
  const playerCount = result.playerResults.length;
  const days = Math.ceil(result.totalTicks / 600);
  if (!winner) return `${playerCount} individuals navigated ${days} days in Kolkata's unforgiving landscape`;
  return `Scored ${winner.score} points across ${days} day${days > 1 ? 's' : ''} — ${playerCount > 1 ? `outpacing ${playerCount - 1} rival${playerCount > 2 ? 's' : ''}` : 'a solo journey through the city'}`;
}

function generateLeadArticle(winner: PlayerResult | undefined): string {
  if (!winner) return 'In a match where survival was the only victory, every player faced the full weight of Kolkata\'s complex social landscape.';
  const parts: string[] = [];
  parts.push(`In what observers are calling ${winner.missionStatus === 'completed' ? 'a masterful display of urban navigation' : 'a hard-fought battle for survival'}, ${winner.personaName} — known locally as "${winner.playerName}" — ${winner.missionStatus === 'completed' ? 'successfully completed' : 'made significant progress on'} the challenging mission "${winner.missionTitle}."`);

  if (winner.cooperationCount > 0) {
    parts.push(`Throughout the ordeal, ${winner.personaName.split(' ')[0]} demonstrated ${winner.cooperationCount > 3 ? 'remarkable' : 'notable'} cooperation, assisting fellow citizens ${winner.cooperationCount} time${winner.cooperationCount > 1 ? 's' : ''}.`);
  }
  if (winner.dilemmasResolved.length > 0) {
    const d = winner.dilemmasResolved[0];
    parts.push(`When faced with "${d.dilemmaTitle}", ${winner.personaName.split(' ')[0]} chose to "${d.choiceLabel}" — a decision that would define their journey.`);
  }
  if (winner.socialTrust > 5) {
    parts.push(`Their social trust rating of ${winner.socialTrust} speaks to a character who understood that in Kolkata, relationships are currency.`);
  }
  parts.push(`"${winner.narrative}"`);
  return parts.join(' ');
}

function generatePlayerBrief(p: PlayerResult): string {
  const name = p.personaName.split(' ')[0];
  const status = p.missionStatus === 'completed' ? 'completed their mission'
    : p.missionStatus === 'partial' ? 'made partial progress'
    : p.missionStatus === 'failed' ? 'fell short of their goal' : 'continued their journey';
  return `${name} (playing as "${p.playerName}") ${status} on "${p.missionTitle}" with a score of ${p.score}. ${p.cooperationCount > 0 ? `Helped ${p.cooperationCount} others. ` : ''}${p.dilemmasResolved.length > 0 ? `Faced ${p.dilemmasResolved.length} moral dilemma${p.dilemmasResolved.length > 1 ? 's' : ''}.` : ''}`;
}

function generateDilemmaColumn(results: PlayerResult[]): string[] {
  const allDilemmas = results.flatMap(r =>
    r.dilemmasResolved.map(d => ({ ...d, playerName: r.personaName.split(' ')[0] }))
  );
  if (allDilemmas.length === 0) return [];
  return allDilemmas.slice(0, 3).map(d =>
    `${d.playerName}, when confronted with "${d.dilemmaTitle}", chose: "${d.choiceLabel}".`
  );
}

export default function KolkataChronicle({ onClose }: { onClose: () => void }) {
  const { matchResult } = useGameStore();
  const chronicleRef = useRef<HTMLDivElement>(null);

  if (!matchResult) return null;

  const results = [...matchResult.playerResults].sort((a, b) => a.rank - b.rank);
  const winner = results[0];
  const others = results.slice(1);
  const days = Math.ceil(matchResult.totalTicks / 600);
  const date = new Date();
  const dateStr = date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const edition = Math.floor(matchResult.totalTicks / 100) + 42;

  const headline = generateHeadline(winner, matchResult);
  const subHeadline = generateSubHeadline(winner, matchResult);
  const leadArticle = generateLeadArticle(winner);
  const dilemmaEntries = generateDilemmaColumn(results);
  const insights = winner?.performanceInsights || [];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease-out'
    }} onClick={onClose}>
      <div
        ref={chronicleRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px', width: '95%', maxHeight: '92vh',
          overflowY: 'auto', borderRadius: '4px',
          background: '#faf5e8',
          color: '#2a2217',
          fontFamily: '"Georgia", "Times New Roman", serif',
          boxShadow: '0 20px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,119,73,0.3)',
          position: 'relative',
        }}
      >
        {/* Paper texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(139,119,73,0.03) 28px, rgba(139,119,73,0.03) 29px),
            radial-gradient(ellipse at 20% 50%, rgba(139,119,73,0.06) 0%, transparent 80%)
          `,
          borderRadius: '4px',
        }} />

        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'sticky', top: '8px', float: 'right', margin: '8px',
          zIndex: 10, background: 'rgba(42,34,23,0.08)', border: '1px solid rgba(42,34,23,0.15)',
          borderRadius: '4px', padding: '4px 10px', color: '#5a4d3a',
          fontFamily: 'sans-serif', fontSize: '11px', cursor: 'pointer',
        }}>
          Close
        </button>

        <div style={{ padding: '32px 28px 24px', position: 'relative' }}>
          {/* Masthead */}
          <div style={{ textAlign: 'center', borderBottom: '3px double #2a2217', paddingBottom: '12px', marginBottom: '12px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '9px', color: '#8b7749', letterSpacing: '1px', marginBottom: '6px',
            }}>
              <span>Est. 1875</span>
              <span>Edition No. {edition}</span>
              <span>Price: 50 Paise</span>
            </div>

            <h1 style={{
              fontSize: '32px', fontWeight: 900, letterSpacing: '3px',
              margin: '0 0 4px', lineHeight: 1, fontFamily: '"Georgia", serif',
              textTransform: 'uppercase', color: '#1a150d',
            }}>
              The Kolkata Chronicle
            </h1>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '9px', color: '#8b7749',
              borderTop: '1px solid #c4b78c', paddingTop: '4px', marginTop: '4px',
            }}>
              <span>{dateStr}</span>
              <span style={{ fontStyle: 'italic' }}>{"\"The City's Voice Since 1875\""}</span>
              <span>{days} Day{days > 1 ? 's' : ''} Coverage</span>
            </div>
          </div>

          {/* Main Headline */}
          <div style={{ borderBottom: '2px solid #2a2217', paddingBottom: '10px', marginBottom: '14px' }}>
            <h2 style={{
              fontSize: '22px', fontWeight: 800, lineHeight: 1.2,
              margin: '0 0 6px', color: '#1a150d',
              fontFamily: '"Georgia", serif',
            }}>
              {headline}
            </h2>
            <p style={{
              fontSize: '13px', color: '#5a4d3a', margin: 0,
              fontStyle: 'italic', lineHeight: 1.4,
            }}>
              {subHeadline}
            </p>
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px' }}>
            {/* Left: Lead story */}
            <div>
              <div style={{
                fontSize: '9px', color: '#8b7749', textTransform: 'uppercase',
                letterSpacing: '1.5px', marginBottom: '6px', fontWeight: 700,
                fontFamily: 'sans-serif',
              }}>
                Lead Story — by Our Correspondent
              </div>
              <p style={{
                fontSize: '13px', lineHeight: 1.7, margin: '0 0 14px',
                textAlign: 'justify', color: '#3d3424',
                textIndent: '2em',
              }}>
                {leadArticle}
              </p>

              {/* Score box */}
              {winner && (
                <div style={{
                  padding: '10px 14px', borderRadius: '2px',
                  border: '1px solid #c4b78c', background: 'rgba(139,119,73,0.04)',
                  marginBottom: '14px',
                }}>
                  <div style={{
                    fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px', color: '#8b7749', marginBottom: '6px',
                    fontFamily: 'sans-serif',
                  }}>
                    Final Scorecard — {winner.personaName}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { l: 'Total Score', v: `${winner.score}/100` },
                      { l: 'Social Trust', v: `${winner.socialTrust}` },
                      { l: 'Community', v: `${winner.communityImpact >= 0 ? '+' : ''}${winner.communityImpact}` },
                      { l: 'Mission', v: winner.scoreBreakdown.missionPoints + ' pts' },
                      { l: 'Cash Bonus', v: winner.scoreBreakdown.cashBonus + ' pts' },
                      { l: 'Trust Bonus', v: winner.scoreBreakdown.trustBonus + ' pts' },
                    ].map(item => (
                      <div key={item.l} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#1a150d' }}>{item.v}</div>
                        <div style={{ fontSize: '8px', color: '#8b7749', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other players */}
              {others.length > 0 && (
                <>
                  <div style={{
                    fontSize: '9px', color: '#8b7749', textTransform: 'uppercase',
                    letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 700,
                    fontFamily: 'sans-serif', borderTop: '1px solid #c4b78c', paddingTop: '10px',
                  }}>
                    Other Journeys
                  </div>
                  {others.map(p => (
                    <div key={p.playerId} style={{ marginBottom: '10px' }}>
                      <div style={{
                        fontSize: '11px', fontWeight: 700, color: '#1a150d', marginBottom: '2px',
                      }}>
                        #{p.rank} — {p.personaName}
                      </div>
                      <p style={{
                        fontSize: '11px', lineHeight: 1.6, margin: 0,
                        color: '#5a4d3a', textAlign: 'justify',
                      }}>
                        {generatePlayerBrief(p)}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Right sidebar */}
            <div style={{ borderLeft: '1px solid #c4b78c', paddingLeft: '14px' }}>
              {/* City Report */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                  borderBottom: '2px solid #2a2217', paddingBottom: '3px', marginBottom: '8px',
                  letterSpacing: '0.5px',
                }}>
                  City Report
                </div>
                <div style={{ fontSize: '10px', lineHeight: 1.6, color: '#5a4d3a' }}>
                  <p style={{ margin: '0 0 6px' }}>
                    <strong>Duration:</strong> {days} day{days > 1 ? 's' : ''} ({matchResult.totalTicks} ticks)
                  </p>
                  <p style={{ margin: '0 0 6px' }}>
                    <strong>Citizens:</strong> {results.length} active
                  </p>
                  <p style={{ margin: '0 0 6px' }}>
                    <strong>Missions Completed:</strong> {results.filter(r => r.missionStatus === 'completed').length}/{results.length}
                  </p>
                  <p style={{ margin: '0 0 6px' }}>
                    <strong>Dilemmas Faced:</strong> {results.reduce((sum, r) => sum + r.dilemmasResolved.length, 0)}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Total Cooperation:</strong> {results.reduce((sum, r) => sum + r.cooperationCount, 0)} acts
                  </p>
                </div>
              </div>

              {/* Moral Compass */}
              {dilemmaEntries.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                    borderBottom: '2px solid #2a2217', paddingBottom: '3px', marginBottom: '8px',
                    letterSpacing: '0.5px',
                  }}>
                    Moral Crossroads
                  </div>
                  {dilemmaEntries.map((entry, i) => (
                    <p key={i} style={{
                      fontSize: '10px', lineHeight: 1.6, color: '#5a4d3a',
                      margin: '0 0 8px', fontStyle: 'italic',
                    }}>
                      {entry}
                    </p>
                  ))}
                </div>
              )}

              {/* Expert Analysis */}
              {insights.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                    borderBottom: '2px solid #2a2217', paddingBottom: '3px', marginBottom: '8px',
                    letterSpacing: '0.5px',
                  }}>
                    Expert Analysis
                  </div>
                  {insights.slice(0, 3).map((ins, i) => (
                    <p key={i} style={{
                      fontSize: '10px', lineHeight: 1.6, color: '#5a4d3a',
                      margin: '0 0 6px',
                      paddingLeft: '8px', borderLeft: `2px solid ${ins.category === 'strength' ? '#4a7c59' : ins.category === 'weakness' ? '#8b4444' : '#4a5c7c'}`,
                    }}>
                      {ins.text}
                    </p>
                  ))}
                </div>
              )}

              {/* Rankings mini-table */}
              <div style={{ marginTop: '16px' }}>
                <div style={{
                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                  borderBottom: '2px solid #2a2217', paddingBottom: '3px', marginBottom: '8px',
                  letterSpacing: '0.5px',
                }}>
                  Final Rankings
                </div>
                {results.map(r => (
                  <div key={r.playerId} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '10px', padding: '3px 0',
                    borderBottom: '1px dotted #c4b78c',
                  }}>
                    <span style={{ fontWeight: r.rank === 1 ? 800 : 400 }}>
                      {r.rank}. {r.personaName.split(' ')[0]}
                    </span>
                    <span style={{ fontWeight: 700 }}>{r.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '3px double #2a2217', marginTop: '20px', paddingTop: '8px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '8px', color: '#8b7749', fontStyle: 'italic' }}>
              Printed by In Their Shoes Press, 1 Park Street, Kolkata 700016
            </span>
            <span style={{ fontSize: '8px', color: '#8b7749' }}>
              All stories are procedurally generated from match data
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
