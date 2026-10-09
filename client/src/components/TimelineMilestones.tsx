import { useGameStore } from '../store/gameStore';

interface Milestone {
  label: string;
  icon: string;
  check: (state: { helpedOthersCount: number; receivedHelpCount: number; cash: number; health: number }, social: { trust: number; impact: number }, tick: number) => boolean;
}

const MILESTONES: Milestone[] = [
  { label: 'First Steps', icon: '👣', check: (_, __, t) => t >= 60 },
  { label: 'Good Samaritan', icon: '🤝', check: (s) => s.helpedOthersCount >= 1 },
  { label: 'Generous Soul', icon: '💝', check: (s) => s.helpedOthersCount >= 5 },
  { label: 'Community Pillar', icon: '🏛️', check: (s) => s.helpedOthersCount >= 10 },
  { label: 'Trusted Friend', icon: '💚', check: (_, soc) => soc.trust >= 60 },
  { label: 'City Elder', icon: '🌟', check: (_, soc) => soc.trust >= 80 },
  { label: 'Positive Force', icon: '🌱', check: (_, soc) => soc.impact >= 10 },
  { label: 'Changemaker', icon: '🔥', check: (_, soc) => soc.impact >= 30 },
  { label: 'Survivor', icon: '💪', check: (_, __, t) => t >= 1200 },
  { label: 'Veteran', icon: '🎖️', check: (_, __, t) => t >= 2400 },
  { label: 'Wealthy', icon: '💰', check: (s) => s.cash >= 200 },
  { label: 'Saver', icon: '🏦', check: (s) => s.cash >= 500 },
  { label: 'Resilient', icon: '🛡️', check: (s) => s.health >= 80 },
  { label: 'Help Network', icon: '🔗', check: (s) => s.helpedOthersCount >= 3 && s.receivedHelpCount >= 3 },
];

export default function TimelineMilestones() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const social = { trust: myPlayer.socialTrust, impact: myPlayer.communityImpact };
  const tick = room.tick;

  const results = MILESTONES.map(m => ({
    ...m,
    achieved: m.check(state, social, tick),
  }));

  const achievedCount = results.filter(r => r.achieved).length;
  const pct = Math.round((achievedCount / results.length) * 100);

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
          Milestones
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
          {achievedCount}/{results.length} ({pct}%)
        </span>
      </div>

      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginBottom: '10px' }}>
        <div style={{
          height: '100%', borderRadius: '2px', width: `${pct}%`,
          background: 'var(--accent-yellow)', transition: 'width 0.5s ease'
        }} />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '4px'
      }}>
        {results.map((m, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 6px', borderRadius: '6px',
            background: m.achieved ? 'rgba(245,200,66,0.06)' : 'rgba(0,0,0,0.1)',
            opacity: m.achieved ? 1 : 0.4
          }}>
            <span style={{ fontSize: '12px', filter: m.achieved ? 'none' : 'grayscale(1)' }}>
              {m.icon}
            </span>
            <span style={{
              fontSize: '9px', fontWeight: m.achieved ? 600 : 400,
              color: m.achieved ? 'var(--accent-yellow)' : 'var(--text-muted)'
            }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
