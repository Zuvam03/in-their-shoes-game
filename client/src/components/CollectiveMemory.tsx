import { useGameStore } from '../store/gameStore';

export default function CollectiveMemory() {
  const { room } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);
  if (players.length <= 1) return null;

  const tick = room.tick;
  const dayNum = Math.floor(tick / 600) + 1;

  const totalHelps = players.reduce((s, p) => s + p.state.helpedOthersCount, 0);
  const totalImpact = players.reduce((s, p) => s + p.communityImpact, 0);
  const avgTrust = Math.round(players.reduce((s, p) => s + p.socialTrust, 0) / players.length);
  const totalCash = players.reduce((s, p) => s + p.state.cash, 0);

  const memories: { text: string; icon: string; type: 'proud' | 'sad' | 'neutral' }[] = [];

  if (totalHelps >= 5) {
    memories.push({
      text: `${totalHelps} acts of kindness were witnessed in these streets`,
      icon: '🤝', type: 'proud'
    });
  }

  if (avgTrust >= 60) {
    memories.push({
      text: 'A spirit of trust grew among the people of this city',
      icon: '💚', type: 'proud'
    });
  } else if (avgTrust < 35) {
    memories.push({
      text: 'Suspicion hung in the air — trust was hard to find',
      icon: '😔', type: 'sad'
    });
  }

  if (totalImpact > 20) {
    memories.push({
      text: 'Together, the community made a real difference',
      icon: '🌱', type: 'proud'
    });
  }

  const minCash = Math.min(...players.map(p => p.state.cash));
  if (minCash < 10) {
    memories.push({
      text: 'Some among us went hungry — the gaps remained',
      icon: '💔', type: 'sad'
    });
  }

  if (dayNum >= 3) {
    memories.push({
      text: `${dayNum} days of survival, struggle, and small victories`,
      icon: '📅', type: 'neutral'
    });
  }

  const mostHelpful = [...players].sort((a, b) => b.state.helpedOthersCount - a.state.helpedOthersCount)[0];
  if (mostHelpful.state.helpedOthersCount >= 3) {
    memories.push({
      text: `${mostHelpful.name} became known for their generosity`,
      icon: '⭐', type: 'proud'
    });
  }

  if (memories.length === 0) return null;

  const TYPE_COLORS = {
    proud: 'var(--accent-green)',
    sad: 'var(--accent-orange)',
    neutral: 'var(--accent-blue)',
  };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Collective Memory
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {memories.slice(0, 5).map((m, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '6px',
            paddingLeft: '8px',
            borderLeft: `2px solid ${TYPE_COLORS[m.type]}`
          }}>
            <span style={{ fontSize: '12px', flexShrink: 0 }}>{m.icon}</span>
            <span style={{
              fontSize: '10px', color: 'var(--text-secondary)',
              lineHeight: 1.4, fontStyle: 'italic'
            }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
