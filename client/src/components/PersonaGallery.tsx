import { useGameStore } from '../store/gameStore';

const PERSONA_COLORS = [
  '#f5c842', '#3b82f6', '#22c55e', '#a855f7',
  '#f97316', '#ef4444', '#14b8a6', '#ec4899'
];

export default function PersonaGallery() {
  const { room, mySocketId } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);
  if (players.length === 0) return null;

  return (
    <div style={{
      padding: '16px', borderRadius: '12px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '12px', fontWeight: 700, color: 'var(--accent-yellow)',
        marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        👥 Players in This Match ({players.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {players.map((player, idx) => {
          const isMe = player.id === mySocketId;
          const color = PERSONA_COLORS[idx % PERSONA_COLORS.length];

          return (
            <div key={player.id} style={{
              padding: '12px', borderRadius: '10px',
              background: isMe ? `color-mix(in srgb, ${color} 6%, transparent)` : 'rgba(0,0,0,0.1)',
              border: `1px solid ${isMe ? `color-mix(in srgb, ${color} 20%, transparent)` : 'transparent'}`,
              display: 'flex', gap: '10px', alignItems: 'flex-start'
            }}>
              {/* Avatar */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, #000))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '14px', color: '#fff', flexShrink: 0
              }}>
                {player.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  marginBottom: '2px'
                }}>
                  <span style={{
                    fontWeight: 700, fontSize: '13px',
                    color: isMe ? color : 'var(--text-primary)'
                  }}>
                    {player.name}
                  </span>
                  {isMe && (
                    <span style={{
                      fontSize: '9px', padding: '1px 6px', borderRadius: '8px',
                      background: `color-mix(in srgb, ${color} 15%, transparent)`,
                      color, fontWeight: 700
                    }}>
                      YOU
                    </span>
                  )}
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: player.isConnected ? 'var(--accent-green)' : 'var(--accent-red)'
                  }} />
                </div>

                <div style={{
                  fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px'
                }}>
                  {player.persona.title}
                </div>

                <div style={{
                  fontSize: '10px', color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {player.persona.description}
                </div>

                {/* Quick trait badges */}
                {player.persona.strengths && player.persona.strengths.length > 0 && (
                  <div style={{
                    display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap'
                  }}>
                    {player.persona.strengths.slice(0, 3).map((s, i) => (
                      <span key={i} style={{
                        fontSize: '9px', padding: '1px 6px', borderRadius: '8px',
                        background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)',
                        fontWeight: 600
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Mission */}
                <div style={{
                  marginTop: '6px', fontSize: '10px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  color: 'var(--text-muted)'
                }}>
                  <span style={{
                    padding: '1px 6px', borderRadius: '8px', fontWeight: 600,
                    background: player.mission.status === 'completed'
                      ? 'rgba(34,197,94,0.1)' : 'rgba(245,200,66,0.1)',
                    color: player.mission.status === 'completed'
                      ? 'var(--accent-green)' : 'var(--accent-yellow)'
                  }}>
                    {player.mission.status}
                  </span>
                  <span>{player.mission.title}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
