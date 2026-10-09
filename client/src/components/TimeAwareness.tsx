import { useGameStore } from '../store/gameStore';

export default function TimeAwareness() {
  const { room } = useGameStore();
  if (!room) return null;

  const tick = room.tick;
  const dayPct = (tick % 600) / 600;
  const dayNum = Math.floor(tick / 600) + 1;

  const hour = Math.floor(dayPct * 24);
  const minute = Math.floor((dayPct * 24 - hour) * 60);
  const timeStr = `${(hour + 6) % 24}:${minute.toString().padStart(2, '0')}`;

  const isNight = dayPct > 2 / 3;
  const isMorning = dayPct < 1 / 4;
  const isAfternoon = dayPct >= 1 / 4 && dayPct < 1 / 2;
  const isEvening = dayPct >= 1 / 2 && dayPct <= 2 / 3;

  let period: string;
  let icon: string;
  let color: string;
  let advice: string;

  if (isMorning) {
    period = 'Morning'; icon = '🌅'; color = 'var(--accent-yellow)';
    advice = 'Best time for work and errands';
  } else if (isAfternoon) {
    period = 'Afternoon'; icon = '☀️'; color = 'var(--accent-orange)';
    advice = 'Peak heat — stay hydrated, find shade';
  } else if (isEvening) {
    period = 'Evening'; icon = '🌇'; color = 'var(--accent-purple)';
    advice = 'Markets are busy — good for trading';
  } else {
    period = 'Night'; icon = '🌙'; color = 'var(--accent-blue)';
    advice = 'Rest up — fewer options available at night';
  }

  const totalTicks = room.matchDuration || 3600;
  const remainPct = Math.max(0, ((totalTicks - tick) / totalTicks) * 100);

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${color} 5%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${color} 15%, transparent)`
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '6px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Time of Day
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          Day {dayNum}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color }}>{timeStr}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{period}</span>
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {advice}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '6px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginBottom: '2px'
        }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Day progress</span>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{Math.round(dayPct * 100)}%</span>
        </div>
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${dayPct * 100}%`,
            background: `linear-gradient(to right, var(--accent-yellow), ${color})`
          }} />
        </div>
      </div>

      <div style={{ marginTop: '4px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginBottom: '2px'
        }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Game remaining</span>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{Math.round(remainPct)}%</span>
        </div>
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${remainPct}%`,
            background: remainPct < 20 ? 'var(--accent-red)' : 'var(--accent-green)'
          }} />
        </div>
      </div>
    </div>
  );
}
