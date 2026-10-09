import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { LOCATIONS } from '../game/mapData';

export default function ExplorationTracker() {
  const { myPlayer } = useGameStore();
  const visited = useRef(new Set<string>());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!myPlayer) return;
    const loc = myPlayer.state.location;
    if (!visited.current.has(loc)) {
      visited.current.add(loc);
      forceUpdate(n => n + 1);
    }
  }, [myPlayer?.state.location]);

  const total = LOCATIONS.length;
  const explored = visited.current.size;
  const pct = Math.round((explored / total) * 100);

  const groupedByType: Record<string, { total: number; visited: number }> = {};
  for (const loc of LOCATIONS) {
    if (!groupedByType[loc.type]) groupedByType[loc.type] = { total: 0, visited: 0 };
    groupedByType[loc.type].total++;
    if (visited.current.has(loc.id)) groupedByType[loc.type].visited++;
  }

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      marginBottom: '10px'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Exploration
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-blue)' }}>
          {explored}/{total} ({pct}%)
        </div>
      </div>

      {/* Overall progress */}
      <div style={{
        height: '6px', background: 'var(--border)', borderRadius: '3px',
        overflow: 'hidden', marginBottom: '10px'
      }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          width: `${pct}%`,
          background: pct === 100
            ? 'linear-gradient(90deg, var(--accent-green), var(--accent-yellow))'
            : 'var(--accent-blue)',
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Per-type breakdown */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {Object.entries(groupedByType).map(([type, data]) => {
          const complete = data.visited === data.total;
          return (
            <div key={type} style={{
              padding: '3px 8px', borderRadius: '10px',
              background: complete ? 'rgba(34,197,94,0.1)' : 'var(--bg-card)',
              border: `1px solid ${complete ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
              fontSize: '10px', color: complete ? 'var(--accent-green)' : 'var(--text-secondary)',
              fontWeight: 500
            }}>
              <span style={{ textTransform: 'capitalize' }}>{type}</span>{' '}
              <span style={{ fontWeight: 700 }}>{data.visited}/{data.total}</span>
            </div>
          );
        })}
      </div>

      {/* Recent discoveries */}
      {explored > 0 && explored < total && (
        <div style={{
          marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)',
          fontStyle: 'italic'
        }}>
          {total - explored} location{total - explored !== 1 ? 's' : ''} left to discover
        </div>
      )}
      {explored === total && (
        <div style={{
          marginTop: '8px', fontSize: '10px', color: 'var(--accent-green)',
          fontWeight: 600
        }}>
          You've explored all of Kolkata!
        </div>
      )}
    </div>
  );
}
