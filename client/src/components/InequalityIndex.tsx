import { useGameStore } from '../store/gameStore';

export default function InequalityIndex() {
  const { room } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);
  if (players.length <= 1) return null;

  const cashValues = players.map(p => p.state.cash).sort((a, b) => a - b);
  const healthValues = players.map(p => p.state.health).sort((a, b) => a - b);
  const trustValues = players.map(p => p.socialTrust).sort((a, b) => a - b);

  function gini(values: number[]): number {
    const n = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum === 0) return 0;
    let numerator = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        numerator += Math.abs(values[i] - values[j]);
      }
    }
    return Math.round((numerator / (2 * n * sum)) * 100);
  }

  const cashGini = gini(cashValues);
  const healthGini = gini(healthValues);
  const trustGini = gini(trustValues);

  const overallInequality = Math.round((cashGini * 0.5 + healthGini * 0.3 + trustGini * 0.2));

  const level = overallInequality <= 15 ? { label: 'Equitable', color: 'var(--accent-green)', icon: '⚖️' }
    : overallInequality <= 30 ? { label: 'Moderate', color: 'var(--accent-yellow)', icon: '📊' }
      : overallInequality <= 50 ? { label: 'Unequal', color: 'var(--accent-orange)', icon: '⚠️' }
        : { label: 'Severe', color: 'var(--accent-red)', icon: '🚨' };

  const metrics = [
    { label: 'Wealth', value: cashGini, icon: '💰' },
    { label: 'Health', value: healthGini, icon: '❤️' },
    { label: 'Trust', value: trustGini, icon: '💚' },
  ];

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${level.color} 4%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${level.color} 15%, transparent)`
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Inequality Index
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px' }}>{level.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: level.color }}>
            {level.label}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px'
      }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            padding: '6px', borderRadius: '6px',
            background: 'rgba(0,0,0,0.1)', textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '2px' }}>{m.icon}</div>
            <div style={{
              fontSize: '13px', fontWeight: 700,
              color: m.value <= 20 ? 'var(--accent-green)' : m.value <= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)'
            }}>
              {m.value}%
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{m.label} Gap</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '6px', fontSize: '9px', color: 'var(--text-muted)',
        textAlign: 'center', fontStyle: 'italic'
      }}>
        {overallInequality <= 15 ? 'Resources are shared fairly across the community'
          : overallInequality <= 30 ? 'Some gaps exist — cooperation can help close them'
            : 'Large disparities detected — mutual aid is critical'}
      </div>
    </div>
  );
}
