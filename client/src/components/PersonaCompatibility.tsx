import { useGameStore } from '../store/gameStore';

export default function PersonaCompatibility() {
  const { room, myPlayer } = useGameStore();
  if (!room || !myPlayer) return null;

  const players = Object.values(room.players);
  if (players.length <= 1) return null;

  const me = myPlayer;
  const others = players.filter(p => p.id !== me.id);

  const compatibilities = others.map(other => {
    let synergy = 0;
    const insights: string[] = [];

    // Without full persona traits for other players, estimate compatibility from social stats
    const trustDiff = Math.abs(me.socialTrust - other.socialTrust);
    if (trustDiff < 10) {
      synergy += 20;
      insights.push('Similar trust');
    }
    const impactAlign = (me.communityImpact >= 0) === (other.communityImpact >= 0);
    if (impactAlign) {
      synergy += 15;
      insights.push('Aligned impact');
    }
    if (other.helpedOthersCount >= 2) {
      synergy += 10;
      insights.push('Helpful neighbor');
    }

    const score = Math.min(100, Math.max(0, 50 + synergy));
    const label = score >= 80 ? 'Great Match' : score >= 60 ? 'Compatible' :
      score >= 40 ? 'Neutral' : score >= 20 ? 'Challenging' : 'Friction';
    const color = score >= 80 ? 'var(--accent-green)' : score >= 60 ? 'var(--accent-blue)' :
      score >= 40 ? 'var(--text-muted)' : score >= 20 ? 'var(--accent-orange)' : 'var(--accent-red)';

    return { player: other, score, label, color, insights: insights.slice(0, 2) };
  }).sort((a, b) => b.score - a.score);

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Persona Compatibility
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {compatibilities.map(comp => (
          <div key={comp.player.id} style={{
            padding: '6px 8px', borderRadius: '6px',
            background: `color-mix(in srgb, ${comp.color} 5%, transparent)`
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {comp.player.name}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: comp.color }}>
                {comp.label} ({comp.score}%)
              </span>
            </div>
            {comp.insights.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {comp.insights.map((insight, i) => (
                  <span key={i} style={{
                    fontSize: '8px', padding: '1px 5px', borderRadius: '3px',
                    background: `color-mix(in srgb, ${comp.color} 10%, transparent)`,
                    color: comp.color
                  }}>
                    {insight}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
