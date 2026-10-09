import { useGameStore } from '../store/gameStore';
import { LOCATIONS } from '../game/mapData';

export default function PlayerProximity() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const players = Object.values(room.players).filter(p => p.id !== myPlayer.id && p.isConnected);
  const myLoc = myPlayer.state.location;
  const myLocInfo = LOCATIONS.find(l => l.id === myLoc);

  const nearby = players.filter(p => p.state.location === myLoc);
  const sameDistrict = players.filter(p => {
    if (p.state.location === myLoc) return false;
    const pLoc = LOCATIONS.find(l => l.id === p.state.location);
    return pLoc?.district === myLocInfo?.district;
  });
  const farAway = players.filter(p => {
    const pLoc = LOCATIONS.find(l => l.id === p.state.location);
    return p.state.location !== myLoc && pLoc?.district !== myLocInfo?.district;
  });

  if (players.length === 0) return null;

  const renderGroup = (title: string, group: typeof players, color: string, distLabel: string) => {
    if (group.length === 0) return null;
    return (
      <div>
        <div style={{
          fontSize: '9px', fontWeight: 600, color, marginBottom: '3px',
          textTransform: 'uppercase', letterSpacing: '0.3px'
        }}>
          {title} ({group.length})
        </div>
        {group.map(p => {
          const pLoc = LOCATIONS.find(l => l.id === p.state.location);
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '3px 6px', borderRadius: '4px',
              marginBottom: '2px'
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: p.state.health > 50 ? 'var(--accent-green)' : 'var(--accent-red)',
                flexShrink: 0
              }} />
              <span style={{ fontSize: '10px', color: 'var(--text-primary)', flex: 1 }}>
                {p.name}
              </span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                {distLabel === 'here' ? 'Here' : pLoc?.name || 'Unknown'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Player Proximity
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {renderGroup('Right Here', nearby, 'var(--accent-green)', 'here')}
        {renderGroup('Same District', sameDistrict, 'var(--accent-yellow)', 'district')}
        {renderGroup('Far Away', farAway, 'var(--text-muted)', 'far')}
      </div>
    </div>
  );
}
