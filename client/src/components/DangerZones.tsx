import { useGameStore } from '../store/gameStore';
import { getLocationById } from '../game/mapData';

export default function DangerZones() {
  const { room, myPlayer } = useGameStore();
  if (!room || !myPlayer) return null;

  const tick = room.tick;
  const isNight = ((tick % 600) / 600) > 2 / 3;

  const dangers: { locationId: string; reason: string; severity: 'low' | 'medium' | 'high' }[] = [];

  room.cityEvents.forEach(evt => {
    if (evt.affectedLocations) {
      evt.affectedLocations.forEach(locId => {
        dangers.push({
          locationId: locId,
          reason: evt.title,
          severity: 'medium'
        });
      });
    }
  });

  if (isNight) {
    const nightDanger = ['park_maidan', 'park_rabindra', 'ghat_princep'].filter(id => getLocationById(id));
    nightDanger.forEach(locId => {
      if (!dangers.find(d => d.locationId === locId)) {
        dangers.push({
          locationId: locId,
          reason: 'Unsafe at night',
          severity: 'medium'
        });
      }
    });
  }

  if (dangers.length === 0) return null;

  const severityConfig = {
    low: { color: 'var(--accent-yellow)', bg: 'rgba(245,200,66,0.08)', icon: '⚠' },
    medium: { color: 'var(--accent-orange)', bg: 'rgba(249,115,22,0.08)', icon: '⚠' },
    high: { color: 'var(--accent-red)', bg: 'rgba(239,68,68,0.08)', icon: '🚨' }
  };

  return (
    <div style={{
      position: 'absolute', top: '50px', right: '10px',
      zIndex: 4, maxWidth: '200px'
    }}>
      <div style={{
        padding: '8px 10px', borderRadius: '10px',
        background: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(239,68,68,0.2)'
      }}>
        <div style={{
          fontSize: '9px', fontWeight: 700, color: 'var(--accent-red)',
          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          <span style={{ animation: 'pulse 2s infinite' }}>🚨</span> Danger Zones
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {dangers.slice(0, 4).map((d, i) => {
            const loc = getLocationById(d.locationId);
            const cfg = severityConfig[d.severity];
            const isPlayerHere = myPlayer.state.location === d.locationId;

            return (
              <div key={i} style={{
                padding: '4px 6px', borderRadius: '6px',
                background: isPlayerHere ? 'rgba(239,68,68,0.15)' : cfg.bg,
                border: isPlayerHere ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{ fontSize: '10px' }}>{cfg.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '10px', fontWeight: 600,
                    color: isPlayerHere ? 'var(--accent-red)' : 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {loc?.name || d.locationId}
                    {isPlayerHere && ' (YOU)'}
                  </div>
                  <div style={{
                    fontSize: '9px', color: 'var(--text-muted)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {d.reason}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
