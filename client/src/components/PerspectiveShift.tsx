import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const PERSPECTIVES = [
  {
    id: 'rickshaw',
    title: 'Through a Rickshaw Puller\'s Eyes',
    icon: '🛺',
    getInsight: (cash: number, energy: number) => {
      if (cash < 30) return 'They would understand your struggle — every rupee matters when you pull all day for ₹200.';
      if (energy < 30) return 'They know this bone-deep tiredness. They pedal 12 hours to feel it.';
      return 'To them, your situation might seem manageable. They dream of having steady income.';
    }
  },
  {
    id: 'child',
    title: 'Through a Street Child\'s Eyes',
    icon: '👧',
    getInsight: (cash: number, _energy: number, helped: number) => {
      if (helped >= 3) return 'A child would see you as one of the kind ones — someone who might share food or a smile.';
      if (cash > 100) return 'To a child sleeping under a bridge, you seem incredibly wealthy.';
      return 'They would see someone who has choices. That alone is a luxury they don\'t have.';
    }
  },
  {
    id: 'doctor',
    title: 'Through a Community Doctor\'s Eyes',
    icon: '👩‍⚕️',
    getInsight: (_cash: number, _energy: number, _helped: number, health: number, stress: number) => {
      if (health < 40 || stress > 70) return 'They see patients like you every day — pushed to the edge by circumstance, not choice.';
      if (health > 70 && stress < 30) return 'They would say you\'re one of the lucky ones. Most in Kolkata aren\'t this healthy.';
      return 'They would note the toll poverty takes on bodies and minds — even when people seem "fine."';
    }
  },
  {
    id: 'elder',
    title: 'Through an Elder\'s Eyes',
    icon: '👴',
    getInsight: (_cash: number, _energy: number, helped: number, _health: number, _stress: number, trust: number) => {
      if (trust >= 60 && helped >= 2) return 'An elder would nod approvingly — community bonds are what kept Kolkata alive through every crisis.';
      if (trust < 30) return 'They would worry for you. In their time, no one survived alone. Trust is everything.';
      return 'They would remind you: the city has survived floods, famines, and partitions — through mutual aid.';
    }
  },
];

export default function PerspectiveShift() {
  const { myPlayer } = useGameStore();
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!myPlayer) return null;

  const state = myPlayer.state;
  const perspective = PERSPECTIVES[currentIdx];
  const insight = perspective.getInsight(
    state.cash, state.energy, state.helpedOthersCount,
    state.health, state.stress, myPlayer.socialTrust
  );

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'rgba(139,92,246,0.04)',
      border: '1px solid rgba(139,92,246,0.15)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Perspective Shift
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {PERSPECTIVES.map((_, i) => (
            <button key={i} onClick={() => setCurrentIdx(i)} style={{
              width: '18px', height: '18px', borderRadius: '50%',
              border: i === currentIdx ? '2px solid var(--accent-purple)' : '1px solid var(--border)',
              background: i === currentIdx ? 'rgba(139,92,246,0.15)' : 'transparent',
              cursor: 'pointer', fontSize: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {PERSPECTIVES[i].icon}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '8px'
      }}>
        <span style={{ fontSize: '20px', flexShrink: 0 }}>{perspective.icon}</span>
        <div>
          <div style={{
            fontSize: '11px', fontWeight: 600, color: 'var(--accent-purple)',
            marginBottom: '4px'
          }}>
            {perspective.title}
          </div>
          <div style={{
            fontSize: '10px', color: 'var(--text-secondary)',
            lineHeight: 1.5, fontStyle: 'italic'
          }}>
            {insight}
          </div>
        </div>
      </div>
    </div>
  );
}
