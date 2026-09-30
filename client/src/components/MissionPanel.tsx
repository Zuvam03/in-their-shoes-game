import { useGameStore } from '../store/gameStore';

export default function MissionPanel() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const mission = myPlayer.mission;
  const def = mission.definition;

  const statusColor = {
    active: 'var(--accent-blue)',
    completed: 'var(--accent-green)',
    failed: 'var(--accent-red)',
    partial: 'var(--accent-yellow)'
  }[mission.status];

  const statusLabel = {
    active: '⏳ Active',
    completed: '✅ Completed',
    failed: '❌ Failed',
    partial: '◑ Partial'
  }[mission.status];

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '3px 8px', borderRadius: '20px',
          background: `${statusColor}22`,
          color: statusColor,
          fontSize: '11px', fontWeight: 600, marginBottom: '8px'
        }}>
          {statusLabel}
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{def.title}</h3>
      </div>

      {/* Narrative */}
      <div style={{
        padding: '10px', borderRadius: '8px',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6
      }}>
        {def.narrative}
      </div>

      {/* Objectives */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Objectives
        </div>
        {mission.objectives.map(obj => (
          <div key={obj.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            padding: '8px 10px', marginBottom: '6px', borderRadius: '8px',
            background: obj.completed
              ? 'rgba(34,197,94,0.08)'
              : obj.optional
                ? 'rgba(139,146,168,0.05)'
                : 'rgba(245,200,66,0.05)',
            border: `1px solid ${obj.completed
              ? 'rgba(34,197,94,0.25)'
              : obj.optional
                ? 'var(--border)'
                : 'rgba(245,200,66,0.2)'}`
          }}>
            <span style={{
              fontSize: '14px',
              color: obj.completed ? 'var(--accent-green)' : obj.optional ? 'var(--text-muted)' : 'var(--accent-yellow)'
            }}>
              {obj.completed ? '✓' : obj.optional ? '○' : '◉'}
            </span>
            <div>
              <div style={{
                fontSize: '12px',
                color: obj.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: obj.completed ? 'line-through' : undefined
              }}>
                {obj.description}
              </div>
              {obj.optional && !obj.completed && (
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Optional</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Complications */}
      {def.complications && def.complications.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚠ Complications
          </div>
          {def.complications.map((c, i) => (
            <div key={i} style={{
              fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px',
              paddingLeft: '8px', borderLeft: '2px solid rgba(239,68,68,0.3)'
            }}>
              {c}
            </div>
          ))}
        </div>
      )}

      {/* Alternative paths */}
      {def.alternativePaths && def.alternativePaths.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            💡 Alternative Approaches
          </div>
          {def.alternativePaths.map((p, i) => (
            <div key={i} style={{
              fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px',
              paddingLeft: '8px', borderLeft: '2px solid rgba(59,130,246,0.3)'
            }}>
              {p}
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      {mission.status === 'partial' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Progress</span>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>{mission.partialProgress}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${mission.partialProgress}%`,
              background: 'var(--accent-yellow)'
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
