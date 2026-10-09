import { useGameStore } from '../store/gameStore';

export default function InteractionModal() {
  const pending = useGameStore(s => s.pendingInteraction);
  const respond = useGameStore(s => s.respondToInteraction);

  if (!pending) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(3px)'
    }}>
      <div className="slide-up" style={{
        background: 'var(--bg-card)', border: '1px solid var(--accent-blue)',
        borderRadius: '14px', padding: '24px',
        maxWidth: '380px', width: '90%',
        boxShadow: '0 6px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', fontSize: '32px', marginBottom: '12px' }}>🤝</div>
        <h3 style={{
          textAlign: 'center', fontSize: '16px', fontWeight: 700,
          marginBottom: '8px', color: 'var(--accent-blue)'
        }}>
          Help Request
        </h3>
        <p style={{
          textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)',
          lineHeight: 1.6, marginBottom: '20px'
        }}>
          <strong>{pending.fromPlayerName}</strong> is asking for your help.
          Helping costs energy but builds trust and community impact.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => respond(pending.id, false)} style={{
            flex: 1, padding: '10px', borderRadius: '8px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: '13px'
          }}>
            Can't Right Now
          </button>
          <button onClick={() => respond(pending.id, true)} style={{
            flex: 1, padding: '10px', borderRadius: '8px',
            background: 'var(--accent-green)',
            color: '#000', fontWeight: 700, fontSize: '13px'
          }}>
            Help Them
          </button>
        </div>
      </div>
    </div>
  );
}
