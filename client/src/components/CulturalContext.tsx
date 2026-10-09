import { useGameStore } from '../store/gameStore';

const FACTS = [
  { text: 'Kolkata\'s hand-pulled rickshaws are among the last in the world — pullers earn ₹200-400 per day.', icon: '🛺' },
  { text: 'Over 100,000 people in Kolkata live on the streets. Many have jobs but cannot afford rent.', icon: '🏙️' },
  { text: 'The Howrah Bridge carries 100,000 vehicles and countless pedestrians daily — it\'s a lifeline.', icon: '🌉' },
  { text: 'Street food in Kolkata can cost as little as ₹10 — but even that is out of reach for many.', icon: '🍛' },
  { text: 'Kolkata has over 4,000 NGOs working on poverty, education, and health — more than any Indian city.', icon: '🏥' },
  { text: 'The city\'s informal economy employs over 80% of its workforce — no contracts, no safety net.', icon: '💼' },
  { text: 'During monsoon, parts of Kolkata flood regularly. The poorest neighborhoods are hit hardest.', icon: '🌧️' },
  { text: 'Kolkata\'s tea stalls are community centers — where news, gossip, and mutual aid happen daily.', icon: '☕' },
  { text: 'The concept of "para" (neighborhood) is central to Kolkata\'s culture — communities self-organize.', icon: '🏘️' },
  { text: 'Mother Teresa\'s Missionaries of Charity started in Kolkata, serving the city\'s most vulnerable.', icon: '🙏' },
  { text: 'Kolkata\'s book fair is Asia\'s largest. Education is deeply valued even in the poorest communities.', icon: '📚' },
  { text: 'The city was once the capital of British India. Its colonial wealth created deep inequalities.', icon: '🏛️' },
];

export default function CulturalContext() {
  const { room } = useGameStore();
  if (!room) return null;

  const tick = room.tick;
  const factIndex = Math.floor(tick / 180) % FACTS.length;
  const fact = FACTS[factIndex];

  return (
    <div style={{
      padding: '8px 12px', borderRadius: '8px',
      background: 'rgba(245,200,66,0.04)',
      border: '1px solid rgba(245,200,66,0.10)',
      display: 'flex', alignItems: 'flex-start', gap: '8px'
    }}>
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{fact.icon}</span>
      <div>
        <div style={{
          fontSize: '9px', fontWeight: 600, color: 'var(--accent-yellow)',
          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px'
        }}>
          Did You Know?
        </div>
        <div style={{
          fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5
        }}>
          {fact.text}
        </div>
      </div>
    </div>
  );
}
