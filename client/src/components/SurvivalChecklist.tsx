import { useGameStore } from '../store/gameStore';

interface CheckItem {
  id: string;
  label: string;
  icon: string;
  done: boolean;
  tip: string;
}

export default function SurvivalChecklist() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const dayNum = Math.floor(room.tick / 600) + 1;

  const items: CheckItem[] = [
    {
      id: 'eat', label: 'Eaten today', icon: '🍛',
      done: state.hunger < 40,
      tip: 'Visit a food stall to reduce hunger'
    },
    {
      id: 'hydrate', label: 'Stayed hydrated', icon: '💧',
      done: state.hydration < 40,
      tip: 'Find water at public spots or restaurants'
    },
    {
      id: 'rest', label: 'Got enough rest', icon: '😴',
      done: state.energy > 40,
      tip: 'Rest at a residential area or park'
    },
    {
      id: 'earn', label: 'Earned some income', icon: '💰',
      done: state.cash > 20 * dayNum,
      tip: 'Look for work at offices or shops'
    },
    {
      id: 'health', label: 'Health maintained', icon: '❤️',
      done: state.health > 50,
      tip: 'Visit a medical facility if health is low'
    },
    {
      id: 'connect', label: 'Connected with others', icon: '🤝',
      done: state.helpedOthersCount > 0 || state.receivedHelpCount > 0,
      tip: 'Help someone or ask for help nearby'
    },
    {
      id: 'mood', label: 'Mood is stable', icon: '😊',
      done: state.mood > 40 && state.stress < 60,
      tip: 'Reduce stress by resting or socializing'
    },
  ];

  const completed = items.filter(i => i.done).length;
  const pct = Math.round((completed / items.length) * 100);

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Daily Survival Checklist
        </div>
        <div style={{
          fontSize: '10px', fontWeight: 700,
          color: pct >= 80 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'
        }}>
          {completed}/{items.length}
        </div>
      </div>

      <div style={{
        height: '4px', background: 'var(--border)', borderRadius: '2px',
        marginBottom: '8px', overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          width: `${pct}%`,
          background: pct >= 80 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)',
          transition: 'width 0.3s'
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 6px', borderRadius: '4px',
            background: item.done ? 'rgba(34,197,94,0.05)' : 'transparent'
          }}>
            <span style={{ fontSize: '12px' }}>{item.icon}</span>
            <span style={{
              fontSize: '10px', flex: 1,
              color: item.done ? 'var(--accent-green)' : 'var(--text-secondary)',
              textDecoration: item.done ? 'line-through' : 'none'
            }}>
              {item.label}
            </span>
            <span style={{
              fontSize: '11px', color: item.done ? 'var(--accent-green)' : 'var(--text-muted)'
            }}>
              {item.done ? '✓' : '○'}
            </span>
          </div>
        ))}
      </div>

      {completed < items.length && (
        <div style={{
          marginTop: '6px', fontSize: '9px', color: 'var(--accent-yellow)',
          fontStyle: 'italic', padding: '4px 6px',
          background: 'rgba(245,200,66,0.06)', borderRadius: '4px'
        }}>
          💡 {items.find(i => !i.done)?.tip}
        </div>
      )}
    </div>
  );
}
