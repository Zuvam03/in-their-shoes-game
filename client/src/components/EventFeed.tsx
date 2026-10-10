import { useRef, useEffect, useState } from 'react';
import { useGameStore, GameNotification } from '../store/gameStore';

const TYPE_CONFIG: Record<GameNotification['type'], { icon: string; color: string; label: string; bg: string }> = {
  action: { icon: '▸', color: 'var(--text-secondary)', label: 'Action', bg: 'transparent' },
  event: { icon: '⚡', color: 'var(--accent-blue)', label: 'Event', bg: 'rgba(59,130,246,0.06)' },
  fortune: { icon: '★', color: 'var(--accent-green)', label: 'Fortune', bg: 'rgba(34,197,94,0.06)' },
  warning: { icon: '⚠', color: 'var(--accent-red)', label: 'Warning', bg: 'rgba(239,68,68,0.06)' },
  chat: { icon: '✉', color: 'var(--accent-purple)', label: 'Chat', bg: 'rgba(168,85,247,0.06)' },
  system: { icon: '●', color: 'var(--text-muted)', label: 'System', bg: 'transparent' },
  dilemma: { icon: '⬥', color: 'var(--accent-yellow)', label: 'Dilemma', bg: 'rgba(245,200,66,0.06)' },
  proximity: { icon: '📍', color: 'var(--accent-orange)', label: 'Nearby', bg: 'rgba(249,115,22,0.06)' },
  death: { icon: '💀', color: '#c45d2c', label: 'Death', bg: 'rgba(196,93,44,0.06)' }
};

type FilterType = 'all' | GameNotification['type'];

export default function EventFeed() {
  const { notifications, markNotifsRead } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [notifications.length]);

  useEffect(() => {
    markNotifsRead();
  }, [notifications.length, markNotifsRead]);

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  const typeCounts = notifications.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  const activeTypes = Object.keys(typeCounts) as Array<GameNotification['type']>;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column'
    }}>
      {/* Filter bar */}
      {activeTypes.length > 1 && (
        <div style={{
          display: 'flex', gap: '3px', padding: '6px 8px',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap'
        }}>
          <FilterChip
            label="All"
            count={notifications.length}
            active={filter === 'all'}
            color="var(--text-secondary)"
            onClick={() => setFilter('all')}
          />
          {activeTypes.map(type => {
            const cfg = TYPE_CONFIG[type];
            return (
              <FilterChip
                key={type}
                label={cfg.label}
                count={typeCounts[type]}
                active={filter === type}
                color={cfg.color}
                onClick={() => setFilter(filter === type ? 'all' : type)}
              />
            );
          })}
        </div>
      )}

      {/* Events list */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '8px',
        display: 'flex', flexDirection: 'column', gap: '3px'
      }}>
        {filtered.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
            {filter === 'all'
              ? 'Events will appear here as the game progresses.'
              : `No ${TYPE_CONFIG[filter as GameNotification['type']]?.label || filter} events yet.`}
          </div>
        )}
        {filtered.map((n, i) => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
          const prevNotif = i > 0 ? filtered[i - 1] : null;
          const showTimeSep = prevNotif && Math.floor(n.tick / 60) !== Math.floor(prevNotif.tick / 60);

          return (
            <div key={n.id}>
              {showTimeSep && (
                <div style={{
                  textAlign: 'center', fontSize: '9px', color: 'var(--text-muted)',
                  padding: '4px 0', fontWeight: 600, letterSpacing: '0.5px'
                }}>
                  — {formatTick(n.tick)} —
                </div>
              )}
              <div style={{
                padding: '5px 8px', borderRadius: '6px', fontSize: '11px',
                lineHeight: 1.4,
                background: cfg.bg,
                borderLeft: `2px solid ${cfg.color}`,
                display: 'flex', alignItems: 'flex-start', gap: '6px',
                animation: i === filtered.length - 1 ? 'fadeIn 0.3s ease' : undefined
              }}>
                <span style={{ flexShrink: 0 }}>{cfg.icon}</span>
                <div style={{ flex: 1 }}>
                  {n.playerName && (
                    <span style={{
                      fontWeight: 600, color: cfg.color, fontSize: '10px',
                      marginRight: '4px'
                    }}>
                      {n.playerName}
                    </span>
                  )}
                  <span style={{ color: 'var(--text-primary)' }}>{n.text}</span>
                  <span style={{
                    marginLeft: '6px', fontSize: '9px', color: 'var(--text-muted)'
                  }}>
                    {formatTick(n.tick)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({ label, count, active, color, onClick }: {
  label: string; count: number; active: boolean; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      padding: '2px 8px', borderRadius: '10px',
      fontSize: '9px', fontWeight: 600,
      background: active ? `${color}20` : 'transparent',
      border: `1px solid ${active ? `${color}40` : 'var(--border)'}`,
      color: active ? color : 'var(--text-muted)',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '3px'
    }}>
      {label}
      <span style={{
        fontSize: '8px', fontWeight: 700,
        padding: '0 3px', borderRadius: '6px',
        background: active ? `${color}15` : 'rgba(139,146,168,0.1)'
      }}>
        {count}
      </span>
    </button>
  );
}

function formatTick(tick: number): string {
  const m = Math.floor(tick / 60);
  const s = tick % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
