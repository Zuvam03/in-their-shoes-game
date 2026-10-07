import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function CityNewsTicker() {
  const { room, myPlayer } = useGameStore();
  const [offset, setOffset] = useState(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    const step = () => {
      if (cancelled) return;
      setOffset(prev => (prev + 0.5) % 2000);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { cancelled = true; cancelAnimationFrame(animRef.current); };
  }, []);

  if (!room || !myPlayer) return null;

  const players = Object.values(room.players);
  const tick = room.tick;
  const dayNum = Math.floor(tick / 600) + 1;
  const totalHelps = players.reduce((s, p) => s + p.state.helpedOthersCount, 0);
  const avgTrust = Math.round(players.reduce((s, p) => s + p.socialTrust, 0) / players.length);
  const activeEvents = room.cityEvents.length;

  const headlines: string[] = [
    `Day ${dayNum} in Kolkata — ${players.length} citizens navigating the city`,
    totalHelps > 5 ? `${totalHelps} acts of mutual aid recorded across the city` : 'Community spirit is growing slowly',
    avgTrust >= 60 ? 'Trust levels high — community bonds strengthening' : avgTrust < 35 ? 'Trust deficit reported across neighborhoods' : 'Mixed feelings among residents',
    activeEvents > 0 ? `${activeEvents} city event${activeEvents > 1 ? 's' : ''} currently active` : 'Calm day across the city',
    myPlayer.state.helpedOthersCount >= 3 ? `${myPlayer.persona.name} recognized for community service` : `${myPlayer.persona.name} continues their journey`,
  ];

  const text = headlines.join('  ●  ');

  return (
    <div style={{
      overflow: 'hidden', padding: '4px 0',
      background: 'rgba(0,0,0,0.3)', borderRadius: '4px',
      position: 'relative' as const
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        paddingLeft: '6px', position: 'absolute' as const, left: 0, top: '4px'
      }}>
        <span style={{
          fontSize: '8px', fontWeight: 700, color: 'var(--accent-red)',
          background: 'rgba(239,68,68,0.15)', padding: '1px 4px',
          borderRadius: '2px', flexShrink: 0
        }}>
          LIVE
        </span>
      </div>
      <div style={{
        whiteSpace: 'nowrap', fontSize: '10px', color: 'var(--text-muted)',
        transform: `translateX(${-offset}px)`,
        paddingLeft: '50px'
      }}>
        {text}  ●  {text}
      </div>
    </div>
  );
}
