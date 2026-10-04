import { useGameStore } from '../store/gameStore';

function getMoodState(mood: number, stress: number, energy: number) {
  const composite = mood * 0.5 + (100 - stress) * 0.3 + energy * 0.2;

  if (composite >= 75) return { label: 'Thriving', emoji: '🌟', color: '#22c55e', glow: 'rgba(34,197,94,0.3)' };
  if (composite >= 60) return { label: 'Content', emoji: '😊', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' };
  if (composite >= 45) return { label: 'Okay', emoji: '😐', color: '#f5c842', glow: 'rgba(245,200,66,0.3)' };
  if (composite >= 30) return { label: 'Struggling', emoji: '😟', color: '#f97316', glow: 'rgba(249,115,22,0.3)' };
  if (composite >= 15) return { label: 'Distressed', emoji: '😰', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' };
  return { label: 'Breaking', emoji: '😭', color: '#dc2626', glow: 'rgba(220,38,38,0.4)' };
}

export default function MoodRing() {
  const { myPlayer } = useGameStore();
  if (!myPlayer) return null;

  const { mood, stress, energy } = myPlayer.state;
  const moodState = getMoodState(mood, stress, energy);
  const composite = Math.round(mood * 0.5 + (100 - stress) * 0.3 + energy * 0.2);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 10px', borderRadius: '20px',
      background: `color-mix(in srgb, ${moodState.color} 8%, transparent)`,
      border: `1px solid color-mix(in srgb, ${moodState.color} 20%, transparent)`
    }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px',
        background: `radial-gradient(circle, ${moodState.glow}, transparent)`,
        boxShadow: `0 0 8px ${moodState.glow}`,
        animation: composite < 30 ? 'pulse 2s infinite' : undefined
      }}>
        {moodState.emoji}
      </div>
      <div>
        <div style={{
          fontSize: '11px', fontWeight: 700, color: moodState.color
        }}>
          {moodState.label}
        </div>
        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
          Wellbeing: {composite}
        </div>
      </div>
    </div>
  );
}
