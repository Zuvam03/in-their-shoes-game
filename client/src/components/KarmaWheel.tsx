import { useGameStore } from '../store/gameStore';

const KARMA_LEVELS = [
  { min: -50, label: 'Dark Path', icon: '🌑', color: '#dc2626' },
  { min: -20, label: 'Troubled', icon: '🌘', color: '#ef4444' },
  { min: -5, label: 'Uncertain', icon: '🌗', color: '#f97316' },
  { min: 5, label: 'Balanced', icon: '🌓', color: '#f5c842' },
  { min: 20, label: 'Good Heart', icon: '🌔', color: '#22c55e' },
  { min: 50, label: 'Noble Soul', icon: '🌕', color: '#10b981' },
  { min: 80, label: 'Beacon of Light', icon: '✨', color: '#06b6d4' },
];

function getKarmaLevel(karma: number) {
  for (let i = KARMA_LEVELS.length - 1; i >= 0; i--) {
    if (karma >= KARMA_LEVELS[i].min) return KARMA_LEVELS[i];
  }
  return KARMA_LEVELS[0];
}

export default function KarmaWheel() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const helpGiven = myPlayer.state.helpedOthersCount;
  const helpReceived = myPlayer.state.receivedHelpCount;
  const impact = myPlayer.communityImpact;
  const trust = myPlayer.socialTrust;

  const karma = Math.round(
    helpGiven * 5 +
    impact * 2 +
    (trust - 50) * 0.3 -
    Math.max(0, helpReceived - helpGiven * 2) * 2
  );

  const level = getKarmaLevel(karma);
  const angle = Math.min(180, Math.max(0, (karma + 50) / 130 * 180));

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${level.color} 4%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${level.color} 15%, transparent)`
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        {/* Karma wheel */}
        <svg width="50" height="30" viewBox="0 0 50 30" style={{ flexShrink: 0 }}>
          <path d="M 3 28 A 22 22 0 0 1 47 28" fill="none"
            stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 3 28 A 22 22 0 0 1 47 28" fill="none"
            stroke={`url(#karmaGrad)`} strokeWidth="3" strokeLinecap="round"
            strokeDasharray="69" strokeDashoffset={69 - (angle / 180) * 69} />
          <defs>
            <linearGradient id="karmaGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f5c842" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <text x="25" y="24" textAnchor="middle"
            style={{ fontSize: '11px', fontWeight: 700, fill: level.color }}>
            {karma > 0 ? '+' : ''}{karma}
          </text>
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px'
          }}>
            <span style={{ fontSize: '14px' }}>{level.icon}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: level.color }}>
              {level.label}
            </span>
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
            Karma reflects your choices and their ripple effects
          </div>
        </div>
      </div>
    </div>
  );
}
