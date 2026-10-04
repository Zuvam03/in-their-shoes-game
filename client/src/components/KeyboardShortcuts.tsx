import { useState, useEffect } from 'react';

const SHORTCUTS = [
  { key: '1', desc: 'Map view' },
  { key: '2', desc: 'Character stats' },
  { key: '3', desc: 'Mission details' },
  { key: '4', desc: 'Players list' },
  { key: '5', desc: 'Chat' },
  { key: '6', desc: 'Event feed' },
  { key: '7', desc: 'Journey timeline' },
  { key: '?', desc: 'Show shortcuts' },
];

export default function KeyboardShortcuts() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' ||
          (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === '?') {
        e.preventDefault();
        setShow(s => !s);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!show) return null;

  return (
    <div
      onClick={() => setShow(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          padding: '24px', borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          maxWidth: '320px', width: '90%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>Keyboard Shortcuts</div>
          <button
            onClick={() => setShow(false)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SHORTCUTS.map(s => (
            <div key={s.key} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '4px 0'
            }}>
              <kbd style={{
                padding: '2px 8px', borderRadius: '4px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                fontSize: '12px', fontWeight: 700,
                color: 'var(--accent-yellow)',
                fontFamily: 'monospace', minWidth: '24px',
                textAlign: 'center'
              }}>
                {s.key}
              </kbd>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {s.desc}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '16px', padding: '8px 10px', borderRadius: '8px',
          background: 'var(--bg-secondary)', fontSize: '11px',
          color: 'var(--text-muted)', textAlign: 'center'
        }}>
          Press <kbd style={{
            padding: '1px 4px', borderRadius: '3px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            fontSize: '10px'
          }}>?</kbd> to toggle
        </div>
      </div>
    </div>
  );
}
