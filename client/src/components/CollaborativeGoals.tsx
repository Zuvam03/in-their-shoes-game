import { useGameStore } from '../store/gameStore';

interface CommunityGoal {
  id: string;
  title: string;
  icon: string;
  target: number;
  getCurrent: (players: { state: { helpedOthersCount: number; cash: number }; socialTrust: number; communityImpact: number }[]) => number;
  reward: string;
}

const COMMUNITY_GOALS: CommunityGoal[] = [
  {
    id: 'help_10', title: 'Community Spirit', icon: '🤝',
    target: 10, reward: 'Community pride',
    getCurrent: (ps) => ps.reduce((s, p) => s + p.state.helpedOthersCount, 0)
  },
  {
    id: 'trust_avg_50', title: 'Trust Network', icon: '💚',
    target: 50, reward: 'Trusted community',
    getCurrent: (ps) => Math.round(ps.reduce((s, p) => s + p.socialTrust, 0) / Math.max(1, ps.length))
  },
  {
    id: 'positive_impact', title: 'Positive Impact', icon: '🌱',
    target: 30, reward: 'Better city',
    getCurrent: (ps) => ps.reduce((s, p) => s + Math.max(0, p.communityImpact), 0)
  },
  {
    id: 'economy', title: 'Shared Prosperity', icon: '💰',
    target: 200, reward: 'Economic stability',
    getCurrent: (ps) => ps.reduce((s, p) => s + p.state.cash, 0)
  },
];

export default function CollaborativeGoals() {
  const { room } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);
  if (players.length <= 1) return null;

  const goals = COMMUNITY_GOALS.map(goal => {
    const current = goal.getCurrent(players as Parameters<typeof goal.getCurrent>[0]);
    const pct = Math.min(100, Math.round((current / goal.target) * 100));
    const completed = current >= goal.target;
    return { ...goal, current, pct, completed };
  });

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
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
          Community Goals
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 700,
          color: completedCount === goals.length ? 'var(--accent-green)' : 'var(--accent-yellow)'
        }}>
          {completedCount}/{goals.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {goals.map(goal => (
          <div key={goal.id} style={{
            padding: '6px 8px', borderRadius: '6px',
            background: goal.completed ? 'rgba(34,197,94,0.06)' : 'rgba(0,0,0,0.1)',
            border: goal.completed ? '1px solid rgba(34,197,94,0.15)' : '1px solid transparent'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '4px'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 600,
                color: goal.completed ? 'var(--accent-green)' : 'var(--text-primary)'
              }}>
                <span style={{ fontSize: '13px' }}>{goal.icon}</span>
                {goal.title}
                {goal.completed && <span style={{ fontSize: '10px' }}>✅</span>}
              </div>
              <span style={{
                fontSize: '10px', fontWeight: 700,
                color: goal.completed ? 'var(--accent-green)' : 'var(--text-muted)'
              }}>
                {goal.current}/{goal.target}
              </span>
            </div>
            <div style={{
              height: '3px', background: 'var(--border)', borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${goal.pct}%`,
                background: goal.completed ? 'var(--accent-green)' : 'var(--accent-yellow)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
