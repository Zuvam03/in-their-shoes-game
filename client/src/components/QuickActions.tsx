import { useState } from 'react';
import { useGameStore, ActionType } from '../store/gameStore';
import { getLocationById } from '../game/mapData';

const QUICK_ACTIONS: { type: string; icon: string; label: string; color: string; locationTypes: string[] }[] = [
  { type: 'eat', icon: '🍛', label: 'Eat', color: '#f97316', locationTypes: ['food'] },
  { type: 'drink', icon: '💧', label: 'Drink', color: '#3b82f6', locationTypes: ['food', 'public'] },
  { type: 'rest', icon: '😴', label: 'Rest', color: '#a855f7', locationTypes: ['residential', 'public', 'medical'] },
  { type: 'work', icon: '💼', label: 'Work', color: '#f5c842', locationTypes: ['office', 'shop'] },
  { type: 'buy', icon: '🛒', label: 'Buy', color: '#22c55e', locationTypes: ['shop', 'food'] },
];

export default function QuickActions() {
  const { myPlayer, room, submitAction } = useGameStore();
  const [showAll, setShowAll] = useState(false);

  if (!myPlayer || !room || room.phase !== 'playing') return null;

  const location = getLocationById(myPlayer.state.location);
  if (!location) return null;

  const available = QUICK_ACTIONS.filter(a =>
    a.locationTypes.includes(location.type as typeof a.locationTypes[number])
  );

  const display = showAll ? QUICK_ACTIONS : available;

  if (display.length === 0) return null;

  return (
    <div style={{
      position: 'absolute', right: '12px', top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 5, pointerEvents: 'auto',
      display: 'flex', flexDirection: 'column', gap: '4px',
      alignItems: 'flex-end'
    }}>
      {display.map(action => {
        const isAvailable = available.some(a => a.type === action.type);
        return (
          <button
            key={action.type}
            onClick={() => {
              if (isAvailable) {
                submitAction(action.type as ActionType, {});
              }
            }}
            disabled={!isAvailable}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 10px', borderRadius: '8px',
              background: isAvailable
                ? 'rgba(13,15,20,0.88)'
                : 'rgba(13,15,20,0.5)',
              border: `1px solid ${isAvailable ? `${action.color}40` : 'var(--border)'}`,
              backdropFilter: 'blur(6px)',
              cursor: isAvailable ? 'pointer' : 'default',
              opacity: isAvailable ? 1 : 0.4,
              fontSize: '11px', fontWeight: 600,
              color: isAvailable ? action.color : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
            title={`${action.label} (${isAvailable ? 'available here' : 'not available at this location'})`}
          >
            <span style={{ fontSize: '14px' }}>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        );
      })}

      <button
        onClick={() => setShowAll(!showAll)}
        style={{
          padding: '4px 8px', borderRadius: '6px',
          background: 'rgba(13,15,20,0.6)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)', fontSize: '9px',
          cursor: 'pointer'
        }}
      >
        {showAll ? 'Less' : 'All'}
      </button>
    </div>
  );
}
