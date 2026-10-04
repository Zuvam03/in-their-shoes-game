import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLocationById, LOCATION_AMBIENCE, LOCATION_ICONS } from '../game/mapData';

export default function AmbientOverlay() {
  const { myPlayer, room } = useGameStore();
  const [message, setMessage] = useState<{ text: string; icon: string; locationName: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const prevLocationRef = useRef<string | null>(null);

  useEffect(() => {
    if (!myPlayer || !room) return;

    const currentLocation = myPlayer.state.location;
    if (prevLocationRef.current === null) {
      prevLocationRef.current = currentLocation;
      return;
    }

    if (currentLocation !== prevLocationRef.current) {
      prevLocationRef.current = currentLocation;

      const loc = getLocationById(currentLocation);
      const ambience = LOCATION_AMBIENCE[currentLocation];
      if (!loc || !ambience) return;

      const tick = room.tick;
      const dayPct = (tick % 600) / 600;
      const isNight = dayPct > 2 / 3;
      const isEvening = dayPct > 0.55 && dayPct <= 2 / 3;

      const activeEvents = room.cityEvents.filter(e =>
        e.startTick + e.duration > tick &&
        (e.affectedLocations.includes('all') || e.affectedLocations.includes(currentLocation))
      );
      const hasWeather = activeEvents.some(e => e.type === 'weather');
      const hasHeat = activeEvents.some(e => e.type === 'heat');
      const hasCrowd = activeEvents.some(e => e.type === 'crowd');

      let text: string;
      if (hasWeather) text = ambience.rain;
      else if (hasHeat) text = ambience.heat;
      else if (hasCrowd) text = ambience.crowd;
      else if (isNight) text = ambience.night;
      else if (isEvening) text = ambience.evening;
      else text = ambience.day;

      const icon = LOCATION_ICONS[loc.type] || '📍';

      setMessage({ text, icon, locationName: loc.name });
      setVisible(true);

      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [myPlayer?.state.location, room?.tick]);

  if (!visible || !message) return null;

  return (
    <div
      className="slide-up"
      style={{
        position: 'fixed',
        top: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 700,
        maxWidth: '400px',
        width: '90%',
        padding: '12px 16px',
        borderRadius: '12px',
        background: 'rgba(13,15,20,0.92)',
        border: '1px solid rgba(245,200,66,0.2)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        animation: 'fadeIn 0.4s ease',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none'
      }}
    >
      <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>
        {message.icon}
      </span>
      <div>
        <div style={{
          fontSize: '12px', fontWeight: 700,
          color: 'var(--accent-yellow)',
          marginBottom: '3px'
        }}>
          Arrived at {message.locationName}
        </div>
        <div style={{
          fontSize: '12px', color: 'var(--text-secondary)',
          lineHeight: 1.5, fontStyle: 'italic'
        }}>
          {message.text}
        </div>
      </div>
    </div>
  );
}
