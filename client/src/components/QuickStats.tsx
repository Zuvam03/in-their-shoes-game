import { useGameStore } from '../store/gameStore';

export default function QuickStats() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const tick = room.tick;
  const dayNum = Math.floor(tick / 600) + 1;
  const dayPct = (tick % 600) / 600;

  const overallWellbeing = Math.round(
    (state.health + state.energy + state.mood + (100 - state.hunger) + (100 - state.hydration) + (100 - state.stress)) / 6
  );

  const criticalStats = [
    state.health < 25 && '❤️ Low health',
    state.energy < 15 && '⚡ Exhausted',
    state.hunger > 80 && '🍛 Starving',
    state.hydration > 80 && '💧 Dehydrated',
    state.stress > 75 && '😰 Overstressed',
  ].filter(Boolean);

  const wellColor = overallWellbeing >= 60 ? 'var(--accent-green)'
    : overallWellbeing >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)';

  return (
    <div style={{
      padding: '6px 10px', borderRadius: '8px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Day {dayNum}</span>
        <span style={{
          width: '4px', height: '4px', borderRadius: '50%',
          background: dayPct > 2 / 3 ? 'var(--accent-purple)' : 'var(--accent-yellow)'
        }} />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        <span style={{ fontSize: '10px' }}>💚</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: wellColor }}>
          {overallWellbeing}%
        </span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        <span style={{ fontSize: '10px' }}>💰</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green)' }}>
          ₹{state.cash}
        </span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        <span style={{ fontSize: '10px' }}>🤝</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-blue)' }}>
          {state.helpedOthersCount}
        </span>
      </div>

      {criticalStats.length > 0 && (
        <div style={{
          display: 'flex', gap: '6px', flexWrap: 'wrap'
        }}>
          {criticalStats.map((s, i) => (
            <span key={i} style={{
              fontSize: '9px', color: 'var(--accent-red)', fontWeight: 600,
              padding: '1px 5px', borderRadius: '4px',
              background: 'rgba(239,68,68,0.08)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
