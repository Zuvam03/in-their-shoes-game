import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

type Phase = 'fade' | 'cause' | 'narrative' | 'dependents' | 'unfinished' | 'watching';

export default function DeathScreen() {
  const { deathNarrative, myPlayer, room } = useGameStore();
  const [phase, setPhase] = useState<Phase>('fade');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!deathNarrative) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('cause'), 2000));
    timers.push(setTimeout(() => setPhase('narrative'), 4500));
    timers.push(setTimeout(() => setPhase('dependents'), 10000));
    timers.push(setTimeout(() => setPhase('unfinished'), 16000));
    timers.push(setTimeout(() => setPhase('watching'), 22000));
    return () => timers.forEach(clearTimeout);
  }, [deathNarrative]);

  // Typewriter for the narrative text
  useEffect(() => {
    if (phase !== 'narrative' || !deathNarrative) return;
    setCharIndex(0);
    const text = deathNarrative.narrative.finalMoments;
    const timer = setInterval(() => {
      setCharIndex(prev => {
        if (prev >= text.length) { clearInterval(timer); return prev; }
        return prev + 1;
      });
    }, 35);
    return () => clearInterval(timer);
  }, [phase, deathNarrative]);

  if (!deathNarrative || !myPlayer) return null;

  const { narrative } = deathNarrative;
  const phaseOrder: Phase[] = ['fade', 'cause', 'narrative', 'dependents', 'unfinished', 'watching'];
  const phaseIdx = phaseOrder.indexOf(phase);

  const timeLeft = room ? Math.max(0, room.matchDuration - room.tick) : 0;
  const timeMin = Math.floor(timeLeft / 60);
  const timeSec = timeLeft % 60;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: phase === 'fade' ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.92)',
      transition: 'background 2s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', 'Literata', serif"
    }}>
      <div style={{
        maxWidth: '600px', width: '100%', padding: '32px 24px',
        textAlign: 'center', color: '#e8e4dc'
      }}>
        {/* Cause of death */}
        <div style={{
          opacity: phaseIdx >= 1 ? 1 : 0,
          transform: phaseIdx >= 1 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1.5s ease',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '48px', height: '1px',
            background: '#c45d2c', margin: '0 auto 20px'
          }} />
          <h2 style={{
            fontSize: '14px', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#8a8578',
            fontFamily: "'system-ui', sans-serif", fontWeight: 600,
            margin: '0 0 12px'
          }}>
            {myPlayer.persona.title}
          </h2>
          <h1 style={{
            fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 400,
            margin: '0 0 8px', fontStyle: 'italic',
            color: '#c45d2c', lineHeight: 1.4
          }}>
            {narrative.cause}
          </h1>
        </div>

        {/* Narrative — typewriter */}
        <div style={{
          opacity: phaseIdx >= 2 ? 1 : 0,
          transition: 'opacity 1s ease',
          marginBottom: '36px'
        }}>
          <p style={{
            fontSize: '15px', lineHeight: 1.8,
            color: '#b8b0a0', margin: 0,
            fontStyle: 'italic', textWrap: 'balance'
          }}>
            {phase === 'narrative' || phaseIdx > 2
              ? (phaseIdx > 2
                ? narrative.finalMoments
                : narrative.finalMoments.slice(0, charIndex))
              : ''}
            {phase === 'narrative' && charIndex < narrative.finalMoments.length && (
              <span style={{ opacity: 0.5, animation: 'blink 0.8s infinite' }}>|</span>
            )}
          </p>
        </div>

        {/* Dependents */}
        <div style={{
          opacity: phaseIdx >= 3 ? 1 : 0,
          transform: phaseIdx >= 3 ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 1.2s ease',
          marginBottom: '32px'
        }}>
          <h3 style={{
            fontSize: '12px', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#6b6358',
            fontFamily: "'system-ui', sans-serif", fontWeight: 600,
            margin: '0 0 16px'
          }}>
            Who depended on them
          </h3>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '8px',
            alignItems: 'center'
          }}>
            {narrative.dependents.map((dep, i) => (
              <div key={i} style={{
                opacity: phaseIdx >= 3 ? 1 : 0,
                transition: `opacity 0.8s ease ${i * 0.4}s`,
                fontSize: '14px', color: '#9a9080',
                lineHeight: 1.6, maxWidth: '450px',
                padding: '8px 16px',
                borderLeft: '2px solid #3a2a1a',
                textAlign: 'left'
              }}>
                {dep}
              </div>
            ))}
          </div>
        </div>

        {/* Unfinished business */}
        <div style={{
          opacity: phaseIdx >= 4 ? 1 : 0,
          transform: phaseIdx >= 4 ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 1.2s ease',
          marginBottom: '36px'
        }}>
          {narrative.unfinishedBusiness.length > 0 && (
            <>
              <h3 style={{
                fontSize: '12px', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#6b6358',
                fontFamily: "'system-ui', sans-serif", fontWeight: 600,
                margin: '0 0 12px'
              }}>
                What they left behind
              </h3>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '6px',
                alignItems: 'center'
              }}>
                {narrative.unfinishedBusiness.map((item, i) => (
                  <div key={i} style={{
                    fontSize: '13px', color: '#7a7060',
                    lineHeight: 1.5, fontStyle: 'italic'
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Spectate message */}
        <div style={{
          opacity: phaseIdx >= 5 ? 1 : 0,
          transition: 'opacity 1.5s ease',
          borderTop: '1px solid #2a2520',
          paddingTop: '24px'
        }}>
          <p style={{
            fontSize: '13px', color: '#6b6358',
            fontFamily: "'system-ui', sans-serif",
            margin: '0 0 8px'
          }}>
            The match continues. Others are still walking.
          </p>
          <p style={{
            fontSize: '12px', color: '#4a4540',
            fontFamily: "'system-ui', sans-serif", margin: 0
          }}>
            Time remaining: {timeMin}:{timeSec.toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
