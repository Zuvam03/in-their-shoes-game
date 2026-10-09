import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface Hint {
  id: string;
  text: string;
  icon: string;
  priority: number;
}

export default function ContextualHints() {
  const { myPlayer, room } = useGameStore();
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(false);
  const lastHintTick = useRef(0);

  useEffect(() => {
    if (!myPlayer || !room || room.phase !== 'playing') return;

    const tick = room.tick;
    if (tick - lastHintTick.current < 30) return;

    const hints: Hint[] = [];
    const s = myPlayer.state;

    if (s.health < 20 && s.cash >= 30) {
      hints.push({ id: 'low-health', text: 'Health is critical — find a medical facility or rest soon.', icon: '🏥', priority: 10 });
    }
    if (s.energy < 15) {
      hints.push({ id: 'low-energy', text: 'You are exhausted. Rest before taking more actions.', icon: '😴', priority: 9 });
    }
    if (s.hunger > 80) {
      hints.push({ id: 'high-hunger', text: 'You need to eat soon — find a food stall or restaurant.', icon: '🍛', priority: 8 });
    }
    if (s.hydration > 80) {
      hints.push({ id: 'high-thirst', text: 'Dangerously dehydrated — get water immediately.', icon: '💧', priority: 9 });
    }
    if (s.stress > 70) {
      hints.push({ id: 'high-stress', text: 'Stress is mounting. Visit a park or temple to unwind.', icon: '🧘', priority: 6 });
    }
    if (s.mood < 25) {
      hints.push({ id: 'low-mood', text: 'Morale is low. Socializing or eating can help.', icon: '😔', priority: 5 });
    }

    if (s.cash < 20 && s.cash > 0) {
      hints.push({ id: 'low-cash', text: 'Running low on cash. Look for work opportunities.', icon: '💸', priority: 7 });
    }
    if (s.cash <= 0) {
      hints.push({ id: 'no-cash', text: 'No money left — find free resources or ask others for help.', icon: '🚫', priority: 8 });
    }

    const completedRequired = myPlayer.mission.objectives
      .filter(o => !o.optional && o.completed).length;
    const totalRequired = myPlayer.mission.objectives
      .filter(o => !o.optional).length;

    if (completedRequired === totalRequired && totalRequired > 0) {
      const optionalLeft = myPlayer.mission.objectives
        .filter(o => o.optional && !o.completed).length;
      if (optionalLeft > 0) {
        hints.push({ id: 'optional-left', text: `All required objectives done! Try optional ones for bonus points.`, icon: '⭐', priority: 4 });
      }
    }

    const deadline = myPlayer.mission.definition.deadline;
    const missionTimeLeft = deadline - tick;
    if (missionTimeLeft > 0 && missionTimeLeft < 180 && completedRequired < totalRequired) {
      hints.push({ id: 'deadline-near', text: 'Mission deadline approaching — focus on required objectives.', icon: '⏰', priority: 10 });
    }

    const nearbyPlayers = Object.values(room.players)
      .filter(p => p.id !== myPlayer.id && p.state.location === s.location && p.isConnected);

    if (nearbyPlayers.length > 0 && myPlayer.socialTrust < 30) {
      hints.push({ id: 'socialize', text: 'Players nearby — helping them builds social trust for bonus points.', icon: '🤝', priority: 3 });
    }

    const isNight = tick > 0 && ((tick % 600) > 400);
    if (isNight && s.stress < 50) {
      hints.push({ id: 'night-tip', text: 'Nighttime increases stress and drains energy faster.', icon: '🌙', priority: 2 });
    }

    const activeWeather = room.cityEvents.some(e =>
      e.type === 'weather' && e.startTick + e.duration > tick
    );
    if (activeWeather) {
      hints.push({ id: 'weather-tip', text: 'Rain is falling — it affects mood but helps with hydration.', icon: '🌧', priority: 3 });
    }

    const available = hints
      .filter(h => !dismissed.has(h.id))
      .sort((a, b) => b.priority - a.priority);

    if (available.length > 0 && available[0].id !== currentHint?.id) {
      setCurrentHint(available[0]);
      setVisible(true);
      lastHintTick.current = tick;

      setTimeout(() => setVisible(false), 8000);
    }
  }, [room?.tick]);

  if (!currentHint || !visible) return null;

  return (
    <div style={{
      position: 'absolute', bottom: '8px', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 7, maxWidth: '320px', width: '90%',
      pointerEvents: 'auto',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{
        padding: '8px 12px', borderRadius: '10px',
        background: 'rgba(13,15,20,0.92)',
        border: '1px solid rgba(59,130,246,0.2)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', gap: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
      }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>{currentHint.icon}</span>
        <span style={{
          flex: 1, fontSize: '11px', color: 'var(--text-secondary)',
          lineHeight: 1.4
        }}>
          {currentHint.text}
        </span>
        <button
          onClick={() => {
            setDismissed(prev => new Set([...prev, currentHint.id]));
            setVisible(false);
          }}
          style={{
            background: 'none', border: 'none', padding: '2px 4px',
            color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer',
            flexShrink: 0
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
