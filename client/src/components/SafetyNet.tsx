import { useGameStore } from '../store/gameStore';

export default function SafetyNet() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const trust = myPlayer.socialTrust;
  const players = Object.values(room.players);
  const otherPlayers = players.filter(p => p.id !== myPlayer.id);

  const resources = [
    { label: 'Cash Reserve', icon: '💰', value: state.cash, threshold: 30, unit: '₹' },
    { label: 'Health Buffer', icon: '❤️', value: state.health, threshold: 40, unit: '' },
    { label: 'Energy Reserve', icon: '⚡', value: state.energy, threshold: 25, unit: '' },
    { label: 'Social Trust', icon: '💚', value: trust, threshold: 40, unit: '' },
  ];

  const potentialHelpers = otherPlayers.filter(p =>
    p.socialTrust >= 50 && p.state.helpedOthersCount >= 1
  ).length;

  const communityStrength = Math.round(
    (players.reduce((s, p) => s + p.socialTrust, 0) / players.length) +
    players.reduce((s, p) => s + p.state.helpedOthersCount, 0) * 2
  );

  const safeResources = resources.filter(r => r.value >= r.threshold).length;
  const netStrength = Math.round((safeResources / resources.length) * 60 + (potentialHelpers / Math.max(1, otherPlayers.length)) * 40);

  const netStatus = netStrength >= 70 ? { label: 'Strong', color: 'var(--accent-green)', icon: '🛡️' }
    : netStrength >= 40 ? { label: 'Moderate', color: 'var(--accent-yellow)', icon: '🔶' }
      : { label: 'Vulnerable', color: 'var(--accent-red)', icon: '⚠️' };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${netStatus.color} 4%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${netStatus.color} 15%, transparent)`
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Safety Net
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px' }}>{netStatus.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: netStatus.color }}>
            {netStatus.label}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
        marginBottom: '6px'
      }}>
        {resources.map(r => {
          const safe = r.value >= r.threshold;
          return (
            <div key={r.label} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 6px', borderRadius: '4px',
              background: safe ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)'
            }}>
              <span style={{ fontSize: '10px' }}>{r.icon}</span>
              <span style={{
                fontSize: '9px',
                color: safe ? 'var(--accent-green)' : 'var(--accent-red)',
                fontWeight: 600
              }}>
                {safe ? '✓' : '✗'} {r.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: '9px', color: 'var(--text-muted)'
      }}>
        <span>👥 {potentialHelpers} potential helper{potentialHelpers !== 1 ? 's' : ''}</span>
        <span>🏘️ Community: {communityStrength}</span>
      </div>
    </div>
  );
}
