const REPUTATION_TIERS = [
  { min: 0, label: 'Unknown', color: '#64748b', icon: '👤', bg: 'rgba(100,116,139,0.1)' },
  { min: 20, label: 'Noticed', color: '#3b82f6', icon: '👁️', bg: 'rgba(59,130,246,0.1)' },
  { min: 40, label: 'Respected', color: '#22c55e', icon: '🌟', bg: 'rgba(34,197,94,0.1)' },
  { min: 60, label: 'Trusted', color: '#f5c842', icon: '🏅', bg: 'rgba(245,200,66,0.1)' },
  { min: 80, label: 'Community Pillar', color: '#f97316', icon: '🏆', bg: 'rgba(249,115,22,0.1)' },
  { min: 95, label: 'Legend', color: '#a855f7', icon: '👑', bg: 'rgba(168,85,247,0.1)' },
];

function getTier(trust: number) {
  for (let i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
    if (trust >= REPUTATION_TIERS[i].min) return REPUTATION_TIERS[i];
  }
  return REPUTATION_TIERS[0];
}

export default function ReputationBadge({ trust, size = 'normal' }: {
  trust: number; size?: 'small' | 'normal';
}) {
  const tier = getTier(trust);
  const isSmall = size === 'small';

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: isSmall ? '3px' : '5px',
      padding: isSmall ? '2px 6px' : '3px 8px',
      borderRadius: '12px',
      background: tier.bg,
      border: `1px solid ${tier.color}30`
    }}>
      <span style={{ fontSize: isSmall ? '10px' : '12px' }}>{tier.icon}</span>
      <span style={{
        fontSize: isSmall ? '9px' : '10px',
        fontWeight: 600, color: tier.color
      }}>
        {tier.label}
      </span>
    </div>
  );
}

export { getTier, REPUTATION_TIERS };
