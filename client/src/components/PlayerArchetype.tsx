import { useGameStore, PersonaTraits } from '../store/gameStore';

interface Archetype {
  name: string;
  icon: string;
  description: string;
  color: string;
}

function determineArchetype(
  helped: number,
  received: number,
  trust: number,
  impact: number,
  cash: number,
  traits: PersonaTraits
): Archetype {
  if (helped >= 5 && trust >= 60 && impact >= 10) {
    return {
      name: 'The Guardian',
      icon: '🛡️',
      description: 'A protector of the community who puts others first',
      color: 'var(--accent-green)'
    };
  }

  if (cash >= 150 && traits.workOrientation >= 7) {
    return {
      name: 'The Enterpriser',
      icon: '💼',
      description: 'A resourceful survivor who builds economic stability',
      color: 'var(--accent-yellow)'
    };
  }

  if (helped >= 3 && traits.emotionalSensitivity >= 7) {
    return {
      name: 'The Empath',
      icon: '💙',
      description: 'Someone who feels deeply and acts on compassion',
      color: 'var(--accent-blue)'
    };
  }

  if (traits.analyticalThinking >= 7 && traits.adaptability >= 7) {
    return {
      name: 'The Strategist',
      icon: '🧠',
      description: 'A careful planner who thinks before acting',
      color: 'var(--accent-purple)'
    };
  }

  if (traits.resilience >= 8 && trust >= 50) {
    return {
      name: 'The Survivor',
      icon: '💪',
      description: 'Endures everything and never gives up',
      color: 'var(--accent-orange)'
    };
  }

  if (traits.socialOrientation >= 7 && helped >= 2) {
    return {
      name: 'The Connector',
      icon: '🔗',
      description: 'A social bridge who brings people together',
      color: 'var(--accent-blue)'
    };
  }

  if (traits.riskTolerance >= 7) {
    return {
      name: 'The Adventurer',
      icon: '🌟',
      description: 'Bold and willing to take chances for a better life',
      color: 'var(--accent-yellow)'
    };
  }

  return {
    name: 'The Wanderer',
    icon: '🚶',
    description: 'Finding their path in the city, one step at a time',
    color: 'var(--text-muted)'
  };
}

export default function PlayerArchetype() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const archetype = determineArchetype(
    myPlayer.state.helpedOthersCount,
    myPlayer.state.receivedHelpCount,
    myPlayer.socialTrust,
    myPlayer.communityImpact,
    myPlayer.state.cash,
    myPlayer.persona.traits
  );

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${archetype.color} 5%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${archetype.color} 15%, transparent)`
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
      }}>
        Your Archetype
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <span style={{ fontSize: '28px' }}>{archetype.icon}</span>
        <div>
          <div style={{
            fontSize: '14px', fontWeight: 700, color: archetype.color,
            marginBottom: '2px'
          }}>
            {archetype.name}
          </div>
          <div style={{
            fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4
          }}>
            {archetype.description}
          </div>
        </div>
      </div>
    </div>
  );
}
