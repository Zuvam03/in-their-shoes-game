import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { LOCATIONS, LOCATION_ICONS } from '../game/mapData';

const ACTION_COOLDOWN = 3;

const ACTION_META: Record<string, { icon: string; color: string; glow: (s: any) => boolean }> = {
  eat:     { icon: '🍛', color: '#f59e0b', glow: s => s.hunger > 60 },
  drink:   { icon: '💧', color: '#3b82f6', glow: s => s.hydration > 60 },
  rest:    { icon: '😴', color: '#8b5cf6', glow: s => s.energy < 30 },
  work:    { icon: '💼', color: '#10b981', glow: s => s.cash < 200 },
  buy:     { icon: '🛍️', color: '#ec4899', glow: () => false },
  complete_objective: { icon: '⭐', color: '#f5c842', glow: () => true },
  help_player: { icon: '🤝', color: '#06b6d4', glow: () => false },
  share_info:  { icon: '💬', color: '#6366f1', glow: () => false },
  transfer_money: { icon: '💰', color: '#22c55e', glow: () => false },
};

interface Props {
  locationId: string;
  x: number;
  y: number;
  onClose: () => void;
  scale: number;
}

export default function RadialActionMenu({ locationId, x, y, onClose, scale }: Props) {
  const { myPlayer, submitAction, lastActionResult, lastActionTick, room } = useGameStore();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [appear, setAppear] = useState(false);

  const currentTick = room?.tick || 0;
  const cooldownRemaining = Math.max(0, ACTION_COOLDOWN - (currentTick - lastActionTick));
  const isOnCooldown = cooldownRemaining > 0 && lastActionTick > 0;

  useEffect(() => { requestAnimationFrame(() => setAppear(true)); }, []);
  useEffect(() => { if (lastActionResult) { setPendingAction(null); onClose(); } }, [lastActionResult]);

  if (!myPlayer || !room) return null;

  const loc = LOCATIONS.find(l => l.id === locationId);
  if (!loc) return null;

  const isCurrent = myPlayer.state.location === locationId;
  const cash = myPlayer.state.cash;
  const state = myPlayer.state;

  const actions = isCurrent ? [
    ...loc.availableActions.map(a => ({
      id: a.id,
      label: a.label,
      icon: ACTION_META[a.actionType]?.icon || a.icon,
      color: ACTION_META[a.actionType]?.color || '#888',
      cost: a.cost,
      actionType: a.actionType,
      payload: a.payload,
      canAfford: !a.cost || cash >= a.cost,
      shouldGlow: ACTION_META[a.actionType]?.glow(state) ?? false,
      description: a.description,
    })),
    {
      id: 'rest-anywhere',
      label: 'Rest',
      icon: '😴',
      color: '#8b5cf6',
      cost: undefined,
      actionType: 'rest',
      payload: { duration: 120 },
      canAfford: true,
      shouldGlow: state.energy < 30,
      description: 'Rest to recover energy',
    }
  ] : [];

  if (actions.length === 0) return null;

  const radius = 60 / scale;
  const angleStep = (2 * Math.PI) / Math.max(actions.length, 1);
  const startAngle = -Math.PI / 2;

  return (
    <g>
      <circle cx={x} cy={y} r={radius + 24 / scale} fill="rgba(0,0,0,0.5)" opacity={appear ? 0.8 : 0}>
        <animate attributeName="opacity" from="0" to="0.8" dur="0.2s" fill="freeze" />
      </circle>

      {actions.map((action, i) => {
        const angle = startAngle + i * angleStep;
        const ax = x + Math.cos(angle) * radius;
        const ay = y + Math.sin(angle) * radius;
        const disabled = !action.canAfford || pendingAction !== null || isOnCooldown;
        const btnR = 14 / scale;

        return (
          <g
            key={action.id}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: appear ? 1 : 0 }}
            onClick={e => {
              e.stopPropagation();
              if (disabled) return;
              setPendingAction(action.id);
              submitAction(action.actionType as never, action.payload);
            }}
          >
            {action.shouldGlow && !disabled && (
              <circle cx={ax} cy={ay} r={btnR + 4 / scale} fill="none"
                stroke={action.color} strokeWidth={1.5 / scale} opacity="0.5">
                <animate attributeName="r" values={`${btnR + 2 / scale};${btnR + 6 / scale};${btnR + 2 / scale}`} dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}

            <circle cx={ax} cy={ay} r={btnR}
              fill={disabled ? 'rgba(30,30,40,0.9)' : `${action.color}22`}
              stroke={disabled ? 'rgba(100,100,120,0.4)' : action.color}
              strokeWidth={1.5 / scale}
            />

            <text x={ax} y={ay} textAnchor="middle" dominantBaseline="central"
              fontSize={10 / scale} style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {pendingAction === action.id ? '⏳' : action.icon}
            </text>

            <text x={ax} y={ay + btnR + 8 / scale} textAnchor="middle"
              fontSize={5.5 / scale} fill={disabled ? 'rgba(150,150,160,0.6)' : '#fff'}
              fontWeight="600" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {action.label}
            </text>

            {action.cost !== undefined && action.cost > 0 && (
              <text x={ax} y={ay + btnR + 14 / scale} textAnchor="middle"
                fontSize={4.5 / scale}
                fill={action.canAfford ? '#22c55e' : '#ef4444'}
                fontWeight="600" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                ₹{action.cost}
              </text>
            )}
          </g>
        );
      })}

      {isOnCooldown && (
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
          fontSize={7 / scale} fill="var(--accent-yellow)" fontWeight="700"
          style={{ pointerEvents: 'none' }}>
          ⏳ {cooldownRemaining}s
        </text>
      )}
    </g>
  );
}
