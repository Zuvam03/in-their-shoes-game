import { useGameStore } from '../store/gameStore';
import { LOCATIONS, LOCATION_ICONS } from '../game/mapData';

export default function ResourceMap() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const state = myPlayer.state;
  const needs: { type: string; label: string; urgency: number }[] = [];

  if (state.hunger > 50) needs.push({ type: 'food', label: 'Food', urgency: state.hunger });
  if (state.hydration > 50) needs.push({ type: 'food', label: 'Water', urgency: state.hydration });
  if (state.health < 40) needs.push({ type: 'medical', label: 'Medical', urgency: 100 - state.health });
  if (state.energy < 30) needs.push({ type: 'residential', label: 'Rest', urgency: 100 - state.energy });
  if (state.cash < 20) needs.push({ type: 'office', label: 'Work', urgency: 100 - state.cash });

  needs.sort((a, b) => b.urgency - a.urgency);

  if (needs.length === 0) {
    return null;
  }

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Nearest Resources
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {needs.slice(0, 4).map((need, i) => {
          const spots = LOCATIONS.filter(l => l.type === need.type);
          if (spots.length === 0) return null;
          const nearest = spots[0];
          const icon = LOCATION_ICONS[need.type] || '📍';
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 8px', borderRadius: '6px',
              background: need.urgency > 75
                ? 'rgba(239,68,68,0.06)'
                : 'rgba(0,0,0,0.1)',
              borderLeft: `3px solid ${need.urgency > 75 ? 'var(--accent-red)' : 'var(--accent-yellow)'}`
            }}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>{icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {need.label}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  {nearest.name} · {nearest.district}
                </div>
              </div>
              <div style={{
                fontSize: '9px', fontWeight: 700, padding: '2px 6px',
                borderRadius: '8px',
                background: need.urgency > 75 ? 'rgba(239,68,68,0.15)' : 'rgba(245,200,66,0.1)',
                color: need.urgency > 75 ? 'var(--accent-red)' : 'var(--accent-yellow)'
              }}>
                {Math.round(need.urgency)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
