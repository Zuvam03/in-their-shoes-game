import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

interface Forecast {
  stat: string;
  icon: string;
  current: number;
  trend: 'rising' | 'falling' | 'stable';
  ticksToWarning: number | null;
  color: string;
  warningLevel: number;
  inverted: boolean;
}

export default function ResourceForecast() {
  const { myPlayer, room } = useGameStore();
  const history = useRef<Record<string, number[]>>({});

  useEffect(() => {
    if (!myPlayer || !room) return;
    const stats = ['health', 'energy', 'hunger', 'hydration', 'mood', 'stress'] as const;
    stats.forEach(s => {
      if (!history.current[s]) history.current[s] = [];
      const arr = history.current[s];
      arr.push(myPlayer.state[s] as number);
      if (arr.length > 20) arr.shift();
    });
  }, [room?.tick]);

  if (!myPlayer || !room) return null;

  const buildForecast = (
    stat: string, icon: string, color: string,
    warningLevel: number, inverted: boolean
  ): Forecast => {
    const vals = history.current[stat] || [];
    const current = myPlayer.state[stat as keyof typeof myPlayer.state] as number;

    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    let ticksToWarning: number | null = null;

    if (vals.length >= 3) {
      const recent = vals.slice(-5);
      const avgChange = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);

      if (avgChange > 0.3) trend = 'rising';
      else if (avgChange < -0.3) trend = 'falling';

      if (inverted) {
        if (current < warningLevel && avgChange > 0.1) {
          ticksToWarning = Math.round((warningLevel - current) / avgChange);
        }
      } else {
        if (current > warningLevel && avgChange < -0.1) {
          ticksToWarning = Math.round((current - warningLevel) / Math.abs(avgChange));
        }
      }
    }

    return { stat, icon, current, trend, ticksToWarning, color, warningLevel, inverted };
  };

  const forecasts: Forecast[] = [
    buildForecast('health', '❤️', 'var(--accent-red)', 25, false),
    buildForecast('energy', '⚡', 'var(--accent-yellow)', 20, false),
    buildForecast('hunger', '🍛', 'var(--accent-orange)', 70, true),
    buildForecast('hydration', '💧', 'var(--accent-blue)', 70, true),
    buildForecast('mood', '😊', 'var(--accent-purple)', 25, false),
    buildForecast('stress', '😰', 'var(--accent-red)', 70, true),
  ];

  const urgent = forecasts.filter(f => f.ticksToWarning !== null && f.ticksToWarning < 60);
  if (urgent.length === 0) return null;

  const trendIcon = (t: string) => t === 'rising' ? '↗' : t === 'falling' ? '↘' : '→';

  return (
    <div style={{
      padding: '10px', borderRadius: '10px',
      background: 'rgba(239,68,68,0.04)',
      border: '1px solid rgba(239,68,68,0.15)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--accent-red)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        <span style={{ animation: 'pulse 2s infinite' }}>⚠</span> Resource Forecast
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {urgent.map(f => (
          <div key={f.stat} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 6px', borderRadius: '6px',
            background: 'rgba(239,68,68,0.06)'
          }}>
            <span style={{ fontSize: '12px' }}>{f.icon}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', flex: 1 }}>
              {f.stat} {trendIcon(f.trend)}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 700, color: 'var(--accent-red)'
            }}>
              ~{Math.round(f.ticksToWarning! / 10)}s to warning
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
