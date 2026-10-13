import { useGameStore } from '../store/gameStore';

export default function ConstraintPanel() {
  const myPlayer = useGameStore(s => s.myPlayer);
  const notifications = useGameStore(s => s.notifications);

  if (!myPlayer) return null;

  const sc = myPlayer.persona.socialContext;
  if (!sc) return null;

  const obligations = sc.hiddenObligations || [];
  const obligationNotifs = notifications.filter(n => n.type === 'obligation');

  const hasObligations = obligations.length > 0;
  const classLabel = sc.class.replace('-', ' ');

  const decisionWeights = sc.decisionWeights;
  const topWeights = Object.entries(decisionWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k]) => {
      const labels: Record<string, string> = {
        groupLoyalty: 'Group loyalty',
        selfPreservation: 'Self-preservation',
        principledAction: 'Principled action',
        statusAnxiety: 'Status anxiety',
        communityDuty: 'Community duty',
      };
      return labels[k] || k;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{
        fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.4px',
      }}>
        Your Hidden Constraints
      </div>

      {/* Social class */}
      <div style={{
        padding: '8px 10px', borderRadius: '8px',
        background: 'rgba(168,85,247,0.04)',
        border: '1px solid rgba(168,85,247,0.12)',
      }}>
        <div style={{
          fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px',
        }}>
          Social Position
        </div>
        <div style={{
          fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {classLabel} class
        </div>
        <div style={{
          fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px',
        }}>
          {sc.communityIdentity}
        </div>
      </div>

      {/* Decision drivers */}
      <div style={{
        padding: '8px 10px', borderRadius: '8px',
        background: 'rgba(59,130,246,0.04)',
        border: '1px solid rgba(59,130,246,0.1)',
      }}>
        <div style={{
          fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px',
        }}>
          What drives your decisions
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {topWeights.map(w => (
            <span key={w} style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
              background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)',
              fontWeight: 500,
            }}>
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* Hidden obligations */}
      {hasObligations && (
        <div style={{
          padding: '8px 10px', borderRadius: '8px',
          background: 'rgba(245,200,66,0.04)',
          border: '1px solid rgba(245,200,66,0.12)',
        }}>
          <div style={{
            fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <span>⚠️</span> Obligations ({obligations.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {obligations.map((obl, i) => {
              const triggered = obligationNotifs.some(n => n.text.includes(obl));
              return (
                <div key={i} style={{
                  fontSize: '11px', padding: '5px 8px', borderRadius: '6px',
                  background: triggered
                    ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.1)',
                  border: triggered
                    ? '1px solid rgba(239,68,68,0.15)' : '1px solid transparent',
                  color: triggered
                    ? 'var(--text-primary)' : 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}>
                  {triggered && <span style={{ color: 'var(--accent-red)', marginRight: '4px' }}>!</span>}
                  {obl}
                  {triggered && (
                    <div style={{
                      fontSize: '9px', color: 'var(--accent-red)', marginTop: '2px',
                    }}>
                      This obligation has cost you resources
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pressures */}
      {sc.politicalPressures.length > 0 && (
        <div style={{
          padding: '8px 10px', borderRadius: '8px',
          background: 'rgba(239,68,68,0.03)',
          border: '1px solid rgba(239,68,68,0.08)',
        }}>
          <div style={{
            fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px',
          }}>
            Pressures you face
          </div>
          {sc.politicalPressures.map((p, i) => (
            <div key={i} style={{
              fontSize: '10px', color: 'var(--text-secondary)',
              lineHeight: 1.4, marginTop: i > 0 ? '2px' : 0,
            }}>
              {p}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
