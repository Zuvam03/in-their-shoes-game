import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface Consequence {
  tick: number;
  action: string;
  icon: string;
  effects: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export default function ChoiceConsequences() {
  const { myPlayer, room, notifications } = useGameStore();
  const consequences = useRef<Consequence[]>([]);
  const lastTick = useRef(0);

  if (!myPlayer || !room) return null;

  const tick = room.tick;
  const newNotifs = notifications.filter(
    n => n.playerId === myPlayer.id && n.tick > lastTick.current
  );

  for (const n of newNotifs) {
    const text = n.text.toLowerCase();
    let action = '';
    let icon = '';
    let sentiment: Consequence['sentiment'] = 'neutral';
    const effects: string[] = [];

    if (text.includes('helped')) {
      action = 'Helped someone';
      icon = '🤝';
      sentiment = 'positive';
      effects.push('Trust increased', 'Community impact +');
    } else if (text.includes('ate') || text.includes('food') || text.includes('eat')) {
      action = 'Ate food';
      icon = '🍛';
      sentiment = 'neutral';
      effects.push('Hunger reduced');
      if (myPlayer.state.cash < 20) effects.push('Funds getting low');
    } else if (text.includes('work')) {
      action = 'Worked';
      icon = '💼';
      sentiment = 'neutral';
      effects.push('Earned money', 'Energy spent');
    } else if (text.includes('dilemma')) {
      action = 'Moral choice';
      icon = '⚖️';
      sentiment = 'neutral';
      effects.push('Character defined');
    } else if (text.includes('rest')) {
      action = 'Rested';
      icon = '😴';
      sentiment = 'positive';
      effects.push('Energy restored');
    } else {
      continue;
    }

    consequences.current.push({ tick: n.tick, action, icon, effects, sentiment });
  }

  if (newNotifs.length > 0) lastTick.current = tick;
  if (consequences.current.length > 20) consequences.current = consequences.current.slice(-20);

  const recent = [...consequences.current].reverse().slice(0, 5);
  if (recent.length === 0) return null;

  const SENTIMENT_COLORS = {
    positive: 'var(--accent-green)',
    negative: 'var(--accent-red)',
    neutral: 'var(--accent-blue)',
  };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Choice Consequences
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {recent.map((c, i) => (
          <div key={i} style={{
            display: 'flex', gap: '8px', alignItems: 'flex-start',
            padding: '4px 6px', borderRadius: '6px',
            background: `color-mix(in srgb, ${SENTIMENT_COLORS[c.sentiment]} 4%, transparent)`,
            opacity: 1 - i * 0.12
          }}>
            <span style={{ fontSize: '14px', flexShrink: 0 }}>{c.icon}</span>
            <div>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                color: SENTIMENT_COLORS[c.sentiment]
              }}>
                {c.action}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                {c.effects.map((eff, j) => (
                  <span key={j} style={{
                    fontSize: '8px', padding: '1px 5px', borderRadius: '3px',
                    background: 'rgba(0,0,0,0.1)', color: 'var(--text-muted)'
                  }}>
                    {eff}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
