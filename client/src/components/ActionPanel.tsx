import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { LOCATIONS } from '../game/mapData';

export default function ActionPanel() {
  const { myPlayer, submitAction, lastActionResult } = useGameStore();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (lastActionResult) setPendingAction(null);
  }, [lastActionResult]);

  useEffect(() => {
    if (!pendingAction) return;
    const t = setTimeout(() => setPendingAction(null), 3000);
    return () => clearTimeout(t);
  }, [pendingAction]);

  if (!myPlayer) return null;

  const currentLoc = LOCATIONS.find(l => l.id === myPlayer.state.location);
  if (!currentLoc) return (
    <div style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
      Location not found.
    </div>
  );

  const cash = myPlayer.state.cash;

  return (
    <div>
      <div style={{
        fontSize: '12px', color: 'var(--text-secondary)',
        fontWeight: 600, marginBottom: '10px',
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        📍 {currentLoc.name}
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({currentLoc.district})</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {currentLoc.availableActions.map(action => {
          const canAfford = !action.cost || cash >= action.cost;
          const isObjective = action.actionType === 'complete_objective';

          return (
            <button
              key={action.id}
              onClick={() => { setPendingAction(action.id); submitAction(action.actionType as never, action.payload); }}
              disabled={!canAfford || pendingAction !== null}
              title={action.description}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: isObjective
                  ? 'rgba(245, 200, 66, 0.1)'
                  : canAfford ? 'var(--bg-secondary)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${isObjective ? 'rgba(245,200,66,0.3)' : canAfford ? 'var(--border)' : 'var(--border)'}`,
                color: isObjective ? 'var(--accent-yellow)' : canAfford ? 'var(--text-primary)' : 'var(--text-muted)',
                textAlign: 'left', fontSize: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                opacity: canAfford ? 1 : 0.5,
                cursor: canAfford ? 'pointer' : 'not-allowed'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{pendingAction === action.id ? '⏳' : action.icon}</span>
                <span>{pendingAction === action.id ? 'Working...' : action.label}</span>
              </span>
              {action.cost && (
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: canAfford ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  ₹{action.cost}
                </span>
              )}
            </button>
          );
        })}

        {/* Rest action (available anywhere) */}
        <button
          onClick={() => { setPendingAction('rest'); submitAction('rest', { duration: 120 }); }}
          disabled={pendingAction !== null}
          style={{
            padding: '9px 12px', borderRadius: '8px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', textAlign: 'left', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <span>😴</span>
          <span>Rest (2 min)</span>
        </button>
      </div>
    </div>
  );
}
