import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface Decision {
  tick: number;
  type: string;
  label: string;
  icon: string;
}

const ACTION_META: Record<string, { label: string; icon: string }> = {
  eat: { label: 'Ate food', icon: '🍛' },
  drink: { label: 'Had water', icon: '💧' },
  rest: { label: 'Rested', icon: '😴' },
  work: { label: 'Worked', icon: '💼' },
  buy: { label: 'Bought item', icon: '🛒' },
  help_player: { label: 'Helped someone', icon: '🤝' },
  request_help: { label: 'Asked for help', icon: '🙏' },
  share_info: { label: 'Shared info', icon: '💬' },
  transfer_money: { label: 'Sent money', icon: '💸' },
  move: { label: 'Moved', icon: '🚶' },
  dilemma_choice: { label: 'Made moral choice', icon: '⚖️' },
  event_choice: { label: 'Responded to event', icon: '🎯' },
  complete_objective: { label: 'Completed objective', icon: '✅' },
};

export default function DecisionHistory() {
  const { myPlayer, room } = useGameStore();
  const decisions = useRef<Decision[]>([]);
  const lastTick = useRef(-1);

  if (!myPlayer || !room) return null;

  const notifications = useGameStore.getState().notifications;
  const tick = room.tick;

  if (tick !== lastTick.current) {
    const myNotifs = notifications.filter(
      n => n.playerId === myPlayer.id && n.tick > (lastTick.current === -1 ? tick - 300 : lastTick.current)
    );
    for (const n of myNotifs) {
      const actionMatch = Object.keys(ACTION_META).find(a => n.text.toLowerCase().includes(a.replace('_', ' ')));
      if (actionMatch) {
        decisions.current.push({
          tick: n.tick,
          type: actionMatch,
          label: ACTION_META[actionMatch].label,
          icon: ACTION_META[actionMatch].icon,
        });
      }
    }
    if (decisions.current.length > 30) {
      decisions.current = decisions.current.slice(-30);
    }
    lastTick.current = tick;
  }

  const recent = [...decisions.current].reverse().slice(0, 8);

  if (recent.length === 0) return null;

  const dayOf = (t: number) => Math.floor(t / 600) + 1;
  const timeOf = (t: number) => {
    const pct = (t % 600) / 600;
    if (pct < 1 / 3) return 'Morning';
    if (pct < 2 / 3) return 'Afternoon';
    return 'Night';
  };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Decision History
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {recent.map((d, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '4px 6px', borderRadius: '6px',
            background: i === 0 ? 'rgba(245,200,66,0.06)' : 'transparent',
            opacity: 1 - i * 0.08
          }}>
            <span style={{ fontSize: '13px', flexShrink: 0 }}>{d.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: i === 0 ? 600 : 400 }}>
                {d.label}
              </div>
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', flexShrink: 0 }}>
              D{dayOf(d.tick)} {timeOf(d.tick)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
