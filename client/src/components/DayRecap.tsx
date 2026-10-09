import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface DaySnapshot {
  day: number;
  health: number;
  energy: number;
  cash: number;
  trust: number;
  helped: number;
}

export default function DayRecap() {
  const { myPlayer, room } = useGameStore();
  const snapshots = useRef<DaySnapshot[]>([]);
  const lastDay = useRef(0);

  if (!myPlayer || !room) return null;

  const dayNum = Math.floor(room.tick / 600) + 1;

  if (dayNum > lastDay.current && lastDay.current > 0) {
    snapshots.current.push({
      day: lastDay.current,
      health: Math.round(myPlayer.state.health),
      energy: Math.round(myPlayer.state.energy),
      cash: myPlayer.state.cash,
      trust: myPlayer.socialTrust,
      helped: myPlayer.state.helpedOthersCount,
    });
    if (snapshots.current.length > 10) {
      snapshots.current = snapshots.current.slice(-10);
    }
  }
  lastDay.current = dayNum;

  if (snapshots.current.length === 0) return null;

  const latest = snapshots.current[snapshots.current.length - 1];
  const prev = snapshots.current.length > 1 ? snapshots.current[snapshots.current.length - 2] : null;

  function trend(current: number, previous: number | undefined) {
    if (previous === undefined) return '';
    const diff = current - previous;
    if (Math.abs(diff) < 1) return '';
    return diff > 0 ? ` ▲${Math.round(diff)}` : ` ▼${Math.abs(Math.round(diff))}`;
  }

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Day {latest.day} Recap
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px',
        marginBottom: '8px'
      }}>
        {[
          { label: '❤️', val: latest.health, prev: prev?.health, unit: '' },
          { label: '⚡', val: latest.energy, prev: prev?.energy, unit: '' },
          { label: '💰', val: latest.cash, prev: prev?.cash, unit: '₹' },
          { label: '💚', val: latest.trust, prev: prev?.trust, unit: '' },
          { label: '🤝', val: latest.helped, prev: prev?.helped, unit: '' },
        ].map((item, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '4px', borderRadius: '4px',
            background: 'rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '11px' }}>{item.label}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {item.unit}{item.val}
            </div>
            {prev && (
              <div style={{
                fontSize: '8px', fontWeight: 600,
                color: (item.val - (item.prev ?? item.val)) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
              }}>
                {trend(item.val, item.prev)}
              </div>
            )}
          </div>
        ))}
      </div>

      {snapshots.current.length >= 3 && (
        <div style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Health trend
          </div>
          <svg width="100%" height="24" viewBox={`0 0 ${snapshots.current.length * 20} 24`}
            style={{ display: 'block' }}>
            {snapshots.current.map((s, i) => {
              const x = i * 20 + 10;
              const y = 22 - (s.health / 100) * 20;
              const next = snapshots.current[i + 1];
              return (
                <g key={i}>
                  {next && (
                    <line x1={x} y1={y} x2={x + 20} y2={22 - (next.health / 100) * 20}
                      stroke="var(--accent-red)" strokeWidth="1.5" opacity={0.6} />
                  )}
                  <circle cx={x} cy={y} r="2" fill="var(--accent-red)" />
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
