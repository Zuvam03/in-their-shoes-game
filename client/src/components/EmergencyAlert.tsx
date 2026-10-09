import { useGameStore } from '../store/gameStore';

interface Alert {
  icon: string;
  message: string;
  severity: 'critical' | 'warning';
  action: string;
}

export default function EmergencyAlert() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const state = myPlayer.state;
  const alerts: Alert[] = [];

  if (state.health < 15) {
    alerts.push({
      icon: '🚨', message: 'Health critically low!',
      severity: 'critical', action: 'Seek medical help immediately'
    });
  }
  if (state.energy < 10) {
    alerts.push({
      icon: '⚠️', message: 'Exhaustion imminent!',
      severity: 'critical', action: 'Find a place to rest now'
    });
  }
  if (state.hunger > 85) {
    alerts.push({
      icon: '🍽️', message: 'Starving!',
      severity: 'critical', action: 'You must eat soon'
    });
  }
  if (state.hydration > 85) {
    alerts.push({
      icon: '💧', message: 'Severely dehydrated!',
      severity: 'critical', action: 'Find water immediately'
    });
  }
  if (state.stress > 85) {
    alerts.push({
      icon: '😰', message: 'Extreme stress!',
      severity: 'warning', action: 'Your judgment is impaired'
    });
  }
  if (state.mood < 15) {
    alerts.push({
      icon: '😢', message: 'Severe depression risk',
      severity: 'warning', action: 'Seek social connection or rest'
    });
  }
  if (state.cash <= 0) {
    alerts.push({
      icon: '💸', message: 'No money left!',
      severity: 'warning', action: 'Find work or ask for help'
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '4px'
    }}>
      {alerts.map((alert, i) => (
        <div key={i} style={{
          padding: '8px 10px', borderRadius: '8px',
          background: alert.severity === 'critical'
            ? 'rgba(239,68,68,0.12)'
            : 'rgba(245,200,66,0.1)',
          border: `1px solid ${alert.severity === 'critical'
            ? 'rgba(239,68,68,0.3)'
            : 'rgba(245,200,66,0.25)'}`,
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: alert.severity === 'critical' ? 'pulse 1.5s infinite' : undefined
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>{alert.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '11px', fontWeight: 700,
              color: alert.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-yellow)'
            }}>
              {alert.message}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              {alert.action}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
