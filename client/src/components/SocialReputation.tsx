import { useGameStore } from '../store/gameStore';

interface ReputationTier {
  name: string;
  icon: string;
  minTrust: number;
  color: string;
  perks: string[];
}

const TIERS: ReputationTier[] = [
  { name: 'Stranger', icon: '👤', minTrust: 0, color: 'var(--text-muted)', perks: ['Basic interactions'] },
  { name: 'Acquaintance', icon: '🤝', minTrust: 20, color: 'var(--accent-blue)', perks: ['Small talk', 'Basic trade'] },
  { name: 'Neighbor', icon: '🏘️', minTrust: 40, color: 'var(--accent-green)', perks: ['Share resources', 'Get warnings'] },
  { name: 'Trusted Ally', icon: '💪', minTrust: 60, color: 'var(--accent-yellow)', perks: ['Mutual aid', 'Better prices'] },
  { name: 'Community Pillar', icon: '⭐', minTrust: 80, color: 'var(--accent-purple)', perks: ['Leadership roles', 'Full trust'] },
];

export default function SocialReputation() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const trust = myPlayer.socialTrust;
  const currentTier = [...TIERS].reverse().find(t => trust >= t.minTrust) || TIERS[0];
  const currentIdx = TIERS.indexOf(currentTier);
  const nextTier = currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null;
  const progressToNext = nextTier
    ? ((trust - currentTier.minTrust) / (nextTier.minTrust - currentTier.minTrust)) * 100
    : 100;

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Social Reputation
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'
      }}>
        <span style={{ fontSize: '24px' }}>{currentTier.icon}</span>
        <div>
          <div style={{
            fontSize: '14px', fontWeight: 700, color: currentTier.color
          }}>
            {currentTier.name}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Trust: {trust}
          </div>
        </div>
      </div>

      {nextTier && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginBottom: '3px'
          }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              Next: {nextTier.name}
            </span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              {trust}/{nextTier.minTrust}
            </span>
          </div>
          <div style={{
            height: '4px', background: 'var(--border)', borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              width: `${progressToNext}%`,
              background: nextTier.color,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
        {TIERS.map((tier, i) => (
          <div key={tier.name} style={{
            flex: 1, textAlign: 'center', padding: '4px 2px',
            borderRadius: '4px',
            background: i <= currentIdx
              ? `color-mix(in srgb, ${tier.color} 10%, transparent)`
              : 'rgba(0,0,0,0.1)',
            border: tier === currentTier
              ? `1px solid ${tier.color}`
              : '1px solid transparent'
          }}>
            <div style={{ fontSize: '14px' }}>{tier.icon}</div>
            <div style={{
              fontSize: '7px', color: i <= currentIdx ? tier.color : 'var(--text-muted)',
              fontWeight: i <= currentIdx ? 600 : 400, marginTop: '2px'
            }}>
              {tier.name.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '6px' }}>
        <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>
          Current perks:
        </div>
        {currentTier.perks.map((perk, i) => (
          <div key={i} style={{
            fontSize: '9px', color: currentTier.color,
            paddingLeft: '8px', borderLeft: `2px solid ${currentTier.color}`,
            marginBottom: '2px'
          }}>
            {perk}
          </div>
        ))}
      </div>
    </div>
  );
}
