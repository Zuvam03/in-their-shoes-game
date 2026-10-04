import { useGameStore } from '../store/gameStore';

export default function HelpBeacon() {
  const { room, myPlayer, mySocketId } = useGameStore();
  if (!room || !myPlayer) return null;

  const otherPlayers = Object.values(room.players).filter(p =>
    p.id !== mySocketId && p.isConnected
  );

  const playersInNeed = otherPlayers.filter(p =>
    p.state.health < 25 || p.state.energy < 15 ||
    p.state.hunger > 80 || p.state.hydration > 80
  );

  const nearbyInNeed = playersInNeed.filter(p =>
    p.state.location === myPlayer.state.location
  );

  if (playersInNeed.length === 0) return null;

  return (
    <div style={{
      padding: '8px 10px', borderRadius: '10px',
      background: nearbyInNeed.length > 0
        ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.06)',
      border: `1px solid ${nearbyInNeed.length > 0
        ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.15)'}`,
      animation: nearbyInNeed.length > 0 ? 'pulse 3s infinite' : undefined
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600,
        color: nearbyInNeed.length > 0 ? 'var(--accent-red)' : 'var(--accent-orange)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        <span style={{ fontSize: '12px' }}>🆘</span>
        {nearbyInNeed.length > 0 ? 'Nearby Player in Distress!' : 'Players Need Help'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {playersInNeed.slice(0, 3).map(p => {
          const isNearby = p.state.location === myPlayer.state.location;
          const needs: string[] = [];
          if (p.state.health < 25) needs.push('low health');
          if (p.state.energy < 15) needs.push('exhausted');
          if (p.state.hunger > 80) needs.push('starving');
          if (p.state.hydration > 80) needs.push('dehydrated');

          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 6px', borderRadius: '6px',
              background: isNearby ? 'rgba(239,68,68,0.06)' : 'transparent'
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: `hsl(${p.name.charCodeAt(0) * 7}deg 50% 35%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', color: '#fff', fontWeight: 700, flexShrink: 0
              }}>
                {p.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '11px', fontWeight: 600,
                  color: isNearby ? 'var(--accent-red)' : 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  {p.name}
                  {isNearby && (
                    <span style={{ fontSize: '8px', color: 'var(--accent-green)' }}>HERE</span>
                  )}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  {needs.join(' · ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {nearbyInNeed.length > 0 && (
        <div style={{
          marginTop: '6px', fontSize: '10px', color: 'var(--accent-green)',
          fontWeight: 600, textAlign: 'center'
        }}>
          Help them now for a 1.5x proximity bonus!
        </div>
      )}
    </div>
  );
}
