import { useGameStore } from '../store/gameStore';

export default function MoralCompass() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const helped = myPlayer.state.helpedOthersCount;
  const received = myPlayer.state.receivedHelpCount;
  const trust = myPlayer.socialTrust;
  const impact = myPlayer.communityImpact;

  const selfishness = Math.max(0, received - helped) * 10;
  const generosity = helped * 10;
  const compassion = Math.max(0, impact) * 5;
  const reliability = Math.max(0, trust - 40) * 2;

  const total = selfishness + generosity + compassion + reliability;
  const maxVal = Math.max(1, total);

  const quadrants = [
    { label: 'Generosity', value: generosity, color: 'var(--accent-green)', icon: '🎁' },
    { label: 'Compassion', value: compassion, color: 'var(--accent-blue)', icon: '💙' },
    { label: 'Reliability', value: reliability, color: 'var(--accent-yellow)', icon: '⭐' },
    { label: 'Self-Interest', value: selfishness, color: 'var(--accent-orange)', icon: '🪞' },
  ];

  const dominant = quadrants.reduce((a, b) => a.value >= b.value ? a : b);

  const moralScore = Math.round(
    ((generosity + compassion + reliability) / Math.max(1, generosity + compassion + reliability + selfishness)) * 100
  );

  const alignment = moralScore >= 80 ? 'Virtuous' :
    moralScore >= 60 ? 'Good-Hearted' :
      moralScore >= 40 ? 'Pragmatic' :
        moralScore >= 20 ? 'Self-Serving' : 'Survival Mode';

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
          Moral Compass
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: dominant.color }}>
          {alignment}
        </span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
        marginBottom: '8px'
      }}>
        {quadrants.map(q => {
          const pct = total > 0 ? Math.round((q.value / maxVal) * 100) : 0;
          return (
            <div key={q.label} style={{
              padding: '6px', borderRadius: '6px',
              background: q === dominant ? `color-mix(in srgb, ${q.color} 8%, transparent)` : 'rgba(0,0,0,0.1)',
              border: q === dominant ? `1px solid color-mix(in srgb, ${q.color} 20%, transparent)` : '1px solid transparent'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px'
              }}>
                <span style={{ fontSize: '11px' }}>{q.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: q.color }}>{q.label}</span>
              </div>
              <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${pct}%`, background: q.color,
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center',
        fontStyle: 'italic'
      }}>
        Your strongest trait: {dominant.icon} {dominant.label}
      </div>
    </div>
  );
}
