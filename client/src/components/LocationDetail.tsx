import { useGameStore } from '../store/gameStore';
import { getLocationById, getConnectedLocations, LOCATION_ICONS, LOCATION_COLORS, LOCATION_AMBIENCE } from '../game/mapData';

const SCENE_CONFIGS: Record<string, { gradient: string; particles: Array<{ emoji: string; speed: number }>; accent: string }> = {
  transport: {
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(30,64,175,0.08) 100%)',
    particles: [{ emoji: '🚌', speed: 4 }, { emoji: '🚇', speed: 6 }, { emoji: '🚋', speed: 5 }],
    accent: '#3b82f6'
  },
  food: {
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(234,88,12,0.08) 100%)',
    particles: [{ emoji: '🍛', speed: 3 }, { emoji: '☕', speed: 2.5 }, { emoji: '🫖', speed: 3.5 }],
    accent: '#f59e0b'
  },
  shop: {
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.12) 0%, rgba(168,85,247,0.08) 100%)',
    particles: [{ emoji: '🛍️', speed: 2 }, { emoji: '📦', speed: 3 }, { emoji: '🪙', speed: 2.5 }],
    accent: '#ec4899'
  },
  office: {
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)',
    particles: [{ emoji: '💼', speed: 2 }, { emoji: '📋', speed: 1.5 }],
    accent: '#10b981'
  },
  medical: {
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(185,28,28,0.06) 100%)',
    particles: [{ emoji: '💊', speed: 2 }, { emoji: '🏥', speed: 1.5 }],
    accent: '#ef4444'
  },
  public: {
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(124,58,237,0.06) 100%)',
    particles: [{ emoji: '🌳', speed: 1 }, { emoji: '🕊️', speed: 2 }],
    accent: '#8b5cf6'
  },
  residential: {
    gradient: 'linear-gradient(135deg, rgba(245,200,66,0.12) 0%, rgba(234,179,8,0.06) 100%)',
    particles: [{ emoji: '🏠', speed: 1 }, { emoji: '🪴', speed: 1.5 }],
    accent: '#eab308'
  },
  education: {
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(14,116,144,0.06) 100%)',
    particles: [{ emoji: '📚', speed: 1.5 }, { emoji: '✏️', speed: 2 }],
    accent: '#06b6d4'
  },
};

export default function LocationDetail() {
  const { myPlayer, room, submitAction, visitedLocations } = useGameStore();
  if (!myPlayer || !room) return null;

  const loc = getLocationById(myPlayer.state.location);
  if (!loc) return null;

  const icon = LOCATION_ICONS[loc.type] || '📍';
  const color = LOCATION_COLORS[loc.type] || '#888';
  const scene = SCENE_CONFIGS[loc.type] || SCENE_CONFIGS.public;

  const nearbyPlayers = Object.values(room.players)
    .filter(p => p.id !== myPlayer.id && p.state.location === myPlayer.state.location && p.isConnected);

  const connectedLocs = getConnectedLocations(myPlayer.state.location)
    .map(id => getLocationById(id))
    .filter(Boolean);

  const tick = room.tick;
  const dayPct = (tick % 600) / 600;
  const isNight = dayPct > 2 / 3;
  const isEvening = dayPct > 0.55 && dayPct <= 2 / 3;

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

  const exploredCount = visitedLocations.size;

  return (
    <div style={{
      borderRadius: '12px', overflow: 'hidden', marginBottom: '10px',
      border: `1px solid ${scene.accent}22`,
    }}>
      {/* Scene header with animated particles */}
      <div style={{
        position: 'relative',
        background: scene.gradient,
        padding: '14px 12px 10px',
        overflow: 'hidden',
        minHeight: '70px',
      }}>
        {/* Floating particles */}
        {scene.particles.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            fontSize: '16px',
            opacity: 0.15,
            right: `${10 + i * 25}%`,
            top: `${15 + (i * 20) % 50}%`,
            animation: `float ${p.speed}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
            pointerEvents: 'none',
          }}>
            {p.emoji}
          </div>
        ))}

        {/* Night/evening tint */}
        {isNight && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'rgba(0,0,20,0.25)',
          }} />
        )}
        {isEvening && !isNight && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, transparent 100%)',
          }} />
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: `${scene.accent}20`,
              border: `1px solid ${scene.accent}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}>
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{loc.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span>{loc.district}</span>
                <span style={{
                  padding: '1px 5px', borderRadius: '4px',
                  fontSize: '8px', fontWeight: 700, textTransform: 'uppercase',
                  background: `${color}22`, color, letterSpacing: '0.3px'
                }}>
                  {loc.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content body */}
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '10px 12px',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
          {loc.description}
        </div>

        {ambienceSnippet && (
          <div style={{
            fontSize: '10px', color: isNight ? 'rgba(129,140,248,0.8)' : isEvening ? 'rgba(251,146,60,0.9)' : 'var(--accent-teal)',
            fontStyle: 'italic',
            padding: '6px 8px', borderRadius: '6px',
            background: isNight ? 'rgba(99,102,241,0.06)' : isEvening ? 'rgba(249,115,22,0.04)' : 'rgba(245,200,66,0.03)',
            marginBottom: '8px', lineHeight: 1.5,
            borderLeft: `2px solid ${isNight ? 'rgba(129,140,248,0.3)' : isEvening ? 'rgba(251,146,60,0.3)' : 'rgba(245,200,66,0.2)'}`,
          }}>
            {ambienceSnippet}
          </div>
        )}

        {/* Nearby players */}
        {nearbyPlayers.length > 0 && (
          <div style={{
            padding: '6px 8px', borderRadius: '8px',
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)',
            marginBottom: '8px', fontSize: '11px',
            display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'
          }}>
            <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '10px' }}>
              👥 {nearbyPlayers.length} here:
            </span>
            {nearbyPlayers.map(p => (
              <span key={p.id} style={{
                padding: '2px 8px', borderRadius: '10px',
                background: 'rgba(34,197,94,0.1)',
                color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 500
              }}>
                {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Active events */}
        {activeEvents.length > 0 && (
          <div style={{
            padding: '6px 8px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
            marginBottom: '8px', fontSize: '10px',
            display: 'flex', flexDirection: 'column', gap: '3px'
          }}>
            {activeEvents.map(evt => (
              <div key={evt.id} style={{
                display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171'
              }}>
                <span>⚠</span>
                <span style={{ fontWeight: 600 }}>{evt.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Connected locations */}
        {connectedLocs.length > 0 && (
          <div style={{ marginBottom: '6px' }}>
            <div style={{
              fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px'
            }}>
              Nearby Locations
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {connectedLocs.slice(0, 5).map(cl => {
                const clIcon = LOCATION_ICONS[cl!.type] || '📍';
                const isVisited = visitedLocations.has(cl!.id);
                return (
                  <button
                    key={cl!.id}
                    onClick={() => submitAction('move' as never, { destination: cl!.id })}
                    style={{
                      padding: '4px 8px', borderRadius: '12px',
                      background: isVisited ? 'var(--bg-card)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isVisited ? 'var(--border)' : 'rgba(255,255,255,0.06)'}`,
                      fontSize: '10px', color: isVisited ? 'var(--text-secondary)' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', gap: '3px',
                      cursor: 'pointer', opacity: isVisited ? 1 : 0.6,
                    }}
                  >
                    <span style={{ fontSize: '11px' }}>{clIcon}</span>
                    {isVisited ? cl!.name : '???'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Exploration progress */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px',
          paddingTop: '6px', borderTop: '1px solid var(--border)',
        }}>
          <span>Explored {exploredCount}/{connectedLocs.length + 1} nearby</span>
          <div style={{
            width: '60px', height: '3px', borderRadius: '2px',
            background: 'var(--border)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              width: `${Math.min(100, (exploredCount / Math.max(1, connectedLocs.length + 1)) * 100)}%`,
              background: scene.accent,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
