import { useGameStore } from '../store/gameStore';
import GameHistory from './GameHistory';
import LobbyTips from './LobbyTips';

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x', desc: 'Relaxed' },
  { value: 1, label: '1x', desc: 'Normal' },
  { value: 1.5, label: '1.5x', desc: 'Fast' },
  { value: 2, label: '2x', desc: 'Rush' }
];

export default function Lobby() {
  const { room, mySocketId, roomId, setReady, startMatch, playAgain, setGameSpeed } = useGameStore();
  const isHost = room?.hostId === mySocketId;
  const myPlayer = mySocketId ? room?.players[mySocketId] : null;
  const players = room ? Object.values(room.players) : [];
  const allReady = players.length > 0 && players.every(p => p.isReady);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '520px', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>🚪</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Game Lobby</h1>
          {room && (
            <div style={{
              marginTop: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Room Code:</span>
              <span style={{
                fontFamily: 'monospace', fontSize: '20px', fontWeight: 700,
                color: 'var(--accent-yellow)', letterSpacing: '3px'
              }}>
                {roomId}
              </span>
              <button
                onClick={() => navigator.clipboard?.writeText(roomId || '')}
                title="Copy room code"
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '4px 8px',
                  color: 'var(--text-secondary)', fontSize: '12px'
                }}
              >
                Copy
              </button>
            </div>
          )}
        </div>

        {/* Match info */}
        <div style={{
          borderRadius: '10px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid var(--border)'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Match Duration</span>
            <span style={{ fontWeight: 600 }}>
              {room ? `${room.matchDuration / 60} minutes` : '—'}
            </span>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Game Speed</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {room?.gameSpeed === 1 ? 'Normal pace' :
                 room?.gameSpeed === 0.5 ? 'Half speed - more time to think' :
                 room?.gameSpeed === 1.5 ? 'Faster - more pressure' :
                 'Double speed - intense!'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {SPEED_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => isHost && setGameSpeed(opt.value)}
                  disabled={!isHost}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '8px',
                    background: room?.gameSpeed === opt.value
                      ? 'rgba(245,200,66,0.15)'
                      : 'var(--bg-secondary)',
                    border: `1px solid ${room?.gameSpeed === opt.value
                      ? 'rgba(245,200,66,0.4)'
                      : 'var(--border)'}`,
                    color: room?.gameSpeed === opt.value
                      ? 'var(--accent-yellow)'
                      : 'var(--text-muted)',
                    fontSize: '12px', fontWeight: 600,
                    cursor: isHost ? 'pointer' : 'default',
                    opacity: isHost ? 1 : 0.6,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
                  }}
                >
                  <span>{opt.label}</span>
                  <span style={{ fontSize: '9px', fontWeight: 400 }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Players list */}
        <div style={{
          borderRadius: '12px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600
          }}>
            Players ({players.length}/6)
          </div>
          {players.map(p => (
            <div
              key={p.id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                background: p.id === mySocketId ? 'rgba(245, 200, 66, 0.05)' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: `hsl(${p.name.charCodeAt(0) * 7}deg 60% 40%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, color: '#fff'
                }}>
                  {p.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {p.name}
                    {p.id === mySocketId && <span style={{ color: 'var(--accent-yellow)', fontSize: '11px', marginLeft: '6px' }}>(you)</span>}
                    {room?.hostId === p.id && <span style={{ color: 'var(--accent-orange)', fontSize: '11px', marginLeft: '6px' }}>host</span>}
                  </div>
                  {!p.isConnected && <div style={{ fontSize: '11px', color: 'var(--accent-red)' }}>Disconnected</div>}
                </div>
              </div>
              <div style={{
                padding: '4px 10px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 600,
                background: p.isReady ? 'rgba(34, 197, 94, 0.15)' : 'rgba(139, 146, 168, 0.15)',
                color: p.isReady ? 'var(--accent-green)' : 'var(--text-muted)'
              }}>
                {p.isReady ? 'Ready' : 'Waiting'}
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No players yet
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {!myPlayer?.isReady && (
            <button
              onClick={setReady}
              style={{
                flex: 1, padding: '13px', borderRadius: '10px',
                background: 'var(--accent-green)',
                color: '#fff', fontWeight: 700, fontSize: '14px'
              }}
            >
              Ready ✓
            </button>
          )}
          {isHost && (
            <button
              onClick={startMatch}
              disabled={players.length < 1}
              style={{
                flex: 2, padding: '13px', borderRadius: '10px',
                background: allReady || players.length >= 1
                  ? 'linear-gradient(135deg, #f5c842, #f97316)'
                  : 'var(--bg-card-hover)',
                color: (allReady || players.length >= 1) ? '#000' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '14px',
                border: 'none'
              }}
            >
              Start Match →
            </button>
          )}
        </div>

        {/* Tips */}
        <LobbyTips />

        <button
          onClick={playAgain}
          style={{
            padding: '10px', borderRadius: '8px',
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: '13px'
          }}
        >
          Leave Room
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
          Share the room code with friends. Host can start with any number of players.
        </p>
      </div>
    </div>
  );
}
