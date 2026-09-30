import { useGameStore } from '../store/gameStore';

export default function CityEventModal() {
  const { pendingCityEvent, respondToEvent } = useGameStore();
  if (!pendingCityEvent) return null;

  const eventTypeIcons: Record<string, string> = {
    weather: '🌧️',
    transport_disruption: '🚧',
    opportunity: '💼',
    npc_request: '🧑',
    crowd: '👥',
    emergency: '🚨'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '20px'
    }}>
      <div style={{
        maxWidth: '420px', width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px', padding: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
      }} className="slide-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>
            {eventTypeIcons[pendingCityEvent.type] || '🌆'}
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>{pendingCityEvent.title}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              City Event
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
          {pendingCityEvent.description}
        </p>

        {pendingCityEvent.choices && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingCityEvent.choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => respondToEvent(pendingCityEvent.id, choice.id)}
                style={{
                  padding: '12px 16px', borderRadius: '10px', textAlign: 'left',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '13px', lineHeight: 1.5,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-active)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                }}
              >
                <div style={{ marginBottom: '4px' }}>→ {choice.text}</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {choice.effects.map((effect, i) => (
                    <span key={i} style={{
                      fontSize: '11px',
                      color: effect.change > 0 ? 'var(--accent-green)' : effect.change < 0 ? 'var(--accent-red)' : 'var(--text-muted)',
                      background: effect.change > 0 ? 'rgba(34,197,94,0.1)' : effect.change < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(139,146,168,0.1)',
                      padding: '1px 6px', borderRadius: '10px'
                    }}>
                      {effect.stat} {effect.change > 0 ? '+' : ''}{effect.change}
                    </span>
                  ))}
                  {choice.karmaEffect !== 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--accent-purple)', background: 'rgba(168,85,247,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
                      ✦ karma {choice.karmaEffect > 0 ? '+' : ''}{choice.karmaEffect}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
