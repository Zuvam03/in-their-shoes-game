import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface Challenge {
  id: string;
  title: string;
  icon: string;
  description: string;
  check: (state: { helpedOthersCount: number; cash: number; health: number; energy: number; mood: number }, trust: number) => boolean;
}

const CHALLENGES_POOL: Challenge[][] = [
  [
    { id: 'd1_help', title: 'Helping Hand', icon: '🤝', description: 'Help at least 1 person today',
      check: (s) => s.helpedOthersCount >= 1 },
    { id: 'd1_health', title: 'Stay Healthy', icon: '❤️', description: 'Keep health above 60',
      check: (s) => s.health >= 60 },
    { id: 'd1_earn', title: 'Earn Something', icon: '💰', description: 'Have at least ₹50',
      check: (s) => s.cash >= 50 },
  ],
  [
    { id: 'd2_help2', title: 'Double Down', icon: '🤝', description: 'Help 2 people today',
      check: (s) => s.helpedOthersCount >= 2 },
    { id: 'd2_mood', title: 'Stay Positive', icon: '😊', description: 'Keep mood above 50',
      check: (s) => s.mood >= 50 },
    { id: 'd2_trust', title: 'Build Trust', icon: '💚', description: 'Reach 55+ social trust',
      check: (_, t) => t >= 55 },
  ],
  [
    { id: 'd3_help3', title: 'Community Hero', icon: '🦸', description: 'Help 3 people today',
      check: (s) => s.helpedOthersCount >= 3 },
    { id: 'd3_energy', title: 'Energized', icon: '⚡', description: 'Keep energy above 50',
      check: (s) => s.energy >= 50 },
    { id: 'd3_save', title: 'Save Up', icon: '🏦', description: 'Have at least ₹100',
      check: (s) => s.cash >= 100 },
  ],
];

export default function DailyChallenge() {
  const { myPlayer, room } = useGameStore();
  const lastDay = useRef(-1);

  if (!myPlayer || !room) return null;

  const dayNum = Math.floor(room.tick / 600) + 1;
  const dayIndex = (dayNum - 1) % CHALLENGES_POOL.length;
  const challenges = CHALLENGES_POOL[dayIndex];

  const results = challenges.map(c => ({
    ...c,
    completed: c.check(myPlayer.state, myPlayer.socialTrust),
  }));

  const completedCount = results.filter(r => r.completed).length;

  if (lastDay.current !== dayNum) {
    lastDay.current = dayNum;
  }

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: completedCount === results.length
        ? 'rgba(34,197,94,0.06)' : 'var(--bg-secondary)',
      border: `1px solid ${completedCount === results.length
        ? 'rgba(34,197,94,0.15)' : 'var(--border)'}`
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Daily Challenges — Day {dayNum}
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 700,
          color: completedCount === results.length ? 'var(--accent-green)' : 'var(--accent-yellow)'
        }}>
          {completedCount}/{results.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {results.map(c => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 8px', borderRadius: '6px',
            background: c.completed ? 'rgba(34,197,94,0.06)' : 'rgba(0,0,0,0.1)'
          }}>
            <span style={{
              fontSize: '14px',
              filter: c.completed ? 'none' : 'grayscale(0.5)',
              opacity: c.completed ? 1 : 0.7
            }}>
              {c.completed ? '✅' : c.icon}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                color: c.completed ? 'var(--accent-green)' : 'var(--text-primary)',
                textDecoration: c.completed ? 'line-through' : 'none'
              }}>
                {c.title}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                {c.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
