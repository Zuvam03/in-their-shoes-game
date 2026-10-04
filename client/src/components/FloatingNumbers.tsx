import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface FloatingNumber {
  id: number;
  text: string;
  color: string;
  x: number;
}

let nextId = 0;

export default function FloatingNumbers() {
  const { myPlayer, prevStats } = useGameStore();
  const [numbers, setNumbers] = useState<FloatingNumber[]>([]);
  const prevRef = useRef(prevStats);

  useEffect(() => {
    if (!myPlayer || !prevStats || prevRef.current === prevStats) return;
    prevRef.current = prevStats;

    const newNumbers: FloatingNumber[] = [];

    const diffs: { stat: string; label: string; value: number; color: string; x: number }[] = [
      { stat: 'health', label: 'HP', value: myPlayer.state.health - prevStats.health, color: '', x: 0 },
      { stat: 'energy', label: 'EN', value: myPlayer.state.energy - prevStats.energy, color: '', x: 1 },
      { stat: 'mood', label: 'Mood', value: myPlayer.state.mood - prevStats.mood, color: '', x: 2 },
      { stat: 'hunger', label: 'Hunger', value: myPlayer.state.hunger - prevStats.hunger, color: '', x: 3 },
      { stat: 'hydration', label: 'Thirst', value: myPlayer.state.hydration - prevStats.hydration, color: '', x: 4 },
      { stat: 'stress', label: 'Stress', value: myPlayer.state.stress - prevStats.stress, color: '', x: 5 },
      { stat: 'cash', label: '₹', value: myPlayer.state.cash - prevStats.cash, color: '', x: 6 },
    ];

    for (const d of diffs) {
      if (Math.abs(d.value) < 1.5) continue;
      const val = Math.round(d.value);

      const isGood = d.stat === 'hunger' || d.stat === 'hydration' || d.stat === 'stress'
        ? val < 0
        : val > 0;

      const color = isGood ? '#4ade80' : '#f87171';
      const sign = val > 0 ? '+' : '';
      const text = d.stat === 'cash'
        ? `${sign}₹${val}`
        : `${sign}${val} ${d.label}`;

      newNumbers.push({
        id: nextId++,
        text,
        color,
        x: d.x
      });
    }

    if (newNumbers.length > 0) {
      setNumbers(prev => [...prev, ...newNumbers]);
      setTimeout(() => {
        setNumbers(prev => prev.filter(n => !newNumbers.some(nn => nn.id === n.id)));
      }, 2000);
    }
  }, [prevStats]);

  if (numbers.length === 0) return null;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      pointerEvents: 'none', zIndex: 100, overflow: 'hidden',
      height: '60px'
    }}>
      {numbers.map(n => (
        <div
          key={n.id}
          style={{
            position: 'absolute',
            left: `${10 + n.x * 13}%`,
            top: '40px',
            fontSize: '13px',
            fontWeight: 700,
            color: n.color,
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            animation: 'floatUp 2s ease-out forwards',
            whiteSpace: 'nowrap'
          }}
        >
          {n.text}
        </div>
      ))}
    </div>
  );
}
