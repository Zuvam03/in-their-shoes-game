import { useState, useEffect } from 'react';
import { useGameStore, PersonaDefinition, CharacterState } from '../store/gameStore';

const INSIGHT_INTERVAL = 45000;

function generateInsight(
  persona: PersonaDefinition,
  state: CharacterState,
  helpedCount: number,
  socialTrust: number
): string | null {
  const insights: string[] = [];

  if (persona.socialContext?.insightLines) {
    insights.push(...persona.socialContext.insightLines);
  }

  if (state.stress > 60 && persona.traits.resilience < 5) {
    insights.push(`${persona.name} isn't built for this kind of pressure — find ways to decompress.`);
  }
  if (state.stress > 60 && persona.traits.resilience >= 7) {
    insights.push(`Despite the stress, ${persona.name}'s resilience keeps them going.`);
  }

  if (state.hunger > 65 && persona.traits.appetite > 6) {
    insights.push(`${persona.name}'s strong appetite makes hunger hit harder — eating soon is critical.`);
  }

  if (state.energy < 25 && persona.traits.workOrientation > 7) {
    insights.push(`Even when exhausted, ${persona.name} feels guilty about not working.`);
  }

  if (state.cash < 20 && persona.traits.spendingStyle > 6) {
    insights.push(`Low funds are especially stressful for someone used to spending freely.`);
  }
  if (state.cash < 20 && persona.traits.spendingStyle <= 3) {
    insights.push(`${persona.name} is used to making do with little — they'll manage.`);
  }

  if (helpedCount > 2 && persona.traits.cooperation > 6) {
    insights.push(`Helping others comes naturally to ${persona.name}. The trust they've built is valuable.`);
  }

  if (socialTrust > 50 && persona.traits.socialOrientation > 6) {
    insights.push(`${persona.name}'s social nature has paid off — people respect them here.`);
  }

  if (state.mood < 30 && persona.traits.emotionalSensitivity > 6) {
    insights.push(`${persona.name} feels the weight of everything more deeply than most.`);
  }

  if (state.health < 40) {
    insights.push(`Health is slipping — ${persona.name} needs medical attention or rest.`);
  }

  if (insights.length === 0) return null;
  return insights[Math.floor(Math.random() * insights.length)];
}

export default function PersonaInsights() {
  const { myPlayer } = useGameStore();
  const [insight, setInsight] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!myPlayer) return;

    const show = () => {
      const text = generateInsight(
        myPlayer.persona,
        myPlayer.state,
        myPlayer.state.helpedOthersCount,
        myPlayer.socialTrust
      );
      if (text) {
        setInsight(text);
        setVisible(true);
        setTimeout(() => setVisible(false), 8000);
      }
    };

    const initial = setTimeout(show, 15000);
    const interval = setInterval(show, INSIGHT_INTERVAL);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [myPlayer?.persona.name]);

  if (!visible || !insight) return null;

  return (
    <div
      className="slide-up"
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 650,
        maxWidth: '360px',
        width: '90%',
        padding: '10px 14px',
        borderRadius: '10px',
        background: 'rgba(168,85,247,0.12)',
        border: '1px solid rgba(168,85,247,0.25)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none'
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>🎭</span>
      <div style={{
        fontSize: '11px', color: 'var(--text-secondary)',
        lineHeight: 1.5, fontStyle: 'italic'
      }}>
        {insight}
      </div>
    </div>
  );
}
