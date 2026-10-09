import { useGameStore } from '../store/gameStore';

export default function CityPulse() {
  const { room } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);
  const tick = room.tick;
  const dayPct = (tick % 600) / 600;
  const dayNum = Math.floor(tick / 600) + 1;

  const avgHealth = Math.round(players.reduce((s, p) => s + p.state.health, 0) / players.length);
  const avgMood = Math.round(players.reduce((s, p) => s + p.state.mood, 0) / players.length);
  const avgEnergy = Math.round(players.reduce((s, p) => s + p.state.energy, 0) / players.length);
  const totalHelps = players.reduce((s, p) => s + p.state.helpedOthersCount, 0);
  const activeEvents = room.cityEvents.length;

  const isNight = dayPct > 2 / 3;
  const isMorning = dayPct < 1 / 3;

  const timeLabel = isMorning ? 'Morning' : isNight ? 'Night' : 'Afternoon';
  const timeIcon = isMorning ? '🌅' : isNight ? '🌙' : '☀️';

  const cityMood = (avgHealth + avgMood + avgEnergy) / 3;
  const cityStatus = cityMood >= 70 ? { label: 'Thriving', color: 'var(--accent-green)', icon: '🌟' }
    : cityMood >= 50 ? { label: 'Active', color: 'var(--accent-blue)', icon: '🏙️' }
      : cityMood >= 30 ? { label: 'Struggling', color: 'var(--accent-orange)', icon: '⚠️' }
        : { label: 'In Crisis', color: 'var(--accent-red)', icon: '🆘' };

  return (
    <div style={{
      padding: '8px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${cityStatus.color} 4%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${cityStatus.color} 15%, transparent)`
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '6px'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <span style={{ fontSize: '14px' }}>{cityStatus.icon}</span>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: cityStatus.color }}>
              Kolkata is {cityStatus.label}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              Day {dayNum} · {timeIcon} {timeLabel}
            </div>
          </div>
        </div>
        <div style={{
          padding: '3px 8px', borderRadius: '10px',
          background: 'rgba(0,0,0,0.15)',
          fontSize: '10px', fontWeight: 700, color: cityStatus.color
        }}>
          {Math.round(cityMood)}%
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px',
        fontSize: '9px', color: 'var(--text-muted)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--accent-blue)' }}>{players.length}</div>
          Citizens
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--accent-green)' }}>{totalHelps}</div>
          Help Acts
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--accent-yellow)' }}>{activeEvents}</div>
          Events
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--accent-purple)' }}>{avgMood}</div>
          Avg Mood
        </div>
      </div>
    </div>
  );
}
