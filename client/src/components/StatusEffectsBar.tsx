import { useGameStore } from '../store/gameStore';

interface StatusEffect {
  id: string;
  icon: string;
  label: string;
  color: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export default function StatusEffectsBar() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const effects: StatusEffect[] = [];
  const state = myPlayer.state;
  const tick = room.tick;
  const isNight = tick > 0 && ((tick % 600) > 400);

  const activeEvents = room.cityEvents.filter(e =>
    e.startTick + e.duration > tick &&
    (e.affectedLocations.includes('all') || e.affectedLocations.includes(state.location))
  );

  const hasWeather = activeEvents.some(e => e.type === 'weather');
  const hasHeat = activeEvents.some(e => e.type === 'heat');
  const hasCrowd = activeEvents.some(e => e.type === 'crowd');
  const hasEmergency = activeEvents.some(e => e.type === 'emergency');

  if (hasWeather) {
    effects.push({ id: 'rain', icon: '🌧️', label: 'Rain', color: '#3b82f6', severity: 'moderate' });
  }
  if (hasHeat) {
    effects.push({ id: 'heat', icon: '🥵', label: 'Heat wave', color: '#ef4444', severity: 'moderate' });
  }
  if (hasCrowd) {
    effects.push({ id: 'crowd', icon: '👥', label: 'Crowded', color: '#f59e0b', severity: 'mild' });
  }
  if (hasEmergency) {
    effects.push({ id: 'emergency', icon: '🚨', label: 'Emergency', color: '#ef4444', severity: 'severe' });
  }
  if (isNight) {
    effects.push({ id: 'night', icon: '🌙', label: 'Nighttime', color: '#6366f1', severity: 'mild' });
  }

  if (state.hunger > 80) {
    effects.push({
      id: 'starving', icon: '🍽️',
      label: state.hunger > 95 ? 'Starving' : 'Very hungry',
      color: '#ef4444',
      severity: state.hunger > 95 ? 'severe' : 'moderate'
    });
  }
  if (state.hydration > 75) {
    effects.push({
      id: 'dehydrated', icon: '💧',
      label: state.hydration > 90 ? 'Dehydrated' : 'Thirsty',
      color: '#3b82f6',
      severity: state.hydration > 90 ? 'severe' : 'moderate'
    });
  }
  if (state.energy < 20) {
    effects.push({ id: 'exhausted', icon: '😵', label: 'Exhausted', color: '#f59e0b', severity: 'moderate' });
  }
  if (state.stress > 70) {
    effects.push({
      id: 'stressed', icon: '😰',
      label: state.stress > 90 ? 'Overwhelmed' : 'Stressed',
      color: '#ef4444',
      severity: state.stress > 90 ? 'severe' : 'moderate'
    });
  }
  if (state.health < 30) {
    effects.push({
      id: 'injured', icon: '🩹',
      label: state.health < 15 ? 'Critical' : 'Unwell',
      color: '#ef4444',
      severity: state.health < 15 ? 'severe' : 'moderate'
    });
  }
  if (state.mood < 25) {
    effects.push({ id: 'depressed', icon: '😞', label: 'Low morale', color: '#8b5cf6', severity: 'moderate' });
  }
  if (state.overeatingPenalty > 10) {
    effects.push({ id: 'overate', icon: '🤢', label: 'Overfull', color: '#f59e0b', severity: 'mild' });
  }

  if (effects.length === 0) return null;

  const severityBorder: Record<string, string> = {
    mild: 'rgba(255,255,255,0.08)',
    moderate: 'rgba(245,200,66,0.2)',
    severe: 'rgba(239,68,68,0.3)',
  };

  return (
    <div style={{
      display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '4px 0'
    }}>
      {effects.map(fx => (
        <div key={fx.id} style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          padding: '2px 8px', borderRadius: '12px',
          background: `${fx.color}12`,
          border: `1px solid ${severityBorder[fx.severity]}`,
          fontSize: '10px', fontWeight: 600,
          color: fx.color,
          animation: fx.severity === 'severe' ? 'pulse 2s infinite' : undefined
        }}
          title={`${fx.label} — ${fx.severity} severity`}
        >
          <span style={{ fontSize: '11px' }}>{fx.icon}</span>
          {fx.label}
        </div>
      ))}
    </div>
  );
}
