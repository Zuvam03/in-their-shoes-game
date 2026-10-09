import { useGameStore } from '../store/gameStore';

export default function ConscienceMeter() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const trust = myPlayer.socialTrust;
  const impact = myPlayer.communityImpact;
  const helped = myPlayer.state.helpedOthersCount;
  const received = myPlayer.state.receivedHelpCount;

  const score = Math.min(100, Math.max(0,
    50 + impact * 2 + (helped - received) * 3 + (trust - 50) * 0.5
  ));

  const getLabel = (s: number) => {
    if (s >= 85) return { text: 'Beacon of Hope', color: '#22c55e', icon: '✨' };
    if (s >= 70) return { text: 'Compassionate', color: '#4ade80', icon: '💚' };
    if (s >= 55) return { text: 'Well-Meaning', color: '#a3e635', icon: '🌱' };
    if (s >= 45) return { text: 'Pragmatic', color: '#facc15', icon: '⚖️' };
    if (s >= 30) return { text: 'Self-Focused', color: '#fb923c', icon: '🔶' };
    if (s >= 15) return { text: 'Ruthless', color: '#f87171', icon: '🔥' };
    return { text: 'Merciless', color: '#ef4444', icon: '💀' };
  };

  const { text, color, icon } = getLabel(score);
  const angle = (score / 100) * 180;

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      marginBottom: '10px'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px'
      }}>
        Moral Compass
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Arc meter */}
        <div style={{ position: 'relative', width: '60px', height: '35px', flexShrink: 0 }}>
          <svg viewBox="0 0 60 35" style={{ width: '100%', height: '100%' }}>
            <path
              d="M 5 32 A 25 25 0 0 1 55 32"
              fill="none"
              stroke="var(--border)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 5 32 A 25 25 0 0 1 55 32"
              fill="none"
              stroke={`url(#conscience-grad)`}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(angle / 180) * 78.5} 78.5`}
            />
            <defs>
              <linearGradient id="conscience-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            {/* Needle */}
            <line
              x1="30" y1="32"
              x2={30 + Math.cos(Math.PI - (angle * Math.PI / 180)) * 20}
              y2={32 + Math.sin(Math.PI - (angle * Math.PI / 180)) * -20}
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="30" cy="32" r="2" fill={color} />
          </svg>
        </div>

        <div>
          <div style={{
            fontSize: '13px', fontWeight: 700, color,
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            {icon} {text}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {score >= 50
              ? `Your choices reflect care for others`
              : `Your choices prioritize self-interest`}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
        marginTop: '10px'
      }}>
        <MiniStat label="Trust" value={trust} color="var(--accent-green)" />
        <MiniStat label="Impact" value={impact} color={impact >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'} />
        <MiniStat label="Net Help" value={helped - received} color="var(--accent-blue)" />
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 700, color }}>
        {value >= 0 ? '+' : ''}{value}
      </div>
    </div>
  );
}
