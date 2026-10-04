import { useGameStore, PersonaTraits } from '../store/gameStore';

interface DynamicInsight {
  trait: string;
  value: number;
  effect: string;
  icon: string;
  positive: boolean;
}

function analyzeTraits(traits: PersonaTraits): DynamicInsight[] {
  const insights: DynamicInsight[] = [];

  if (traits.cooperation >= 7) {
    insights.push({ trait: 'Cooperation', value: traits.cooperation, effect: 'Help actions cost less energy', icon: '🤝', positive: true });
  } else if (traits.cooperation <= 3) {
    insights.push({ trait: 'Cooperation', value: traits.cooperation, effect: 'Self-reliant, but help is less effective', icon: '🐺', positive: false });
  }

  if (traits.emotionalSensitivity >= 7) {
    insights.push({ trait: 'Empathy', value: traits.emotionalSensitivity, effect: 'Gain more trust from helping others', icon: '💚', positive: true });
  }

  if (traits.riskTolerance >= 7) {
    insights.push({ trait: 'Risk', value: traits.riskTolerance, effect: 'Higher rewards but steeper consequences', icon: '🎲', positive: true });
  } else if (traits.riskTolerance <= 3) {
    insights.push({ trait: 'Risk', value: traits.riskTolerance, effect: 'Safer choices with moderate returns', icon: '🛡️', positive: true });
  }

  if (traits.resilience >= 7) {
    insights.push({ trait: 'Resilience', value: traits.resilience, effect: 'Recover faster from setbacks', icon: '💪', positive: true });
  } else if (traits.resilience <= 3) {
    insights.push({ trait: 'Resilience', value: traits.resilience, effect: 'Stress builds faster under pressure', icon: '😰', positive: false });
  }

  if (traits.spendingStyle >= 7) {
    insights.push({ trait: 'Spending', value: traits.spendingStyle, effect: 'Comfortable spending but burns cash fast', icon: '💸', positive: false });
  } else if (traits.spendingStyle <= 3) {
    insights.push({ trait: 'Spending', value: traits.spendingStyle, effect: 'Frugal nature preserves your cash', icon: '🏦', positive: true });
  }

  if (traits.workOrientation >= 7) {
    insights.push({ trait: 'Work Drive', value: traits.workOrientation, effect: 'Earn more per work action', icon: '💼', positive: true });
  }

  if (traits.appetite >= 7) {
    insights.push({ trait: 'Appetite', value: traits.appetite, effect: 'Hunger builds faster', icon: '🍛', positive: false });
  }

  if (traits.adaptability >= 7) {
    insights.push({ trait: 'Adaptability', value: traits.adaptability, effect: 'Handle city events better', icon: '🌊', positive: true });
  }

  return insights.slice(0, 5);
}

export default function SocialDynamics() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const insights = analyzeTraits(myPlayer.persona.traits);
  if (insights.length === 0) return null;

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      marginBottom: '10px'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Trait Effects
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {insights.map((insight, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 8px', borderRadius: '6px',
            background: insight.positive ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)'
          }}>
            <span style={{ fontSize: '14px', flexShrink: 0 }}>{insight.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                marginBottom: '1px'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {insight.trait}
                </span>
                <span style={{
                  fontSize: '9px', fontWeight: 700,
                  color: insight.positive ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  {insight.value}/10
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {insight.effect}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
