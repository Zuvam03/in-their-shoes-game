import { useGameStore, PersonaTraits, PersonaMotivations } from '../store/gameStore';

interface Strategy {
  icon: string;
  title: string;
  advice: string;
  priority: number;
}

function analyzeStrategy(
  traits: PersonaTraits,
  motivations: PersonaMotivations,
  state: { health: number; energy: number; hunger: number; hydration: number; mood: number; stress: number; cash: number },
  missionStatus: string,
  helpedCount: number,
  trust: number
): Strategy[] {
  const strategies: Strategy[] = [];

  if (motivations.financialSecurity >= 7 && state.cash < 30) {
    strategies.push({
      icon: '💰', title: 'Earn Priority',
      advice: 'Your persona values financial security — prioritize work to build savings',
      priority: 8
    });
  }

  if (motivations.helpingOthers >= 7 && helpedCount < 3 && state.energy > 40) {
    strategies.push({
      icon: '🤝', title: 'Help Others',
      advice: 'Your persona is driven to help — look for players who need assistance',
      priority: 7
    });
  }

  if (motivations.careerAdvancement >= 7 && missionStatus === 'active') {
    strategies.push({
      icon: '🎯', title: 'Mission Focus',
      advice: 'Career-driven persona — focus on completing mission objectives first',
      priority: 6
    });
  }

  if (traits.riskTolerance >= 7 && state.cash > 40) {
    strategies.push({
      icon: '🎲', title: 'Take Risks',
      advice: 'Your persona embraces risk — bold choices can yield bigger rewards',
      priority: 4
    });
  } else if (traits.riskTolerance <= 3) {
    strategies.push({
      icon: '🛡️', title: 'Play Safe',
      advice: 'Your persona prefers safety — keep reserves and avoid risky choices',
      priority: 4
    });
  }

  if (traits.cooperation >= 7 && trust < 40) {
    strategies.push({
      icon: '👥', title: 'Build Trust',
      advice: 'High cooperation trait — help others to build community trust faster',
      priority: 5
    });
  }

  if (traits.spendingStyle <= 3 && state.cash > 80) {
    strategies.push({
      icon: '🏦', title: 'Frugal Edge',
      advice: 'Your frugal nature is an advantage — maintain savings for emergencies',
      priority: 3
    });
  }

  if (motivations.familyResponsibility >= 7) {
    strategies.push({
      icon: '👨‍👩‍👧', title: 'Family First',
      advice: 'Keep yourself healthy — your persona has family depending on them',
      priority: 5
    });
  }

  if (traits.adaptability >= 7) {
    strategies.push({
      icon: '🌊', title: 'Adapt & Flow',
      advice: 'High adaptability — use city events as opportunities, not threats',
      priority: 3
    });
  }

  if (motivations.socialAcceptance >= 7 && trust < 50) {
    strategies.push({
      icon: '💬', title: 'Social Bridge',
      advice: 'Your persona craves acceptance — chat and share info to build connections',
      priority: 5
    });
  }

  return strategies.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

export default function StrategyAdvisor() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const strategies = analyzeStrategy(
    myPlayer.persona.traits,
    myPlayer.persona.motivations,
    myPlayer.state,
    myPlayer.mission.status,
    myPlayer.state.helpedOthersCount,
    myPlayer.socialTrust
  );

  if (strategies.length === 0) return null;

  return (
    <div style={{
      padding: '10px', borderRadius: '10px',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(168,85,247,0.04))',
      border: '1px solid rgba(59,130,246,0.15)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--accent-blue)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        🧭 Persona Strategy
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {strategies.map((s, i) => (
          <div key={i} style={{
            padding: '6px 8px', borderRadius: '6px',
            background: 'rgba(59,130,246,0.04)',
            display: 'flex', alignItems: 'flex-start', gap: '8px'
          }}>
            <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{s.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1px' }}>
                {s.title}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {s.advice}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
