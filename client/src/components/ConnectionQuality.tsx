import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function ConnectionQuality() {
  const { connected, room } = useGameStore();
  const [ping, setPing] = useState<number | null>(null);
  const [quality, setQuality] = useState<'good' | 'fair' | 'poor'>('good');

  useEffect(() => {
    if (!room) return;
    let lastTick = room.tick;
    let lastTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTime;
      const ticks = room.tick - lastTick;

      if (ticks > 0 && elapsed > 0) {
        const estimatedPing = Math.max(0, elapsed / ticks - (1000 / (room.gameSpeed || 1)));
        setPing(Math.round(Math.abs(estimatedPing)));
      }

      lastTick = room.tick;
      lastTime = now;
    }, 5000);

    return () => clearInterval(interval);
  }, [room?.tick]);

  useEffect(() => {
    if (!connected) setQuality('poor');
    else if (ping !== null && ping > 200) setQuality('poor');
    else if (ping !== null && ping > 100) setQuality('fair');
    else setQuality('good');
  }, [connected, ping]);

  const colors = {
    good: 'var(--accent-green)',
    fair: 'var(--accent-yellow)',
    poor: 'var(--accent-red)'
  };

  const bars = quality === 'good' ? 3 : quality === 'fair' ? 2 : 1;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '2px 6px', borderRadius: '4px',
      background: 'rgba(0,0,0,0.2)'
    }} title={`Connection: ${quality}${ping !== null ? ` (~${ping}ms)` : ''}`}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height: '10px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            width: '3px',
            height: `${i * 3 + 1}px`,
            borderRadius: '1px',
            background: i <= bars ? colors[quality] : 'rgba(255,255,255,0.15)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>
      {!connected && (
        <span style={{ fontSize: '8px', color: colors.poor, fontWeight: 600 }}>!</span>
      )}
    </div>
  );
}
