import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const WISDOM: { text: string; condition?: (state: Record<string, number>, tick: number) => boolean }[] = [
  { text: '"The measure of a community is how it treats its most vulnerable." — Unknown' },
  { text: '"No one has ever become poor by giving." — Anne Frank' },
  { text: '"We rise by lifting others." — Robert Ingersoll' },
  { text: '"Poverty is not an accident. It is man-made and can be removed by the actions of human beings." — Nelson Mandela' },
  { text: '"If you want to go fast, go alone. If you want to go far, go together." — African Proverb' },
  { text: '"The best way to find yourself is to lose yourself in the service of others." — Gandhi' },
  { text: '"When I give food to the poor, they call me a saint. When I ask why they are poor, they call me a communist." — Dom Helder Camara' },
  { text: '"An empty stomach is not a good political adviser." — Albert Einstein' },
  { text: '"Until you walk a mile in another man\'s moccasins, you can\'t imagine the smell." — Robert Byrne' },
  { text: '"Kolkata teaches you that kindness is the only currency that never loses value."' },
  { text: '"The streets know who you really are — not your title, but your choices."' },
  { text: '"In the city of joy, survival is a team sport."' },
  { text: 'Tip: Helping others near you gives a 1.5x effectiveness bonus!', condition: (s) => s.energy > 40 },
  { text: 'Tip: Night time drains stats faster. Plan your rest wisely.', condition: (_, t) => ((t % 600) / 600) > 0.55 },
  { text: 'Tip: Working when well-rested earns more. Take care of yourself first.', condition: (s) => s.energy < 30 },
  { text: 'Tip: High cooperation trait makes helping cheaper on energy.', condition: (s) => s.energy > 50 },
  { text: 'Tip: Building trust unlocks better opportunities in the community.' },
  { text: 'Tip: Each dilemma you face reveals something about your character\'s values.' },
];

export default function StreetWisdom() {
  const { room, myPlayer } = useGameStore();
  const [currentIdx, setCurrentIdx] = useState(() => Math.floor(Math.random() * WISDOM.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx(prev => {
          let next = (prev + 1) % WISDOM.length;
          const state = myPlayer?.state;
          const tick = room?.tick || 0;
          let attempts = 0;
          while (attempts < WISDOM.length) {
            const w = WISDOM[next];
            if (!w.condition || (state && w.condition(state as unknown as Record<string, number>, tick))) {
              break;
            }
            next = (next + 1) % WISDOM.length;
            attempts++;
          }
          return next;
        });
        setVisible(true);
      }, 500);
    }, 30000);
    return () => clearInterval(interval);
  }, [myPlayer?.state, room?.tick]);

  const wisdom = WISDOM[currentIdx];

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'linear-gradient(135deg, rgba(245,200,66,0.04), rgba(168,85,247,0.04))',
      border: '1px solid rgba(245,200,66,0.12)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        {wisdom.text.startsWith('Tip:') ? '💡 Street Tip' : '📜 Street Wisdom'}
      </div>
      <div style={{
        fontSize: '11px',
        color: wisdom.text.startsWith('Tip:') ? 'var(--accent-blue)' : 'var(--text-secondary)',
        lineHeight: 1.5,
        fontStyle: wisdom.text.startsWith('Tip:') ? 'normal' : 'italic'
      }}>
        {wisdom.text}
      </div>
    </div>
  );
}
