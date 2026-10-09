import { useGameStore } from '../store/gameStore';
import { LOCATIONS, LOCATION_COLORS, getLocationById } from '../game/mapData';

const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];

export default function Minimap() {
  const { room, mySocketId } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);
  const tick = room.tick;
  const dayPct = (tick % 600) / 600;
  const isNight = dayPct > 2 / 3;
  const isEvening = dayPct > 0.55 && dayPct <= 2 / 3;

  const minX = Math.min(...LOCATIONS.map(l => l.x));
  const maxX = Math.max(...LOCATIONS.map(l => l.x));
  const minY = Math.min(...LOCATIONS.map(l => l.y));
  const maxY = Math.max(...LOCATIONS.map(l => l.y));

  const pad = 12;
  const w = 100;
  const h = 80;

  const scaleX = (x: number) => pad + ((x - minX) / (maxX - minX)) * (w - pad * 2);
  const scaleY = (y: number) => pad + ((y - minY) / (maxY - minY)) * (h - pad * 2);

  const affectedLocations = new Set<string>();
  room.cityEvents.forEach(e => {
    if (e.startTick + e.duration > tick) {
      e.affectedLocations.forEach(id => {
        if (id === 'all') LOCATIONS.forEach(l => affectedLocations.add(l.id));
        else affectedLocations.add(id);
      });
    }
  });

  const bgGradient = isNight
    ? 'linear-gradient(135deg, rgba(30,27,75,0.4) 0%, rgba(49,46,129,0.3) 100%)'
    : isEvening
      ? 'linear-gradient(135deg, rgba(124,45,18,0.2) 0%, rgba(146,64,14,0.15) 100%)'
      : 'none';

  return (
    <div style={{
      background: bgGradient || 'var(--bg-secondary)',
      border: `1px solid ${isNight ? 'rgba(99,102,241,0.2)' : isEvening ? 'rgba(249,115,22,0.15)' : 'var(--border)'}`,
      borderRadius: '10px', padding: '8px', marginBottom: '10px',
      transition: 'background 1s ease, border-color 1s ease'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '4px'
      }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
          CITY OVERVIEW
        </span>
        <span style={{
          fontSize: '9px',
          color: isNight ? 'rgba(165,180,252,0.7)' : isEvening ? 'rgba(251,191,36,0.7)' : 'var(--text-muted)'
        }}>
          {isNight ? '🌙 Night' : isEvening ? '🌆 Evening' : dayPct < 0.15 ? '🌅 Morning' : '☀️ Day'}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
        {LOCATIONS.map(loc => {
          const isAffected = affectedLocations.has(loc.id);
          return (
            <g key={loc.id}>
              {isAffected && (
                <circle
                  cx={scaleX(loc.x)}
                  cy={scaleY(loc.y)}
                  r={3}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={0.4}
                  opacity={0.6}
                  strokeDasharray="1 1"
                />
              )}
              <circle
                cx={scaleX(loc.x)}
                cy={scaleY(loc.y)}
                r={1.5}
                fill={LOCATION_COLORS[loc.type] || '#666'}
                opacity={isNight ? 0.25 : 0.4}
              />
            </g>
          );
        })}

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
                >
                  <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={scaleX(loc.x)}
                cy={scaleY(loc.y)}
                r={isMe ? 2.5 : 2}
                fill={PLAYER_COLORS[i % PLAYER_COLORS.length]}
                stroke={isMe ? '#fff' : 'none'}
                strokeWidth={isMe ? 0.5 : 0}
                opacity={p.isConnected ? 1 : 0.4}
              />
            </g>
          );
        })}
      </svg>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
        {players.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px',
            color: p.id === mySocketId ? 'var(--text-primary)' : 'var(--text-muted)',
            opacity: p.isConnected ? 1 : 0.5
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: PLAYER_COLORS[i % PLAYER_COLORS.length]
            }} />
            {p.name}
          </div>
        ))}
      </div>

      {affectedLocations.size > 0 && (
        <div style={{
          marginTop: '4px', fontSize: '9px', color: '#f87171',
          display: 'flex', alignItems: 'center', gap: '3px'
        }}>
          <span>⚠</span>
          {room.cityEvents.filter(e => e.startTick + e.duration > tick).length} active event{room.cityEvents.filter(e => e.startTick + e.duration > tick).length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
