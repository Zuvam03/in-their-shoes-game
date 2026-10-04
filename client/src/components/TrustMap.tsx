import { useGameStore } from '../store/gameStore';

export default function TrustMap() {
  const { room, myPlayer } = useGameStore();
  if (!room || !myPlayer) return null;

  const players = Object.values(room.players);
  if (players.length <= 1) return null;

  const avgTrust = Math.round(players.reduce((s, p) => s + p.socialTrust, 0) / players.length);
  const maxTrust = Math.max(...players.map(p => p.socialTrust));
  const minTrust = Math.min(...players.map(p => p.socialTrust));

  const sorted = [...players].sort((a, b) => b.socialTrust - a.socialTrust);

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Trust Map
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
            Avg: <b style={{ color: 'var(--accent-blue)' }}>{avgTrust}</b>
          </span>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
            Spread: <b style={{
              color: (maxTrust - minTrust) > 30 ? 'var(--accent-red)' : 'var(--accent-green)'
            }}>{maxTrust - minTrust}</b>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {sorted.map((player, i) => {
          const isMe = player.id === myPlayer.id;
          const trustColor = player.socialTrust >= 70 ? 'var(--accent-green)'
            : player.socialTrust >= 50 ? 'var(--accent-blue)'
              : player.socialTrust >= 30 ? 'var(--accent-yellow)' : 'var(--accent-red)';

          return (
            <div key={player.id} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '4px 6px', borderRadius: '6px',
              background: isMe ? 'rgba(245,200,66,0.06)' : 'transparent'
            }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, color: trustColor,
                width: '16px', textAlign: 'center'
              }}>
                #{i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '11px', fontWeight: isMe ? 700 : 500,
                  color: isMe ? 'var(--accent-yellow)' : 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {player.name} {isMe && '(You)'}
                </div>
              </div>
              <div style={{
                width: '60px', height: '4px', background: 'var(--border)',
                borderRadius: '2px', flexShrink: 0
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${player.socialTrust}%`,
                  background: trustColor,
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 700, color: trustColor,
                width: '24px', textAlign: 'right', flexShrink: 0
              }}>
                {player.socialTrust}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
