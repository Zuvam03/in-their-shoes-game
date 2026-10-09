import { useGameStore } from '../store/gameStore';

interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress: number;
}

function getSkills(
  helped: number,
  received: number,
  trust: number,
  impact: number,
  cash: number,
  health: number,
  energy: number,
  mood: number,
  tick: number
): Skill[] {
  const dayNum = Math.floor(tick / 600) + 1;
  return [
    {
      id: 'streetwise', name: 'Street Wisdom', icon: '🧭',
      description: 'Navigate the city with confidence',
      unlocked: dayNum >= 2,
      progress: Math.min(100, (dayNum / 3) * 100)
    },
    {
      id: 'haggler', name: 'Haggler', icon: '💰',
      description: 'Get better prices at shops',
      unlocked: cash >= 100,
      progress: Math.min(100, (cash / 100) * 100)
    },
    {
      id: 'healer', name: 'Community Healer', icon: '💊',
      description: 'Help others recover faster',
      unlocked: helped >= 3,
      progress: Math.min(100, (helped / 3) * 100)
    },
    {
      id: 'networker', name: 'Networker', icon: '🤝',
      description: 'Build trust faster with others',
      unlocked: trust >= 60,
      progress: Math.min(100, (trust / 60) * 100)
    },
    {
      id: 'resilient', name: 'Iron Will', icon: '🛡️',
      description: 'Resist stress and low mood',
      unlocked: mood >= 70 && energy >= 60,
      progress: Math.min(100, ((mood + energy) / 130) * 100)
    },
    {
      id: 'leader', name: 'Community Leader', icon: '⭐',
      description: 'Inspire others through your actions',
      unlocked: impact >= 15,
      progress: Math.min(100, (impact / 15) * 100)
    },
  ];
}

export default function SkillTree() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const skills = getSkills(
    myPlayer.state.helpedOthersCount,
    myPlayer.state.receivedHelpCount,
    myPlayer.socialTrust,
    myPlayer.communityImpact,
    myPlayer.state.cash,
    myPlayer.state.health,
    myPlayer.state.energy,
    myPlayer.state.mood,
    room.tick
  );

  const unlocked = skills.filter(s => s.unlocked).length;

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Skills Unlocked
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
          {unlocked}/{skills.length}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {skills.map(skill => (
          <div key={skill.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 8px', borderRadius: '8px',
            background: skill.unlocked
              ? 'rgba(34,197,94,0.06)'
              : 'rgba(0,0,0,0.15)',
            border: `1px solid ${skill.unlocked ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)'}`,
            opacity: skill.unlocked ? 1 : 0.6
          }}>
            <span style={{ fontSize: '16px', filter: skill.unlocked ? 'none' : 'grayscale(1)' }}>
              {skill.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                color: skill.unlocked ? 'var(--accent-green)' : 'var(--text-muted)'
              }}>
                {skill.name} {skill.unlocked && '✓'}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                {skill.description}
              </div>
              {!skill.unlocked && (
                <div style={{
                  height: '2px', background: 'var(--border)', borderRadius: '1px',
                  marginTop: '3px', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%', borderRadius: '1px',
                    width: `${skill.progress}%`,
                    background: 'var(--accent-yellow)',
                    transition: 'width 0.3s'
                  }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
