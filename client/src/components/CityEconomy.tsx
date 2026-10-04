import { useGameStore } from '../store/gameStore';

export default function CityEconomy() {
  const { room, myPlayer } = useGameStore();
  if (!room || !myPlayer) return null;

  const players = Object.values(room.players);
  const totalCash = players.reduce((s, p) => s + p.state.cash, 0);
  const avgCash = Math.round(totalCash / players.length);
  const myCash = myPlayer.state.cash;

  const totalHelps = players.reduce((s, p) => s + p.state.helpedOthersCount, 0);
  const totalTransfers = 0;

  const wealthGap = Math.max(...players.map(p => p.state.cash)) -
    Math.min(...players.map(p => p.state.cash));

  const tick = room.tick;
  const dayNum = Math.floor(tick / 600) + 1;

  const cashDistribution = players.map(p => ({
    name: p.name, cash: p.state.cash,
    pct: totalCash > 0 ? Math.round((p.state.cash / totalCash) * 100) : 0
  })).sort((a, b) => b.cash - a.cash);

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        📊 City Economy — Day {dayNum}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
        marginBottom: '10px'
      }}>
        <EconStat label="Total ₹" value={totalCash} color="var(--accent-green)" />
        <EconStat label="Average ₹" value={avgCash} color="var(--accent-blue)" />
        <EconStat label="Gap ₹" value={wealthGap}
          color={wealthGap > 100 ? 'var(--accent-red)' : 'var(--accent-yellow)'} />
      </div>

      {/* Wealth distribution bar */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>
          Wealth Distribution
        </div>
        <div style={{
          display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden'
        }}>
          {cashDistribution.map((p, i) => (
            <div key={p.name} style={{
              width: `${Math.max(p.pct, 2)}%`,
              background: `hsl(${i * 60 + 120}deg 55% 45%)`,
              transition: 'width 0.5s ease'
            }} title={`${p.name}: ₹${p.cash} (${p.pct}%)`} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
          {cashDistribution.map((p, i) => (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px'
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '2px',
                background: `hsl(${i * 60 + 120}deg 55% 45%)`
              }} />
              <span style={{
                color: p.name === myPlayer.persona.name ? 'var(--accent-yellow)' : 'var(--text-muted)'
              }}>
                {p.name}: ₹{p.cash}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Economic activity */}
      <div style={{
        display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--text-muted)'
      }}>
        <span>🤝 {totalHelps} help acts</span>
        <span>💸 {totalTransfers} transfers</span>
        <span style={{
          color: myCash > avgCash ? 'var(--accent-green)' : 'var(--accent-orange)'
        }}>
          You: {myCash > avgCash ? 'above' : 'below'} avg
        </span>
      </div>
    </div>
  );
}

function EconStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      padding: '6px', borderRadius: '6px',
      background: 'rgba(0,0,0,0.1)', textAlign: 'center'
    }}>
      <div style={{ fontWeight: 700, fontSize: '14px', color }}>{value}</div>
      <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
