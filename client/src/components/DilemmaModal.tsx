import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const DILEMMA_TYPE_LABELS: Record<string, string> = {
  ethics_vs_survival: 'Ethics vs Survival',
  loyalty_vs_principle: 'Loyalty vs Principle',
  class_encounter: 'Class Encounter',
  political_pressure: 'Political Pressure',
  community_obligation: 'Community Obligation',
  bystander: 'Bystander Moment',
};

const DILEMMA_TYPE_COLORS: Record<string, string> = {
  ethics_vs_survival: '#f59e0b',
  loyalty_vs_principle: '#8b5cf6',
  class_encounter: '#3b82f6',
  political_pressure: '#ef4444',
  community_obligation: '#22c55e',
  bystander: '#64748b',
};

export default function DilemmaModal() {
  const { pendingDilemma, respondToDilemma, myPlayer, room } = useGameStore();
  const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(100);

  useEffect(() => {
    if (!pendingDilemma || !room) return;
    const update = () => {
      const remaining = pendingDilemma.expiresAtTick - (room.tick || 0);
      const total = pendingDilemma.expiresAtTick - pendingDilemma.tick;
      setTimeLeft(Math.max(0, Math.min(100, (remaining / total) * 100)));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [pendingDilemma, room?.tick]);

  if (!pendingDilemma) return null;

  const accentColor = DILEMMA_TYPE_COLORS[pendingDilemma.dilemmaType] || '#f59e0b';
  const personaId = myPlayer?.persona.id || '';
  const personaContext = pendingDilemma.personaContext[personaId];
  const isUrgent = timeLeft < 30;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        maxWidth: '500px', width: '100%',
        background: '#0f1117',
        border: `1px solid ${accentColor}44`,
        borderRadius: '16px', padding: '28px',
        boxShadow: `0 20px 80px rgba(0,0,0,0.9), 0 0 40px ${accentColor}18`
      }} className="slide-up">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: accentColor,
            background: `${accentColor}18`, padding: '3px 10px', borderRadius: '20px'
          }}>
            {DILEMMA_TYPE_LABELS[pendingDilemma.dilemmaType] || 'Social Dilemma'}
          </span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f1f5f9', marginBottom: '10px', lineHeight: 1.3 }}>
          {pendingDilemma.title}
        </h2>

        {/* Timer bar */}
        <div style={{
          height: '3px', background: '#1e2130', borderRadius: '2px',
          marginBottom: '14px', overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${timeLeft}%`,
            background: isUrgent ? '#ef4444' : accentColor,
            transition: 'width 1s linear, background 0.3s ease',
            ...(isUrgent ? { animation: 'pulse 1s infinite' } : {})
          }} />
        </div>

        {/* Setup */}
        <p style={{
          color: '#94a3b8', fontSize: '14px', lineHeight: 1.7,
          marginBottom: '20px',
          borderLeft: `3px solid ${accentColor}55`,
          paddingLeft: '14px'
        }}>
          {pendingDilemma.setup}
        </p>

        {/* Persona-specific context */}
        {personaContext && (
          <div style={{
            background: '#1e2130',
            border: '1px solid #2a2f44',
            borderRadius: '10px', padding: '12px 14px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {myPlayer?.persona.name || 'Your perspective'}
            </div>
            <p style={{ fontSize: '13px', color: '#a8b3cc', lineHeight: 1.6, margin: 0 }}>
              {personaContext}
            </p>
          </div>
        )}

        {/* Choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pendingDilemma.choices.map(choice => {
            const isHovered = hoveredChoice === choice.id;
            const resonance = choice.personaResonance?.[personaId];
            const resonanceColor = resonance === 'natural' ? '#22c55e'
              : resonance === 'against' ? '#ef4444' : undefined;

            return (
              <button
                key={choice.id}
                onMouseEnter={() => setHoveredChoice(choice.id)}
                onMouseLeave={() => setHoveredChoice(null)}
                onClick={() => respondToDilemma(pendingDilemma.dilemmaId, choice.id, choice.shortLabel)}
                style={{
                  padding: '14px 16px', borderRadius: '12px', textAlign: 'left',
                  background: isHovered ? '#1e2130' : '#161921',
                  border: `1px solid ${isHovered ? accentColor + '55' : '#2a2f44'}`,
                  color: '#f1f5f9', fontSize: '14px', lineHeight: 1.5,
                  transition: 'all 0.15s ease', cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {resonanceColor && (
                  <span style={{
                    position: 'absolute', top: '10px', right: '12px',
                    fontSize: '10px', color: resonanceColor,
                    background: resonanceColor + '18',
                    padding: '2px 8px', borderRadius: '10px', fontWeight: 700
                  }}>
                    {resonance === 'natural' ? 'feels natural' : 'against instinct'}
                  </span>
                )}
                <div style={{ fontWeight: 600, marginBottom: '4px', paddingRight: resonanceColor ? '100px' : '0' }}>
                  {choice.text}
                </div>
                {isHovered && choice.narrativeOutcome && (
                  <div style={{
                    fontSize: '11px', color: '#64748b', fontStyle: 'italic',
                    marginBottom: '6px', lineHeight: 1.4
                  }}>
                    → {choice.narrativeOutcome}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {choice.karmaChange !== 0 && (
                    <Pip label={`karma ${choice.karmaChange > 0 ? '+' : ''}${choice.karmaChange}`}
                      positive={choice.karmaChange > 0} />
                  )}
                  {choice.trustChange !== 0 && (
                    <Pip label={`trust ${choice.trustChange > 0 ? '+' : ''}${choice.trustChange}`}
                      positive={choice.trustChange > 0} />
                  )}
                  {choice.communityChange !== 0 && (
                    <Pip label={`community ${choice.communityChange > 0 ? '+' : ''}${choice.communityChange}`}
                      positive={choice.communityChange > 0} />
                  )}
                  {Object.entries(choice.statChanges || {}).filter(([k]) => k !== 'mood').map(([k, v]) => (
                    <Pip key={k} label={`${k} ${Number(v) > 0 ? '+' : ''}${v}`} positive={Number(v) > 0} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: '14px', fontSize: '11px', color: '#475569', textAlign: 'center',
          display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center'
        }}>
          <span>This choice will shape your persona's story. There is no objectively right answer.</span>
          {isUrgent && (
            <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '10px' }}>
              Time is running out — decide now!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Pip({ label, positive }: { label: string; positive: boolean }) {
  return (
    <span style={{
      fontSize: '11px',
      color: positive ? '#4ade80' : '#f87171',
      background: positive ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
      padding: '2px 8px', borderRadius: '10px'
    }}>
      {label}
    </span>
  );
}
