import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLocationById, LOCATION_ICONS } from '../game/mapData';

export default function ArrivalToast() {
  const myPlayer = useGameStore(s => s.myPlayer);
  const snapshot = useGameStore(s => s.currentLocationSnapshot);
  const [arrival, setArrival] = useState<{
    locationName: string; icon: string; district: string;
    atmosphere: string; vendors: number;
  } | null>(null);
  const [visible, setVisible] = useState(false);
  const prevLocation = useRef<string | null>(null);

  useEffect(() => {
    if (!myPlayer) return;
    const loc = myPlayer.state.location;

    if (prevLocation.current !== null && prevLocation.current !== loc) {
      const locData = getLocationById(loc);
      if (locData) {
        const icon = LOCATION_ICONS[locData.type] || '📍';
        const atmo = snapshot?.atmosphere;
        let atmosphereText = '';
        if (atmo) {
          if (atmo.visualDetail) atmosphereText = atmo.visualDetail;
          else if (atmo.mood) atmosphereText = atmo.mood;
        }

        setArrival({
          locationName: locData.name,
          icon,
          district: locData.district,
          atmosphere: atmosphereText,
          vendors: snapshot?.vendors?.length || 0,
        });
        setVisible(true);

        const timer = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(timer);
      }
    }
    prevLocation.current = loc;
  }, [myPlayer?.state.location, snapshot]);

  if (!visible || !arrival) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '60px', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 700,
      maxWidth: '340px', width: '90%',
      borderRadius: '12px',
      background: 'rgba(15,15,25,0.92)',
      border: '1px solid rgba(245,200,66,0.25)',
      backdropFilter: 'blur(12px)',
      overflow: 'hidden',
      animation: 'arrivalSlide 0.4s ease-out',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
      pointerEvents: 'none',
    }}>
      <div style={{
        height: '2px', width: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(245,200,66,0.6), transparent)',
      }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '24px' }}>{arrival.icon}</span>
          <div>
            <div style={{
              fontSize: '14px', fontWeight: 700, color: '#f5c842',
              letterSpacing: '0.3px',
            }}>
              {arrival.locationName}
            </div>
            <div style={{
              fontSize: '10px', color: 'rgba(255,255,255,0.5)',
              marginTop: '1px',
            }}>
              {arrival.district}
              {arrival.vendors > 0 && ` · ${arrival.vendors} vendor${arrival.vendors > 1 ? 's' : ''} here`}
            </div>
          </div>
        </div>
        {arrival.atmosphere && (
          <div style={{
            marginTop: '8px', fontSize: '11px',
            color: 'rgba(255,255,255,0.6)',
            fontStyle: 'italic', lineHeight: 1.4,
          }}>
            {arrival.atmosphere}
          </div>
        )}
      </div>

      <style>{`
        @keyframes arrivalSlide {
          from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
