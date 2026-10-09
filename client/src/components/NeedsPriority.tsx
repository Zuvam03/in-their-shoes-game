import { useGameStore } from '../store/gameStore';

interface Need {
  label: string;
  icon: string;
  urgency: number;
  color: string;
  tip: string;
}

export default function NeedsPriority() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const state = myPlayer.state;
  const needs: Need[] = [
    {
      label: 'Food', icon: '🍛',
      urgency: state.hunger,
      color: state.hunger > 75 ? 'var(--accent-red)' : state.hunger > 50 ? 'var(--accent-orange)' : 'var(--accent-green)',
      tip: 'Visit food stalls or restaurants'
    },
    {
      label: 'Water', icon: '💧',
      urgency: state.hydration,
      color: state.hydration > 75 ? 'var(--accent-red)' : state.hydration > 50 ? 'var(--accent-orange)' : 'var(--accent-green)',
      tip: 'Find water at public or food locations'
    },
    {
      label: 'Rest', icon: '😴',
      urgency: 100 - state.energy,
      color: state.energy < 25 ? 'var(--accent-red)' : state.energy < 50 ? 'var(--accent-orange)' : 'var(--accent-green)',
      tip: 'Rest at parks or residential areas'
    },
    {
      label: 'Health', icon: '❤️',
      urgency: 100 - state.health,
      color: state.health < 25 ? 'var(--accent-red)' : state.health < 50 ? 'var(--accent-orange)' : 'var(--accent-green)',
      tip: 'Visit medical facilities'
    },
    {
      label: 'Stress', icon: '😰',
      urgency: state.stress,
      color: state.stress > 75 ? 'var(--accent-red)' : state.stress > 50 ? 'var(--accent-orange)' : 'var(--accent-green)',
      tip: 'Socialize or rest to reduce stress'
    },
    {
      label: 'Money', icon: '💰',
      urgency: Math.max(0, 100 - state.cash),
      color: state.cash < 10 ? 'var(--accent-red)' : state.cash < 30 ? 'var(--accent-orange)' : 'var(--accent-green)',
      tip: 'Work at offices or shops to earn'
    },
  ].sort((a, b) => b.urgency - a.urgency);

  const topNeed = needs[0];

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Priority Needs
      </div>

      {topNeed.urgency > 60 && (
        <div style={{
          padding: '6px 8px', borderRadius: '6px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.15)',
          marginBottom: '8px', fontSize: '10px', color: 'var(--accent-red)',
          fontWeight: 600
        }}>
          ⚠️ Top priority: {topNeed.label} — {topNeed.tip}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {needs.map(need => (
          <div key={need.label} style={{
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span style={{ fontSize: '12px', width: '18px', flexShrink: 0 }}>{need.icon}</span>
            <span style={{
              fontSize: '10px', color: 'var(--text-secondary)',
              width: '40px', flexShrink: 0
            }}>
              {need.label}
            </span>
            <div style={{
              flex: 1, height: '6px', background: 'var(--border)',
              borderRadius: '3px', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                width: `${need.urgency}%`,
                background: need.color,
                transition: 'width 0.3s'
              }} />
            </div>
            <span style={{
              fontSize: '9px', fontWeight: 700, color: need.color,
              width: '28px', textAlign: 'right'
            }}>
              {Math.round(need.urgency)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
