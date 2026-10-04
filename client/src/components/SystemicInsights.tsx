import { useGameStore } from '../store/gameStore';

interface Insight {
  title: string;
  icon: string;
  description: string;
  color: string;
}

export default function SystemicInsights() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const players = Object.values(room.players);
  const state = myPlayer.state;
  const tick = room.tick;

  const insights: Insight[] = [];

  if (state.cash < 20 && state.hunger > 60) {
    insights.push({
      title: 'Poverty Trap',
      icon: '🔄',
      description: 'When you can\'t afford food, hunger weakens you, making it harder to work and earn. This cycle traps millions.',
      color: 'var(--accent-red)'
    });
  }

  if (state.health < 40 && state.cash < 30) {
    insights.push({
      title: 'Health-Wealth Connection',
      icon: '🏥',
      description: 'Poor health and poverty reinforce each other. Medical care costs money you don\'t have, and illness prevents earning.',
      color: 'var(--accent-orange)'
    });
  }

  if (players.length > 1) {
    const maxCash = Math.max(...players.map(p => p.state.cash));
    const minCash = Math.min(...players.map(p => p.state.cash));
    if (maxCash > minCash * 3 && minCash > 0) {
      insights.push({
        title: 'Wealth Inequality',
        icon: '📊',
        description: 'The gap between the richest and poorest player mirrors real urban inequality. Those with more have easier access to everything.',
        color: 'var(--accent-yellow)'
      });
    }
  }

  if (myPlayer.socialTrust < 30 && state.helpedOthersCount < 2) {
    insights.push({
      title: 'Social Isolation',
      icon: '🧍',
      description: 'Without trust or community connections, survival becomes much harder. Social capital is as vital as financial capital.',
      color: 'var(--accent-purple)'
    });
  }

  if (state.stress > 60 && state.energy < 30) {
    insights.push({
      title: 'Burnout Cycle',
      icon: '🔥',
      description: 'High stress with low energy mirrors the daily grind of informal workers — exhaustion without the luxury of rest.',
      color: 'var(--accent-red)'
    });
  }

  if (tick > 600 && state.helpedOthersCount >= 3 && myPlayer.socialTrust >= 55) {
    insights.push({
      title: 'Community Resilience',
      icon: '🌱',
      description: 'Your mutual aid is building something real. Research shows communities with strong social bonds survive crises better.',
      color: 'var(--accent-green)'
    });
  }

  if (insights.length === 0) return null;

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Systemic Insights
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {insights.slice(0, 3).map((insight, i) => (
          <div key={i} style={{
            padding: '8px', borderRadius: '8px',
            background: `color-mix(in srgb, ${insight.color} 5%, transparent)`,
            borderLeft: `3px solid ${insight.color}`
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px'
            }}>
              <span style={{ fontSize: '13px' }}>{insight.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: insight.color }}>
                {insight.title}
              </span>
            </div>
            <div style={{
              fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5
            }}>
              {insight.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
