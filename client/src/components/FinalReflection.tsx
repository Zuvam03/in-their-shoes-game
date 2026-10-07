import { useGameStore } from '../store/gameStore';

export default function FinalReflection() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const totalTicks = room.matchDuration || 3600;
  const progress = room.tick / totalTicks;
  if (progress < 0.75) return null;

  const state = myPlayer.state;
  const reflections: string[] = [];

  if (state.helpedOthersCount >= 5) {
    reflections.push('You chose compassion over self-interest again and again. That takes real courage.');
  } else if (state.helpedOthersCount >= 2) {
    reflections.push('You helped when you could. Even small acts of kindness ripple outward.');
  } else {
    reflections.push('Survival demanded all your energy. When basic needs are unmet, altruism becomes a luxury.');
  }

  if (myPlayer.socialTrust >= 60) {
    reflections.push('You built genuine trust. In the real world, social capital is the safety net that money can\'t buy.');
  } else if (myPlayer.socialTrust >= 30) {
    reflections.push('Building trust takes time. Many urban poor spend years before the community truly accepts them.');
  }

  if (state.cash >= 100) {
    reflections.push('Financial stability gave you choices. For millions, having even this much is a distant dream.');
  } else if (state.cash < 20) {
    reflections.push('Living hand-to-mouth means every decision has life-or-death weight. There is no room for error.');
  }

  if (state.health > 70) {
    reflections.push('Good health is invisible wealth. Without it, nothing else matters.');
  }

  if (state.stress > 60) {
    reflections.push('Chronic stress isn\'t a character flaw — it\'s a natural response to impossible circumstances.');
  }

  const overallScore = Math.round(
    (state.health * 0.2)
    + ((100 - state.hunger) * 0.1)
    + (state.mood * 0.15)
    + (myPlayer.socialTrust * 0.2)
    + (Math.min(state.cash, 100) * 0.15)
    + (myPlayer.communityImpact * 2)
    + (state.helpedOthersCount * 5)
  );

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(59,130,246,0.08))',
      border: '1px solid rgba(168,85,247,0.2)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--accent-purple)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Final Reflection
      </div>

      <div style={{
        textAlign: 'center', marginBottom: '10px'
      }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
          Your Journey Score
        </div>
        <div style={{
          fontSize: '28px', fontWeight: 700,
          background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {overallScore}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {reflections.map((r, i) => (
          <div key={i} style={{
            fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.6,
            padding: '6px 8px', borderRadius: '6px',
            background: 'rgba(0,0,0,0.12)',
            borderLeft: '3px solid var(--accent-purple)'
          }}>
            {r}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)',
        textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6
      }}>
        "Walk a mile in someone else's shoes, and you'll never look at the world the same way."
      </div>
    </div>
  );
}
