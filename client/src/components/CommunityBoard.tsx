import { useGameStore } from '../store/gameStore';
import ReputationBadge from './ReputationBadge';

export default function CommunityBoard() {
  const { room, mySocketId } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);
  if (players.length <= 1) return null;

  const totalHelps = players.reduce((s, p) => s + p.state.helpedOthersCount, 0);
  const totalReceived = players.reduce((s, p) => s + p.state.receivedHelpCount, 0);
  const avgTrust = Math.round(players.reduce((s, p) => s + p.socialTrust, 0) / players.length);
  const totalImpact = players.reduce((s, p) => s + p.communityImpact, 0);
  const avgHealth = Math.round(players.reduce((s, p) => s + p.state.health, 0) / players.length);
  const avgCash = Math.round(players.reduce((s, p) => s + p.state.cash, 0) / players.length);

  const mostHelpful = [...players].sort((a, b) => b.state.helpedOthersCount - a.state.helpedOthersCount)[0];
  const mostTrusted = [...players].sort((a, b) => b.socialTrust - a.socialTrust)[0];

  const communityMood = totalImpact > 20 ? 'Thriving' :
    totalImpact > 5 ? 'Growing' :
    totalImpact >= 0 ? 'Neutral' :
    totalImpact > -10 ? 'Strained' : 'Struggling';

  const moodColor = totalImpact > 20 ? 'var(--accent-green)' :
    totalImpact > 5 ? 'var(--accent-blue)' :
    totalImpact >= 0 ? 'var(--text-muted)' :
    totalImpact > -10 ? 'var(--accent-orange)' : 'var(--accent-red)';

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Community Board
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 700, color: moodColor,
          padding: '2px 8px', borderRadius: '10px',
          background: `color-mix(in srgb, ${moodColor} 10%, transparent)`
        }}>
          {communityMood}
        </span>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
        marginBottom: '10px'
      }}>
        <BoardStat label="Help Acts" value={totalHelps} icon="🤝" color="var(--accent-green)" />
        <BoardStat label="Avg Trust" value={avgTrust} icon="💚" color="var(--accent-blue)" />
        <BoardStat label="Community" value={totalImpact} icon="🏘️" color={moodColor} signed />
        <BoardStat label="Avg Health" value={avgHealth} icon="❤️" color="var(--accent-red)" />
        <BoardStat label="Avg Cash" value={avgCash} icon="💰" color="var(--accent-green)" prefix="₹" />
        <BoardStat label="Help Recv" value={totalReceived} icon="🙏" color="var(--accent-purple)" />
      </div>

      {/* Spotlights */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {mostHelpful && mostHelpful.state.helpedOthersCount > 0 && (
          <div style={{
            flex: 1, padding: '6px 8px', borderRadius: '6px',
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.12)'
          }}>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>
              Most Helpful
            </div>
            <div style={{
              fontSize: '11px', fontWeight: 600,
              color: mostHelpful.id === mySocketId ? 'var(--accent-yellow)' : 'var(--text-primary)',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              🤝 {mostHelpful.name}
              {mostHelpful.id === mySocketId && (
                <span style={{ fontSize: '9px', color: 'var(--accent-yellow)' }}>(you!)</span>
              )}
            </div>
          </div>
        )}
        {mostTrusted && mostTrusted.socialTrust > 0 && (
          <div style={{
            flex: 1, padding: '6px 8px', borderRadius: '6px',
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.12)'
          }}>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>
              Most Trusted
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <span style={{
                fontSize: '11px', fontWeight: 600,
                color: mostTrusted.id === mySocketId ? 'var(--accent-yellow)' : 'var(--text-primary)'
              }}>
                {mostTrusted.name}
              </span>
              <ReputationBadge trust={mostTrusted.socialTrust} size="small" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BoardStat({ label, value, icon, color, prefix, signed }: {
  label: string; value: number; icon: string; color: string;
  prefix?: string; signed?: boolean;
}) {
  return (
    <div style={{
      padding: '6px', borderRadius: '6px',
      background: 'rgba(0,0,0,0.1)', textAlign: 'center'
    }}>
      <div style={{ fontSize: '11px', marginBottom: '2px' }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '13px', color }}>
        {signed && value >= 0 ? '+' : ''}{prefix || ''}{value}
      </div>
      <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
