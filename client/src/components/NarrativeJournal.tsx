import { useGameStore } from '../store/gameStore';

const NARRATIVE_TEMPLATES: Record<string, (desc: string) => string> = {
  move: (d) => `You made your way to ${d.replace('Moved to ', '')}`,
  eat: (d) => `You found something to eat. ${d}`,
  drink: (d) => `You quenched your thirst. ${d}`,
  rest: (d) => `You paused to catch your breath. ${d}`,
  work: (d) => `You put in some work. ${d}`,
  buy: (d) => `You made a purchase. ${d}`,
  help_player: (d) => `You extended a helping hand. ${d}`,
  request_help: (d) => `You reached out for assistance. ${d}`,
  transfer_money: (d) => `You shared your resources. ${d}`,
  complete_objective: (d) => `A milestone achieved! ${d}`,
  dilemma_choice: (d) => `You faced a moral crossroads. ${d}`,
  city_event: (d) => `The city shifted around you. ${d}`,
};

function getTimeOfDay(tick: number): string {
  const dayPct = (tick % 600) / 600;
  if (dayPct < 0.15) return 'early morning';
  if (dayPct < 0.35) return 'morning';
  if (dayPct < 0.45) return 'midday';
  if (dayPct < 0.55) return 'afternoon';
  if (dayPct < 0.67) return 'evening';
  return 'night';
}

function getDayNumber(tick: number): number {
  return Math.floor(tick / 600) + 1;
}

export default function NarrativeJournal() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const events = myPlayer.actionLog.slice(-40).reverse();

  if (events.length === 0) {
    return (
      <div style={{
        padding: '20px', textAlign: 'center', color: 'var(--text-muted)',
        fontSize: '13px', fontStyle: 'italic'
      }}>
        Your story is waiting to be written...
      </div>
    );
  }

  let currentDay = -1;

  return (
    <div style={{ padding: '12px' }}>
      <div style={{
        fontSize: '14px', fontWeight: 700, color: 'var(--accent-yellow)',
        marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        📖 {myPlayer.persona.name}'s Journal
      </div>
      <div style={{
        fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px',
        fontStyle: 'italic'
      }}>
        {myPlayer.persona.title} — Kolkata
      </div>

      {events.map((event, i) => {
        const day = getDayNumber(event.tick);
        const timeOfDay = getTimeOfDay(event.tick);
        const showDayHeader = day !== currentDay;
        currentDay = day;

        const template = NARRATIVE_TEMPLATES[event.type];
        const narrative = template ? template(event.description) : event.description;

        const isSignificant =
          event.type === 'complete_objective' ||
          event.type === 'dilemma_choice' ||
          event.type === 'help_player';

        return (
          <div key={event.id || i}>
            {showDayHeader && (
              <div style={{
                padding: '8px 12px', marginBottom: '10px', marginTop: i > 0 ? '16px' : '0',
                borderRadius: '8px',
                background: 'linear-gradient(90deg, rgba(245,200,66,0.08), transparent)',
                borderLeft: '3px solid var(--accent-yellow)'
              }}>
                <span style={{
                  fontSize: '12px', fontWeight: 700, color: 'var(--accent-yellow)'
                }}>
                  Day {day}
                </span>
              </div>
            )}

            <div style={{
              padding: '8px 12px', marginBottom: '6px', borderRadius: '8px',
              background: isSignificant ? 'rgba(245,200,66,0.04)' : 'transparent',
              borderLeft: `2px solid ${isSignificant ? 'var(--accent-yellow)' : 'var(--border)'}`,
              transition: 'background 0.2s ease'
            }}>
              <div style={{
                fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px',
                textTransform: 'capitalize', fontWeight: 600
              }}>
                {timeOfDay}
              </div>
              <div style={{
                fontSize: '12px', color: 'var(--text-secondary)',
                lineHeight: 1.6,
                fontWeight: isSignificant ? 500 : 400
              }}>
                {narrative}
              </div>
              {event.statChanges && Object.keys(event.statChanges).length > 0 && (
                <div style={{
                  display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap'
                }}>
                  {Object.entries(event.statChanges)
                    .filter(([k]) => k !== 'location')
                    .map(([stat, val]) => (
                    <span key={stat} style={{
                      fontSize: '9px', padding: '1px 5px', borderRadius: '6px',
                      background: Number(val) > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: Number(val) > 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}>
                      {stat} {Number(val) > 0 ? '+' : ''}{val}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
