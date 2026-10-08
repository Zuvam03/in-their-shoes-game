import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { soundEnabled, volume, toggleSound, setVolume, room, myPlayer } = useGameStore();
  const [showStats, setShowStats] = useState(false);

  const matchTimeElapsed = room ? room.tick : 0;
  const matchMin = Math.floor(matchTimeElapsed / 60);
  const matchSec = matchTimeElapsed % 60;

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
          maxWidth: '420px', width: '90%',
          maxHeight: '80vh', overflowY: 'auto'
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

        {/* Match info */}
        {room && (
          <div style={{
            padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)',
            marginBottom: '10px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Match Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <InfoItem label="Room" value={room.id.slice(0, 8)} />
              <InfoItem label="Players" value={`${Object.values(room.players).filter(p => p.isConnected).length}/${Object.keys(room.players).length}`} />
              <InfoItem label="Elapsed" value={`${matchMin}:${matchSec.toString().padStart(2, '0')}`} />
              <InfoItem label="Speed" value={`${room.gameSpeed}x`} />
              <InfoItem label="Phase" value={room.phase} />
              <InfoItem label="Events" value={`${room.cityEvents.length} active`} />
            </div>
          </div>
        )}

        {/* My character summary */}
        {myPlayer && (
          <div style={{
            padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)',
            marginBottom: '10px'
          }}>
            <div
              style={{
                fontSize: '13px', fontWeight: 600, marginBottom: '4px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => setShowStats(!showStats)}
            >
              <span>Quick Stats</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {showStats ? '▲' : '▼'}
              </span>
            </div>
            {showStats && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px' }}>
                <InfoItem label="Persona" value={myPlayer.persona.title} />
                <InfoItem label="Cash" value={`₹${myPlayer.state.cash}`} color="var(--accent-green)" />
                <InfoItem label="Mission" value={myPlayer.mission.status} />
                <InfoItem label="Helped" value={`${myPlayer.state.helpedOthersCount}`} color="var(--accent-green)" />
                <InfoItem label="Trust" value={`${myPlayer.socialTrust}`} />
                <InfoItem label="Impact" value={`${myPlayer.communityImpact >= 0 ? '+' : ''}${myPlayer.communityImpact}`} />
              </div>
            )}
          </div>
        )}

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
              ['6', 'Event Feed'],
              ['7', 'Journey'],
              ['8', 'Achievements'],
              ['?', 'Shortcuts overlay']
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

        {/* Version info */}
        <div style={{
          marginTop: '16px', textAlign: 'center',
          fontSize: '10px', color: 'var(--text-muted)'
        }}>
          In Their Shoes v0.9 — Kolkata City Survival
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '11px', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
