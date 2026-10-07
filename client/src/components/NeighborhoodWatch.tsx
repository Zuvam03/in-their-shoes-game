import { useGameStore } from '../store/gameStore';
import { LOCATIONS } from '../game/mapData';

export default function NeighborhoodWatch() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const players = Object.values(room.players);
  const myLoc = LOCATIONS.find(l => l.id === myPlayer.state.location);
  if (!myLoc) return null;

  const sameLocPlayers = players.filter(p => p.id !== myPlayer.id && p.state.location === myPlayer.state.location);
  const avgHealth = sameLocPlayers.length > 0
    ? Math.round(sameLocPlayers.reduce((s, p) => s + p.state.health, 0) / sameLocPlayers.length)
    : 0;
  const avgMood = sameLocPlayers.length > 0
    ? Math.round(sameLocPlayers.reduce((s, p) => s + p.state.mood, 0) / sameLocPlayers.length)
    : 0;

  const needyNearby = sameLocPlayers.filter(p => p.state.health < 30 || p.state.energy < 20);
  const activeEvents = room.cityEvents.filter(e =>
    e.affectedLocations.includes(myLoc.id) || e.affectedLocations.includes(myLoc.name)
  );

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
      }}>
        Neighborhood Watch — {myLoc.name}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
        marginBottom: '8px'
      }}>
        <div style={{
          textAlign: 'center', padding: '6px', borderRadius: '6px',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-blue)' }}>
            {sameLocPlayers.length}
          </div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>People Here</div>
        </div>
        <div style={{
          textAlign: 'center', padding: '6px', borderRadius: '6px',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: avgHealth > 50 ? 'var(--accent-green)' : 'var(--accent-red)'
          }}>
            {avgHealth || '—'}
          </div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Avg Health</div>
        </div>
        <div style={{
          textAlign: 'center', padding: '6px', borderRadius: '6px',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: avgMood > 50 ? 'var(--accent-green)' : 'var(--accent-yellow)'
          }}>
            {avgMood || '—'}
          </div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Avg Mood</div>
        </div>
      </div>

      {needyNearby.length > 0 && (
        <div style={{
          padding: '6px 8px', borderRadius: '6px',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.15)',
          marginBottom: '6px'
        }}>
          <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '2px' }}>
            ⚠️ {needyNearby.length} {needyNearby.length === 1 ? 'person' : 'people'} need help nearby
          </div>
          {needyNearby.map(p => (
            <div key={p.id} style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              {p.name} — HP: {Math.round(p.state.health)}%, EN: {Math.round(p.state.energy)}%
            </div>
          ))}
        </div>
      )}

      {activeEvents.length > 0 && (
        <div style={{
          padding: '6px 8px', borderRadius: '6px',
          background: 'rgba(245,200,66,0.06)',
          border: '1px solid rgba(245,200,66,0.15)'
        }}>
          <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--accent-yellow)' }}>
            📢 Active events here:
          </div>
          {activeEvents.map(e => (
            <div key={e.id} style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              {e.title}
            </div>
          ))}
        </div>
      )}

      {sameLocPlayers.length === 0 && activeEvents.length === 0 && (
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          All quiet in the neighborhood
        </div>
      )}
    </div>
  );
}
