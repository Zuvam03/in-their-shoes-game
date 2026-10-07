import { useGameStore } from '../store/gameStore';

export default function CommunityHealth() {
  const { room } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);
  if (players.length === 0) return null;

  const metrics = [
    {
      label: 'Average Health',
      value: Math.round(players.reduce((s, p) => s + p.state.health, 0) / players.length),
      icon: '❤️',
      color: 'var(--accent-red)',
      unit: '%'
    },
    {
      label: 'Average Mood',
      value: Math.round(players.reduce((s, p) => s + p.state.mood, 0) / players.length),
      icon: '😊',
      color: 'var(--accent-purple)',
      unit: '%'
    },
    {
      label: 'Average Trust',
      value: Math.round(players.reduce((s, p) => s + p.socialTrust, 0) / players.length),
      icon: '⭐',
      color: 'var(--accent-yellow)',
      unit: ''
    },
    {
      label: 'Total Helps',
      value: players.reduce((s, p) => s + p.state.helpedOthersCount, 0),
      icon: '🤝',
      color: 'var(--accent-green)',
      unit: ''
    },
  ];

  const criticalCount = players.filter(p => p.state.health < 25 || p.state.energy < 15).length;
  const prosperingCount = players.filter(p => p.state.health > 70 && p.state.mood > 60 && p.state.cash > 50).length;

  let communityStatus: string;
  let statusColor: string;
  if (criticalCount > players.length / 2) {
    communityStatus = 'In Crisis';
    statusColor = 'var(--accent-red)';
  } else if (prosperingCount > players.length / 2) {
    communityStatus = 'Thriving';
    statusColor = 'var(--accent-green)';
  } else if (criticalCount > 0) {
    communityStatus = 'Struggling';
    statusColor = 'var(--accent-orange)';
  } else {
    communityStatus = 'Stable';
    statusColor = 'var(--accent-blue)';
  }

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Community Health
        </div>
        <div style={{
          fontSize: '9px', fontWeight: 700, padding: '2px 6px',
          borderRadius: '8px',
          background: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
          color: statusColor
        }}>
          {communityStatus}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            padding: '6px', borderRadius: '6px',
            background: 'rgba(0,0,0,0.1)', textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '2px' }}>{m.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: m.color }}>
              {m.value}{m.unit}
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '6px', display: 'flex', justifyContent: 'space-between',
        fontSize: '9px', color: 'var(--text-muted)'
      }}>
        <span>🚨 {criticalCount} in crisis</span>
        <span>✨ {prosperingCount} prospering</span>
      </div>
    </div>
  );
}
