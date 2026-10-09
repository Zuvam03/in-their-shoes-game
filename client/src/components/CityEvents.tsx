import { useGameStore } from '../store/gameStore';

export default function CityEvents() {
  const { room } = useGameStore();
  if (!room) return null;

  const events = room.cityEvents;
  if (events.length === 0) {
    return (
      <div style={{
        padding: '10px 12px', borderRadius: '10px',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
        }}>
          City Events
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No active events — the city is calm
        </div>
      </div>
    );
  }

  const EVENT_COLORS: Record<string, string> = {
    festival: 'var(--accent-yellow)',
    accident: 'var(--accent-red)',
    weather: 'var(--accent-blue)',
    market: 'var(--accent-green)',
    protest: 'var(--accent-orange)',
    health: 'var(--accent-red)',
  };

  const EVENT_ICONS: Record<string, string> = {
    festival: '🎉',
    accident: '🚧',
    weather: '🌧️',
    market: '📈',
    protest: '📢',
    health: '🏥',
  };

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
          City Events
        </div>
        <div style={{
          fontSize: '9px', fontWeight: 700, padding: '2px 6px',
          borderRadius: '8px', background: 'rgba(239,68,68,0.15)',
          color: 'var(--accent-red)'
        }}>
          {events.length} ACTIVE
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {events.map(evt => {
          const color = EVENT_COLORS[evt.type] || 'var(--text-muted)';
          const icon = EVENT_ICONS[evt.type] || '📌';
          const elapsed = room.tick - evt.startTick;
          const remaining = Math.max(0, evt.duration - elapsed);
          const remainPct = (remaining / evt.duration) * 100;

          return (
            <div key={evt.id} style={{
              padding: '8px', borderRadius: '8px',
              background: `color-mix(in srgb, ${color} 5%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 15%, transparent)`
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px'
              }}>
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color }}>
                    {evt.title}
                  </div>
                </div>
                {evt.requiresChoice && (
                  <span style={{
                    fontSize: '8px', fontWeight: 700, padding: '2px 5px',
                    borderRadius: '4px', background: 'rgba(245,200,66,0.15)',
                    color: 'var(--accent-yellow)'
                  }}>
                    CHOICE
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px'
              }}>
                {evt.description}
              </div>
              <div style={{
                height: '2px', background: 'var(--border)', borderRadius: '1px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', borderRadius: '1px',
                  width: `${remainPct}%`, background: color,
                  transition: 'width 1s linear'
                }} />
              </div>
              <div style={{
                fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px'
              }}>
                Affects: {evt.affectedLocations.join(', ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
