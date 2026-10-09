import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { LOCATIONS, LOCATION_AMBIENCE, LOCATION_ICONS } from '../game/mapData';

const ACTION_COOLDOWN = 3;

export default function ActionPanel() {
  const { myPlayer, submitAction, lastActionResult, lastActionTick, room } = useGameStore();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const currentTick = room?.tick || 0;
  const cooldownRemaining = Math.max(0, ACTION_COOLDOWN - (currentTick - lastActionTick));
  const isOnCooldown = cooldownRemaining > 0 && lastActionTick > 0;

  useEffect(() => {
    if (lastActionResult) setPendingAction(null);
  }, [lastActionResult]);

  useEffect(() => {
    if (!pendingAction) return;
    const t = setTimeout(() => setPendingAction(null), 3000);
    return () => clearTimeout(t);
  }, [pendingAction]);

  if (!myPlayer || !room) return null;

  const currentLoc = LOCATIONS.find(l => l.id === myPlayer.state.location);
  if (!currentLoc) return (
    <div style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
      Location not found.
    </div>
  );

  const cash = myPlayer.state.cash;
  const state = myPlayer.state;

  const dayPct = (currentTick % 600) / 600;
  const isNight = dayPct > 2 / 3;
  const isEvening = dayPct > 0.55 && dayPct <= 2 / 3;

  const activeEvents = room.cityEvents.filter(e =>
    e.startTick + e.duration > currentTick &&
    (e.affectedLocations.includes('all') || e.affectedLocations.includes(state.location))
  );
  const hasWeather = activeEvents.some(e => e.type === 'weather');
  const hasHeat = activeEvents.some(e => e.type === 'heat');
  const hasCrowd = activeEvents.some(e => e.type === 'crowd');

  const ambience = LOCATION_AMBIENCE[currentLoc.id];
  let ambienceText = '';
  if (ambience) {
    if (hasWeather) ambienceText = ambience.rain;
    else if (hasHeat) ambienceText = ambience.heat;
    else if (hasCrowd) ambienceText = ambience.crowd;
    else if (isNight) ambienceText = ambience.night;
    else if (isEvening) ambienceText = ambience.evening;
    else ambienceText = ambience.day;
  }

  const locIcon = LOCATION_ICONS[currentLoc.type] || '📍';

  const warnings: string[] = [];
  if (state.hunger > 70 && !currentLoc.availableActions.some(a => a.actionType === 'eat')) {
    warnings.push('No food here — find a food location soon');
  }
  if (state.hydration > 70 && !currentLoc.availableActions.some(a => a.actionType === 'drink')) {
    warnings.push('No water here — you need to hydrate');
  }
  if (state.energy < 15) {
    warnings.push('Very low energy — rest before attempting actions');
  }
  if (state.health < 20 && currentLoc.type !== 'medical') {
    warnings.push('Health critical — get to a medical location');
  }

  return (
    <div>
      {/* Location header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '6px'
      }}>
        <span style={{ fontSize: '18px' }}>{locIcon}</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentLoc.name}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {currentLoc.district} · {currentLoc.type}
          </div>
        </div>
      </div>

      {/* Ambient description */}
      {ambienceText && (
        <div style={{
          padding: '8px 10px', borderRadius: '8px',
          background: isNight
            ? 'rgba(99,102,241,0.06)'
            : isEvening
              ? 'rgba(249,115,22,0.06)'
              : 'rgba(245,200,66,0.04)',
          border: `1px solid ${isNight
            ? 'rgba(99,102,241,0.15)'
            : isEvening
              ? 'rgba(249,115,22,0.12)'
              : 'rgba(245,200,66,0.1)'}`,
          marginBottom: '8px',
          fontSize: '11px', color: 'var(--text-secondary)',
          lineHeight: 1.5, fontStyle: 'italic'
        }}>
          {ambienceText}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{
          marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          {warnings.map((w, i) => (
            <div key={i} style={{
              padding: '5px 8px', borderRadius: '6px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
              fontSize: '10px', color: '#f87171',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <span>⚠</span> {w}
            </div>
          ))}
        </div>
      )}

      {/* Cooldown */}
      {isOnCooldown && (
        <div style={{
          marginBottom: '8px', padding: '6px 10px', borderRadius: '6px',
          background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.15)',
          fontSize: '11px', color: 'var(--accent-yellow)',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <span style={{ animation: 'pulse 1s infinite' }}>⏳</span>
          Cooldown: {cooldownRemaining}s
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {currentLoc.availableActions.map(action => {
          const canAfford = !action.cost || cash >= action.cost;
          const isObjective = action.actionType === 'complete_objective';
          const disabled = !canAfford || pendingAction !== null || isOnCooldown;

          const statHint = getStatHint(action.actionType, action.payload);

          return (
            <button
              key={action.id}
              onClick={() => { setPendingAction(action.id); submitAction(action.actionType as never, action.payload); }}
              disabled={disabled}
              title={`${action.description}${statHint ? ` | ${statHint}` : ''}`}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: isObjective
                  ? 'rgba(245, 200, 66, 0.1)'
                  : canAfford ? 'var(--bg-secondary)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${isObjective ? 'rgba(245,200,66,0.3)' : canAfford ? 'var(--border)' : 'var(--border)'}`,
                color: isObjective ? 'var(--accent-yellow)' : canAfford ? 'var(--text-primary)' : 'var(--text-muted)',
                textAlign: 'left', fontSize: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                opacity: canAfford ? 1 : 0.5,
                cursor: disabled ? 'not-allowed' : 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                <span style={{ flexShrink: 0 }}>{pendingAction === action.id ? '⏳' : action.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pendingAction === action.id ? 'Working...' : action.label}
                  </div>
                  {statHint && (
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {statHint}
                    </div>
                  )}
                </div>
              </div>
              {action.cost !== undefined && action.cost > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: 600, flexShrink: 0, marginLeft: '6px',
                  color: canAfford ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  ₹{action.cost}
                </span>
              )}
            </button>
          );
        })}

        {/* Rest action (available anywhere) */}
        <button
          onClick={() => { setPendingAction('rest'); submitAction('rest', { duration: 120 }); }}
          disabled={pendingAction !== null || isOnCooldown}
          style={{
            padding: '8px 10px', borderRadius: '8px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', textAlign: 'left', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <span>😴</span>
          <div>
            <div>Rest (2 min)</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              +energy, -stress
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function getStatHint(actionType: string, payload: Record<string, unknown>): string {
  switch (actionType) {
    case 'eat': return '-hunger, +energy, +mood';
    case 'drink': return '-thirst, +mood';
    case 'rest': return '+energy, -stress';
    case 'work': return '+cash, -energy, +stress';
    case 'buy': return '+mood, -cash';
    case 'complete_objective': return '+mood, -stress, mission progress';
    default: return '';
  }
}
