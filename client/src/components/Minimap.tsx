import { useGameStore } from '../store/gameStore';
import { LOCATIONS, LOCATION_COLORS, getLocationById } from '../game/mapData';

const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];

export default function Minimap() {
  const { room, mySocketId } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);

  const minX = Math.min(...LOCATIONS.map(l => l.x));
  const maxX = Math.max(...LOCATIONS.map(l => l.x));
  const minY = Math.min(...LOCATIONS.map(l => l.y));
  const maxY = Math.max(...LOCATIONS.map(l => l.y));

  const pad = 12;
  const w = 100;
  const h = 80;

  const scaleX = (x: number) => pad + ((x - minX) / (maxX - minX)) * (w - pad * 2);
  const scaleY = (y: number) => pad + ((y - minY) / (maxY - minY)) * (h - pad * 2);

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '8px', marginBottom: '10px'
    }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
        CITY OVERVIEW
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
        {LOCATIONS.map(loc => (
          <circle
            key={loc.id}
            cx={scaleX(loc.x)}
            cy={scaleY(loc.y)}
            r={1.5}
            fill={LOCATION_COLORS[loc.type] || '#666'}
            opacity={0.4}
          />
        ))}

        {players.map((p, i) => {
          const loc = getLocationById(p.state.location);
          if (!loc) return null;
          const isMe = p.id === mySocketId;
          return (
            <g key={p.id}>
              {isMe && (
                <circle
                  cx={scaleX(loc.x)}
                  cy={scaleY(loc.y)}
                  r={4}
                  fill="none"
                  stroke={PLAYER_COLORS[i % PLAYER_COLORS.length]}
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              )}
              <circle
                cx={scaleX(loc.x)}
                cy={scaleY(loc.y)}
                r={isMe ? 2.5 : 2}
                fill={PLAYER_COLORS[i % PLAYER_COLORS.length]}
                stroke={isMe ? '#fff' : 'none'}
                strokeWidth={isMe ? 0.5 : 0}
              />
            </g>
          );
        })}
      </svg>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
        {players.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px',
            color: p.id === mySocketId ? 'var(--text-primary)' : 'var(--text-muted)'
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: PLAYER_COLORS[i % PLAYER_COLORS.length]
            }} />
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}
