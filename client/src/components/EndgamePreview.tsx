import { useGameStore } from '../store/gameStore';

export default function EndgamePreview() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const tick = room.tick;
  const remaining = room.matchDuration - tick;
  const pctDone = Math.round((tick / room.matchDuration) * 100);

  if (pctDone < 50) return null;

  const state = myPlayer.state;
  const trust = myPlayer.socialTrust;
  const impact = myPlayer.communityImpact;

  const scores = {
    survival: Math.round((state.health + state.energy + (100 - state.stress)) / 3),
    social: Math.round((trust + Math.min(100, Math.max(0, impact + 50))) / 2),
    empathy: Math.min(100, myPlayer.state.helpedOthersCount * 15 + impact * 2),
    mission: Math.round(myPlayer.mission.partialProgress * 100),
  };

  const overall = Math.round(
    (scores.survival * 0.25 + scores.social * 0.25 + scores.empathy * 0.25 + scores.mission * 0.25)
  );

  const grade = overall >= 90 ? { letter: 'A+', color: 'var(--accent-green)' }
    : overall >= 80 ? { letter: 'A', color: 'var(--accent-green)' }
      : overall >= 70 ? { letter: 'B', color: 'var(--accent-blue)' }
        : overall >= 60 ? { letter: 'C', color: 'var(--accent-yellow)' }
          : overall >= 50 ? { letter: 'D', color: 'var(--accent-orange)' }
            : { letter: 'F', color: 'var(--accent-red)' };

  const remainMins = Math.ceil(remaining / 60);

  const categories = [
    { label: 'Survival', value: scores.survival, icon: '💪' },
    { label: 'Social', value: scores.social, icon: '🤝' },
    { label: 'Empathy', value: scores.empathy, icon: '💙' },
    { label: 'Mission', value: scores.mission, icon: '🎯' },
  ];

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${grade.color} 4%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${grade.color} 15%, transparent)`
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Projected Final Score
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
            ~{remainMins} ticks left
          </span>
          <span style={{
            fontSize: '16px', fontWeight: 800, color: grade.color,
            lineHeight: 1
          }}>
            {grade.letter}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
        marginBottom: '6px'
      }}>
        {categories.map(cat => (
          <div key={cat.label} style={{
            padding: '4px 6px', borderRadius: '6px',
            background: 'rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span style={{ fontSize: '11px' }}>{cat.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginBottom: '2px'
              }}>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{cat.label}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {cat.value}
                </span>
              </div>
              <div style={{ height: '2px', background: 'var(--border)', borderRadius: '1px' }}>
                <div style={{
                  height: '100%', borderRadius: '1px',
                  width: `${cat.value}%`,
                  background: cat.value >= 70 ? 'var(--accent-green)' : cat.value >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)'
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center', fontSize: '9px', color: 'var(--text-muted)',
        fontStyle: 'italic'
      }}>
        {overall >= 70 ? 'You\'re doing great — keep it up!'
          : overall >= 50 ? 'There\'s still time to improve your score'
            : 'Focus on helping others and staying healthy'}
      </div>
    </div>
  );
}
