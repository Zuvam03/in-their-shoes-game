import { useGameStore } from '../store/gameStore';

interface Tip {
  icon: string;
  text: string;
  priority: number;
  color: string;
}

function generateTips(state: {
  health: number; energy: number; hunger: number;
  hydration: number; mood: number; stress: number; cash: number;
  location: string;
}, tick: number, missionStatus: string): Tip[] {
  const tips: Tip[] = [];
  const dayPct = (tick % 600) / 600;
  const isNight = dayPct > 2 / 3;
  const isEvening = dayPct > 0.55 && dayPct <= 2 / 3;

  if (state.health < 25) {
    tips.push({ icon: '🏥', text: 'Health critical — find medical help or rest immediately', priority: 10, color: 'var(--accent-red)' });
  } else if (state.health < 45) {
    tips.push({ icon: '💊', text: 'Health is low. Consider resting or eating to recover', priority: 6, color: 'var(--accent-orange)' });
  }

  if (state.energy < 15) {
    tips.push({ icon: '😴', text: 'Exhausted! Rest before you collapse', priority: 9, color: 'var(--accent-red)' });
  } else if (state.energy < 35) {
    tips.push({ icon: '⚡', text: 'Energy is draining. Find a place to rest', priority: 5, color: 'var(--accent-yellow)' });
  }

  if (state.hunger > 75) {
    tips.push({ icon: '🍛', text: 'Very hungry — eat something soon', priority: 8, color: 'var(--accent-orange)' });
  }

  if (state.hydration > 75) {
    tips.push({ icon: '💧', text: 'Dehydrated — find water quickly', priority: 8, color: 'var(--accent-blue)' });
  }

  if (state.stress > 70) {
    tips.push({ icon: '🧘', text: 'Stress is high. Rest or change location to calm down', priority: 7, color: 'var(--accent-purple)' });
  }

  if (state.mood < 25) {
    tips.push({ icon: '😔', text: 'Morale is low. Helping others or eating well can lift spirits', priority: 5, color: 'var(--accent-purple)' });
  }

  if (state.cash < 10) {
    tips.push({ icon: '💸', text: 'Almost out of money! Look for work opportunities', priority: 7, color: 'var(--accent-red)' });
  } else if (state.cash < 30) {
    tips.push({ icon: '💰', text: 'Funds running low. Consider earning before spending', priority: 4, color: 'var(--accent-yellow)' });
  }

  if (isNight) {
    tips.push({ icon: '🌙', text: 'Night time — stats drain faster. Find shelter to rest', priority: 6, color: 'var(--accent-blue)' });
  } else if (isEvening) {
    tips.push({ icon: '🌆', text: 'Evening approaches. Plan your night strategy', priority: 3, color: 'var(--accent-blue)' });
  }

  if (missionStatus === 'active' && state.energy > 50 && state.health > 50) {
    tips.push({ icon: '🎯', text: 'Good condition — focus on your mission objectives', priority: 2, color: 'var(--accent-green)' });
  }

  if (state.health > 70 && state.energy > 60 && state.cash > 50) {
    tips.push({ icon: '🤝', text: 'You\'re doing well — consider helping others in need', priority: 1, color: 'var(--accent-green)' });
  }

  return tips.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

export default function SurvivalTips() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const tips = generateTips(myPlayer.state, room.tick, myPlayer.mission.status);
  if (tips.length === 0) return null;

  return (
    <div style={{
      padding: '10px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Survival Tips
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {tips.map((tip, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            padding: '6px 8px', borderRadius: '6px',
            background: `color-mix(in srgb, ${tip.color} 6%, transparent)`
          }}>
            <span style={{ fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>{tip.icon}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {tip.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
