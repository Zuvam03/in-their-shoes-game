import { useGameStore } from '../store/gameStore';
import { ACHIEVEMENTS } from '../game/achievements';
import { useUnlockedAchievements } from './AchievementToast';

export default function AchievementGallery() {
  const { myPlayer, room } = useGameStore();
  const unlocked = useUnlockedAchievements();

  if (!myPlayer || !room) return null;

  const unlockedCount = unlocked.size;
  const totalCount = ACHIEVEMENTS.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{
        padding: '12px', borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(249,115,22,0.05))',
        border: '1px solid rgba(245,200,66,0.2)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '8px'
        }}>
          <div style={{
            fontSize: '11px', fontWeight: 600, color: 'var(--accent-yellow)',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            Achievements
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
            {unlockedCount}/{totalCount}
          </div>
        </div>
        <div style={{
          height: '4px', background: 'var(--border)', borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--accent-yellow), var(--accent-orange))',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Achievement grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
      }}>
        {ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlocked.has(ach.id);
          return (
            <div key={ach.id} style={{
              padding: '10px', borderRadius: '10px',
              background: isUnlocked
                ? 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(249,115,22,0.04))'
                : 'var(--bg-secondary)',
              border: `1px solid ${isUnlocked ? 'rgba(245,200,66,0.25)' : 'var(--border)'}`,
              opacity: isUnlocked ? 1 : 0.5,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: isUnlocked ? 'rgba(245,200,66,0.15)' : 'var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', flexShrink: 0
                }}>
                  {isUnlocked ? ach.icon : '🔒'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '12px', fontWeight: 600,
                    color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {ach.title}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '10px', lineHeight: 1.4,
                color: isUnlocked ? 'var(--text-secondary)' : 'var(--text-muted)'
              }}>
                {ach.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
