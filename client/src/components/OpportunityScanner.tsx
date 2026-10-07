import { useGameStore } from '../store/gameStore';
import { LOCATIONS } from '../game/mapData';

interface Opportunity {
  icon: string;
  label: string;
  location: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

const TYPE_ICONS: Record<string, string> = {
  transport: '🚌', food: '🍛', shop: '🛒', office: '💼',
  medical: '🏥', public: '🏛️', residential: '🏠', education: '📚',
};

export default function OpportunityScanner() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const opportunities: Opportunity[] = [];

  if (state.hunger > 50) {
    const foodSpots = LOCATIONS.filter(l => l.type === 'food');
    if (foodSpots.length > 0) {
      opportunities.push({
        icon: '🍛', label: 'Eat food', location: foodSpots[0].name,
        reason: `Hunger at ${Math.round(state.hunger)}%`,
        priority: state.hunger > 75 ? 'high' : 'medium'
      });
    }
  }

  if (state.hydration > 50) {
    const waterSpots = LOCATIONS.filter(l => l.type === 'public' || l.type === 'food');
    if (waterSpots.length > 0) {
      opportunities.push({
        icon: '💧', label: 'Get water', location: waterSpots[0].name,
        reason: `Thirst at ${Math.round(state.hydration)}%`,
        priority: state.hydration > 75 ? 'high' : 'medium'
      });
    }
  }

  if (state.energy < 30) {
    const restSpots = LOCATIONS.filter(l => l.type === 'residential' || l.type === 'public');
    if (restSpots.length > 0) {
      opportunities.push({
        icon: '😴', label: 'Rest', location: restSpots[0].name,
        reason: `Energy at ${Math.round(state.energy)}%`,
        priority: state.energy < 15 ? 'high' : 'medium'
      });
    }
  }

  if (state.cash < 30) {
    const workSpots = LOCATIONS.filter(l => l.type === 'office' || l.type === 'shop');
    if (workSpots.length > 0) {
      opportunities.push({
        icon: '💼', label: 'Find work', location: workSpots[0].name,
        reason: `Only ₹${state.cash} left`,
        priority: state.cash < 10 ? 'high' : 'medium'
      });
    }
  }

  if (state.health < 40) {
    const medSpots = LOCATIONS.filter(l => l.type === 'medical');
    if (medSpots.length > 0) {
      opportunities.push({
        icon: '🏥', label: 'Get medical help', location: medSpots[0].name,
        reason: `Health at ${Math.round(state.health)}%`,
        priority: state.health < 20 ? 'high' : 'medium'
      });
    }
  }

  const players = Object.values(room.players);
  const needyPlayers = players.filter(p =>
    p.id !== myPlayer.id && (p.state.health < 25 || p.state.energy < 15)
  );
  if (needyPlayers.length > 0 && state.energy > 30) {
    opportunities.push({
      icon: '🤝', label: `Help ${needyPlayers[0].name}`,
      location: 'Nearby',
      reason: 'Someone needs assistance',
      priority: 'medium'
    });
  }

  opportunities.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  if (opportunities.length === 0) {
    return null;
  }

  const PRIORITY_COLORS = {
    high: 'var(--accent-red)',
    medium: 'var(--accent-yellow)',
    low: 'var(--accent-blue)',
  };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
      }}>
        Opportunities
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {opportunities.slice(0, 4).map((opp, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 8px', borderRadius: '6px',
            background: `color-mix(in srgb, ${PRIORITY_COLORS[opp.priority]} 4%, transparent)`,
            borderLeft: `3px solid ${PRIORITY_COLORS[opp.priority]}`
          }}>
            <span style={{ fontSize: '14px', flexShrink: 0 }}>{opp.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {opp.label}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                {opp.reason} · {opp.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
