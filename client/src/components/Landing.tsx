import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function Landing() {
  const { connected, createRoom, joinRoom } = useGameStore();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [duration, setDuration] = useState(600);

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
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 80%, rgba(245, 200, 66, 0.04) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.04) 0%, transparent 50%)`,
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '32px',
        maxWidth: '480px', width: '90%',
        zIndex: 1
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏙️</div>
          <h1 style={{
            fontSize: '32px', fontWeight: 700,
            background: 'linear-gradient(135deg, #f5c842, #f97316)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '8px', letterSpacing: '-0.5px'
          }}>
            Kolkata City Survival
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '360px', textAlign: 'center' }}>
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
                opacity: connected ? 1 : 0.5
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
