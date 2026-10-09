import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export default function ResilienceTracker() {
  const { myPlayer, room } = useGameStore();
  const crisisCount = useRef(0);
  const recoveryCount = useRef(0);
  const wasCritical = useRef(false);

  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const isCritical = state.health < 25 || state.energy < 10 || state.hunger > 85 || state.hydration > 85;

  if (isCritical && !wasCritical.current) {
    crisisCount.current++;
  }
  if (!isCritical && wasCritical.current) {
    recoveryCount.current++;
  }
  wasCritical.current = isCritical;

  const resilienceScore = Math.min(100, Math.round(
    (myPlayer.persona.traits.resilience * 8) +
    (recoveryCount.current * 10) +
    (myPlayer.persona.traits.adaptability * 3) -
    (Math.max(0, crisisCount.current - recoveryCount.current) * 5)
  ));

  const level = resilienceScore >= 80 ? { label: 'Unbreakable', color: 'var(--accent-green)', icon: '🛡️' }
    : resilienceScore >= 60 ? { label: 'Resilient', color: 'var(--accent-blue)', icon: '💪' }
      : resilienceScore >= 40 ? { label: 'Enduring', color: 'var(--accent-yellow)', icon: '🌿' }
        : resilienceScore >= 20 ? { label: 'Struggling', color: 'var(--accent-orange)', icon: '🥀' }
          : { label: 'Fragile', color: 'var(--accent-red)', icon: '💔' };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${level.color} 4%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${level.color} 15%, transparent)`
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '6px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Resilience
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '13px' }}>{level.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: level.color }}>
            {level.label}
          </span>
        </div>
      </div>

      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', marginBottom: '8px' }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          width: `${resilienceScore}%`,
          background: `linear-gradient(90deg, var(--accent-red), ${level.color})`,
          transition: 'width 0.5s ease'
        }} />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
        fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent-orange)' }}>
            {crisisCount.current}
          </div>
          Crises
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent-green)' }}>
            {recoveryCount.current}
          </div>
          Recoveries
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '13px', color: level.color }}>
            {resilienceScore}
          </div>
          Score
        </div>
      </div>
    </div>
  );
}
