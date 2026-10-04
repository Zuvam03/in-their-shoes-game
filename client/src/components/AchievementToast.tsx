import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { checkAchievements, Achievement } from '../game/achievements';
import { playCoinEarn } from '../game/sounds';

export default function AchievementToast() {
  const { myPlayer, room, soundEnabled } = useGameStore();
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);
  const unlocked = useRef(new Set<string>());

  useEffect(() => {
    if (!myPlayer || !room || room.phase !== 'playing') return;

    const newAchievements = checkAchievements(myPlayer, room.tick, unlocked.current);
    if (newAchievements.length > 0) {
      for (const a of newAchievements) unlocked.current.add(a.id);
      setQueue(q => [...q, ...newAchievements]);
    }
  }, [myPlayer, room?.tick]);

  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
    if (soundEnabled) playCoinEarn();

    const timer = setTimeout(() => setCurrent(null), 4000);
    return () => clearTimeout(timer);
  }, [queue, current]);

  if (!current) return null;

  return (
    <div style={{
      position: 'fixed', top: '60px', right: '16px', zIndex: 800,
      animation: 'achievementPop 0.4s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,200,66,0.15), rgba(249,115,22,0.1))',
        border: '1px solid rgba(245,200,66,0.3)',
        borderRadius: '12px', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        minWidth: '240px', maxWidth: '320px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'rgba(245,200,66,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', flexShrink: 0
        }}>
          {current.icon}
        </div>
        <div>
          <div style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.5px', color: 'var(--accent-yellow)', marginBottom: '2px'
          }}>
            Achievement Unlocked
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>
            {current.title}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {current.description}
          </div>
        </div>
      </div>
    </div>
  );
}

export function useUnlockedAchievements(): Set<string> {
  const { myPlayer, room } = useGameStore();
  const unlocked = useRef(new Set<string>());

  useEffect(() => {
    if (!myPlayer || !room) return;
    checkAchievements(myPlayer, room.tick, unlocked.current)
      .forEach(a => unlocked.current.add(a.id));
  }, [myPlayer, room?.tick]);

  return unlocked.current;
}
