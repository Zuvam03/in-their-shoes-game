import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLocationById, LOCATIONS, LocationInfo } from '../game/mapData';

const TYPE_ICONS: Record<string, string> = {
  transport: '🚌', food: '🍛', shop: '🛒', office: '💼',
  medical: '🏥', public: '🏛️', residential: '🏠', education: '📚'
};

interface LocationVisit {
  locationId: string;
  firstVisit: number;
  lastVisit: number;
  visitCount: number;
  actionsPerformed: string[];
}

export default function LocationMemory() {
  const { myPlayer, room } = useGameStore();
  const visits = useRef<Record<string, LocationVisit>>({});

  useEffect(() => {
    if (!myPlayer || !room) return;
    const loc = myPlayer.state.location;
    if (!loc) return;

    if (!visits.current[loc]) {
      visits.current[loc] = {
        locationId: loc,
        firstVisit: room.tick,
        lastVisit: room.tick,
        visitCount: 1,
        actionsPerformed: []
      };
    } else {
      const v = visits.current[loc];
      if (room.tick - v.lastVisit > 10) {
        v.visitCount++;
      }
      v.lastVisit = room.tick;
    }

    const lastAction = myPlayer.actionLog[myPlayer.actionLog.length - 1];
    if (lastAction && lastAction.type !== 'move') {
      const v = visits.current[loc];
      if (!v.actionsPerformed.includes(lastAction.type)) {
        v.actionsPerformed.push(lastAction.type);
      }
    }
  }, [myPlayer?.state.location, myPlayer?.actionLog.length, room?.tick]);

  if (!myPlayer) return null;

  const visitList = Object.values(visits.current)
    .sort((a, b) => b.visitCount - a.visitCount);

  const totalLocations = LOCATIONS.length;
  const visitedCount = visitList.length;
  const pct = Math.round((visitedCount / totalLocations) * 100);

  if (visitedCount === 0) return null;

  const ACTION_ICONS: Record<string, string> = {
    eat: '🍛', drink: '💧', rest: '😴', work: '💼', buy: '🛒',
    help_player: '🤝', request_help: '🙏', transfer_money: '💸',
    complete_objective: '🎯', dilemma_choice: '⚖️', share_info: '💬'
  };

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
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
          Location Memory
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 700,
          color: pct >= 80 ? 'var(--accent-green)' : 'var(--accent-blue)'
        }}>
          {visitedCount}/{totalLocations} ({pct}%)
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {visitList.slice(0, 6).map(visit => {
          const loc = getLocationById(visit.locationId);
          const isCurrent = myPlayer.state.location === visit.locationId;

          return (
            <div key={visit.locationId} style={{
              padding: '6px 8px', borderRadius: '6px',
              background: isCurrent ? 'rgba(34,197,94,0.06)' : 'rgba(0,0,0,0.1)',
              border: isCurrent ? '1px solid rgba(34,197,94,0.15)' : '1px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: isCurrent ? 'rgba(34,197,94,0.15)' : 'rgba(245,200,66,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', flexShrink: 0
              }}>
                {(loc && TYPE_ICONS[(loc as LocationInfo).type]) || '📍'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '11px', fontWeight: 600,
                  color: isCurrent ? 'var(--accent-green)' : 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  {loc?.name || visit.locationId}
                  {isCurrent && (
                    <span style={{ fontSize: '8px', color: 'var(--accent-green)' }}>HERE</span>
                  )}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px'
                }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {visit.visitCount}x visited
                  </span>
                  {visit.actionsPerformed.length > 0 && (
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {visit.actionsPerformed.slice(0, 4).map(a => (
                        <span key={a} style={{ fontSize: '10px' }} title={a}>
                          {ACTION_ICONS[a] || '?'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{
                fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)'
              }}>
                {visit.visitCount}
              </div>
            </div>
          );
        })}
      </div>

      {visitList.length > 6 && (
        <div style={{
          marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)',
          textAlign: 'center', fontStyle: 'italic'
        }}>
          + {visitList.length - 6} more locations visited
        </div>
      )}
    </div>
  );
}
