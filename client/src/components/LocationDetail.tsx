import { useGameStore } from '../store/gameStore';
import { getLocationById, LOCATION_ICONS, LOCATION_COLORS } from '../game/mapData';

export default function LocationDetail() {
  const { myPlayer, submitAction } = useGameStore();
  if (!myPlayer) return null;

  const loc = getLocationById(myPlayer.state.location);
  if (!loc) return null;

  const icon = LOCATION_ICONS[loc.type] || '📍';
  const color = LOCATION_COLORS[loc.type] || '#888';

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '10px', marginBottom: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{loc.name}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{loc.district}</div>
        </div>
        <div style={{
          marginLeft: 'auto', padding: '2px 6px', borderRadius: '4px',
          fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
          background: `${color}22`, color, letterSpacing: '0.3px'
        }}>
          {loc.type}
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
        {loc.description}
      </div>

      {loc.availableActions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Available Actions
          </div>
          {loc.availableActions.map(action => {
            const canAfford = action.cost === undefined || myPlayer.state.cash >= action.cost;
            return (
              <button
                key={action.id}
                onClick={() => submitAction(action.actionType as never, action.payload)}
                disabled={!canAfford}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 8px', borderRadius: '6px',
                  background: canAfford ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border)',
                  color: canAfford ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '11px', textAlign: 'left',
                  opacity: canAfford ? 1 : 0.5,
                  cursor: canAfford ? 'pointer' : 'not-allowed'
                }}
              >
                <span style={{ fontSize: '14px' }}>{action.icon}</span>
                <span style={{ flex: 1 }}>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Rest action always available */}
      <button
        onClick={() => submitAction('rest' as never, { duration: 120 })}
        style={{
          width: '100%', marginTop: '6px',
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 8px', borderRadius: '6px',
          background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)',
          color: 'var(--accent-purple)', fontSize: '11px'
        }}
      >
        <span style={{ fontSize: '14px' }}>😴</span>
        <span>Rest here (2 min)</span>
      </button>
    </div>
  );
}
