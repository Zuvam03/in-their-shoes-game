import { useGameStore } from '../store/gameStore';

interface Props {
  onClose: () => void;
}

export default function PauseMenu({ onClose }: Props) {
  const { soundEnabled, toggleSound, volume, setVolume, room, myPlayer, playAgain } = useGameStore();

  if (!room || !myPlayer) return null;

  const timeLeft = room.matchDuration - room.tick;
  const timeMin = Math.floor(Math.max(0, timeLeft) / 60);
  const timeSec = Math.max(0, timeLeft) % 60;
  const dayNum = Math.floor(room.tick / 600) + 1;
  const progress = Math.min(100, (room.tick / room.matchDuration) * 100);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div
        style={{
          width: '90%', maxWidth: '400px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>⚙️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Game Menu</h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Day {dayNum} — {timeMin}:{String(timeSec).padStart(2, '0')} remaining
          </div>
        </div>

        <div style={{
          height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--accent-green), var(--accent-yellow), var(--accent-red))'
          }} />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
        }}>
          {[
            { label: 'Health', value: myPlayer.state.health, color: 'var(--accent-red)' },
            { label: 'Energy', value: myPlayer.state.energy, color: 'var(--accent-yellow)' },
            { label: 'Cash', value: `₹${myPlayer.state.cash}`, color: 'var(--accent-green)' },
            { label: 'Score', value: room.tick > 0 ? Math.round((myPlayer.mission.partialProgress || 0)) + '%' : '—', color: 'var(--accent-blue)' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '8px 10px', borderRadius: '8px',
              background: 'var(--bg-secondary)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: stat.color }}>
                {typeof stat.value === 'number' ? stat.value : stat.value}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          padding: '12px', borderRadius: '10px',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Sound</span>
            <button
              onClick={toggleSound}
              style={{
                padding: '4px 12px', borderRadius: '6px',
                background: soundEnabled ? 'rgba(34,197,94,0.15)' : 'var(--bg-card)',
                border: `1px solid ${soundEnabled ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                color: soundEnabled ? 'var(--accent-green)' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: 600
              }}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          {soundEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🔈</span>
              <input
                type="range" min="0" max="100"
                value={Math.round(volume * 100)}
                onChange={e => setVolume(Number(e.target.value) / 100)}
                style={{ flex: 1, accentColor: 'var(--accent-yellow)' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🔊</span>
            </div>
          )}
        </div>

        <div style={{
          padding: '10px 12px', borderRadius: '8px',
          background: 'rgba(139,92,246,0.04)',
          border: '1px solid rgba(139,92,246,0.12)'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Keyboard Shortcuts
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
            fontSize: '10px', color: 'var(--text-secondary)'
          }}>
            {[
              ['1-8', 'Switch tabs'],
              ['M', 'Map tab'],
              ['C', 'Character tab'],
              ['Esc', 'Close menus'],
            ].map(([key, desc]) => (
              <div key={key} style={{ display: 'flex', gap: '6px' }}>
                <kbd style={{
                  padding: '1px 4px', borderRadius: '3px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  fontSize: '9px', fontWeight: 600
                }}>{key}</kbd>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 2, padding: '12px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #f5c842, #f97316)',
              color: '#000', fontWeight: 700, fontSize: '14px'
            }}
          >
            Resume Game
          </button>
          <button
            onClick={playAgain}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--accent-red)', fontWeight: 600, fontSize: '13px'
            }}
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}
