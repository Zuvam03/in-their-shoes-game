import { useGameStore } from '../store/gameStore';

interface AchievementDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  check: (state: { helped: number; received: number; trust: number; impact: number; cash: number; health: number; dayNum: number }) => number;
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_help', name: 'Good Samaritan', icon: '🤝',
    description: 'Help another player',
    check: s => Math.min(100, s.helped * 100)
  },
  {
    id: 'helper_5', name: 'Community Hero', icon: '🦸',
    description: 'Help 5 different people',
    check: s => Math.min(100, (s.helped / 5) * 100)
  },
  {
    id: 'trust_50', name: 'Trusted Friend', icon: '⭐',
    description: 'Reach 50 social trust',
    check: s => Math.min(100, (s.trust / 50) * 100)
  },
  {
    id: 'cash_200', name: 'Thrifty Saver', icon: '💰',
    description: 'Accumulate ₹200',
    check: s => Math.min(100, (s.cash / 200) * 100)
  },
  {
    id: 'survivor_3', name: 'Three Day Survivor', icon: '🏕️',
    description: 'Survive for 3 days',
    check: s => Math.min(100, (s.dayNum / 3) * 100)
  },
  {
    id: 'impact_10', name: 'Change Maker', icon: '💎',
    description: 'Reach 10 community impact',
    check: s => Math.min(100, (s.impact / 10) * 100)
  },
  {
    id: 'healthy', name: 'Iron Constitution', icon: '❤️',
    description: 'Keep health above 80',
    check: s => s.health >= 80 ? 100 : Math.min(99, (s.health / 80) * 100)
  },
  {
    id: 'mutual', name: 'Mutual Aid', icon: '🔄',
    description: 'Both help and receive help',
    check: s => s.helped > 0 && s.received > 0 ? 100 : (s.helped > 0 || s.received > 0 ? 50 : 0)
  },
];

export default function AchievementProgress() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const params = {
    helped: myPlayer.state.helpedOthersCount,
    received: myPlayer.state.receivedHelpCount,
    trust: myPlayer.socialTrust,
    impact: myPlayer.communityImpact,
    cash: myPlayer.state.cash,
    health: myPlayer.state.health,
    dayNum: Math.floor(room.tick / 600) + 1,
  };

  const achievements = ACHIEVEMENTS.map(a => ({
    ...a,
    progress: a.check(params),
    completed: a.check(params) >= 100
  }));

  const completed = achievements.filter(a => a.completed).length;

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
          Achievements
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
          {completed}/{achievements.length}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        {achievements.map(a => (
          <div key={a.id} style={{
            padding: '6px', borderRadius: '6px',
            background: a.completed ? 'rgba(34,197,94,0.06)' : 'rgba(0,0,0,0.1)',
            border: a.completed ? '1px solid rgba(34,197,94,0.15)' : '1px solid transparent',
            opacity: a.completed ? 1 : 0.7
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px'
            }}>
              <span style={{
                fontSize: '12px',
                filter: a.completed ? 'none' : 'grayscale(0.8)'
              }}>
                {a.icon}
              </span>
              <span style={{
                fontSize: '9px', fontWeight: 600,
                color: a.completed ? 'var(--accent-green)' : 'var(--text-secondary)'
              }}>
                {a.name}
              </span>
            </div>
            <div style={{
              height: '2px', background: 'var(--border)', borderRadius: '1px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: '1px',
                width: `${a.progress}%`,
                background: a.completed ? 'var(--accent-green)' : 'var(--accent-yellow)'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
