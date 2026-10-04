import { useGameStore } from '../store/gameStore';

export default function LifeBalance() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const tick = room.tick;

  const categories = [
    {
      label: 'Body',
      icon: '🏃',
      score: Math.round((state.health + (100 - state.hunger) + (100 - state.hydration)) / 3),
      color: 'var(--accent-red)'
    },
    {
      label: 'Mind',
      icon: '🧠',
      score: Math.round((state.mood + (100 - state.stress) + state.energy) / 3),
      color: 'var(--accent-purple)'
    },
    {
      label: 'Social',
      icon: '👥',
      score: Math.round((myPlayer.socialTrust + Math.min(100, state.helpedOthersCount * 15)) / 2),
      color: 'var(--accent-blue)'
    },
    {
      label: 'Purpose',
      icon: '🎯',
      score: Math.round(myPlayer.mission.partialProgress * 100),
      color: 'var(--accent-yellow)'
    },
  ];

  const balance = Math.round(categories.reduce((s, c) => s + c.score, 0) / categories.length);
  const maxDiff = Math.max(...categories.map(c => c.score)) - Math.min(...categories.map(c => c.score));

  const balanceLabel = maxDiff <= 15 ? 'Well Balanced' :
    maxDiff <= 30 ? 'Somewhat Balanced' : 'Imbalanced';

  const balanceColor = maxDiff <= 15 ? 'var(--accent-green)' :
    maxDiff <= 30 ? 'var(--accent-yellow)' : 'var(--accent-orange)';

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
          Life Balance
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: balanceColor }}>
          {balanceLabel} ({balance}%)
        </span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px'
      }}>
        {categories.map(cat => (
          <div key={cat.label} style={{
            padding: '6px 8px', borderRadius: '6px',
            background: `color-mix(in srgb, ${cat.color} 5%, transparent)`
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px'
            }}>
              <span style={{ fontSize: '12px' }}>{cat.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: cat.color }}>
                {cat.label}
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 700, color: cat.color,
                marginLeft: 'auto'
              }}>
                {cat.score}
              </span>
            </div>
            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${cat.score}%`, background: cat.color,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      {maxDiff > 25 && (
        <div style={{
          marginTop: '6px', fontSize: '9px', color: 'var(--text-muted)',
          textAlign: 'center', fontStyle: 'italic'
        }}>
          {categories.reduce((a, b) => a.score < b.score ? a : b).label} needs attention
        </div>
      )}
    </div>
  );
}
