import { useGameStore } from '../store/gameStore';

export default function ProgressSummary() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const mission = myPlayer.mission;
  const required = mission.objectives.filter((o: { optional: boolean }) => !o.optional);
  const completed = required.filter((o: { completed: boolean }) => o.completed).length;
  const total = required.length;
  const missionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const timeLeft = room.matchDuration - room.tick;
  const timePct = Math.round((timeLeft / room.matchDuration) * 100);

  const survivalScore = Math.round(
    (myPlayer.state.health + myPlayer.state.energy + myPlayer.state.mood +
      (100 - myPlayer.state.hunger) + (100 - myPlayer.state.hydration) + (100 - myPlayer.state.stress)) / 6
  );

  const statusColor = mission.status === 'completed' ? 'var(--accent-green)'
    : mission.status === 'failed' ? 'var(--accent-red)'
    : missionPct >= 60 ? 'var(--accent-yellow)' : 'var(--text-muted)';

  return (
    <div style={{
      position: 'absolute',
      bottom: '12px',
      right: '12px',
      zIndex: 5,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      background: 'rgba(13,15,20,0.88)',
      backdropFilter: 'blur(8px)',
      borderRadius: '10px',
      padding: '8px 10px',
      border: '1px solid var(--border)',
      minWidth: '140px'
    }}>
      {/* Mission progress */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '3px'
        }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>MISSION</span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: statusColor }}>
            {completed}/{total}
          </span>
        </div>
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${missionPct}%`,
            background: statusColor,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Survival index */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '3px'
        }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>SURVIVAL</span>
          <span style={{
            fontSize: '10px', fontWeight: 700,
            color: survivalScore > 60 ? 'var(--accent-green)'
              : survivalScore > 35 ? 'var(--accent-yellow)'
              : 'var(--accent-red)'
          }}>
            {survivalScore}%
          </span>
        </div>
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${survivalScore}%`,
            background: survivalScore > 60 ? 'var(--accent-green)'
              : survivalScore > 35 ? 'var(--accent-yellow)'
              : 'var(--accent-red)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Time remaining */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '3px'
        }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>TIME</span>
          <span style={{
            fontSize: '10px', fontWeight: 700,
            color: timePct > 30 ? 'var(--text-secondary)'
              : timePct > 10 ? 'var(--accent-yellow)'
              : 'var(--accent-red)'
          }}>
            {timePct}%
          </span>
        </div>
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${timePct}%`,
            background: timePct > 30 ? 'var(--accent-blue)'
              : timePct > 10 ? 'var(--accent-yellow)'
              : 'var(--accent-red)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Social stats row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px'
      }}>
        <span>🤝 {myPlayer.socialTrust}</span>
        <span>🌟 {myPlayer.communityImpact >= 0 ? '+' : ''}{myPlayer.communityImpact}</span>
        <span>₹{myPlayer.state.cash}</span>
      </div>
    </div>
  );
}
