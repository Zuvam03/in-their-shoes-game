import { useGameStore } from '../store/gameStore';

const TIME_PHASES = [
  { name: 'Early Morning', icon: '🌅', start: 0, color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  { name: 'Morning', icon: '☀️', start: 0.08, color: '#f5c842', bg: 'rgba(245,200,66,0.08)' },
  { name: 'Midday', icon: '🌤️', start: 0.2, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  { name: 'Afternoon', icon: '⛅', start: 0.35, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { name: 'Late Afternoon', icon: '🌇', start: 0.5, color: '#ea580c', bg: 'rgba(234,88,12,0.08)' },
  { name: 'Evening', icon: '🌆', start: 0.55, color: '#c2410c', bg: 'rgba(194,65,12,0.1)' },
  { name: 'Dusk', icon: '🌙', start: 0.63, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  { name: 'Night', icon: '🌃', start: 2 / 3, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { name: 'Late Night', icon: '🌑', start: 0.85, color: '#4f46e5', bg: 'rgba(79,70,229,0.12)' },
];

function getTimePhase(dayPct: number) {
  for (let i = TIME_PHASES.length - 1; i >= 0; i--) {
    if (dayPct >= TIME_PHASES[i].start) return TIME_PHASES[i];
  }
  return TIME_PHASES[0];
}

export default function DayNightCycle() {
  const room = useGameStore(s => s.room);
  if (!room) return null;

  const tick = room.tick;
  const dayPct = (tick % 600) / 600;
  const dayNumber = Math.floor(tick / 600) + 1;
  const phase = getTimePhase(dayPct);

  const hourInDay = Math.floor(dayPct * 24);
  const minuteInDay = Math.floor((dayPct * 24 * 60) % 60);
  const hour12 = hourInDay % 12 || 12;
  const ampm = hourInDay < 12 ? 'AM' : 'PM';
  const timeStr = `${hour12}:${minuteInDay.toString().padStart(2, '0')} ${ampm}`;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '20px',
      background: phase.bg,
      border: `1px solid ${phase.color}30`,
      fontSize: '11px', fontWeight: 600,
      color: phase.color,
      whiteSpace: 'nowrap'
    }}>
      <span style={{ fontSize: '13px' }}>{phase.icon}</span>
      <span>{timeStr}</span>
      <span style={{
        fontSize: '9px', color: 'var(--text-muted)',
        fontWeight: 400
      }}>
        Day {dayNumber}
      </span>
    </div>
  );
}
