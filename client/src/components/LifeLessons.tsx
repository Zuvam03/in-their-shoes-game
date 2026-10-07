import { useGameStore } from '../store/gameStore';

interface Lesson {
  icon: string;
  title: string;
  insight: string;
  category: string;
}

export default function LifeLessons() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const dayNum = Math.floor(room.tick / 600) + 1;
  const lessons: Lesson[] = [];

  if (state.helpedOthersCount >= 1) {
    lessons.push({
      icon: '🤝', title: 'Power of Kindness', category: 'Social',
      insight: 'Helping others strengthens the entire community, not just the person you help.'
    });
  }
  if (state.receivedHelpCount >= 1) {
    lessons.push({
      icon: '🙏', title: 'Accepting Help', category: 'Growth',
      insight: 'Receiving help is not weakness — it builds bonds and creates mutual obligation.'
    });
  }
  if (state.cash < 10 && dayNum >= 2) {
    lessons.push({
      icon: '💸', title: 'Poverty Trap', category: 'Economics',
      insight: 'Without savings, every crisis becomes an emergency. Financial buffers save lives.'
    });
  }
  if (state.health < 30) {
    lessons.push({
      icon: '🏥', title: 'Health as Wealth', category: 'Survival',
      insight: 'When health fails, everything else follows. Prevention is cheaper than cure.'
    });
  }
  if (myPlayer.socialTrust >= 50) {
    lessons.push({
      icon: '⭐', title: 'Trust as Currency', category: 'Social',
      insight: 'In communities without banks, trust IS the currency. Reputation opens doors.'
    });
  }
  if (state.stress > 60) {
    lessons.push({
      icon: '😰', title: 'Invisible Burden', category: 'Mental Health',
      insight: 'Chronic stress impairs decision-making. The poor face constant cognitive load.'
    });
  }
  if (dayNum >= 3) {
    lessons.push({
      icon: '📅', title: 'Daily Grind', category: 'Reality',
      insight: 'Survival is not a one-day challenge. The real test is doing it again tomorrow.'
    });
  }
  if (myPlayer.communityImpact >= 5) {
    lessons.push({
      icon: '🌊', title: 'Ripple Effect', category: 'Impact',
      insight: 'Individual actions shape the community. Small consistent acts create big change.'
    });
  }

  if (lessons.length === 0) {
    lessons.push({
      icon: '🌱', title: 'Beginning', category: 'Journey',
      insight: 'Every journey starts with a single step. Keep exploring to discover life lessons.'
    });
  }

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Life Lessons Learned
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {lessons.map((lesson, i) => (
          <div key={i} style={{
            padding: '8px', borderRadius: '8px',
            background: 'rgba(0,0,0,0.12)',
            borderLeft: '3px solid var(--accent-purple)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px'
            }}>
              <span style={{ fontSize: '14px' }}>{lesson.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-purple)' }}>
                {lesson.title}
              </span>
              <span style={{
                fontSize: '8px', padding: '1px 4px', borderRadius: '4px',
                background: 'rgba(168,85,247,0.1)', color: 'var(--accent-purple)',
                marginLeft: 'auto'
              }}>
                {lesson.category}
              </span>
            </div>
            <div style={{
              fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5
            }}>
              {lesson.insight}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
