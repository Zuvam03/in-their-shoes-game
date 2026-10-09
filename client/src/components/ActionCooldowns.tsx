import { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface Cooldown {
  action: string;
  label: string;
  icon: string;
  lastTick: number;
  cooldownTicks: number;
}

const ACTION_COOLDOWNS: Record<string, { label: string; icon: string; ticks: number }> = {
  eat: { label: 'Eat', icon: '🍛', ticks: 30 },
  drink: { label: 'Drink', icon: '💧', ticks: 20 },
  rest: { label: 'Rest', icon: '😴', ticks: 40 },
  work: { label: 'Work', icon: '💼', ticks: 50 },
  help_player: { label: 'Help', icon: '🤝', ticks: 30 },
  request_help: { label: 'Ask Help', icon: '🙏', ticks: 60 },
};

export default function ActionCooldowns() {
  const { myPlayer, room } = useGameStore();
  const lastActions = useRef<Record<string, number>>({});
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!myPlayer) return;
    const lastLog = myPlayer.actionLog[myPlayer.actionLog.length - 1];
    if (lastLog && ACTION_COOLDOWNS[lastLog.type]) {
      lastActions.current[lastLog.type] = lastLog.tick;
    }
  }, [myPlayer?.actionLog.length]);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!myPlayer || !room) return null;

  const tick = room.tick;
  const activeCooldowns: Cooldown[] = [];

  Object.entries(lastActions.current).forEach(([action, lastTick]) => {
    const config = ACTION_COOLDOWNS[action];
    if (!config) return;
    const remaining = config.ticks - (tick - lastTick);
    if (remaining > 0) {
      activeCooldowns.push({
        action, label: config.label, icon: config.icon,
        lastTick, cooldownTicks: remaining
      });
    }
  });

  if (activeCooldowns.length === 0) return null;

  return (
    <div style={{
      display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '4px 0'
    }}>
      {activeCooldowns.map(cd => {
        const config = ACTION_COOLDOWNS[cd.action];
        const pct = (cd.cooldownTicks / config.ticks) * 100;

        return (
          <div key={cd.action} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '12px',
            background: 'rgba(100,116,139,0.1)',
            border: '1px solid rgba(100,116,139,0.15)',
            fontSize: '10px', color: 'var(--text-muted)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${pct}%`,
              background: 'rgba(100,116,139,0.08)',
              transition: 'width 1s linear'
            }} />
            <span style={{ position: 'relative', fontSize: '11px' }}>{cd.icon}</span>
            <span style={{ position: 'relative', fontWeight: 600 }}>
              {Math.ceil(cd.cooldownTicks / 10)}s
            </span>
          </div>
        );
      })}
    </div>
  );
}
