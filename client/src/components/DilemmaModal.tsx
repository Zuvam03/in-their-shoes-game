import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore, DilemmaChoice } from '../store/gameStore';

const DILEMMA_THEMES: Record<string, {
  label: string;
  color: string;
  bgGradient: string;
  icon: string;
  ambientEmoji: string[];
}> = {
  ethics_vs_survival: {
    label: 'Ethics vs Survival',
    color: '#f59e0b',
    bgGradient: 'radial-gradient(ellipse at 30% 20%, rgba(245,158,11,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(234,88,12,0.08) 0%, transparent 50%)',
    icon: '⚖️',
    ambientEmoji: ['⚖️', '🔥', '💔'],
  },
  loyalty_vs_principle: {
    label: 'Loyalty vs Principle',
    color: '#8b5cf6',
    bgGradient: 'radial-gradient(ellipse at 20% 30%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(124,58,237,0.06) 0%, transparent 50%)',
    icon: '🤝',
    ambientEmoji: ['🤝', '⭐', '🪞'],
  },
  class_encounter: {
    label: 'Class Encounter',
    color: '#3b82f6',
    bgGradient: 'radial-gradient(ellipse at 40% 20%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 60% 80%, rgba(30,64,175,0.06) 0%, transparent 50%)',
    icon: '🏛️',
    ambientEmoji: ['🏛️', '💰', '🪙'],
  },
  political_pressure: {
    label: 'Political Pressure',
    color: '#ef4444',
    bgGradient: 'radial-gradient(ellipse at 50% 10%, rgba(239,68,68,0.12) 0%, transparent 60%), radial-gradient(ellipse at 30% 90%, rgba(185,28,28,0.06) 0%, transparent 50%)',
    icon: '🏴',
    ambientEmoji: ['🏴', '📢', '✊'],
  },
  community_obligation: {
    label: 'Community Obligation',
    color: '#22c55e',
    bgGradient: 'radial-gradient(ellipse at 60% 30%, rgba(34,197,94,0.12) 0%, transparent 60%), radial-gradient(ellipse at 40% 70%, rgba(22,163,74,0.06) 0%, transparent 50%)',
    icon: '🏘️',
    ambientEmoji: ['🏘️', '🫂', '🌱'],
  },
  bystander: {
    label: 'Bystander Moment',
    color: '#64748b',
    bgGradient: 'radial-gradient(ellipse at 50% 50%, rgba(100,116,139,0.1) 0%, transparent 60%)',
    icon: '👁️',
    ambientEmoji: ['👁️', '🚶', '❓'],
  },
};

type Phase = 'enter' | 'narrative' | 'choices' | 'deciding' | 'chosen';

export default function DilemmaModal() {
  const { pendingDilemma, respondToDilemma, myPlayer, room } = useGameStore();
  const [phase, setPhase] = useState<Phase>('enter');
  const [revealedChars, setRevealedChars] = useState(0);
  const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<DilemmaChoice | null>(null);
  const [timeLeft, setTimeLeft] = useState(100);
  const [heartbeatScale, setHeartbeatScale] = useState(1);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevDilemmaId = useRef<string | null>(null);

  const currentTick = room?.tick || 0;

  // Reset state when a new dilemma arrives
  useEffect(() => {
    if (!pendingDilemma) {
      prevDilemmaId.current = null;
      return;
    }
    if (pendingDilemma.dilemmaId !== prevDilemmaId.current) {
      prevDilemmaId.current = pendingDilemma.dilemmaId;
      setPhase('enter');
      setRevealedChars(0);
      setHoveredChoice(null);
      setSelectedChoice(null);
      setTimeout(() => setPhase('narrative'), 800);
    }
  }, [pendingDilemma?.dilemmaId]);

  // Typewriter effect for narrative text
  useEffect(() => {
    if (phase !== 'narrative' || !pendingDilemma) return;
    const fullText = pendingDilemma.setup;
    if (revealedChars >= fullText.length) {
      setTimeout(() => setPhase('choices'), 400);
      return;
    }
    const speed = revealedChars < 10 ? 40 : 22;
    const timer = setTimeout(() => setRevealedChars(prev => Math.min(prev + 1, fullText.length)), speed);
    return () => clearTimeout(timer);
  }, [phase, revealedChars, pendingDilemma]);

  // Timer countdown
  useEffect(() => {
    if (!pendingDilemma || !room) return;
    const update = () => {
      const remaining = pendingDilemma.expiresAtTick - currentTick;
      const total = pendingDilemma.expiresAtTick - pendingDilemma.tick;
      const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
      setTimeLeft(pct);
      if (pct < 25) setShakeIntensity(Math.random() * 2);
    };
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [pendingDilemma, currentTick]);

  // Heartbeat when time is low
  useEffect(() => {
    if (timeLeft > 30 || phase === 'chosen') return;
    const beatSpeed = timeLeft < 15 ? 400 : 700;
    const interval = setInterval(() => {
      setHeartbeatScale(1.04);
      setTimeout(() => setHeartbeatScale(1), beatSpeed * 0.3);
    }, beatSpeed);
    return () => clearInterval(interval);
  }, [timeLeft, phase]);

  const handleChoose = useCallback((choice: DilemmaChoice) => {
    if (phase === 'chosen' || !pendingDilemma) return;
    setSelectedChoice(choice);
    setPhase('chosen');
    setTimeout(() => {
      respondToDilemma(pendingDilemma.dilemmaId, choice.id, choice.shortLabel);
    }, 1600);
  }, [phase, pendingDilemma, respondToDilemma]);

  if (!pendingDilemma) return null;

  const theme = DILEMMA_THEMES[pendingDilemma.dilemmaType] || DILEMMA_THEMES.bystander;
  const personaId = myPlayer?.persona.id || '';
  const personaContext = pendingDilemma.personaContext[personaId];
  const isUrgent = timeLeft < 30;
  const isCritical = timeLeft < 15;
  const setupText = pendingDilemma.setup;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', flexDirection: 'column',
        background: '#000',
        overflow: 'hidden',
        transform: `scale(${heartbeatScale})`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* Ambient background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: theme.bgGradient,
        opacity: phase === 'enter' ? 0 : 1,
        transition: 'opacity 1.2s ease',
        pointerEvents: 'none',
      }} />

      {/* Floating ambient particles */}
      {phase !== 'enter' && theme.ambientEmoji.map((emoji, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: `${18 + i * 6}px`,
          opacity: 0.06 + i * 0.02,
          left: `${15 + i * 30}%`,
          top: `${20 + (i * 25) % 60}%`,
          animation: `dilemmaFloat ${6 + i * 2}s ease-in-out infinite`,
          animationDelay: `${i * 1.5}s`,
          pointerEvents: 'none',
          filter: 'blur(1px)',
        }}>
          {emoji}
        </div>
      ))}

      {/* Cinematic letterbox bars */}
      <div style={{
        height: phase === 'enter' ? '50%' : '48px',
        background: '#000',
        transition: 'height 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        paddingBottom: phase === 'enter' ? '0' : '12px',
      }}>
        {phase !== 'enter' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            opacity: phase === 'enter' ? 0 : 1,
            transition: 'opacity 0.6s ease 0.4s',
          }}>
            <span style={{ fontSize: '16px' }}>{theme.icon}</span>
            <span style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: theme.color,
            }}>
              {theme.label}
            </span>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
        position: 'relative', zIndex: 1,
        overflow: 'auto',
      }}>
        <div style={{
          maxWidth: '580px', width: '100%',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(30px)' : 'translateY(0)',
          transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s',
        }}>
          {/* Title */}
          <h2 style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 800,
            color: '#f1f5f9',
            textAlign: 'center',
            marginBottom: '20px',
            lineHeight: 1.25,
            textShadow: `0 0 40px ${theme.color}33`,
            ...(shakeIntensity > 0 && isCritical ? {
              transform: `translateX(${(Math.random() - 0.5) * shakeIntensity}px)`,
            } : {}),
          }}>
            {pendingDilemma.title}
          </h2>

          {/* Timer bar */}
          <div style={{
            height: '2px', borderRadius: '1px',
            background: 'rgba(255,255,255,0.06)',
            marginBottom: '24px', overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: isCritical ? '#ef4444' : isUrgent ? '#f59e0b' : theme.color,
              transformOrigin: 'left',
              transform: `scaleX(${timeLeft / 100})`,
              transition: 'transform 0.5s linear, background 0.3s ease',
              boxShadow: isCritical ? '0 0 12px rgba(239,68,68,0.6)' : 'none',
            }} />
          </div>

          {/* Narrative text with typewriter */}
          <div style={{
            marginBottom: '20px',
            padding: '0 4px',
          }}>
            <p style={{
              color: '#cbd5e1',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              lineHeight: 1.8,
              textAlign: 'center',
              margin: 0,
              minHeight: '60px',
            }}>
              {phase === 'narrative' ? (
                <>
                  {setupText.slice(0, revealedChars)}
                  <span style={{
                    display: 'inline-block',
                    width: '2px', height: '1em',
                    background: theme.color,
                    marginLeft: '2px',
                    verticalAlign: 'text-bottom',
                    animation: 'cursorBlink 0.8s step-end infinite',
                  }} />
                </>
              ) : setupText}
            </p>
          </div>

          {/* Persona perspective */}
          {personaContext && (phase === 'choices' || phase === 'deciding' || phase === 'chosen') && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '24px',
              opacity: phase === 'narrative' ? 0 : 1,
              transform: phase === 'narrative' ? 'translateY(10px)' : 'translateY(0)',
              transition: 'all 0.5s ease',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginBottom: '6px',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: theme.color,
                  boxShadow: `0 0 8px ${theme.color}88`,
                }} />
                <span style={{
                  fontSize: '10px', fontWeight: 700, color: theme.color,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {myPlayer?.persona.name || 'Your perspective'}
                </span>
              </div>
              <p style={{
                fontSize: '13px', color: '#94a3b8', lineHeight: 1.7,
                margin: 0, fontStyle: 'italic',
              }}>
                {personaContext}
              </p>
            </div>
          )}

          {/* Choices */}
          {(phase === 'choices' || phase === 'deciding' || phase === 'chosen') && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px',
              opacity: phase === 'narrative' ? 0 : 1,
              transition: 'opacity 0.6s ease 0.2s',
            }}>
              {pendingDilemma.choices.map((choice, idx) => {
                const isHovered = hoveredChoice === choice.id;
                const isSelected = selectedChoice?.id === choice.id;
                const isNotSelected = phase === 'chosen' && !isSelected;
                const resonance = choice.personaResonance?.[personaId];

                return (
                  <button
                    key={choice.id}
                    onMouseEnter={() => phase !== 'chosen' && setHoveredChoice(choice.id)}
                    onMouseLeave={() => setHoveredChoice(null)}
                    onClick={() => {
                      if (phase === 'chosen') return;
                      setPhase('deciding');
                      handleChoose(choice);
                    }}
                    style={{
                      padding: '16px 18px',
                      borderRadius: '14px',
                      textAlign: 'left',
                      background: isSelected
                        ? `linear-gradient(135deg, ${theme.color}18 0%, ${theme.color}08 100%)`
                        : isHovered
                          ? 'rgba(255,255,255,0.04)'
                          : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${
                        isSelected ? theme.color + '66'
                        : isHovered ? 'rgba(255,255,255,0.12)'
                        : 'rgba(255,255,255,0.05)'
                      }`,
                      color: '#f1f5f9',
                      cursor: phase === 'chosen' ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: isNotSelected ? 0.15 : 1,
                      transform: isSelected ? 'scale(1.02)'
                        : isNotSelected ? 'scale(0.97) translateX(-4px)'
                        : isHovered ? 'translateX(4px)' : 'translateX(0)',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: phase === 'choices' ? `choiceSlideIn 0.4s ease ${idx * 0.1}s both` : 'none',
                    }}
                  >
                    {/* Selection ripple effect */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `radial-gradient(circle at 50% 50%, ${theme.color}22 0%, transparent 70%)`,
                        animation: 'rippleExpand 1s ease-out',
                        pointerEvents: 'none',
                      }} />
                    )}

                    {/* Resonance indicator */}
                    {resonance && resonance !== 'neutral' && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '14px',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '10px', fontWeight: 600,
                        color: resonance === 'natural' ? '#4ade80' : '#f87171',
                        opacity: 0.8,
                      }}>
                        <span style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: resonance === 'natural' ? '#4ade80' : '#f87171',
                          boxShadow: `0 0 6px ${resonance === 'natural' ? '#4ade80' : '#f87171'}`,
                        }} />
                        {resonance === 'natural' ? 'feels right' : 'against instinct'}
                      </div>
                    )}

                    <div style={{
                      fontWeight: 600, fontSize: '14px', marginBottom: '6px',
                      paddingRight: resonance && resonance !== 'neutral' ? '110px' : '0',
                      lineHeight: 1.5,
                    }}>
                      {choice.text}
                    </div>

                    {/* Consequence preview on hover */}
                    {(isHovered || isSelected) && (
                      <div style={{
                        overflow: 'hidden',
                        maxHeight: isHovered || isSelected ? '200px' : '0',
                        transition: 'max-height 0.3s ease',
                      }}>
                        {choice.narrativeOutcome && (
                          <div style={{
                            fontSize: '12px', color: '#64748b', fontStyle: 'italic',
                            marginBottom: '8px', lineHeight: 1.5,
                            paddingLeft: '10px',
                            borderLeft: `2px solid ${theme.color}44`,
                          }}>
                            {choice.narrativeOutcome}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {choice.karmaChange !== 0 && (
                            <ConsequencePip
                              icon={choice.karmaChange > 0 ? '✨' : '🌑'}
                              label={`Karma ${choice.karmaChange > 0 ? '+' : ''}${choice.karmaChange}`}
                              positive={choice.karmaChange > 0}
                            />
                          )}
                          {choice.trustChange !== 0 && (
                            <ConsequencePip
                              icon={choice.trustChange > 0 ? '🤝' : '💔'}
                              label={`Trust ${choice.trustChange > 0 ? '+' : ''}${choice.trustChange}`}
                              positive={choice.trustChange > 0}
                            />
                          )}
                          {choice.communityChange !== 0 && (
                            <ConsequencePip
                              icon={choice.communityChange > 0 ? '🏘️' : '🏚️'}
                              label={`Community ${choice.communityChange > 0 ? '+' : ''}${choice.communityChange}`}
                              positive={choice.communityChange > 0}
                            />
                          )}
                          {Object.entries(choice.statChanges || {}).filter(([k]) => k !== 'mood').map(([k, v]) => (
                            <ConsequencePip
                              key={k}
                              icon={Number(v) > 0 ? '📈' : '📉'}
                              label={`${k} ${Number(v) > 0 ? '+' : ''}${v}`}
                              positive={Number(v) > 0}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Chosen feedback */}
          {phase === 'chosen' && selectedChoice && (
            <div style={{
              textAlign: 'center', marginTop: '20px',
              animation: 'fadeInUp 0.6s ease 0.3s both',
            }}>
              <div style={{
                fontSize: '28px', marginBottom: '8px',
                animation: 'chosenPulse 0.6s ease',
              }}>
                {selectedChoice.karmaChange >= 0 ? '🌟' : '🌑'}
              </div>
              <div style={{
                fontSize: '13px', color: '#94a3b8',
                fontStyle: 'italic', lineHeight: 1.6,
              }}>
                {selectedChoice.narrativeOutcome || 'Your choice echoes through the city...'}
              </div>
            </div>
          )}

          {/* Footer hint */}
          {phase !== 'chosen' && phase !== 'enter' && (
            <div style={{
              marginTop: '20px', textAlign: 'center',
              fontSize: '11px', color: '#334155',
              lineHeight: 1.5,
            }}>
              {isCritical ? (
                <span style={{ color: '#ef4444', fontWeight: 600, animation: 'pulse 1s infinite' }}>
                  Decide now — time is almost up
                </span>
              ) : isUrgent ? (
                <span style={{ color: '#f59e0b' }}>The moment won't wait forever...</span>
              ) : (
                <span>There is no right answer. Only yours.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom letterbox */}
      <div style={{
        height: phase === 'enter' ? '50%' : '40px',
        background: '#000',
        transition: 'height 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: phase === 'enter' ? '0' : '10px',
      }}>
        {isUrgent && phase !== 'enter' && phase !== 'chosen' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '11px', color: isCritical ? '#ef4444' : '#f59e0b',
            fontWeight: 600,
            opacity: 0.8,
          }}>
            <span style={{
              display: 'inline-block', width: '6px', height: '6px',
              borderRadius: '50%',
              background: isCritical ? '#ef4444' : '#f59e0b',
              animation: 'pulse 1s infinite',
            }} />
            {Math.round(timeLeft)}% time remaining
          </div>
        )}
      </div>

      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)',
      }} />

      <style>{`
        @keyframes dilemmaFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(3deg); }
          66% { transform: translateY(8px) rotate(-2deg); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes choiceSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rippleExpand {
          from { transform: scale(0); opacity: 0.6; }
          to { transform: scale(1); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chosenPulse {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function ConsequencePip({ icon, label, positive }: { icon: string; label: string; positive: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      fontSize: '11px',
      color: positive ? '#4ade80' : '#f87171',
      background: positive ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
      padding: '3px 8px', borderRadius: '10px',
      border: `1px solid ${positive ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}`,
    }}>
      <span style={{ fontSize: '10px' }}>{icon}</span>
      {label}
    </span>
  );
}
