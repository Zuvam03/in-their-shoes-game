import { useGameStore } from '../store/gameStore';

interface Risk {
  label: string;
  icon: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detail: string;
}

export default function RiskAssessment() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const tick = room.tick;
  const dayPct = (tick % 600) / 600;
  const isNight = dayPct > 2 / 3;

  const risks: Risk[] = [];

  if (state.health < 20) {
    risks.push({ label: 'Health Critical', icon: '❤️', severity: 'critical', detail: 'Seek medical help or rest immediately' });
  } else if (state.health < 40) {
    risks.push({ label: 'Health Low', icon: '❤️', severity: 'high', detail: 'Rest or eat to recover' });
  }

  if (state.energy < 10) {
    risks.push({ label: 'Exhaustion', icon: '⚡', severity: 'critical', detail: 'Cannot perform actions effectively' });
  } else if (state.energy < 25) {
    risks.push({ label: 'Low Energy', icon: '⚡', severity: 'medium', detail: 'Find a place to rest' });
  }

  if (state.hunger > 85) {
    risks.push({ label: 'Starvation', icon: '🍛', severity: 'critical', detail: 'Find food urgently' });
  } else if (state.hunger > 65) {
    risks.push({ label: 'Hungry', icon: '🍛', severity: 'medium', detail: 'Eat soon to avoid health decline' });
  }

  if (state.hydration > 85) {
    risks.push({ label: 'Severe Dehydration', icon: '💧', severity: 'critical', detail: 'Get water immediately' });
  } else if (state.hydration > 65) {
    risks.push({ label: 'Thirsty', icon: '💧', severity: 'medium', detail: 'Drink water when possible' });
  }

  if (state.stress > 80) {
    risks.push({ label: 'Breakdown Risk', icon: '😰', severity: 'high', detail: 'Stress is dangerously high' });
  } else if (state.stress > 60) {
    risks.push({ label: 'High Stress', icon: '😰', severity: 'medium', detail: 'Take time to relax' });
  }

  if (state.cash < 10) {
    risks.push({ label: 'Poverty', icon: '💰', severity: 'high', detail: 'Cannot afford essentials' });
  } else if (state.cash < 30) {
    risks.push({ label: 'Low Funds', icon: '💰', severity: 'medium', detail: 'Seek work opportunities' });
  }

  if (isNight && state.energy < 40) {
    risks.push({ label: 'Night Exposure', icon: '🌙', severity: 'medium', detail: 'Vulnerable at night with low energy' });
  }

  if (room.cityEvents.length > 0 && state.health < 50) {
    risks.push({ label: 'Event Vulnerability', icon: '⚠️', severity: 'medium', detail: 'City events pose extra risk when weakened' });
  }

  risks.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  if (risks.length === 0) return null;

  const SEVERITY_COLORS = {
    low: 'var(--accent-blue)',
    medium: 'var(--accent-yellow)',
    high: 'var(--accent-orange)',
    critical: 'var(--accent-red)',
  };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${SEVERITY_COLORS[risks[0].severity]} 4%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${SEVERITY_COLORS[risks[0].severity]} 15%, transparent)`
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '6px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Risk Assessment
        </div>
        <span style={{
          fontSize: '9px', fontWeight: 700,
          padding: '2px 6px', borderRadius: '4px',
          color: SEVERITY_COLORS[risks[0].severity],
          background: `color-mix(in srgb, ${SEVERITY_COLORS[risks[0].severity]} 10%, transparent)`
        }}>
          {risks.length} {risks.length === 1 ? 'risk' : 'risks'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {risks.slice(0, 5).map((risk, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 6px', borderRadius: '6px',
            background: `color-mix(in srgb, ${SEVERITY_COLORS[risk.severity]} 5%, transparent)`
          }}>
            <span style={{ fontSize: '12px', flexShrink: 0 }}>{risk.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '10px', fontWeight: 600, color: SEVERITY_COLORS[risk.severity]
              }}>
                {risk.label}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                {risk.detail}
              </div>
            </div>
            <span style={{
              fontSize: '8px', fontWeight: 700, color: SEVERITY_COLORS[risk.severity],
              textTransform: 'uppercase'
            }}>
              {risk.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
