import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const EVENT_THEMES: Record<string, {
  icon: string;
  gradient: string;
  particleColor: string;
  urgencyColor: string;
  subtitle: string;
}> = {
  weather: {
    icon: '🌧️',
    gradient: 'linear-gradient(135deg, rgba(30,64,175,0.95) 0%, rgba(15,23,42,0.98) 100%)',
    particleColor: 'rgba(147,197,253,0.5)',
    urgencyColor: '#60a5fa',
    subtitle: 'WEATHER ALERT',
  },
  heat: {
    icon: '🔥',
    gradient: 'linear-gradient(135deg, rgba(180,83,9,0.95) 0%, rgba(15,23,42,0.98) 100%)',
    particleColor: 'rgba(251,191,36,0.4)',
    urgencyColor: '#f59e0b',
    subtitle: 'HEAT ADVISORY',
  },
  transport_disruption: {
    icon: '🚧',
    gradient: 'linear-gradient(135deg, rgba(146,64,14,0.9) 0%, rgba(15,23,42,0.98) 100%)',
    particleColor: 'rgba(251,146,60,0.4)',
    urgencyColor: '#fb923c',
    subtitle: 'TRANSPORT DISRUPTION',
  },
  crowd: {
    icon: '👥',
    gradient: 'linear-gradient(135deg, rgba(88,28,135,0.9) 0%, rgba(15,23,42,0.98) 100%)',
    particleColor: 'rgba(192,132,252,0.4)',
    urgencyColor: '#a78bfa',
    subtitle: 'CROWD SURGE',
  },
  emergency: {
    icon: '🚨',
    gradient: 'linear-gradient(135deg, rgba(153,27,27,0.95) 0%, rgba(15,23,42,0.98) 100%)',
    particleColor: 'rgba(248,113,113,0.5)',
    urgencyColor: '#ef4444',
    subtitle: 'EMERGENCY',
  },
  opportunity: {
    icon: '💼',
    gradient: 'linear-gradient(135deg, rgba(21,128,61,0.9) 0%, rgba(15,23,42,0.98) 100%)',
    particleColor: 'rgba(74,222,128,0.4)',
    urgencyColor: '#22c55e',
    subtitle: 'OPPORTUNITY',
  },
  resource_shortage: {
    icon: '🚰',
    gradient: 'linear-gradient(135deg, rgba(120,53,15,0.9) 0%, rgba(15,23,42,0.98) 100%)',
    particleColor: 'rgba(217,119,6,0.4)',
    urgencyColor: '#d97706',
    subtitle: 'RESOURCE SHORTAGE',
  },
};

const DEFAULT_THEME = {
  icon: '🌆',
  gradient: 'linear-gradient(135deg, rgba(51,65,85,0.95) 0%, rgba(15,23,42,0.98) 100%)',
  particleColor: 'rgba(148,163,184,0.4)',
  urgencyColor: '#94a3b8',
  subtitle: 'CITY EVENT',
};

export default function CityEventCinematic() {
  const { room } = useGameStore();
  const [activeEvent, setActiveEvent] = useState<{ id: string; title: string; description: string; type: string } | null>(null);
  const [phase, setPhase] = useState<'hidden' | 'enter' | 'show' | 'exit'>('hidden');
  const seenEventIds = useRef(new Set<string>());
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!room) return;
    const events = room.cityEvents;
    for (const evt of events) {
      if (!seenEventIds.current.has(evt.id)) {
        seenEventIds.current.add(evt.id);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveEvent({ id: evt.id, title: evt.title, description: evt.description, type: evt.type });
        setPhase('enter');
        setTimeout(() => setPhase('show'), 100);
        timeoutRef.current = setTimeout(() => {
          setPhase('exit');
          setTimeout(() => { setPhase('hidden'); setActiveEvent(null); }, 600);
        }, 4000);
        break;
      }
    }
  }, [room?.cityEvents]);

  if (phase === 'hidden' || !activeEvent) return null;

  const theme = EVENT_THEMES[activeEvent.type] || DEFAULT_THEME;
  const isVisible = phase === 'show';
  const isExiting = phase === 'exit';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 150,
      pointerEvents: 'none',
      display: 'flex', justifyContent: 'center',
      padding: '60px 20px 0',
    }}>
      <div style={{
        maxWidth: '600px', width: '100%',
        background: theme.gradient,
        borderRadius: '16px',
        border: `1px solid ${theme.urgencyColor}33`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${theme.urgencyColor}15`,
        padding: '24px 28px',
        overflow: 'hidden',
        position: 'relative',
        transform: isExiting ? 'translateY(-20px)' : isVisible ? 'translateY(0)' : 'translateY(-40px)',
        opacity: isExiting ? 0 : isVisible ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      }}>
        {/* Animated particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${3 + i}px`, height: `${3 + i}px`,
            borderRadius: '50%',
            background: theme.particleColor,
            left: `${10 + i * 16}%`,
            top: `${20 + (i * 15) % 60}%`,
            animation: `dilemmaFloat ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Scanning line effect */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${theme.urgencyColor}66, transparent)`,
          animation: 'scanLine 2s ease-in-out infinite',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Subtitle */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: theme.urgencyColor,
              boxShadow: `0 0 8px ${theme.urgencyColor}`,
              animation: 'pulse 1.5s infinite',
            }} />
            <span style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: theme.urgencyColor,
            }}>
              {theme.subtitle}
            </span>
          </div>

          {/* Title */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '28px' }}>{theme.icon}</span>
            <h3 style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 800,
              color: '#f1f5f9',
              margin: 0,
              lineHeight: 1.2,
            }}>
              {activeEvent.title}
            </h3>
          </div>

          {/* Description */}
          <p style={{
            fontSize: '13px', color: '#94a3b8',
            lineHeight: 1.6, margin: 0,
            maxWidth: '90%',
          }}>
            {activeEvent.description}
          </p>
        </div>

        {/* Progress bar (auto-dismiss timer) */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '2px', background: 'rgba(255,255,255,0.05)',
        }}>
          <div style={{
            height: '100%',
            background: theme.urgencyColor,
            animation: isVisible ? 'cinematicTimer 4s linear forwards' : 'none',
            transformOrigin: 'left',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }
        @keyframes cinematicTimer {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
