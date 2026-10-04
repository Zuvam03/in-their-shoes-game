import { useState, useEffect } from 'react';

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Kolkata City Survival',
    content: 'You\'ve been assigned a unique persona with different traits, strengths, and vulnerabilities. Your experience of the city will be shaped by who you are.',
    icon: '🏙️',
    highlight: 'persona'
  },
  {
    title: 'Navigate the Map',
    content: 'Click locations on the map to travel. Each move costs energy and sometimes cash depending on transport mode. Walk is free but tiring.',
    icon: '🗺️',
    highlight: 'map'
  },
  {
    title: 'Manage Your Needs',
    content: 'Watch your hunger, hydration, energy, and health bars. Hunger and thirst increase over time — eat and drink before they get critical.',
    icon: '❤️',
    highlight: 'stats'
  },
  {
    title: 'Complete Your Mission',
    content: 'You have objectives to complete at specific locations. Check the Mission tab to see what\'s required and where to go.',
    icon: '🎯',
    highlight: 'mission'
  },
  {
    title: 'Interact with Players',
    content: 'Help other players, share information, or transfer money. Cooperation builds social trust and community impact — both affect your score.',
    icon: '🤝',
    highlight: 'players'
  },
  {
    title: 'Respond to Events',
    content: 'City events and social dilemmas will appear. Your choices have real consequences and reveal different perspectives based on your persona.',
    icon: '⚡',
    highlight: 'events'
  },
  {
    title: 'Keyboard Shortcuts',
    content: 'Press 1-6 to switch tabs quickly. Use the settings gear for volume control and more shortcuts.',
    icon: '⌨️',
    highlight: 'shortcuts'
  }
];

const STORAGE_KEY = 'its_tutorial_seen';

export default function TutorialOverlay() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {}
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  if (!visible) return null;

  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 950,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="slide-up" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '28px',
        maxWidth: '440px', width: '90%',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Progress dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '6px',
          marginBottom: '20px'
        }}>
          {TUTORIAL_STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? '20px' : '6px', height: '6px',
              borderRadius: '3px',
              background: i === step ? 'var(--accent-yellow)' : i < step ? 'var(--accent-green)' : 'var(--border)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ textAlign: 'center', fontSize: '40px', marginBottom: '16px' }}>
          {current.icon}
        </div>

        {/* Content */}
        <h3 style={{
          textAlign: 'center', fontSize: '18px', fontWeight: 700,
          marginBottom: '10px', color: 'var(--accent-yellow)'
        }}>
          {current.title}
        </h3>
        <p style={{
          textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)',
          lineHeight: 1.7, marginBottom: '24px'
        }}>
          {current.content}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={dismiss} style={{
            flex: 1, padding: '10px', borderRadius: '8px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: '13px'
          }}>
            Skip Tutorial
          </button>
          {isLast ? (
            <button onClick={dismiss} style={{
              flex: 2, padding: '10px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #f5c842, #f97316)',
              color: '#000', fontWeight: 700, fontSize: '13px'
            }}>
              Start Playing
            </button>
          ) : (
            <button onClick={() => setStep(s => s + 1)} style={{
              flex: 2, padding: '10px', borderRadius: '8px',
              background: 'var(--accent-blue)',
              color: '#fff', fontWeight: 700, fontSize: '13px'
            }}>
              Next ({step + 1}/{TUTORIAL_STEPS.length})
            </button>
          )}
        </div>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{
            width: '100%', marginTop: '8px', padding: '6px',
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)', fontSize: '12px'
          }}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
