import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface GratitudeEntry {
  tick: number;
  text: string;
  icon: string;
}

export default function GratitudeLog() {
  const { myPlayer, room } = useGameStore();
  const entries = useRef<GratitudeEntry[]>([]);
  const lastCheck = useRef(0);

  if (!myPlayer || !room) return null;

  const tick = room.tick;
  const state = myPlayer.state;

  if (tick - lastCheck.current >= 120) {
    const newEntries: GratitudeEntry[] = [];

    if (state.receivedHelpCount > 0 && entries.current.every(e => !e.text.includes('received help'))) {
      newEntries.push({
        tick,
        text: `Someone helped you — ${state.receivedHelpCount} time${state.receivedHelpCount > 1 ? 's' : ''}`,
        icon: '🙏'
      });
    }

    if (state.health > 60 && state.energy > 40 && entries.current.every(e => !e.text.includes('reasonable health'))) {
      newEntries.push({ tick, text: 'You have reasonable health and energy', icon: '💚' });
    }

    if (state.cash >= 50 && entries.current.every(e => !e.text.includes('enough to eat'))) {
      newEntries.push({ tick, text: 'You have enough to eat today', icon: '🍛' });
    }

    if (myPlayer.socialTrust >= 55 && entries.current.every(e => !e.text.includes('people trust'))) {
      newEntries.push({ tick, text: 'People trust you in this community', icon: '💛' });
    }

    if (state.helpedOthersCount >= 3 && entries.current.every(e => !e.text.includes('made a difference'))) {
      newEntries.push({ tick, text: 'You\'ve made a difference in others\' lives', icon: '✨' });
    }

    entries.current.push(...newEntries);
    if (entries.current.length > 10) entries.current = entries.current.slice(-10);
    lastCheck.current = tick;
  }

  if (entries.current.length === 0) return null;

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'rgba(245,200,66,0.04)',
      border: '1px solid rgba(245,200,66,0.12)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
      }}>
        Things to Be Grateful For
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[...entries.current].reverse().slice(0, 5).map((entry, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '10px', color: 'var(--text-secondary)',
            opacity: 1 - i * 0.12
          }}>
            <span style={{ fontSize: '12px' }}>{entry.icon}</span>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}
