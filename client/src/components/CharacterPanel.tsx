import { useGameStore } from '../store/gameStore';

const TRAIT_LABELS: Record<string, string> = {
  analyticalThinking: 'Analytical', emotionalSensitivity: 'Empathy',
  appetite: 'Appetite', workOrientation: 'Work Drive',
  spendingStyle: 'Spending', socialOrientation: 'Social',
  riskTolerance: 'Risk', resilience: 'Resilience',
  adaptability: 'Adaptability', cooperation: 'Cooperation'
};

const MOTIVATION_LABELS: Record<string, string> = {
  careerAdvancement: 'Career', financialSecurity: 'Financial Security',
  socialAcceptance: 'Social Acceptance', personalIndependence: 'Independence',
  familyResponsibility: 'Family', fairness: 'Fairness',
  helpingOthers: 'Helping Others', achievement: 'Achievement', comfort: 'Comfort'
};

export default function CharacterPanel() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const persona = myPlayer.persona;
  const state = myPlayer.state;

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Identity */}
      <div style={{
        padding: '12px', borderRadius: '10px',
        background: 'rgba(245,200,66,0.05)',
        border: '1px solid rgba(245,200,66,0.2)'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--accent-yellow)', fontSize: '14px' }}>
          {persona.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {persona.title}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
          {persona.description}
        </div>
      </div>

      {/* Trait interactions */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Key Traits
        </div>
        {persona.traitInteractions?.map((ti, i) => (
          <div key={i} style={{
            fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px',
            paddingLeft: '8px', borderLeft: '2px solid rgba(245,200,66,0.3)'
          }}>
            {ti}
          </div>
        ))}
      </div>

      {/* Personality Traits */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Personality Traits
        </div>
        {Object.entries(persona.traits).map(([key, val]) => (
          <div key={key} style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{TRAIT_LABELS[key] || key}</span>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>{val}/10</span>
            </div>
            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${(val as number) * 10}%`,
                background: `hsl(${(val as number) * 12}deg 65% 50%)`
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Motivations */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Motivations
        </div>
        {Object.entries(persona.motivations)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 5)
          .map(([key, val]) => (
            <div key={key} style={{ marginBottom: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{MOTIVATION_LABELS[key] || key}</span>
                <span style={{ fontSize: '11px', fontWeight: 600 }}>{val}/10</span>
              </div>
              <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${(val as number) * 10}%`,
                  background: 'var(--accent-purple)'
                }} />
              </div>
            </div>
          ))}
      </div>

      {/* Social status */}
      <div style={{
        padding: '10px', borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Social Trust</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '16px' }}>
            {myPlayer.socialTrust}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Community Impact</div>
          <div style={{
            fontWeight: 700, fontSize: '16px',
            color: myPlayer.communityImpact >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
          }}>
            {myPlayer.communityImpact >= 0 ? '+' : ''}{myPlayer.communityImpact}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Helped Others</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '16px' }}>
            {state.helpedOthersCount}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Received Help</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '16px' }}>
            {state.receivedHelpCount}
          </div>
        </div>
      </div>
    </div>
  );
}
