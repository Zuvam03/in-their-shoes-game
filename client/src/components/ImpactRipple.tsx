import { useGameStore } from '../store/gameStore';

export default function ImpactRipple() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const players = Object.values(room.players);
  if (players.length <= 1) return null;

  const me = myPlayer;
  const totalPlayerHelps = players.reduce((s, p) => s + p.state.helpedOthersCount, 0);
  const myHelpShare = totalPlayerHelps > 0
    ? Math.round((me.state.helpedOthersCount / totalPlayerHelps) * 100) : 0;

  const totalImpact = players.reduce((s, p) => s + Math.max(0, p.communityImpact), 0);
  const myImpactShare = totalImpact > 0
    ? Math.round((Math.max(0, me.communityImpact) / totalImpact) * 100) : 0;

  const rippleScore = Math.round(
    me.state.helpedOthersCount * 10 +
    Math.max(0, me.communityImpact) * 3 +
    Math.max(0, me.socialTrust - 50) * 0.5
  );

  const rippleLevel = rippleScore >= 80 ? { label: 'Transformative', icon: '🌊', color: 'var(--accent-green)' }
    : rippleScore >= 50 ? { label: 'Significant', icon: '💫', color: 'var(--accent-blue)' }
      : rippleScore >= 20 ? { label: 'Growing', icon: '🌱', color: 'var(--accent-yellow)' }
        : { label: 'Emerging', icon: '🫧', color: 'var(--text-muted)' };

  const rings = [
    { label: 'Direct Help', value: me.state.helpedOthersCount, max: 10, color: 'var(--accent-green)' },
    { label: 'Trust Built', value: Math.max(0, me.socialTrust - 50), max: 50, color: 'var(--accent-blue)' },
    { label: 'Community Impact', value: Math.max(0, me.communityImpact), max: 30, color: 'var(--accent-purple)' },
  ];

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
          Impact Ripple
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px' }}>{rippleLevel.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: rippleLevel.color }}>
            {rippleLevel.label}
          </span>
        </div>
      </div>

      {/* Concentric rings visualization */}
      <div style={{
        display: 'flex', justifyContent: 'center', marginBottom: '8px'
      }}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          {rings.map((ring, i) => {
            const r = 15 + i * 12;
            const pct = Math.min(1, ring.value / ring.max);
            const circumference = 2 * Math.PI * r;
            return (
              <g key={ring.label}>
                <circle cx="45" cy="45" r={r}
                  fill="none" stroke="var(--border)" strokeWidth="4" opacity={0.3} />
                <circle cx="45" cy="45" r={r}
                  fill="none" stroke={ring.color} strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct)}
                  transform="rotate(-90 45 45)"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
          <text x="45" y="45" textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: '14px', fontWeight: 700, fill: rippleLevel.color }}>
            {rippleScore}
          </text>
        </svg>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-around',
        fontSize: '9px', color: 'var(--text-muted)'
      }}>
        <span>Help share: <b style={{ color: 'var(--accent-green)' }}>{myHelpShare}%</b></span>
        <span>Impact share: <b style={{ color: 'var(--accent-purple)' }}>{myImpactShare}%</b></span>
      </div>
    </div>
  );
}
