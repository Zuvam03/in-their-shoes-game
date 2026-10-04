import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const EVENT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  weather: { icon: '🌧', color: '#60a5fa', label: 'Rain' },
  heat: { icon: '🔥', color: '#f87171', label: 'Heat Wave' },
  crowd: { icon: '👥', color: '#fbbf24', label: 'Crowd Surge' },
  emergency: { icon: '🚨', color: '#ef4444', label: 'Emergency' },
  opportunity: { icon: '💡', color: '#a78bfa', label: 'Opportunity' },
  festival: { icon: '🎉', color: '#f5c842', label: 'Festival' },
  transport_disruption: { icon: '🚌', color: '#f97316', label: 'Transport' },
  resource_shortage: { icon: '💧', color: '#60a5fa', label: 'Shortage' },
  npc_request: { icon: '🙋', color: '#22c55e', label: 'Request' },
  cultural: { icon: '🎭', color: '#c084fc', label: 'Cultural' },
  market: { icon: '🏪', color: '#34d399', label: 'Market' },
};

export default function WeatherWidget() {
  const { room } = useGameStore();
  const [expanded, setExpanded] = useState(false);

  if (!room || room.phase !== 'playing') return null;

  const tick = room.tick;
  const events = room.cityEvents;

  const active = events.filter(e => e.startTick <= tick && e.startTick + e.duration > tick);
  const upcoming = events.filter(e => e.startTick > tick);

  const isNight = tick > 0 && ((tick % 600) > 400);
  const dayPct = (tick % 600) / 600;
  const isSunset = dayPct > 0.55 && dayPct <= 2 / 3;

  if (active.length === 0 && upcoming.length === 0 && !isNight) return null;

  const primary = active[0];
  const cfg = primary ? (EVENT_CONFIG[primary.type] || EVENT_CONFIG.emergency) : null;

  return (
    <div style={{
      position: 'absolute', bottom: '16px', left: '12px',
      zIndex: 5, pointerEvents: 'auto'
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '5px 10px',
          borderRadius: expanded ? '8px 8px 0 0' : '8px',
          background: 'rgba(13,15,20,0.88)',
          border: '1px solid var(--border)',
          borderBottom: expanded ? 'none' : undefined,
          backdropFilter: 'blur(6px)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '11px'
        }}
      >
        {isNight ? (
          <span style={{ color: '#a5b4fc' }}>🌙 Night</span>
        ) : isSunset ? (
          <span style={{ color: 'var(--accent-orange)' }}>🌆 Evening</span>
        ) : (
          <span style={{ color: 'var(--accent-yellow)' }}>☀️ Day</span>
        )}

        {cfg && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: cfg.color }}>{cfg.icon} {cfg.label}</span>
          </>
        )}

        {active.length > 1 && (
          <span style={{
            fontSize: '9px', padding: '1px 4px', borderRadius: '6px',
            background: 'var(--bg-secondary)', color: 'var(--text-muted)'
          }}>
            +{active.length - 1}
          </span>
        )}

        <span style={{
          fontSize: '9px', color: 'var(--text-muted)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▲
        </span>
      </div>

      {expanded && (
        <div style={{
          background: 'rgba(13,15,20,0.92)',
          border: '1px solid var(--border)',
          borderRadius: '0 8px 8px 8px',
          backdropFilter: 'blur(8px)',
          padding: '8px 10px', minWidth: '180px',
          display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          {active.length > 0 && (
            <div>
              <div style={{
                fontSize: '9px', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px'
              }}>
                Active
              </div>
              {active.map(e => {
                const c = EVENT_CONFIG[e.type] || EVENT_CONFIG.emergency;
                const remaining = (e.startTick + e.duration) - tick;
                const remMin = Math.floor(remaining / 60);
                const remSec = remaining % 60;
                return (
                  <div key={e.id} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '4px 6px', borderRadius: '6px',
                    background: `${c.color}11`, marginBottom: '2px'
                  }}>
                    <span style={{ fontSize: '12px' }}>{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: c.color }}>
                        {e.title}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                        {e.affectedLocations.includes('all') ? 'Citywide' : e.affectedLocations.join(', ')}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)'
                    }}>
                      {remMin}:{remSec.toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <div style={{
                fontSize: '9px', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px'
              }}>
                Forecast
              </div>
              {upcoming.slice(0, 3).map(e => {
                const c = EVENT_CONFIG[e.type] || EVENT_CONFIG.emergency;
                const eta = e.startTick - tick;
                const etaMin = Math.floor(eta / 60);
                return (
                  <div key={e.id} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '3px 6px', fontSize: '10px',
                    opacity: 0.7
                  }}>
                    <span>{c.icon}</span>
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{e.title}</span>
                    <span style={{ color: 'var(--text-muted)' }}>in {etaMin}m</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
