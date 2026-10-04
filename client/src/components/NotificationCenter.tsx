import { useState } from 'react';
import { useGameStore, GameNotification } from '../store/gameStore';

const NOTIF_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  action: { icon: '⚡', color: 'var(--accent-blue)', bg: 'rgba(59,130,246,0.08)' },
  event: { icon: '🌆', color: 'var(--accent-orange)', bg: 'rgba(249,115,22,0.08)' },
  fortune: { icon: '🎲', color: 'var(--accent-purple)', bg: 'rgba(168,85,247,0.08)' },
  warning: { icon: '⚠️', color: 'var(--accent-red)', bg: 'rgba(239,68,68,0.08)' },
  chat: { icon: '💬', color: 'var(--accent-green)', bg: 'rgba(34,197,94,0.08)' },
  system: { icon: '📢', color: 'var(--text-muted)', bg: 'rgba(100,116,139,0.08)' },
  dilemma: { icon: '⚖️', color: 'var(--accent-yellow)', bg: 'rgba(245,200,66,0.08)' },
  proximity: { icon: '📍', color: 'var(--accent-green)', bg: 'rgba(34,197,94,0.08)' },
};

export default function NotificationCenter() {
  const { notifications } = useGameStore();
  const [filter, setFilter] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const recentNotifs = notifications.slice(-50).reverse();
  const filtered = filter
    ? recentNotifs.filter(n => n.type === filter)
    : recentNotifs;

  const unread = notifications.slice(-5);
  const hasWarnings = unread.some(n => n.type === 'warning');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '70px', right: '12px',
          zIndex: 20, width: '40px', height: '40px',
          borderRadius: '50%',
          background: hasWarnings ? 'rgba(239,68,68,0.2)' : 'var(--bg-card)',
          border: `1px solid ${hasWarnings ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
          color: hasWarnings ? 'var(--accent-red)' : 'var(--text-secondary)',
          fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          animation: hasWarnings ? 'pulse 2s infinite' : undefined
        }}
      >
        🔔
        {notifications.length > 0 && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            width: '14px', height: '14px', borderRadius: '50%',
            background: 'var(--accent-red)', color: '#fff',
            fontSize: '8px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {Math.min(notifications.length, 99)}
          </span>
        )}
      </button>
    );
  }

  const typeCount: Record<string, number> = {};
  recentNotifs.forEach(n => {
    typeCount[n.type] = (typeCount[n.type] || 0) + 1;
  });

  return (
    <div style={{
      position: 'fixed', bottom: '70px', right: '12px',
      zIndex: 20, width: '300px', maxHeight: '400px',
      background: 'var(--bg-primary)', borderRadius: '12px',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700 }}>
          Notifications ({recentNotifs.length})
        </span>
        <button onClick={() => setIsOpen(false)} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '14px', cursor: 'pointer'
        }}>
          x
        </button>
      </div>

      {/* Filters */}
      <div style={{
        padding: '6px 8px', borderBottom: '1px solid var(--border)',
        display: 'flex', gap: '4px', flexWrap: 'wrap'
      }}>
        <FilterChip label="All" active={!filter} onClick={() => setFilter(null)} />
        {Object.entries(typeCount).map(([type, count]) => (
          <FilterChip
            key={type}
            label={`${NOTIF_CONFIG[type]?.icon || '?'} ${count}`}
            active={filter === type}
            onClick={() => setFilter(filter === type ? null : type)}
          />
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: '20px', textAlign: 'center',
            color: 'var(--text-muted)', fontSize: '12px'
          }}>
            No notifications
          </div>
        ) : (
          filtered.map((notif, i) => {
            const cfg = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.system;
            return (
              <div key={notif.id || i} style={{
                padding: '8px 10px', borderRadius: '8px',
                background: cfg.bg, marginBottom: '4px',
                borderLeft: `3px solid ${cfg.color}`
              }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '6px'
                }}>
                  <span style={{ fontSize: '12px', flexShrink: 0, marginTop: '1px' }}>
                    {cfg.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '11px', color: 'var(--text-primary)',
                      lineHeight: 1.4
                    }}>
                      {notif.text}
                    </div>
                    <div style={{
                      fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px'
                    }}>
                      {notif.type}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      padding: '2px 8px', borderRadius: '10px', fontSize: '10px',
      fontWeight: 600, border: 'none',
      background: active ? 'rgba(245,200,66,0.15)' : 'var(--bg-secondary)',
      color: active ? 'var(--accent-yellow)' : 'var(--text-muted)',
      cursor: 'pointer'
    }}>
      {label}
    </button>
  );
}
