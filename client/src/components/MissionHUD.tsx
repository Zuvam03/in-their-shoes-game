import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function MissionHUD() {
  const { myPlayer, room } = useGameStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!myPlayer || !room || room.phase !== 'playing') return null;

  const mission = myPlayer.mission;
  const objectives = mission.objectives;
  const completedRequired = objectives.filter(o => !o.optional && o.completed).length;
  const totalRequired = objectives.filter(o => !o.optional).length;
  const completedOptional = objectives.filter(o => o.optional && o.completed).length;
  const totalOptional = objectives.filter(o => o.optional).length;

  const allRequiredDone = completedRequired === totalRequired;

  const statusColor = allRequiredDone ? 'var(--accent-green)' : 'var(--accent-yellow)';
  const progress = totalRequired > 0
    ? Math.round((completedRequired / totalRequired) * 100)
    : 0;

  const timeLeft = room.matchDuration - room.tick;
  const deadlineTick = mission.definition.deadline;
  const missionTimeLeft = deadlineTick - room.tick;
  const missionUrgent = missionTimeLeft > 0 && missionTimeLeft < 120;

  return (
    <div
      style={{
        position: 'absolute', top: '12px', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 6, maxWidth: '340px', width: '90%',
        pointerEvents: 'auto'
      }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: collapsed ? '6px 14px' : '10px 14px',
          borderRadius: collapsed ? '20px' : '12px 12px 0 0',
          background: 'rgba(13,15,20,0.92)',
          border: `1px solid ${allRequiredDone ? 'rgba(34,197,94,0.3)' : 'rgba(245,200,66,0.25)'}`,
          borderBottom: collapsed ? undefined : 'none',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}
      >
        <span style={{ fontSize: '13px' }}>🎯</span>

        {/* Progress ring */}
        <svg width="22" height="22" viewBox="0 0 22 22" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="9" fill="none" stroke="var(--border)" strokeWidth="2" />
          <circle
            cx="11" cy="11" r="9" fill="none"
            stroke={statusColor} strokeWidth="2"
            strokeDasharray={`${progress * 0.565} ${56.5 - progress * 0.565}`}
            strokeDashoffset="14.125"
            strokeLinecap="round"
          />
          <text x="11" y="11.5" textAnchor="middle" dominantBaseline="central"
            fontSize="8" fill={statusColor} fontWeight="700">
            {completedRequired}/{totalRequired}
          </text>
        </svg>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '11px', fontWeight: 600,
            color: allRequiredDone ? 'var(--accent-green)' : 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {mission.definition.title}
          </div>
          {!collapsed && (
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              {allRequiredDone
                ? `All required done! ${totalOptional - completedOptional} optional left`
                : `${totalRequired - completedRequired} required remaining`}
            </div>
          )}
        </div>

        {missionUrgent && (
          <span style={{
            fontSize: '10px', fontWeight: 700,
            color: 'var(--accent-red)',
            animation: 'pulse 1s infinite'
          }}>
            {Math.floor(missionTimeLeft / 60)}:{(missionTimeLeft % 60).toString().padStart(2, '0')}
          </span>
        )}

        <span style={{
          fontSize: '10px', color: 'var(--text-muted)',
          transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </div>

      {!collapsed && (
        <div style={{
          padding: '8px 14px 10px',
          borderRadius: '0 0 12px 12px',
          background: 'rgba(13,15,20,0.92)',
          border: `1px solid ${allRequiredDone ? 'rgba(34,197,94,0.3)' : 'rgba(245,200,66,0.25)'}`,
          borderTop: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          {objectives.map(obj => (
            <div key={obj.id} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              opacity: obj.completed ? 0.5 : 1,
              fontSize: '11px'
            }}>
              <span style={{
                width: '14px', height: '14px',
                borderRadius: '50%',
                border: `2px solid ${obj.completed
                  ? 'var(--accent-green)'
                  : obj.optional
                    ? 'var(--text-muted)'
                    : 'var(--accent-yellow)'}`,
                background: obj.completed ? 'var(--accent-green)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '8px', color: '#fff', fontWeight: 700,
                flexShrink: 0
              }}>
                {obj.completed ? '✓' : ''}
              </span>
              <span style={{
                color: obj.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: obj.completed ? 'line-through' : undefined,
                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {obj.description}
              </span>
              {obj.optional && !obj.completed && (
                <span style={{
                  fontSize: '8px', padding: '1px 4px', borderRadius: '4px',
                  background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                  flexShrink: 0
                }}>
                  opt
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
