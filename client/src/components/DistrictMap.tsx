import { useGameStore } from '../store/gameStore';
import { LOCATIONS } from '../game/mapData';

const DISTRICTS = [
  { name: 'Howrah', color: '#3b82f6' },
  { name: 'Burrabazar', color: '#f97316' },
  { name: 'Park Street', color: '#a855f7' },
  { name: 'Esplanade', color: '#10b981' },
  { name: 'College Street', color: '#f59e0b' },
  { name: 'Kalighat', color: '#ef4444' },
  { name: 'Sealdah', color: '#ec4899' },
  { name: 'Salt Lake', color: '#06b6d4' },
];

export default function DistrictMap() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const players = Object.values(room.players);
  const currentLoc = LOCATIONS.find(l => l.id === myPlayer.state.location);
  const currentDistrict = currentLoc?.district || 'Unknown';

  const districtStats = DISTRICTS.map(d => {
    const locs = LOCATIONS.filter(l => l.district === d.name);
    const playersHere = players.filter(p => {
      const pLoc = LOCATIONS.find(l => l.id === p.state.location);
      return pLoc?.district === d.name;
    });
    return {
      ...d,
      locationCount: locs.length,
      playerCount: playersHere.length,
      isCurrent: d.name === currentDistrict,
      types: [...new Set(locs.map(l => l.type))]
    };
  }).filter(d => d.locationCount > 0);

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Districts Overview
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {districtStats.map(d => (
          <div key={d.name} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 8px', borderRadius: '6px',
            background: d.isCurrent
              ? `color-mix(in srgb, ${d.color} 10%, transparent)`
              : 'transparent',
            border: d.isCurrent
              ? `1px solid color-mix(in srgb, ${d.color} 25%, transparent)`
              : '1px solid transparent'
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: d.color, flexShrink: 0
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                color: d.isCurrent ? d.color : 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                {d.name}
                {d.isCurrent && <span style={{ fontSize: '8px' }}>📍</span>}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                {d.locationCount} locations · {d.playerCount} {d.playerCount === 1 ? 'player' : 'players'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
