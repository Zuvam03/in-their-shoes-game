import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function LiveLeaderboard() {
  const { room, myPlayer } = useGameStore();
  const [expanded, setExpanded] = useState(false);

  if (!room || !myPlayer || room.phase !== 'playing') return null;

  const players = Object.values(room.players)
    .filter(p => p.isConnected)
    .map(p => {
      const completedRequired = p.mission.objectives
        .filter((o: { optional: boolean; completed: boolean }) => !o.optional && o.completed).length;
      const totalRequired = p.mission.objectives
        .filter((o: { optional: boolean }) => !o.optional).length;
      const completedOptional = p.mission.objectives
        .filter((o: { optional: boolean; completed: boolean }) => o.optional && o.completed).length;

      const score = Math.min(100, Math.max(0,
        Math.round((completedRequired / Math.max(1, totalRequired)) * 60)
        + completedOptional * 10
        + Math.round(p.state.cash / 10)
        + Math.round(p.socialTrust / 2)
        + Math.round(p.communityImpact)
      ));

      return {
        id: p.id,
        name: p.name,
        score,
        cash: p.state.cash,
        health: p.state.health,
        missionProgress: totalRequired > 0
          ? Math.round((completedRequired / totalRequired) * 100)
          : 0,
        trust: p.socialTrust,
        isMe: p.id === myPlayer.id
      };
    })
    .sort((a, b) => b.score - a.score);

  const myRank = players.findIndex(p => p.isMe) + 1;

  return (
    <div style={{
      position: 'absolute', top: '12px', right: '12px',
      zIndex: 6, pointerEvents: 'auto'
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '6px 12px',
          borderRadius: expanded ? '10px 10px 0 0' : '10px',
          background: 'rgba(13,15,20,0.92)',
          border: '1px solid var(--border)',
          borderBottom: expanded ? 'none' : '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          minWidth: '120px'
        }}
      >
        <span style={{ fontSize: '12px' }}>🏆</span>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          color: myRank === 1 ? 'var(--accent-yellow)' : 'var(--text-primary)'
        }}>
          #{myRank}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          of {players.length}
        </span>
        <span style={{
          fontSize: '10px', color: 'var(--text-muted)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s', marginLeft: 'auto'
        }}>
          ▼
        </span>
      </div>

      {expanded && (
        <div style={{
          background: 'rgba(13,15,20,0.92)',
          border: '1px solid var(--border)',
          borderTop: '1px solid var(--border)',
          borderRadius: '0 0 10px 10px',
          backdropFilter: 'blur(8px)',
          padding: '4px 0', minWidth: '200px'
        }}>
          {players.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 12px',
              background: p.isMe ? 'rgba(245,200,66,0.06)' : 'transparent'
            }}>
              <span style={{
                fontSize: '11px', fontWeight: 700, width: '18px',
                color: i === 0
                  ? 'var(--accent-yellow)'
                  : i === 1
                    ? '#c0c0c0'
                    : i === 2
                      ? '#cd7f32'
                      : 'var(--text-muted)'
              }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>

              <span style={{
                flex: 1, fontSize: '11px', fontWeight: p.isMe ? 700 : 500,
                color: p.isMe ? 'var(--accent-yellow)' : 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {p.name} {p.isMe && '(you)'}
              </span>

              {/* Mini progress bar */}
              <div style={{
                width: '36px', height: '4px',
                background: 'var(--border)', borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${p.missionProgress}%`,
                  background: p.missionProgress === 100
                    ? 'var(--accent-green)'
                    : 'var(--accent-blue)',
                  transition: 'width 0.5s ease'
                }} />
              </div>

              <span style={{
                fontSize: '11px', fontWeight: 700,
                color: 'var(--accent-purple)',
                minWidth: '28px', textAlign: 'right'
              }}>
                {p.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
