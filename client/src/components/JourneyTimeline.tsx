import { useGameStore } from '../store/gameStore';

const EVENT_ICONS: Record<string, string> = {
  move: '🚶', eat: '🍛', drink: '💧', rest: '😴', work: '💼',
  buy: '🛒', help_player: '🤝', request_help: '🙏', share_info: '💬',
  transfer_money: '💰', complete_objective: '🎯', event_choice: '⚡',
  dilemma_choice: '⚖️', city_event: '🌆', mission_update: '📋', system: '📢'
};

const EVENT_COLORS: Record<string, string> = {
  move: 'var(--accent-blue)', eat: 'var(--accent-green)', drink: 'var(--accent-blue)',
  rest: 'var(--accent-purple)', work: 'var(--accent-yellow)',
  help_player: 'var(--accent-green)', complete_objective: 'var(--accent-yellow)',
  dilemma_choice: 'var(--accent-purple)', city_event: 'var(--accent-red)',
  transfer_money: 'var(--accent-yellow)', event_choice: 'var(--accent-orange)'
};

export default function JourneyTimeline() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const events = myPlayer.actionLog.slice(-30).reverse();
  const currentTick = room.tick;

  if (events.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
        Your journey will appear here as you explore Kolkata...
      </div>
    );
  }

  return (
    <div style={{ padding: '12px' }}>
      <div style={{
        fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px'
      }}>
        Journey Timeline
      </div>

      <div style={{ position: 'relative', paddingLeft: '24px' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: '8px', top: '8px', bottom: '8px',
          width: '2px', background: 'var(--border)'
        }} />

        {events.map((event, i) => {
          const icon = EVENT_ICONS[event.type] || '📌';
          const color = EVENT_COLORS[event.type] || 'var(--text-muted)';
          const ticksAgo = currentTick - event.tick;
          const timeLabel = ticksAgo < 60
            ? `${ticksAgo}s ago`
            : `${Math.floor(ticksAgo / 60)}m ago`;

          const isKeyMoment =
            event.type === 'complete_objective' ||
            event.type === 'dilemma_choice' ||
            event.type === 'help_player' ||
            event.type === 'transfer_money';

          return (
            <div key={event.id || i} style={{
              position: 'relative', marginBottom: '10px',
              opacity: i > 20 ? 0.5 : 1
            }}>
              {/* Dot on timeline */}
              <div style={{
                position: 'absolute', left: '-20px', top: '4px',
                width: isKeyMoment ? '12px' : '8px',
                height: isKeyMoment ? '12px' : '8px',
                borderRadius: '50%',
                background: isKeyMoment ? color : 'var(--bg-card)',
                border: `2px solid ${color}`,
                zIndex: 1,
                marginLeft: isKeyMoment ? '-2px' : '0'
              }} />

              <div style={{
                padding: '6px 10px', borderRadius: '8px',
                background: isKeyMoment ? `${color}15` : 'transparent',
                border: isKeyMoment ? `1px solid ${color}30` : '1px solid transparent'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '2px'
                }}>
                  <span style={{ fontSize: '12px' }}>
                    <span style={{ marginRight: '4px' }}>{icon}</span>
                    <span style={{
                      fontWeight: isKeyMoment ? 600 : 400,
                      color: isKeyMoment ? color : 'var(--text-primary)',
                      fontSize: '11px'
                    }}>
                      {event.description}
                    </span>
                  </span>
                </div>
                <div style={{
                  fontSize: '9px', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <span>{timeLabel}</span>
                  {event.statChanges && (
                    <span style={{ display: 'flex', gap: '4px' }}>
                      {Object.entries(event.statChanges).map(([stat, val]) => {
                        if (stat === 'location') return null;
                        const num = val as number;
                        const change = num - ((myPlayer.state as unknown as Record<string, number>)[stat] || 0);
                        if (change === 0) return null;
                        return (
                          <span key={stat} style={{
                            color: change > 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                            fontWeight: 600
                          }}>
                            {stat === 'cash' ? '₹' : ''}{change > 0 ? '+' : ''}{stat === 'cash' ? num : Math.round(change)}
                          </span>
                        );
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
