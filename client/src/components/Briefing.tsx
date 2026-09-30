import { useGameStore } from '../store/gameStore';
import { getLocationById } from '../game/mapData';

export default function Briefing() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const persona = myPlayer.persona;
  const mission = myPlayer.mission;
  const startLocation = getLocationById(myPlayer.state.location);

  const traitLabels: Record<string, string> = {
    analyticalThinking: 'Analytical',
    emotionalSensitivity: 'Empathy',
    appetite: 'Appetite',
    workOrientation: 'Work Drive',
    spendingStyle: 'Spending',
    socialOrientation: 'Social',
    riskTolerance: 'Risk Tolerance',
    resilience: 'Resilience',
    adaptability: 'Adaptability',
    cooperation: 'Cooperation'
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '680px', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }} className="fade-in">
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Your Character
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
            {persona.name}
          </h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>{persona.title}</div>
        </div>

        <div style={{
          padding: '20px', borderRadius: '12px',
          background: 'var(--bg-card)', border: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{persona.backstory}</p>
        </div>

        {/* Traits */}
        <div style={{
          padding: '20px', borderRadius: '12px',
          background: 'var(--bg-card)', border: '1px solid var(--border)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>Character Traits</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.entries(persona.traits).map(([key, value]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {traitLabels[key] || key}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{value}/10</span>
                </div>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: `${(value as number) * 10}%`,
                    background: `hsl(${(value as number) * 12}deg 70% 50%)`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Vulnerabilities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{
            padding: '16px', borderRadius: '10px',
            background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--accent-green)', fontSize: '13px', marginBottom: '10px' }}>
              ✓ Strengths
            </div>
            {persona.strengths.map((s, i) => (
              <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                • {s}
              </div>
            ))}
          </div>
          <div style={{
            padding: '16px', borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--accent-red)', fontSize: '13px', marginBottom: '10px' }}>
              ⚠ Vulnerabilities
            </div>
            {persona.vulnerabilities.map((v, i) => (
              <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                • {v}
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div style={{
          padding: '20px', borderRadius: '12px',
          background: 'rgba(245, 200, 66, 0.05)', border: '1px solid rgba(245, 200, 66, 0.2)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Your Mission
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-yellow)', marginBottom: '10px' }}>
            {mission.definition.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
            {mission.definition.narrative}
          </p>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Objectives:</div>
          {mission.objectives.map(obj => (
            <div key={obj.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              marginBottom: '8px', padding: '8px', borderRadius: '6px',
              background: obj.optional ? 'rgba(139, 146, 168, 0.06)' : 'rgba(245, 200, 66, 0.06)'
            }}>
              <span style={{ marginTop: '1px' }}>{obj.optional ? '○' : '◉'}</span>
              <div>
                <div style={{ fontSize: '13px' }}>{obj.description}</div>
                {obj.optional && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Optional</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Starting info */}
        <div style={{
          padding: '14px 16px', borderRadius: '10px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-around'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Starting Location</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
              {startLocation?.name || myPlayer.state.location}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Starting Cash</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-green)' }}>₹{myPlayer.state.cash}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Energy</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-yellow)' }}>{myPlayer.state.energy}%</div>
          </div>
        </div>

        <div style={{
          textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px'
        }} className="pulse">
          Game starting in a moment...
        </div>
      </div>
    </div>
  );
}
