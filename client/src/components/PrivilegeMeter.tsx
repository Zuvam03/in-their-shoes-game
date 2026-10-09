import { useGameStore } from '../store/gameStore';

export default function PrivilegeMeter() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const players = Object.values(room.players);
  if (players.length <= 1) return null;

  const me = myPlayer;
  const avgCash = players.reduce((s, p) => s + p.state.cash, 0) / players.length;
  const avgHealth = players.reduce((s, p) => s + p.state.health, 0) / players.length;
  const avgTrust = players.reduce((s, p) => s + p.socialTrust, 0) / players.length;

  const dimensions = [
    {
      label: 'Economic',
      icon: '💰',
      myVal: me.state.cash,
      avg: avgCash,
      note: me.state.cash > avgCash * 1.3 ? 'You have more than most' :
        me.state.cash < avgCash * 0.7 ? 'You have less than most' : 'Near average'
    },
    {
      label: 'Health',
      icon: '❤️',
      myVal: me.state.health,
      avg: avgHealth,
      note: me.state.health > avgHealth + 15 ? 'Healthier than most' :
        me.state.health < avgHealth - 15 ? 'Less healthy than most' : 'Similar health'
    },
    {
      label: 'Social',
      icon: '💚',
      myVal: me.socialTrust,
      avg: avgTrust,
      note: me.socialTrust > avgTrust + 10 ? 'More trusted than most' :
        me.socialTrust < avgTrust - 10 ? 'Less trusted than most' : 'Similar trust'
    },
  ];

  const advantages = dimensions.filter(d => d.myVal > d.avg * 1.1).length;
  const disadvantages = dimensions.filter(d => d.myVal < d.avg * 0.9).length;

  const position = advantages > disadvantages ? 'Advantaged' :
    advantages < disadvantages ? 'Disadvantaged' : 'Average';

  const posColor = position === 'Advantaged' ? 'var(--accent-green)' :
    position === 'Disadvantaged' ? 'var(--accent-orange)' : 'var(--accent-blue)';

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Privilege Meter
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: posColor }}>
          {position}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {dimensions.map(dim => {
          const ratio = dim.avg > 0 ? dim.myVal / dim.avg : 1;
          const barPct = Math.min(100, Math.max(0, ratio * 50));
          const isAbove = dim.myVal > dim.avg;

          return (
            <div key={dim.label}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '3px'
              }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                  {dim.icon} {dim.label}
                </span>
                <span style={{
                  fontSize: '9px', fontStyle: 'italic',
                  color: isAbove ? 'var(--accent-green)' : 'var(--accent-orange)'
                }}>
                  {dim.note}
                </span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <div style={{
                  flex: 1, height: '4px', background: 'var(--border)',
                  borderRadius: '2px', position: 'relative' as const
                }}>
                  <div style={{
                    position: 'absolute' as const, left: '50%', top: '-2px',
                    width: '1px', height: '8px', background: 'var(--text-muted)'
                  }} />
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: `${barPct}%`,
                    background: isAbove ? 'var(--accent-green)' : 'var(--accent-orange)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '6px', fontSize: '9px', color: 'var(--text-muted)',
        textAlign: 'center', fontStyle: 'italic'
      }}>
        {position === 'Advantaged'
          ? 'Consider how you can use your position to help others'
          : position === 'Disadvantaged'
            ? 'Don\'t give up — seek help and build connections'
            : 'You\'re in a balanced position — every choice matters'}
      </div>
    </div>
  );
}
