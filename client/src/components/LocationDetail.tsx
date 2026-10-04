import { useGameStore } from '../store/gameStore';
import { getLocationById, getConnectedLocations, LOCATION_ICONS, LOCATION_COLORS, LOCATION_AMBIENCE } from '../game/mapData';

export default function LocationDetail() {
  const { myPlayer, room, submitAction } = useGameStore();
  if (!myPlayer || !room) return null;

  const loc = getLocationById(myPlayer.state.location);
  if (!loc) return null;

  const icon = LOCATION_ICONS[loc.type] || '📍';
  const color = LOCATION_COLORS[loc.type] || '#888';

  const nearbyPlayers = Object.values(room.players)
    .filter(p => p.id !== myPlayer.id && p.state.location === myPlayer.state.location && p.isConnected);

  const connectedLocs = getConnectedLocations(myPlayer.state.location)
    .map(id => getLocationById(id))
    .filter(Boolean);

  const tick = room.tick;
  const dayPct = (tick % 600) / 600;
  const isNight = dayPct > 2 / 3;

  const activeEvents = room.cityEvents.filter(e =>
    e.startTick + e.duration > tick &&
    (e.affectedLocations.includes('all') || e.affectedLocations.includes(myPlayer.state.location))
  );

  const ambience = LOCATION_AMBIENCE[loc.id];
  let ambienceSnippet = '';
  if (ambience) {
    const hasWeather = activeEvents.some(e => e.type === 'weather');
    const hasHeat = activeEvents.some(e => e.type === 'heat');
    if (hasWeather) ambienceSnippet = ambience.rain;
    else if (hasHeat) ambienceSnippet = ambience.heat;
    else if (isNight) ambienceSnippet = ambience.night;
    else ambienceSnippet = ambience.day;
  }

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '10px', marginBottom: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{loc.name}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{loc.district}</div>
        </div>
        <div style={{
          padding: '2px 6px', borderRadius: '4px',
          fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
          background: `${color}22`, color, letterSpacing: '0.3px'
        }}>
          {loc.type}
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: 1.5 }}>
        {loc.description}
      </div>

      {ambienceSnippet && (
        <div style={{
          fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic',
          padding: '6px 8px', borderRadius: '6px',
          background: isNight ? 'rgba(99,102,241,0.04)' : 'rgba(245,200,66,0.03)',
          marginBottom: '8px', lineHeight: 1.5
        }}>
          {ambienceSnippet}
        </div>
      )}

      {/* Nearby players */}
      {nearbyPlayers.length > 0 && (
        <div style={{
          padding: '6px 8px', borderRadius: '6px',
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)',
          marginBottom: '8px', fontSize: '11px',
          display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'
        }}>
          <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
            👥 {nearbyPlayers.length} here:
          </span>
          {nearbyPlayers.map(p => (
            <span key={p.id} style={{
              padding: '1px 6px', borderRadius: '8px',
              background: 'rgba(34,197,94,0.1)',
              color: 'var(--text-secondary)', fontSize: '10px'
            }}>
              {p.name}
            </span>
          ))}
        </div>
      )}

      {/* Active events at this location */}
      {activeEvents.length > 0 && (
        <div style={{
          padding: '6px 8px', borderRadius: '6px',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)',
          marginBottom: '8px', fontSize: '10px',
          display: 'flex', flexDirection: 'column', gap: '3px'
        }}>
          {activeEvents.map(evt => (
            <div key={evt.id} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              color: '#f87171'
            }}>
              <span>⚠</span>
              <span style={{ fontWeight: 600 }}>{evt.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Connected locations */}
      {connectedLocs.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px'
          }}>
            Nearby Locations
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {connectedLocs.slice(0, 5).map(cl => {
              const clIcon = LOCATION_ICONS[cl!.type] || '📍';
              return (
                <button
                  key={cl!.id}
                  onClick={() => submitAction('move' as never, { destination: cl!.id })}
                  style={{
                    padding: '3px 8px', borderRadius: '12px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    fontSize: '10px', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '3px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '11px' }}>{clIcon}</span>
                  {cl!.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
