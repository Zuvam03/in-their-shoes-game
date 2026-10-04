import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const FLOATING_ICONS = ['🏙️', '🚕', '🍛', '⚖️', '🤝', '🎭', '🌧️', '💰', '🏥', '📚'];

export default function Landing() {
  const { connected, createRoom, joinRoom } = useGameStore();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [duration, setDuration] = useState(600);
  const [showHowTo, setShowHowTo] = useState(false);

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
      background: 'linear-gradient(135deg, #0d0f14 0%, #13161e 50%, #0d0f14 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(245, 200, 66, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.02) 0%, transparent 40%)`
        }} />
        {FLOATING_ICONS.map((icon, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 11 + 5) % 90}%`,
            top: `${(i * 13 + 8) % 85}%`,
            fontSize: '20px', opacity: 0.06,
            animation: `floatIcon ${8 + (i % 4) * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`
          }}>
            {icon}
          </div>
        ))}
        <style>{`
          @keyframes floatIcon {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
          }
        `}</style>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '28px',
        maxWidth: '520px', width: '90%',
        zIndex: 1, overflowY: 'auto', maxHeight: '100%',
        padding: '20px 0'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '42px', marginBottom: '8px' }}>🏙️</div>
          <h1 style={{
            fontSize: '34px', fontWeight: 800,
            background: 'linear-gradient(135deg, #f5c842, #f97316, #ef4444)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '8px', letterSpacing: '-0.5px'
          }}>
            In Their Shoes
          </h1>
          <div style={{
            fontSize: '14px', fontWeight: 600, color: 'var(--accent-yellow)',
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px'
          }}>
            Kolkata City Survival
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '380px', textAlign: 'center', lineHeight: 1.6 }}>
            Navigate the city through someone else's eyes. Every character experiences the same world differently.
          </p>
        </div>

        {/* Connection indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', color: connected ? 'var(--accent-green)' : 'var(--text-muted)'
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: connected ? 'var(--accent-green)' : 'var(--text-muted)',
            ...(connected ? {} : { animation: 'pulse 2s infinite' })
          }} />
          {connected ? 'Connected to server' : 'Connecting...'}
        </div>

        {mode === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }} className="fade-in">
            <button
              onClick={() => setMode('create')}
              disabled={!connected}
              style={{
                padding: '14px 24px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #f5c842, #f97316)',
                color: '#000', fontWeight: 700, fontSize: '15px',
                opacity: connected ? 1 : 0.5,
                boxShadow: connected ? '0 4px 20px rgba(245,200,66,0.2)' : 'none'
              }}
            >
              Create New Room
            </button>
            <button
              onClick={() => setMode('join')}
              disabled={!connected}
              style={{
                padding: '14px 24px', borderRadius: '10px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px',
                opacity: connected ? 1 : 0.5
              }}
            >
              Join Existing Room
            </button>

            {/* Feature cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
              width: '100%'
            }}>
              {[
                { icon: '🎭', title: 'Unique Personas', desc: 'Play as someone with different privileges, challenges, and motivations' },
                { icon: '🗺️', title: 'Explore Kolkata', desc: 'Navigate real neighborhoods with distinct resources and dangers' },
                { icon: '⚖️', title: 'Moral Dilemmas', desc: 'Face tough choices where there is no easy answer' },
                { icon: '🤝', title: 'Cooperate or Compete', desc: 'Help others for trust bonuses or focus on your own survival' },
              ].map((f, i) => (
                <div key={i} style={{
                  padding: '12px', borderRadius: '10px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>{f.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{f.title}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              ))}
            </div>

            {/* How to play */}
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              style={{
                padding: '10px', borderRadius: '8px',
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--accent-blue)', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', width: '100%'
              }}
            >
              {showHowTo ? 'Hide Guide' : 'How to Play'}
            </button>

            {showHowTo && (
              <div style={{
                padding: '16px', borderRadius: '10px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                animation: 'fadeIn 0.3s ease'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-yellow)' }}>
                  How to Play
                </div>
                {[
                  { step: '1', title: 'Create or join a room', desc: 'One player creates; others join with the room code.' },
                  { step: '2', title: 'Receive your persona', desc: 'You get a random character with unique traits, strengths, and vulnerabilities.' },
                  { step: '3', title: 'Complete your mission', desc: 'Each persona gets a personal mission with required and optional objectives.' },
                  { step: '4', title: 'Manage survival stats', desc: 'Balance health, hunger, energy, and money by eating, resting, and working.' },
                  { step: '5', title: 'Face moral dilemmas', desc: 'Random social dilemmas test your values. Choices affect trust and community standing.' },
                  { step: '6', title: 'Cooperate with others', desc: 'Help, trade, and chat with other players. Cooperation builds trust and unlocks bonuses.' },
                ].map(s => (
                  <div key={s.step} style={{
                    display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(245,200,66,0.15)', color: 'var(--accent-yellow)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700
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
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px'
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
                  width: '100%', padding: '10px 14px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px'
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
                  flex: 1, padding: '12px', borderRadius: '8px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: '14px'
                }}
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                style={{
                  flex: 2, padding: '12px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f5c842, #f97316)',
                  color: '#000', fontWeight: 700, fontSize: '14px',
                  opacity: name.trim() ? 1 : 0.5
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
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px'
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
                  width: '100%', padding: '10px 14px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px',
                  letterSpacing: '2px', fontWeight: 600
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setMode('menu')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: '14px'
                }}
              >
                Back
              </button>
              <button
                onClick={handleJoin}
                disabled={!name.trim() || !roomCode.trim()}
                style={{
                  flex: 2, padding: '12px', borderRadius: '8px',
                  background: 'var(--accent-blue)',
                  color: '#fff', fontWeight: 700, fontSize: '14px',
                  opacity: (name.trim() && roomCode.trim()) ? 1 : 0.5
                }}
              >
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
