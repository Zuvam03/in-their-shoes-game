import { useGameStore } from '../store/gameStore';

export default function ActionHistory() {
  const { notifications, myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const myActions = notifications
    .filter(n => n.playerId === myPlayer.id && !n.isPrivate)
    .slice(-10)
    .reverse();

  if (myActions.length === 0) {
    return (
      <div style={{
        padding: '10px 12px', borderRadius: '10px',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
        }}>
          Action History
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No actions taken yet — explore the city!
        </div>
      </div>
    );
  }

  const ACTION_ICONS: Record<string, string> = {
    move: '🚶', eat: '🍛', work: '💼', rest: '😴', help: '🤝',
    trade: '💰', heal: '🏥', explore: '🗺️', chat: '💬',
  };

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
          Recent Actions
        </div>
        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
          Last {myActions.length}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {myActions.map((action, i) => {
          const icon = Object.entries(ACTION_ICONS).find(
            ([key]) => action.text.toLowerCase().includes(key)
          )?.[1] || '📌';

          return (
            <div key={action.id} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 6px', borderRadius: '4px',
              background: i === 0 ? 'rgba(59,130,246,0.06)' : 'transparent',
              opacity: 1 - (i * 0.07)
            }}>
              <span style={{ fontSize: '11px', flexShrink: 0 }}>{icon}</span>
              <span style={{
                fontSize: '10px', color: 'var(--text-secondary)', flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {action.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
