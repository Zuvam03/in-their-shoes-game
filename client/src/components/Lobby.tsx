import { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import type { PersonaTraits } from '../store/gameStore';
import LobbyTips from './LobbyTips';

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x', desc: 'Relaxed' },
  { value: 1, label: '1x', desc: 'Normal' },
  { value: 1.5, label: '1.5x', desc: 'Fast' },
  { value: 2, label: '2x', desc: 'Rush' }
];

const PERSONA_PREVIEW = [
  { id: 'overcommitted_achiever', name: 'Arjun Sharma', title: 'The Overcommitted Achiever',
    desc: 'A driven professional who always takes on more than he can handle.',
    traits: { analyticalThinking: 8, emotionalSensitivity: 3, appetite: 4, workOrientation: 10, spendingStyle: 5, socialOrientation: 5, riskTolerance: 6, resilience: 7, adaptability: 6, cooperation: 5 } as PersonaTraits,
    cash: 350, energy: 65, color: '#f5c842',
    strengths: ['High work output', 'Analytical planning', 'Stress-resistant'],
    weaknesses: ['Rapid stress accumulation', 'Ignores personal needs'] },
  { id: 'emotionally_sensitive_friend', name: 'Priya Banerjee', title: 'The Emotionally Sensitive Friend',
    desc: 'A compassionate person who feels everything deeply — other people\'s joy and pain alike.',
    traits: { analyticalThinking: 5, emotionalSensitivity: 10, appetite: 6, workOrientation: 5, spendingStyle: 6, socialOrientation: 9, riskTolerance: 3, resilience: 5, adaptability: 6, cooperation: 10 } as PersonaTraits,
    cash: 250, energy: 75, color: '#ec4899',
    strengths: ['Excellent cooperation', 'Social mood recovery', 'High karma'],
    weaknesses: ['Mood craters from rejection', 'Exhausts herself helping'] },
  { id: 'analytical_planner', name: 'Debashish Roy', title: 'The Analytical Planner',
    desc: 'A methodical thinker who researches everything before acting.',
    traits: { analyticalThinking: 10, emotionalSensitivity: 4, appetite: 5, workOrientation: 8, spendingStyle: 3, socialOrientation: 3, riskTolerance: 2, resilience: 8, adaptability: 3, cooperation: 5 } as PersonaTraits,
    cash: 400, energy: 80, color: '#3b82f6',
    strengths: ['Best route efficiency', 'High starting cash', 'Detailed info'],
    weaknesses: ['Struggles with surprises', 'Poor social skills'] },
  { id: 'impulsive_shopaholic', name: 'Ritika Ghosh', title: 'The Impulsive Shopaholic',
    desc: 'A vibrant soul who lives in the moment and spends freely.',
    traits: { analyticalThinking: 3, emotionalSensitivity: 7, appetite: 7, workOrientation: 5, spendingStyle: 9, socialOrientation: 8, riskTolerance: 7, resilience: 6, adaptability: 8, cooperation: 7 } as PersonaTraits,
    cash: 180, energy: 80, color: '#f97316',
    strengths: ['High adaptability', 'Mood from purchases', 'Social ease'],
    weaknesses: ['Drains cash fast', 'Financial stress escalates'] },
  { id: 'food_loving_explorer', name: 'Sourav Das', title: 'The Food-Loving Explorer',
    desc: 'A foodie who treats every meal as a destination.',
    traits: { analyticalThinking: 5, emotionalSensitivity: 6, appetite: 10, workOrientation: 4, spendingStyle: 7, socialOrientation: 7, riskTolerance: 6, resilience: 7, adaptability: 8, cooperation: 7 } as PersonaTraits,
    cash: 300, energy: 85, color: '#22c55e',
    strengths: ['Huge food benefit', 'High starting energy', 'Adaptable'],
    weaknesses: ['Hunger rises fast', 'Food spending strains cash'] },
  { id: 'frugal_survivor', name: 'Mita Mondal', title: 'The Frugal Survivor',
    desc: 'A resourceful woman who has stretched every rupee her entire life.',
    traits: { analyticalThinking: 7, emotionalSensitivity: 5, appetite: 6, workOrientation: 8, spendingStyle: 1, socialOrientation: 4, riskTolerance: 3, resilience: 9, adaptability: 7, cooperation: 6 } as PersonaTraits,
    cash: 150, energy: 70, color: '#14b8a6',
    strengths: ['Lowest cash drain', 'High resilience', 'Free resource mastery'],
    weaknesses: ['Low starting cash', 'Risk-averse'] },
  { id: 'social_connector', name: 'Neha Chatterjee', title: 'The Social Connector',
    desc: 'Someone who knows everyone and makes friends everywhere.',
    traits: { analyticalThinking: 5, emotionalSensitivity: 8, appetite: 5, workOrientation: 5, spendingStyle: 6, socialOrientation: 10, riskTolerance: 5, resilience: 7, adaptability: 8, cooperation: 9 } as PersonaTraits,
    cash: 280, energy: 78, color: '#a855f7',
    strengths: ['Exceptional cooperation', 'Social mood recovery', 'Network advantage'],
    weaknesses: ['Vulnerable if isolated', 'Social obligations slow progress'] },
  { id: 'independent_loner', name: 'Suman Gupta', title: 'The Independent Loner',
    desc: 'A self-reliant introvert who prefers to work alone.',
    traits: { analyticalThinking: 7, emotionalSensitivity: 4, appetite: 5, workOrientation: 7, spendingStyle: 4, socialOrientation: 1, riskTolerance: 5, resilience: 9, adaptability: 5, cooperation: 1 } as PersonaTraits,
    cash: 320, energy: 85, color: '#6b7280',
    strengths: ['Best solo effectiveness', 'High resilience', 'Self-sufficient'],
    weaknesses: ['Poor cooperation', 'Misses multiplayer bonuses'] },
  { id: 'risk_taking_opportunist', name: 'Rohan Bose', title: 'The Risk-Taking Opportunist',
    desc: 'A gambler at heart who sees uncertainty as opportunity.',
    traits: { analyticalThinking: 6, emotionalSensitivity: 4, appetite: 6, workOrientation: 5, spendingStyle: 7, socialOrientation: 7, riskTolerance: 10, resilience: 7, adaptability: 9, cooperation: 6 } as PersonaTraits,
    cash: 260, energy: 82, color: '#ef4444',
    strengths: ['Best risk payoffs', 'Excellent adaptability', 'Spot opportunities'],
    weaknesses: ['Risk failures can be severe', 'Financial inconsistency'] },
  { id: 'quiet_caregiver', name: 'Anita Paul', title: 'The Quiet Caregiver',
    desc: 'A gentle person who puts everyone else first.',
    traits: { analyticalThinking: 5, emotionalSensitivity: 9, appetite: 5, workOrientation: 6, spendingStyle: 3, socialOrientation: 6, riskTolerance: 3, resilience: 8, adaptability: 6, cooperation: 9 } as PersonaTraits,
    cash: 200, energy: 68, color: '#f472b6',
    strengths: ['Exceptional help effectiveness', 'Trust building', 'Mood from helping'],
    weaknesses: ['Low starting energy', 'Self-neglect', 'Can be exploited'] },
  { id: 'anxious_perfectionist', name: 'Kavya Mukherjee', title: 'The Anxious Perfectionist',
    desc: 'A high-achiever plagued by self-doubt who triple-checks everything.',
    traits: { analyticalThinking: 9, emotionalSensitivity: 8, appetite: 4, workOrientation: 9, spendingStyle: 4, socialOrientation: 4, riskTolerance: 2, resilience: 4, adaptability: 3, cooperation: 6 } as PersonaTraits,
    cash: 370, energy: 72, color: '#8b5cf6',
    strengths: ['Exceptional analytics', 'High achiever', 'Good starting cash'],
    weaknesses: ['Very low stress threshold', 'Unexpected events devastating'] },
  { id: 'street_smart_negotiator', name: 'Tapas Chatterjee', title: 'The Street-Smart Negotiator',
    desc: 'A hustler who grew up reading situations and people.',
    traits: { analyticalThinking: 7, emotionalSensitivity: 6, appetite: 7, workOrientation: 6, spendingStyle: 5, socialOrientation: 8, riskTolerance: 7, resilience: 8, adaptability: 10, cooperation: 7 } as PersonaTraits,
    cash: 240, energy: 80, color: '#eab308',
    strengths: ['Best adaptability', 'Negotiation efficiency', 'Spot hidden opportunities'],
    weaknesses: ['Jack of all trades', 'Overconfident'] },
];

const TRAIT_LABELS: Record<keyof PersonaTraits, string> = {
  analyticalThinking: 'Analytical',
  emotionalSensitivity: 'Empathy',
  appetite: 'Appetite',
  workOrientation: 'Work Drive',
  spendingStyle: 'Spending',
  socialOrientation: 'Social',
  riskTolerance: 'Risk',
  resilience: 'Resilience',
  adaptability: 'Adaptability',
  cooperation: 'Cooperation'
};

function RadarChart({ traits, color, size = 180 }: { traits: PersonaTraits; color: string; size?: number }) {
  const keys = Object.keys(TRAIT_LABELS) as (keyof PersonaTraits)[];
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const angleStep = (Math.PI * 2) / keys.length;

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = keys.map((k, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const val = (traits[k] || 0) / 10;
    return {
      x: cx + Math.cos(angle) * r * val,
      y: cy + Math.sin(angle) * r * val,
      lx: cx + Math.cos(angle) * (r + 14),
      ly: cy + Math.sin(angle) * (r + 14),
      label: TRAIT_LABELS[k]
    };
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {rings.map(ring => (
        <polygon
          key={ring}
          points={keys.map((_, i) => {
            const a = angleStep * i - Math.PI / 2;
            return `${cx + Math.cos(a) * r * ring},${cy + Math.sin(a) * r * ring}`;
          }).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"
        />
      ))}
      {keys.map((_, i) => {
        const a = angleStep * i - Math.PI / 2;
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r}
            stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
          />
        );
      })}
      <polygon
        points={dataPath.replace(/[MLZ]/g, (m) => m === 'Z' ? '' : '').split(/[ML]/).filter(Boolean).join(' ')}
        fill={`${color}22`} stroke={color} strokeWidth="1.5"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />
      ))}
      {dataPoints.map((p, i) => (
        <text key={`l${i}`} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="central"
          fill="rgba(255,255,255,0.5)" fontSize="7" fontWeight="500">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

function PersonaGalleryModal({ onClose }: { onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const persona = PERSONA_PREVIEW[idx];

  const navigate = (dir: number) => {
    if (animating) return;
    setAnimating(true);
    setIdx((idx + dir + PERSONA_PREVIEW.length) % PERSONA_PREVIEW.length);
    setTimeout(() => setAnimating(false), 300);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const traitKeys = Object.keys(TRAIT_LABELS) as (keyof PersonaTraits)[];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.25s ease-out'
    }} onClick={onClose}>
      <div style={{
        maxWidth: '680px', width: '94%', maxHeight: '90vh',
        overflowY: 'auto', borderRadius: '16px',
        background: 'linear-gradient(180deg, rgba(30,30,40,0.98) 0%, rgba(15,15,22,0.99) 100%)',
        border: `1px solid ${persona.color}33`,
        boxShadow: `0 0 60px ${persona.color}15, 0 20px 60px rgba(0,0,0,0.6)`,
        transition: 'border-color 0.3s, box-shadow 0.3s'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Character {idx + 1} of {PERSONA_PREVIEW.length}
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,255,255,0.5)',
            fontSize: '12px', cursor: 'pointer'
          }}>
            ESC
          </button>
        </div>

        {/* Persona identity */}
        <div style={{ padding: '16px 24px 0', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 12px',
            background: `linear-gradient(135deg, ${persona.color}, ${persona.color}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 800, color: '#fff',
            boxShadow: `0 0 30px ${persona.color}44`
          }}>
            {persona.name.charAt(0)}
          </div>
          <h2 style={{
            fontSize: '22px', fontWeight: 800, color: persona.color,
            margin: '0 0 4px', transition: 'color 0.3s'
          }}>{persona.name}</h2>
          <div style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic'
          }}>{persona.title}</div>
          <p style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '10px 0 0',
            lineHeight: 1.5, maxWidth: '460px', marginInline: 'auto'
          }}>{persona.desc}</p>
        </div>

        {/* Radar + stats */}
        <div style={{
          display: 'flex', gap: '16px', padding: '20px 24px',
          flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ flexShrink: 0 }}>
            <RadarChart traits={persona.traits} color={persona.color} size={200} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            {traitKeys.map((k, i) => {
              const val = persona.traits[k];
              return (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', width: '72px', textAlign: 'right' }}>
                    {TRAIT_LABELS[k]}
                  </span>
                  <div style={{
                    flex: 1, height: '4px', borderRadius: '2px',
                    background: 'rgba(255,255,255,0.06)', overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${val * 10}%`, height: '100%', borderRadius: '2px',
                      background: val >= 8 ? persona.color : val >= 5 ? `${persona.color}aa` : `${persona.color}55`,
                      transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)'
                    }} />
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', width: '18px' }}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Starting conditions */}
        <div style={{
          display: 'flex', gap: '12px', padding: '0 24px', justifyContent: 'center'
        }}>
          <div style={{
            padding: '8px 16px', borderRadius: '8px', textAlign: 'center',
            background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.15)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f5c842' }}>{persona.cash}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cash</div>
          </div>
          <div style={{
            padding: '8px 16px', borderRadius: '8px', textAlign: 'center',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>{persona.energy}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Energy</div>
          </div>
        </div>

        {/* Strengths / Weaknesses */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
          padding: '16px 24px'
        }}>
          <div style={{
            padding: '12px', borderRadius: '10px',
            background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)'
          }}>
            <div style={{
              fontSize: '9px', fontWeight: 700, color: '#22c55e',
              textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px'
            }}>Strengths</div>
            {persona.strengths.map((s, i) => (
              <div key={i} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '3px' }}>
                + {s}
              </div>
            ))}
          </div>
          <div style={{
            padding: '12px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)'
          }}>
            <div style={{
              fontSize: '9px', fontWeight: 700, color: '#ef4444',
              textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px'
            }}>Weaknesses</div>
            {persona.weaknesses.map((w, i) => (
              <div key={i} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '3px' }}>
                - {w}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px 20px', borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <button onClick={() => navigate(-1)} style={{
            padding: '8px 20px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span style={{ fontSize: '16px' }}>&#8592;</span> Previous
          </button>

          <div style={{ display: 'flex', gap: '5px' }}>
            {PERSONA_PREVIEW.map((_, i) => (
              <div
                key={i}
                onClick={() => { setIdx(i); }}
                style={{
                  width: i === idx ? '16px' : '6px', height: '6px', borderRadius: '3px',
                  background: i === idx ? persona.color : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s', cursor: 'pointer'
                }}
              />
            ))}
          </div>

          <button onClick={() => navigate(1)} style={{
            padding: '8px 20px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            Next <span style={{ fontSize: '16px' }}>&#8594;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingParticle({ delay, color }: { delay: number; color: string }) {
  const style = useMemo(() => ({
    position: 'absolute' as const,
    width: `${2 + Math.random() * 3}px`,
    height: `${2 + Math.random() * 3}px`,
    borderRadius: '50%',
    background: color,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    opacity: 0.3 + Math.random() * 0.4,
    animation: `lobbyFloat ${8 + Math.random() * 12}s ease-in-out ${delay}s infinite alternate`,
    filter: `blur(${Math.random() < 0.3 ? 1 : 0}px)`,
    boxShadow: `0 0 ${4 + Math.random() * 6}px ${color}`,
    pointerEvents: 'none' as const
  }), [delay, color]);
  return <div style={style} />;
}

export default function Lobby() {
  const { room, mySocketId, roomId, setReady, startMatch, playAgain, setGameSpeed } = useGameStore();
  const [showGallery, setShowGallery] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHost = room?.hostId === mySocketId;
  const myPlayer = mySocketId ? room?.players[mySocketId] : null;
  const players = room ? Object.values(room.players) : [];
  const allReady = players.length > 0 && players.every(p => p.isReady);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const copyCode = () => {
    navigator.clipboard?.writeText(roomId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      delay: i * 0.4,
      color: ['#f5c842', '#f97316', '#3b82f6', '#a855f7', '#22c55e'][i % 5]
    })), []);

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0a12 0%, #111118 40%, #0d0d15 100%)',
      padding: '24px'
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-20%', left: '30%',
        width: '40%', height: '50%', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(245,200,66,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '20%',
        width: '30%', height: '40%', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Floating particles */}
      {particles.map((p, i) => <FloatingParticle key={i} {...p} />)}

      <div style={{
        maxWidth: '560px', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '16px',
        position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <div style={{
            fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase',
            color: 'rgba(245,200,66,0.5)', marginBottom: '8px'
          }}>GAME LOBBY</div>

          {room && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '10px 20px', borderRadius: '12px',
              background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.12)'
            }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Room</span>
              <span style={{
                fontFamily: 'monospace', fontSize: '22px', fontWeight: 800,
                color: '#f5c842', letterSpacing: '4px'
              }}>
                {roomId}
              </span>
              <button onClick={copyCode} style={{
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '6px', padding: '4px 10px',
                color: copied ? '#22c55e' : 'rgba(255,255,255,0.5)',
                fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* Match settings */}
        <div style={{
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.04)'
          }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Match Duration</span>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>
              {room ? `${room.matchDuration / 60} minutes` : '--'}
            </span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'
            }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Game Speed</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                {room?.gameSpeed === 1 ? 'Normal pace' :
                 room?.gameSpeed === 0.5 ? 'Half speed — more time to think' :
                 room?.gameSpeed === 1.5 ? 'Faster — more pressure' :
                 'Double speed — intense!'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {SPEED_OPTIONS.map(opt => {
                const active = room?.gameSpeed === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => isHost && setGameSpeed(opt.value)}
                    disabled={!isHost}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: '8px',
                      background: active ? 'rgba(245,200,66,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${active ? 'rgba(245,200,66,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      color: active ? '#f5c842' : 'rgba(255,255,255,0.35)',
                      fontSize: '12px', fontWeight: 600,
                      cursor: isHost ? 'pointer' : 'default',
                      opacity: isHost ? 1 : 0.5,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{opt.label}</span>
                    <span style={{ fontSize: '9px', fontWeight: 400 }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Players */}
        <div style={{
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              Players ({players.length}/6)
            </span>
            {allReady && players.length > 0 && (
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 600
              }}>
                All Ready
              </span>
            )}
          </div>
          {players.map((p, i) => {
            const isMe = p.id === mySocketId;
            const hue = p.name.charCodeAt(0) * 7;
            return (
              <div
                key={p.id}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: isMe ? 'rgba(245,200,66,0.03)' : undefined,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.4s ${0.1 + i * 0.08}s ease-out, transform 0.4s ${0.1 + i * 0.08}s ease-out`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: `linear-gradient(135deg, hsl(${hue}deg 60% 45%), hsl(${hue}deg 50% 30%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, color: '#fff',
                    boxShadow: p.isReady ? `0 0 12px hsla(${hue}deg, 60%, 45%, 0.3)` : 'none',
                    transition: 'box-shadow 0.3s'
                  }}>
                    {p.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>
                      {p.name}
                      {isMe && <span style={{ color: '#f5c842', fontSize: '10px', marginLeft: '6px' }}>(you)</span>}
                      {room?.hostId === p.id && (
                        <span style={{
                          fontSize: '9px', marginLeft: '6px', padding: '1px 6px', borderRadius: '8px',
                          background: 'rgba(249,115,22,0.12)', color: '#f97316', fontWeight: 700
                        }}>HOST</span>
                      )}
                    </div>
                    {!p.isConnected && (
                      <div style={{ fontSize: '10px', color: '#ef4444' }}>Disconnected</div>
                    )}
                  </div>
                </div>
                <div style={{
                  padding: '4px 12px', borderRadius: '20px',
                  fontSize: '11px', fontWeight: 600,
                  background: p.isReady ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                  color: p.isReady ? '#22c55e' : 'rgba(255,255,255,0.3)',
                  border: `1px solid ${p.isReady ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.3s'
                }}>
                  {p.isReady ? 'Ready' : 'Waiting'}
                </div>
              </div>
            );
          })}
          {players.length === 0 && (
            <div style={{
              padding: '28px', textAlign: 'center',
              color: 'rgba(255,255,255,0.25)', fontSize: '13px'
            }}>
              Waiting for players to join...
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {!myPlayer?.isReady && (
            <button onClick={setReady} style={{
              flex: 1, padding: '13px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff', fontWeight: 700, fontSize: '14px',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(34,197,94,0.25)'
            }}>
              Ready
            </button>
          )}
          {myPlayer?.isReady && !isHost && (
            <div style={{
              flex: 1, padding: '13px', borderRadius: '10px', textAlign: 'center',
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
              color: '#22c55e', fontWeight: 600, fontSize: '13px'
            }}>
              Waiting for host to start...
            </div>
          )}
          {isHost && (
            <button onClick={startMatch} disabled={players.length < 1} style={{
              flex: 2, padding: '14px', borderRadius: '10px',
              background: (allReady || players.length >= 1)
                ? 'linear-gradient(135deg, #f5c842, #f97316)'
                : 'rgba(255,255,255,0.04)',
              color: (allReady || players.length >= 1) ? '#000' : 'rgba(255,255,255,0.3)',
              fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px',
              border: 'none', cursor: players.length >= 1 ? 'pointer' : 'default',
              boxShadow: (allReady || players.length >= 1)
                ? '0 4px 25px rgba(245,200,66,0.3)' : 'none',
              transition: 'all 0.3s'
            }}>
              Start Match
            </button>
          )}
        </div>

        {/* Persona Gallery Button */}
        <button onClick={() => setShowGallery(true)} style={{
          padding: '12px', borderRadius: '10px',
          background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)',
          color: '#a855f7', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>&#128101;</span>
          Browse All 12 Personas
          <span style={{
            fontSize: '9px', padding: '2px 6px', borderRadius: '8px',
            background: 'rgba(168,85,247,0.1)', color: '#a855f7'
          }}>NEW</span>
        </button>

        {/* Tips */}
        <LobbyTips />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={playAgain} style={{
            flex: 1, padding: '10px', borderRadius: '8px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer'
          }}>
            Leave Room
          </button>
        </div>

        <p style={{
          textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '11px',
          margin: '0'
        }}>
          Share the room code with friends. Host can start with any number of players.
        </p>
      </div>

      {showGallery && <PersonaGalleryModal onClose={() => setShowGallery(false)} />}

      <style>{`
        @keyframes lobbyFloat {
          0% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-15px) translateX(8px); }
          66% { transform: translateY(8px) translateX(-5px); }
          100% { transform: translateY(-10px) translateX(3px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
