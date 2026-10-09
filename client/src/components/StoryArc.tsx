import { useGameStore } from '../store/gameStore';

export default function StoryArc() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const tick = room.tick;
  const totalTicks = room.matchDuration;
  const pct = Math.round((tick / totalTicks) * 100);

  const chapters = [
    { label: 'Arrival', pct: 0, icon: '🚶', desc: 'You arrived in Kolkata' },
    { label: 'Struggle', pct: 20, icon: '💪', desc: 'Finding your footing' },
    { label: 'Connection', pct: 40, icon: '🤝', desc: 'Building relationships' },
    { label: 'Challenge', pct: 60, icon: '⚡', desc: 'Facing real dilemmas' },
    { label: 'Impact', pct: 80, icon: '🌟', desc: 'Making a difference' },
    { label: 'Legacy', pct: 95, icon: '📖', desc: 'What will you leave behind?' },
  ];

  const currentChapter = [...chapters].reverse().find(c => pct >= c.pct) || chapters[0];
  const nextChapter = chapters.find(c => c.pct > pct);

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'rgba(139,92,246,0.04)',
      border: '1px solid rgba(139,92,246,0.12)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Your Story
      </div>

      {/* Progress bar with chapter markers */}
      <div style={{ position: 'relative' as const, marginBottom: '12px' }}>
        <div style={{
          height: '6px', background: 'var(--border)', borderRadius: '3px'
        }}>
          <div style={{
            height: '100%', borderRadius: '3px',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-blue))',
            transition: 'width 1s ease'
          }} />
        </div>

        {chapters.map(ch => (
          <div key={ch.label} style={{
            position: 'absolute' as const,
            left: `${ch.pct}%`, top: '-4px',
            transform: 'translateX(-50%)',
          }}>
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: pct >= ch.pct ? 'var(--accent-purple)' : 'var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8px', border: '2px solid var(--bg-secondary)'
            }}>
              {pct >= ch.pct ? ch.icon : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Current chapter */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 8px', borderRadius: '6px',
        background: 'rgba(139,92,246,0.08)'
      }}>
        <span style={{ fontSize: '18px' }}>{currentChapter.icon}</span>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-purple)' }}>
            Chapter: {currentChapter.label}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
            {currentChapter.desc}
          </div>
        </div>
      </div>

      {nextChapter && (
        <div style={{
          marginTop: '6px', fontSize: '9px', color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          Next: {nextChapter.icon} {nextChapter.label} ({nextChapter.pct - pct}% away)
        </div>
      )}
    </div>
  );
}
