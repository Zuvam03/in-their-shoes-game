import { useGameStore, PublicPlayer } from '../store/gameStore';
import ReputationBadge from './ReputationBadge';

interface Props {
  playerId: string;
  onClose: () => void;
}

function CompareBar({ label, myVal, theirVal, color, inverted = false }: {
  label: string; myVal: number; theirVal: number; color: string; inverted?: boolean;
}) {
  const myBetter = inverted ? myVal < theirVal : myVal > theirVal;
  const diff = Math.round(myVal - theirVal);

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '3px'
      }}>
        <span style={{
          fontSize: '11px', fontWeight: 600,
          color: myBetter ? 'var(--accent-green)' : diff === 0 ? 'var(--text-secondary)' : 'var(--accent-red)'
        }}>
          {Math.round(myVal)}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {Math.round(theirVal)}
        </span>
      </div>
      <div style={{
        display: 'flex', gap: '2px', height: '4px'
      }}>
        <div style={{
          flex: 1, background: 'var(--border)', borderRadius: '2px 0 0 2px',
          overflow: 'hidden', direction: 'rtl'
        }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${myVal}%`, background: color, transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{
          flex: 1, background: 'var(--border)', borderRadius: '0 2px 2px 0',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${theirVal}%`, background: `color-mix(in srgb, ${color} 60%, var(--text-muted))`,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
    </div>
  );
}

export default function PlayerComparison({ playerId, onClose }: Props) {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const other: PublicPlayer | undefined = room.players[playerId];
  if (!other) return null;

  const myAdvantages: string[] = [];
  const theirAdvantages: string[] = [];

  if (myPlayer.state.health > other.state.health + 10) myAdvantages.push('Healthier');
  else if (other.state.health > myPlayer.state.health + 10) theirAdvantages.push('Healthier');

  if (myPlayer.state.cash > other.state.cash + 20) myAdvantages.push('Wealthier');
  else if (other.state.cash > myPlayer.state.cash + 20) theirAdvantages.push('Wealthier');

  if (myPlayer.socialTrust > other.socialTrust + 10) myAdvantages.push('More trusted');
  else if (other.socialTrust > myPlayer.socialTrust + 10) theirAdvantages.push('More trusted');

  if (myPlayer.state.helpedOthersCount > other.state.helpedOthersCount) myAdvantages.push('More helpful');
  else if (other.state.helpedOthersCount > myPlayer.state.helpedOthersCount) theirAdvantages.push('More helpful');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
    }}
      onClick={onClose}
    >
      <div style={{
        width: '380px', maxWidth: '90vw', maxHeight: '80vh',
        background: 'var(--bg-primary)', borderRadius: '16px',
        border: '1px solid var(--border)', overflow: 'auto',
        padding: '20px'
      }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
            Player Comparison
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: '18px', cursor: 'pointer'
          }}>
            x
          </button>
        </div>

        {/* Names */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginBottom: '16px',
          padding: '10px', borderRadius: '10px', background: 'var(--bg-secondary)'
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
              {myPlayer.persona.name}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {myPlayer.persona.title}
            </div>
            <div style={{ marginTop: '4px' }}>
              <ReputationBadge trust={myPlayer.socialTrust} size="small" />
            </div>
          </div>
          <div style={{
            fontSize: '16px', fontWeight: 700, color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center'
          }}>
            VS
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {other.name}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {other.persona.title}
            </div>
            <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
              <ReputationBadge trust={other.socialTrust} size="small" />
            </div>
          </div>
        </div>

        {/* Stat bars */}
        <CompareBar label="Health" myVal={myPlayer.state.health} theirVal={other.state.health} color="var(--accent-red)" />
        <CompareBar label="Energy" myVal={myPlayer.state.energy} theirVal={other.state.energy} color="var(--accent-yellow)" />
        <CompareBar label="Mood" myVal={myPlayer.state.mood} theirVal={other.state.mood} color="var(--accent-purple)" />
        <CompareBar label="Hunger" myVal={myPlayer.state.hunger} theirVal={other.state.hunger} color="var(--accent-orange)" inverted />
        <CompareBar label="Stress" myVal={myPlayer.state.stress} theirVal={other.state.stress} color="var(--accent-red)" inverted />

        {/* Cash */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 12px', borderRadius: '8px', marginBottom: '12px',
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)'
        }}>
          <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '14px' }}>
            ₹{myPlayer.state.cash}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cash</span>
          <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '14px' }}>
            ₹{other.state.cash}
          </span>
        </div>

        {/* Social stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px'
        }}>
          <CompactStat label="Trust" myVal={myPlayer.socialTrust} theirVal={other.socialTrust} />
          <CompactStat label="Impact" myVal={myPlayer.communityImpact} theirVal={other.communityImpact} />
          <CompactStat label="Helped" myVal={myPlayer.state.helpedOthersCount} theirVal={other.state.helpedOthersCount} />
          <CompactStat label="Got Help" myVal={myPlayer.state.receivedHelpCount} theirVal={other.state.receivedHelpCount} />
        </div>

        {/* Advantages summary */}
        {(myAdvantages.length > 0 || theirAdvantages.length > 0) && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
          }}>
            {myAdvantages.length > 0 && (
              <div style={{
                padding: '8px', borderRadius: '8px',
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)'
              }}>
                <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--accent-green)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Your Edge
                </div>
                {myAdvantages.map((a, i) => (
                  <div key={i} style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    + {a}
                  </div>
                ))}
              </div>
            )}
            {theirAdvantages.length > 0 && (
              <div style={{
                padding: '8px', borderRadius: '8px',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)'
              }}>
                <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Their Edge
                </div>
                {theirAdvantages.map((a, i) => (
                  <div key={i} style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    + {a}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CompactStat({ label, myVal, theirVal }: {
  label: string; myVal: number; theirVal: number;
}) {
  return (
    <div style={{
      padding: '6px 8px', borderRadius: '6px',
      background: 'var(--bg-secondary)', textAlign: 'center'
    }}>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent-yellow)' }}>{myVal}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>vs</span>
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-secondary)' }}>{theirVal}</span>
      </div>
    </div>
  );
}
