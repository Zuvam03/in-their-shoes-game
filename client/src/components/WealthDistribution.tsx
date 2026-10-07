import { useGameStore } from '../store/gameStore';

export default function WealthDistribution() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const players = Object.values(room.players);
  if (players.length < 2) return null;

  const cashValues = players.map(p => p.state.cash).sort((a, b) => a - b);
  const totalCash = cashValues.reduce((s, v) => s + v, 0);
  const avgCash = Math.round(totalCash / players.length);
  const maxCash = cashValues[cashValues.length - 1];
  const minCash = cashValues[0];
  const myCash = myPlayer.state.cash;

  const myPercentile = Math.round(
    (cashValues.filter(v => v <= myCash).length / cashValues.length) * 100
  );

  const buckets = [
    { label: 'Below ₹20', count: cashValues.filter(v => v < 20).length, color: 'var(--accent-red)' },
    { label: '₹20-50', count: cashValues.filter(v => v >= 20 && v < 50).length, color: 'var(--accent-orange)' },
    { label: '₹50-100', count: cashValues.filter(v => v >= 50 && v < 100).length, color: 'var(--accent-yellow)' },
    { label: '₹100+', count: cashValues.filter(v => v >= 100).length, color: 'var(--accent-green)' },
  ];

  const maxBucket = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Wealth Distribution
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
        marginBottom: '8px'
      }}>
        <div style={{ textAlign: 'center', padding: '4px', borderRadius: '6px', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)' }}>₹{avgCash}</div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Average</div>
        </div>
        <div style={{ textAlign: 'center', padding: '4px', borderRadius: '6px', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-red)' }}>₹{minCash}</div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Poorest</div>
        </div>
        <div style={{ textAlign: 'center', padding: '4px', borderRadius: '6px', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-yellow)' }}>₹{maxCash}</div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Richest</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px' }}>
        {buckets.map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', width: '50px', flexShrink: 0 }}>
              {b.label}
            </span>
            <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                width: `${(b.count / maxBucket) * 100}%`,
                background: b.color
              }} />
            </div>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-primary)', width: '16px', textAlign: 'right' }}>
              {b.count}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center',
        padding: '4px', borderRadius: '4px',
        background: 'rgba(245,200,66,0.06)'
      }}>
        You are in the <strong style={{ color: 'var(--accent-yellow)' }}>{myPercentile}th</strong> percentile with ₹{myCash}
      </div>
    </div>
  );
}
