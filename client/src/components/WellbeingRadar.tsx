import { useGameStore } from '../store/gameStore';

const STATS = [
  { key: 'health', label: 'Health', angle: 0 },
  { key: 'energy', label: 'Energy', angle: 60 },
  { key: 'mood', label: 'Mood', angle: 120 },
  { key: 'hunger', label: 'Satiety', angle: 180, invert: true },
  { key: 'hydration', label: 'Hydration', angle: 240, invert: true },
  { key: 'stress', label: 'Calm', angle: 300, invert: true },
] as const;

function polarToXY(angle: number, radius: number, cx: number, cy: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export default function WellbeingRadar() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const state = myPlayer.state;
  const cx = 55, cy = 55, maxR = 42;

  const values = STATS.map(s => {
    const raw = state[s.key] as number;
    return 'invert' in s && s.invert ? 100 - raw : raw;
  });

  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  const points = STATS.map((s, i) => {
    const r = (values[i] / 100) * maxR;
    return polarToXY(s.angle, r, cx, cy);
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const avgColor = avg >= 60 ? 'var(--accent-green)' : avg >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)';

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '6px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Wellbeing Radar
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: avgColor }}>
          {avg}%
        </span>
      </div>

      <svg width="110" height="110" viewBox="0 0 110 110"
        style={{ display: 'block', margin: '0 auto' }}>
        {[0.25, 0.5, 0.75, 1].map(scale => (
          <polygon key={scale}
            points={STATS.map(s => {
              const p = polarToXY(s.angle, maxR * scale, cx, cy);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none" stroke="var(--border)" strokeWidth="0.5"
            opacity={0.5}
          />
        ))}

        {STATS.map(s => {
          const p = polarToXY(s.angle, maxR, cx, cy);
          return <line key={s.key} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="var(--border)" strokeWidth="0.5" opacity={0.3} />;
        })}

        <path d={pathD}
          fill={`color-mix(in srgb, ${avgColor} 15%, transparent)`}
          stroke={avgColor} strokeWidth="1.5"
        />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5"
            fill={avgColor} stroke="var(--bg-primary)" strokeWidth="1" />
        ))}

        {STATS.map((s, i) => {
          const labelR = maxR + 10;
          const p = polarToXY(s.angle, labelR, cx, cy);
          return (
            <text key={s.key} x={p.x} y={p.y}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: '7px', fill: 'var(--text-muted)', fontWeight: 500 }}>
              {s.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
