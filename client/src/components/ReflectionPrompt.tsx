import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const REFLECTIONS = [
  { trigger: 'helped', text: 'You chose to help someone. What drove that decision — your persona\'s values or your own?' },
  { trigger: 'dilemma', text: 'You faced a moral crossroads. Did your choice reflect what you\'d do, or what your character would do?' },
  { trigger: 'money_low', text: 'Running low on cash changes everything. How does financial pressure shape your decisions?' },
  { trigger: 'night', text: 'Night falls differently when you have no safe place to go. What privileges do you take for granted?' },
  { trigger: 'hungry', text: 'Hunger isn\'t just a stat — for millions, it\'s a daily reality. What would you sacrifice to eat?' },
  { trigger: 'milestone', text: 'You reached a milestone. But at what cost? Who did you help — or not help — along the way?' },
  { trigger: 'general', text: 'Walking in someone else\'s shoes changes how you see the world. What surprised you most?' },
];

export default function ReflectionPrompt() {
  const { myPlayer, room } = useGameStore();
  const [current, setCurrent] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [lastShown, setLastShown] = useState(0);

  useEffect(() => {
    if (!myPlayer || !room) return;
    if (room.tick - lastShown < 300) return;

    const tick = room.tick;
    const dayPct = (tick % 600) / 600;
    const isNight = dayPct > 2 / 3;

    let trigger: string | null = null;

    const lastAction = myPlayer.actionLog[myPlayer.actionLog.length - 1];
    if (lastAction) {
      if (lastAction.type === 'help_player' && !dismissed.has('helped')) trigger = 'helped';
      if (lastAction.type === 'dilemma_choice' && !dismissed.has('dilemma')) trigger = 'dilemma';
      if (lastAction.type === 'complete_objective' && !dismissed.has('milestone')) trigger = 'milestone';
    }

    if (!trigger && myPlayer.state.cash < 10 && !dismissed.has('money_low')) trigger = 'money_low';
    if (!trigger && isNight && !dismissed.has('night')) trigger = 'night';
    if (!trigger && myPlayer.state.hunger > 75 && !dismissed.has('hungry')) trigger = 'hungry';

    if (trigger && !current) {
      setCurrent(trigger);
      setLastShown(tick);
    }
  }, [myPlayer?.actionLog.length, room?.tick]);

  if (!current) return null;

  const reflection = REFLECTIONS.find(r => r.trigger === current);
  if (!reflection) return null;

  const handleDismiss = () => {
    setDismissed(prev => new Set([...prev, current]));
    setCurrent(null);
  };

  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 15, maxWidth: '400px', width: '90%'
    }}>
      <div style={{
        padding: '14px 16px', borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
        border: '1px solid rgba(139,92,246,0.3)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.5s ease'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px'
        }}>
          <div>
            <div style={{
              fontSize: '10px', fontWeight: 600, color: 'rgba(168,85,247,0.8)',
              textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <span>🪞</span> Reflection
            </div>
            <div style={{
              fontSize: '12px', color: 'var(--text-secondary)',
              lineHeight: 1.6, fontStyle: 'italic'
            }}>
              {reflection.text}
            </div>
          </div>
          <button onClick={handleDismiss} style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: '14px',
            cursor: 'pointer', flexShrink: 0, padding: '2px'
          }}>
            x
          </button>
        </div>
      </div>
    </div>
  );
}
