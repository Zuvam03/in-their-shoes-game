import { useGameStore } from '../store/gameStore';

export default function EventCountdown() {
  const { room } = useGameStore();
  if (!room || room.cityEvents.length === 0) return null;

  return (
    <div style={{
      padding: '8px 10px', borderRadius: '10px',
      background: 'rgba(239,68,68,0.06)',
      border: '1px solid rgba(239,68,68,0.15)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--accent-red)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        <span style={{ animation: 'pulse 2s infinite' }}>⚠</span> Active City Events
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {room.cityEvents.map(evt => {
          const elapsed = room.tick - evt.startTick;
          const remaining = Math.max(0, evt.duration - elapsed);
          const pct = (remaining / evt.duration) * 100;
          const timeLeft = Math.round(remaining / 10);

          return (
            <div key={evt.id} style={{
              padding: '6px 8px', borderRadius: '6px',
              background: 'rgba(239,68,68,0.04)'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {evt.title}
                </span>
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  color: remaining < 100 ? 'var(--accent-yellow)' : 'var(--accent-red)'
                }}>
                  {timeLeft}s left
                </span>
              </div>
              <div style={{
                height: '3px', background: 'var(--border)', borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${pct}%`,
                  background: remaining < 100
                    ? 'var(--accent-yellow)'
                    : 'var(--accent-red)',
                  transition: 'width 1s linear'
                }} />
              </div>
              <div style={{
                fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px'
              }}>
                {evt.description}
              </div>
              {evt.affectedLocations.length > 0 && (
                <div style={{
                  display: 'flex', gap: '3px', marginTop: '3px', flexWrap: 'wrap'
                }}>
                  {evt.affectedLocations.slice(0, 3).map(loc => (
                    <span key={loc} style={{
                      fontSize: '9px', padding: '1px 4px', borderRadius: '4px',
                      background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)'
                    }}>
                      {loc.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {evt.affectedLocations.length > 3 && (
                    <span style={{
                      fontSize: '9px', color: 'var(--text-muted)'
                    }}>
                      +{evt.affectedLocations.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
