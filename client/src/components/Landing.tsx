import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import GameHistory from './GameHistory';

// SVG city skyline silhouette data
const SKYLINE_PATH = 'M0,120 L0,90 L15,90 L15,70 L25,70 L25,45 L30,45 L30,70 L40,70 L40,55 L50,55 L50,30 L55,25 L60,30 L60,55 L65,55 L65,40 L80,40 L80,20 L85,15 L90,20 L90,55 L100,55 L100,75 L110,75 L110,50 L115,50 L115,35 L125,35 L125,50 L130,50 L130,65 L145,65 L145,38 L150,33 L155,38 L155,55 L160,55 L160,45 L175,45 L175,25 L180,20 L185,25 L185,60 L195,60 L195,80 L205,80 L205,55 L210,55 L210,42 L220,42 L220,60 L230,60 L230,75 L240,75 L240,50 L248,50 L248,32 L252,28 L256,32 L256,65 L265,65 L265,48 L275,48 L275,70 L285,70 L285,55 L295,55 L295,38 L300,35 L305,38 L305,60 L315,60 L315,75 L325,75 L325,85 L340,85 L340,60 L345,60 L345,40 L355,40 L355,22 L360,18 L365,22 L365,55 L375,55 L375,70 L385,70 L385,48 L395,48 L395,65 L400,65 L400,120 Z';

// Floating city light particles
function CityLights() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(i * 31 + 7) % 96 + 2}%`,
          top: `${(i * 23 + 13) % 80 + 10}%`,
          width: `${1.5 + (i % 3)}px`,
          height: `${1.5 + (i % 3)}px`,
          borderRadius: '50%',
          background: i % 5 === 0
            ? 'rgba(245,200,66,0.4)'
            : i % 3 === 0
              ? 'rgba(249,115,22,0.3)'
              : 'rgba(255,255,255,0.15)',
          boxShadow: i % 5 === 0
            ? '0 0 6px rgba(245,200,66,0.3)'
            : i % 3 === 0
              ? '0 0 4px rgba(249,115,22,0.2)'
              : '0 0 3px rgba(255,255,255,0.1)',
          animation: `cityFloat ${6 + (i % 5) * 2}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
        }} />
      ))}
    </div>
  );
}

// Animated title with staggered letter reveal
function AnimatedTitle() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 300); }, []);

  const words = ['In', 'Their', 'Shoes'];
  let charIndex = 0;

  return (
    <h1 style={{
      fontSize: 'clamp(32px, 8vw, 44px)', fontWeight: 800,
      margin: 0, lineHeight: 1.1,
      display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap',
    }}>
      {words.map((word, wi) => (
        <span key={wi} style={{ display: 'inline-flex' }}>
          {word.split('').map((char, ci) => {
            const idx = charIndex++;
            return (
              <span key={ci} style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #f5c842, #f97316, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 60 + 200}ms`,
              }}>
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

export default function Landing() {
  const { connected, createRoom, joinRoom } = useGameStore();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [duration, setDuration] = useState(600);
  const [showHowTo, setShowHowTo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    createRoom(name.trim(), duration);
  };

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) return;
    joinRoom(roomCode.trim(), name.trim());
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0c12',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Deep atmospheric gradient layers */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(245,200,66,0.04) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 20% 80%, rgba(249,115,22,0.03) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 70%, rgba(59,130,246,0.03) 0%, transparent 50%),
          radial-gradient(circle at 50% 100%, rgba(168,85,247,0.02) 0%, transparent 40%)
        `,
      }} />

      {/* Subtle moving fog layers */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(245,200,66,0.02) 50%, rgba(249,115,22,0.03) 100%)',
        pointerEvents: 'none',
        animation: 'fogDrift 20s ease-in-out infinite',
      }} />

      <CityLights />

      {/* City skyline silhouette */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '120px', pointerEvents: 'none',
        opacity: mounted ? 0.15 : 0,
        transition: 'opacity 2s ease 0.5s',
      }}>
        <svg viewBox="0 0 400 120" preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}>
          <path d={SKYLINE_PATH} fill="rgba(245,200,66,0.15)" />
          <path d={SKYLINE_PATH} fill="none" stroke="rgba(245,200,66,0.08)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Secondary skyline layer (parallax effect) */}
      <div style={{
        position: 'absolute', bottom: '-10px', left: '-5%', right: '-5%',
        height: '100px', pointerEvents: 'none',
        opacity: mounted ? 0.08 : 0,
        transition: 'opacity 2s ease 1s',
        transform: 'scaleX(1.1)',
      }}>
        <svg viewBox="0 0 400 120" preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}>
          <path d={SKYLINE_PATH} fill="rgba(255,255,255,0.1)" />
        </svg>
      </div>

      {/* Content */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '24px',
        maxWidth: '520px', width: '90%',
        zIndex: 2, overflowY: 'auto', maxHeight: '100%',
        padding: '20px 0',
      }}>
        {/* Title block */}
        <div style={{
          textAlign: 'center',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}>
          <div style={{
            fontSize: '48px', marginBottom: '12px',
            filter: 'drop-shadow(0 0 20px rgba(245,200,66,0.3))',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'scale(1)' : 'scale(0.5)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
          }}>
            🏙️
          </div>

          <AnimatedTitle />

          <div style={{
            fontSize: '11px', fontWeight: 700, color: 'rgba(245,200,66,0.7)',
            letterSpacing: '0.35em', textTransform: 'uppercase', marginTop: '12px',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease 1s',
          }}>
            Kolkata City Survival
          </div>

          <p style={{
            color: 'var(--text-secondary)', fontSize: '14px',
            maxWidth: '380px', textAlign: 'center', lineHeight: 1.7,
            margin: '12px auto 0',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease 1.2s',
          }}>
            Navigate the city through someone else's eyes. Every character experiences the same world differently.
          </p>
        </div>

        {/* Connection indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '12px',
          color: connected ? 'var(--accent-green)' : 'var(--text-muted)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.5s ease 1.4s',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: connected ? 'var(--accent-green)' : 'var(--text-muted)',
            boxShadow: connected ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
            ...(connected ? {} : { animation: 'pulse 2s infinite' }),
          }} />
          {connected ? 'Connected to server' : 'Connecting...'}
        </div>

        {mode === 'menu' && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '12px', width: '100%',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 1.5s',
          }}>
            <button
              onClick={() => setMode('create')}
              disabled={!connected}
              style={{
                padding: '16px 24px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #f5c842, #f97316)',
                color: '#000', fontWeight: 700, fontSize: '15px',
                opacity: connected ? 1 : 0.5,
                boxShadow: connected ? '0 4px 24px rgba(245,200,66,0.25), 0 0 0 1px rgba(245,200,66,0.1)' : 'none',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>Create New Room</span>
            </button>
            <button
              onClick={() => setMode('join')}
              disabled={!connected}
              style={{
                padding: '16px 24px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px',
                opacity: connected ? 1 : 0.5,
                backdropFilter: 'blur(8px)',
              }}
            >
              Join Existing Room
            </button>

            {/* Feature cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
              width: '100%',
            }}>
              {[
                { icon: '🎭', title: 'Unique Personas', desc: 'Play as someone with different privileges and challenges', color: 'rgba(168,85,247,0.12)' },
                { icon: '🗺️', title: 'Explore Kolkata', desc: 'Navigate real neighborhoods with distinct resources', color: 'rgba(59,130,246,0.12)' },
                { icon: '⚖️', title: 'Moral Dilemmas', desc: 'Face tough choices where there is no easy answer', color: 'rgba(239,68,68,0.10)' },
                { icon: '🤝', title: 'Cooperate', desc: 'Help others for trust bonuses or focus on survival', color: 'rgba(34,197,94,0.10)' },
              ].map((f, i) => (
                <div key={i} style={{
                  padding: '14px', borderRadius: '12px',
                  background: f.color,
                  border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{f.title}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              ))}
            </div>

            <GameHistory />

            {/* How to play */}
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              style={{
                padding: '10px', borderRadius: '8px',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--accent-blue)', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', width: '100%',
              }}
            >
              {showHowTo ? 'Hide Guide' : 'How to Play'}
            </button>

            {showHowTo && (
              <div style={{
                padding: '16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                animation: 'fadeIn 0.3s ease',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-yellow)' }}>
                  How to Play
                </div>
                {[
                  { step: '1', title: 'Create or join a room', desc: 'One player creates; others join with the room code.' },
                  { step: '2', title: 'Receive your persona', desc: 'You get a random character with unique traits and vulnerabilities.' },
                  { step: '3', title: 'Complete your mission', desc: 'Each persona gets a personal mission with objectives.' },
                  { step: '4', title: 'Manage survival stats', desc: 'Balance health, hunger, energy, and money.' },
                  { step: '5', title: 'Face moral dilemmas', desc: 'Choices affect trust and community standing.' },
                  { step: '6', title: 'Cooperate with others', desc: 'Help, trade, and chat with other players.' },
                ].map(s => (
                  <div key={s.step} style={{
                    display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(245,200,66,0.15)', color: 'var(--accent-yellow)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700,
                    }}>
                      {s.step}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{s.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }} className="fade-in">
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Your Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                autoFocus
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Match Duration
              </label>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px',
                }}
              >
                <option value={300}>5 minutes (Quick)</option>
                <option value={600}>10 minutes (Standard)</option>
                <option value={1200}>20 minutes (Extended)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setMode('menu')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-secondary)', fontSize: '14px',
                }}
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                style={{
                  flex: 2, padding: '12px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f5c842, #f97316)',
                  color: '#000', fontWeight: 700, fontSize: '14px',
                  opacity: name.trim() ? 1 : 0.5,
                  boxShadow: name.trim() ? '0 4px 20px rgba(245,200,66,0.2)' : 'none',
                }}
              >
                Create Room
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }} className="fade-in">
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Your Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                autoFocus
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Room Code
              </label>
              <input
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={8}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px',
                  letterSpacing: '3px', fontWeight: 700, textAlign: 'center',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setMode('menu')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-secondary)', fontSize: '14px',
                }}
              >
                Back
              </button>
              <button
                onClick={handleJoin}
                disabled={!name.trim() || !roomCode.trim()}
                style={{
                  flex: 2, padding: '12px', borderRadius: '10px',
                  background: 'var(--accent-blue)',
                  color: '#fff', fontWeight: 700, fontSize: '14px',
                  opacity: (name.trim() && roomCode.trim()) ? 1 : 0.5,
                }}
              >
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cityFloat {
          0%, 100% { transform: translateY(0); opacity: 0.2; }
          50% { transform: translateY(-12px); opacity: 0.6; }
        }
        @keyframes fogDrift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(15px); }
        }
      `}</style>
    </div>
  );
}
