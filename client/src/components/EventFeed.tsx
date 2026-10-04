import { useRef, useEffect } from 'react';
import { useGameStore, GameNotification } from '../store/gameStore';

const TYPE_CONFIG: Record<GameNotification['type'], { icon: string; color: string }> = {
  action: { icon: '', color: 'var(--text-secondary)' },
  event: { icon: '', color: 'var(--accent-blue)' },
  fortune: { icon: '', color: 'var(--accent-green)' },
  warning: { icon: '', color: 'var(--accent-red)' },
  chat: { icon: '', color: 'var(--accent-purple)' },
  system: { icon: '', color: 'var(--text-muted)' },
  dilemma: { icon: '', color: 'var(--accent-yellow)' }
};

export default function EventFeed() {
  const { notifications, markNotifsRead } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [notifications.length]);

  useEffect(() => {
    markNotifsRead();
  }, [notifications.length, markNotifsRead]);

  return (
    <div ref={scrollRef} style={{
      height: '100%', overflowY: 'auto', padding: '8px',
      display: 'flex', flexDirection: 'column', gap: '3px'
    }}>
      {notifications.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
          Events will appear here as the game progresses.
        </div>
      )}
      {notifications.map(n => {
        const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
        return (
          <div key={n.id} style={{
            padding: '5px 8px', borderRadius: '6px', fontSize: '11px',
            lineHeight: 1.4,
            background: n.type === 'warning'
              ? 'rgba(239, 68, 68, 0.06)'
              : n.type === 'fortune'
                ? 'rgba(34, 197, 94, 0.06)'
                : n.type === 'dilemma'
                  ? 'rgba(245, 200, 66, 0.06)'
                  : 'transparent',
            borderLeft: `2px solid ${cfg.color}`,
            display: 'flex', alignItems: 'flex-start', gap: '6px'
          }}>
            <span>{cfg.icon}</span>
            <div style={{ flex: 1 }}>
              <span style={{ color: 'var(--text-primary)' }}>{n.text}</span>
              <span style={{
                marginLeft: '6px', fontSize: '9px', color: 'var(--text-muted)'
              }}>
                {formatTick(n.tick)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTick(tick: number): string {
  const m = Math.floor(tick / 60);
  const s = tick % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
