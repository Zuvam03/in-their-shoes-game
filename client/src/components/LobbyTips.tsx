import { useState, useEffect } from 'react';

const TIPS = [
  { icon: '🎭', tip: 'Each persona has unique strengths and vulnerabilities that change how you experience the city.' },
  { icon: '💰', tip: 'Money management is key — some characters start with less and must be more resourceful.' },
  { icon: '🤝', tip: 'Helping other players builds trust, which unlocks cooperation bonuses.' },
  { icon: '⚖️', tip: 'Moral dilemmas have no right answer — your choices reflect your persona\'s values.' },
  { icon: '🍛', tip: 'Different food options cost different amounts. Street food is cheap but watch your health.' },
  { icon: '🚃', tip: 'Transport costs money. Walking is free but takes longer and drains energy.' },
  { icon: '📍', tip: 'Each location has unique actions. Explore to find the best resources for your mission.' },
  { icon: '⏰', tip: 'Time matters — prioritize your mission objectives before the match ends.' },
  { icon: '😴', tip: 'Keep your energy up by resting. Low energy reduces your effectiveness.' },
  { icon: '🌧️', tip: 'City events can help or hinder you. Adapt your strategy when conditions change.' },
];

export default function LobbyTips() {
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx(i => (i + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tip = TIPS[tipIdx];

  return (
    <div style={{
      padding: '14px 16px', borderRadius: '10px',
      background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)',
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      transition: 'opacity 0.3s'
    }}>
      <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>
        {tip.icon}
      </span>
      <div>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: '#a78bfa',
          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px'
        }}>
          Tip {tipIdx + 1}/{TIPS.length}
        </div>
        <div style={{
          fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5
        }}>
          {tip.tip}
        </div>
      </div>
    </div>
  );
}
