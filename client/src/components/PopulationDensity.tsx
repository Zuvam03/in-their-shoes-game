import { useGameStore } from '../store/gameStore';
import { LOCATIONS } from '../game/mapData';

export default function PopulationDensity() {
  const { room } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);

  const locationCounts = LOCATIONS.map(loc => {
    const count = players.filter(p => p.state.location === loc.id).length;
    return { name: loc.name, district: loc.district, type: loc.type, count };
  }).filter(l => l.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...locationCounts.map(l => l.count), 1);

  if (locationCounts.length === 0) return null;

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Population Hotspots
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {locationCounts.slice(0, 5).map(loc => (
          <div key={loc.name} style={{
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <div style={{
              fontSize: '10px', color: 'var(--text-secondary)',
              width: '80px', overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', flexShrink: 0
            }}>
              {loc.name}
            </div>
            <div style={{
              flex: 1, height: '10px', background: 'var(--border)',
              borderRadius: '5px', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: '5px',
                width: `${(loc.count / maxCount) * 100}%`,
                background: loc.count >= 3 ? 'var(--accent-red)' : loc.count >= 2 ? 'var(--accent-yellow)' : 'var(--accent-green)',
                transition: 'width 0.3s'
              }} />
            </div>
            <span style={{
              fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)',
              width: '20px', textAlign: 'right'
            }}>
              {loc.count}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '6px', fontSize: '9px', color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        {players.length} players across {locationCounts.length} locations
      </div>
    </div>
  );
}
