import { useGameStore } from '../store/gameStore';

export default function ConnectionOverlay() {
  const { reconnecting, reconnectAttempt, connected } = useGameStore();

  if (!reconnecting || connected) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '32px', textAlign: 'center',
        maxWidth: '360px', width: '90%'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>
          <span className="pulse">📡</span>
        </div>
        <h3 style={{ marginBottom: '8px', color: 'var(--accent-yellow)' }}>
          Connection Lost
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Attempting to reconnect to the server...
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', marginBottom: '16px'
        }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: i <= reconnectAttempt ? 'var(--accent-red)' : 'var(--border)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Attempt {reconnectAttempt} of 5
        </p>
        {reconnectAttempt >= 5 && (
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px', padding: '10px 24px', borderRadius: '8px',
              background: 'var(--accent-blue)', color: '#fff',
              fontWeight: 600, fontSize: '13px'
            }}
          >
            Reload Page
          </button>
        )}
      </div>
    </div>
  );
}
