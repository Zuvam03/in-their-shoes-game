import { useGameStore } from '../store/gameStore';

export default function EmpathyMap() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const persona = myPlayer.persona;

  const quadrants = [
    {
      label: 'THINKS',
      icon: '💭',
      items: [
        state.cash < 30 ? '"How will I afford food tomorrow?"' :
          state.cash > 100 ? '"I have some security for now"' :
            '"I need to be careful with money"',
        persona.traits.analyticalThinking >= 7
          ? '"I should plan my next steps carefully"'
          : '"I just need to get through today"',
      ],
      color: 'var(--accent-blue)',
    },
    {
      label: 'FEELS',
      icon: '❤️',
      items: [
        state.mood > 60 ? 'Hopeful despite challenges' :
          state.mood > 30 ? 'Uncertain about the future' :
            'Overwhelmed by circumstances',
        state.stress > 60 ? 'Anxious and tense' :
          state.helpedOthersCount >= 2 ? 'Warmth from helping others' :
            'Isolated and alone',
      ],
      color: 'var(--accent-red)',
    },
    {
      label: 'SAYS',
      icon: '💬',
      items: [
        myPlayer.socialTrust >= 60 ? '"We can help each other"' :
          myPlayer.socialTrust >= 40 ? '"I\'m doing okay"' :
            '"I don\'t need anyone"',
        state.helpedOthersCount >= 3 ? '"Let me help you with that"' :
          '"Just trying to get by"',
      ],
      color: 'var(--accent-green)',
    },
    {
      label: 'DOES',
      icon: '🏃',
      items: [
        state.helpedOthersCount >= 2 ? 'Reaches out to help neighbors' :
          'Focuses on personal survival',
        state.energy > 50 ? 'Actively seeking work and food' :
          'Conserving energy, moving carefully',
      ],
      color: 'var(--accent-yellow)',
    },
  ];

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Empathy Map — {persona.name}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px'
      }}>
        {quadrants.map(q => (
          <div key={q.label} style={{
            padding: '6px 8px', borderRadius: '6px',
            background: `color-mix(in srgb, ${q.color} 5%, transparent)`,
            borderTop: `2px solid ${q.color}`
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px'
            }}>
              <span style={{ fontSize: '10px' }}>{q.icon}</span>
              <span style={{
                fontSize: '9px', fontWeight: 700, color: q.color,
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {q.label}
              </span>
            </div>
            {q.items.map((item, i) => (
              <div key={i} style={{
                fontSize: '9px', color: 'var(--text-secondary)',
                marginBottom: '3px', lineHeight: 1.4,
                fontStyle: item.startsWith('"') ? 'italic' : 'normal'
              }}>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
