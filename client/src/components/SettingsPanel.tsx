import { useGameStore } from '../store/gameStore';

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { soundEnabled, volume, toggleSound, setVolume } = useGameStore();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="slide-up"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '24px',
          maxWidth: '400px', width: '90%'
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px' }}>Settings</h3>
          <button onClick={onClose} style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '4px 10px', color: 'var(--text-secondary)', fontSize: '13px'
          }}>
            Close
          </button>
        </div>

        {/* Sound toggle */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)',
          marginBottom: '10px'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>Sound Effects</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Synthesized audio cues</div>
          </div>
          <button onClick={toggleSound} style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
            background: soundEnabled ? 'rgba(34,197,94,0.15)' : 'var(--bg-card)',
            color: soundEnabled ? 'var(--accent-green)' : 'var(--text-muted)',
            border: `1px solid ${soundEnabled ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`
          }}>
            {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Volume slider */}
        <div style={{
          padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)',
          marginBottom: '10px', opacity: soundEnabled ? 1 : 0.5
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '8px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Volume</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {Math.round(volume * 100)}%
            </div>
          </div>
          <input
            type="range" min="0" max="100" value={Math.round(volume * 100)}
            onChange={e => setVolume(Number(e.target.value) / 100)}
            disabled={!soundEnabled}
            style={{ width: '100%', accentColor: 'var(--accent-yellow)' }}
          />
        </div>

        {/* Keyboard shortcuts */}
        <div style={{
          padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Keyboard Shortcuts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              ['1', 'Map'],
              ['2', 'Character Stats'],
              ['3', 'Mission'],
              ['4', 'Players'],
              ['5', 'Chat'],
              ['6', 'Event Feed']
            ].map(([key, label]) => (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '12px'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <kbd style={{
                  padding: '2px 8px', borderRadius: '4px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-primary)'
                }}>{key}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
