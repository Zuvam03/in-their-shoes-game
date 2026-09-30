import { useGameStore } from '../store/gameStore';

export default function FeedbackToast() {
  const { actionFeedback, lastActionResult } = useGameStore();

  if (!actionFeedback) return null;

  const isError = actionFeedback.startsWith('Error:') || (lastActionResult && !lastActionResult.success);
  const isSuccess = lastActionResult?.success;

  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200, maxWidth: '400px', width: '90%'
    }}>
      <div style={{
        padding: '12px 16px', borderRadius: '10px',
        background: isError ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.12)',
        border: `1px solid ${isError ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.3)'}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex', gap: '10px', alignItems: 'flex-start'
      }} className="slide-up">
        <span style={{ fontSize: '16px', marginTop: '1px' }}>
          {isError ? '⚠️' : '✓'}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '13px', fontWeight: 600,
            color: isError ? 'var(--accent-red)' : 'var(--accent-green)'
          }}>
            {actionFeedback}
          </div>
          {lastActionResult?.narrative && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {lastActionResult.narrative}
            </div>
          )}
          {lastActionResult?.changes && isSuccess && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {Object.entries(lastActionResult.changes)
                .filter(([k]) => ['health', 'energy', 'hunger', 'hydration', 'mood', 'stress', 'cash'].includes(k))
                .map(([stat, change]) => {
                  if (typeof change !== 'number') return null;
                  const isPositive = stat === 'hunger' || stat === 'hydration' || stat === 'stress'
                    ? change < 0 : change > 0;
                  return (
                    <span key={stat} style={{
                      fontSize: '10px', padding: '1px 6px', borderRadius: '10px',
                      background: isPositive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)',
                      color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}>
                      {stat} {change > 0 ? '+' : ''}{typeof change === 'number' ? Math.round(change) : change}
                    </span>
                  );
                })
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
