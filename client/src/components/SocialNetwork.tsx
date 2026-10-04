import { useGameStore } from '../store/gameStore';

export default function SocialNetwork() {
  const { room, myPlayer } = useGameStore();
  if (!room || !myPlayer) return null;

  const players = Object.values(room.players);
  if (players.length <= 1) return null;

  const me = myPlayer;
  const others = players.filter(p => p.id !== me.id);

  const connections = others.map(other => {
    const trustDiff = Math.abs(me.socialTrust - other.socialTrust);
    const impactAlign = (me.communityImpact >= 0) === (other.communityImpact >= 0);
    const helpBalance = me.state.helpedOthersCount + other.state.helpedOthersCount;

    let strength = 50;
    if (trustDiff < 10) strength += 20;
    else if (trustDiff < 25) strength += 10;
    if (impactAlign) strength += 15;
    strength += Math.min(15, helpBalance * 3);

    strength = Math.min(100, Math.max(0, strength));

    const bond = strength >= 80 ? 'Strong' :
      strength >= 60 ? 'Friendly' :
        strength >= 40 ? 'Neutral' :
          strength >= 20 ? 'Distant' : 'Strained';

    const color = strength >= 80 ? 'var(--accent-green)' :
      strength >= 60 ? 'var(--accent-blue)' :
        strength >= 40 ? 'var(--text-muted)' :
          strength >= 20 ? 'var(--accent-orange)' : 'var(--accent-red)';

    return { player: other, strength, bond, color };
  }).sort((a, b) => b.strength - a.strength);

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Social Network
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {connections.map(conn => (
          <div key={conn.player.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 8px', borderRadius: '6px',
            background: 'rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: `color-mix(in srgb, ${conn.color} 20%, var(--bg-primary))`,
              border: `2px solid ${conn.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: conn.color, flexShrink: 0
            }}>
              {conn.player.name.charAt(0)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {conn.player.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <div style={{
                  height: '3px', flex: 1, background: 'var(--border)', borderRadius: '2px'
                }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: `${conn.strength}%`, background: conn.color,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <span style={{ fontSize: '9px', fontWeight: 600, color: conn.color, flexShrink: 0 }}>
                  {conn.bond}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
