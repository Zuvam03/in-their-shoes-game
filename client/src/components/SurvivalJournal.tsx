import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface JournalEntry {
  day: number;
  time: string;
  text: string;
  type: 'status' | 'event' | 'social' | 'milestone';
}

export default function SurvivalJournal() {
  const { myPlayer, room, notifications } = useGameStore();
  const entries = useRef<JournalEntry[]>([]);
  const lastProcessed = useRef(0);

  if (!myPlayer || !room) return null;

  const tick = room.tick;
  const dayNum = Math.floor(tick / 600) + 1;
  const dayPct = (tick % 600) / 600;
  const timeLabel = dayPct < 1 / 3 ? 'Morning' : dayPct < 2 / 3 ? 'Afternoon' : 'Night';

  const newNotifs = notifications.filter(
    n => n.playerId === myPlayer.id && n.tick > lastProcessed.current
  );

  for (const n of newNotifs) {
    const day = Math.floor(n.tick / 600) + 1;
    const pct = (n.tick % 600) / 600;
    const time = pct < 1 / 3 ? 'Morning' : pct < 2 / 3 ? 'Afternoon' : 'Night';

    let type: JournalEntry['type'] = 'status';
    if (n.text.includes('help') || n.text.includes('trust') || n.text.includes('share')) type = 'social';
    else if (n.text.includes('event') || n.text.includes('dilemma')) type = 'event';
    else if (n.text.includes('complet') || n.text.includes('achiev') || n.text.includes('milestone')) type = 'milestone';

    entries.current.push({ day, time, text: n.text, type });
  }

  if (newNotifs.length > 0) {
    lastProcessed.current = tick;
  }

  if (entries.current.length > 50) {
    entries.current = entries.current.slice(-50);
  }

  const recent = [...entries.current].reverse().slice(0, 12);

  const TYPE_STYLES: Record<string, { border: string; icon: string }> = {
    status: { border: 'var(--text-muted)', icon: '📝' },
    event: { border: 'var(--accent-yellow)', icon: '⚡' },
    social: { border: 'var(--accent-blue)', icon: '🤝' },
    milestone: { border: 'var(--accent-green)', icon: '🏆' },
  };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        📖 Survival Journal — Day {dayNum}, {timeLabel}
      </div>

      {recent.length === 0 ? (
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Your story is just beginning...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {recent.map((entry, i) => {
            const style = TYPE_STYLES[entry.type];
            return (
              <div key={i} style={{
                display: 'flex', gap: '6px', alignItems: 'flex-start',
                paddingLeft: '8px',
                borderLeft: `2px solid color-mix(in srgb, ${style.border} 40%, transparent)`,
                opacity: 1 - i * 0.06
              }}>
                <span style={{ fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>{style.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4
                  }}>
                    {entry.text}
                  </div>
                  <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '1px' }}>
                    Day {entry.day} · {entry.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
