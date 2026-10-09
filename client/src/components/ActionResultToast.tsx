import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function ActionResultToast() {
  const { lastActionResult } = useGameStore();
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState<'success' | 'fail' | null>(null);

  useEffect(() => {
    if (!lastActionResult) return;
    setVisible(true);
    setFlash(lastActionResult.success ? 'success' : 'fail');

    const hideTimer = setTimeout(() => setVisible(false), 3000);
    const flashTimer = setTimeout(() => setFlash(null), 400);
    return () => { clearTimeout(hideTimer); clearTimeout(flashTimer); };
  }, [lastActionResult]);

  return (
    <>
      {/* Screen flash overlay */}
      {flash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 900, pointerEvents: 'none',
          background: flash === 'success'
            ? 'rgba(34, 197, 94, 0.08)'
            : 'rgba(239, 68, 68, 0.08)',
          animation: 'screenFlash 0.4s ease-out forwards'
        }} />
      )}

      {/* Toast */}
      {visible && lastActionResult && (
        <div style={{
          position: 'fixed', top: '100px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 750, maxWidth: '360px', width: '90%',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{
            padding: '10px 16px', borderRadius: '10px',
            background: lastActionResult.success
              ? 'rgba(34, 197, 94, 0.12)'
              : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${lastActionResult.success
              ? 'rgba(34, 197, 94, 0.25)'
              : 'rgba(239, 68, 68, 0.25)'}`,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>
              {lastActionResult.success ? '✅' : '❌'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12px', fontWeight: 600,
                color: lastActionResult.success
                  ? 'var(--accent-green)' : 'var(--accent-red)',
                marginBottom: '2px'
              }}>
                {lastActionResult.success ? 'Success' : 'Failed'}
              </div>
              <div style={{
                fontSize: '11px', color: 'var(--text-secondary)',
                lineHeight: 1.4,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {lastActionResult.narrative || lastActionResult.message}
              </div>
            </div>
            {/* Stat change summary */}
            {lastActionResult.success && Object.keys(lastActionResult.changes).length > 0 && (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '2px',
                alignItems: 'flex-end', flexShrink: 0
              }}>
                {Object.entries(lastActionResult.changes).map(([key, val]) => {
                  if (key === 'location' || key === 'lastMealTime' || key === 'overeatingPenalty') return null;
                  return (
                    <span key={key} style={{
                      fontSize: '10px', fontWeight: 700,
                      color: key === 'cash'
                        ? 'var(--accent-green)'
                        : 'var(--text-muted)'
                    }}>
                      {key === 'cash' ? `₹${val}` : ''}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
