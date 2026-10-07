import { useGameStore } from '../store/gameStore';

interface LeaderEntry {
  name: string;
  score: number;
  icon: string;
  isMe: boolean;
}

export default function CommunityLeaderboard() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const players = Object.values(room.players);

  const categories = [
    {
      title: 'Most Helpful',
      icon: '🤝',
      entries: players
        .map(p => ({
          name: p.name, isMe: p.id === myPlayer.id,
          score: p.state.helpedOthersCount, icon: '🤝'
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
      unit: 'helps'
    },
    {
      title: 'Most Trusted',
      icon: '⭐',
      entries: players
        .map(p => ({
          name: p.name, isMe: p.id === myPlayer.id,
          score: p.socialTrust, icon: '⭐'
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
      unit: 'trust'
    },
    {
      title: 'Biggest Impact',
      icon: '💎',
      entries: players
        .map(p => ({
          name: p.name, isMe: p.id === myPlayer.id,
          score: p.communityImpact, icon: '💎'
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
      unit: 'impact'
    },
  ];

  const MEDAL = ['🥇', '🥈', '🥉'];

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Community Leaderboard
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {categories.map(cat => (
          <div key={cat.title}>
            <div style={{
              fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)',
              marginBottom: '4px'
            }}>
              {cat.icon} {cat.title}
            </div>
            {cat.entries.map((entry, i) => (
              <div key={entry.name} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '3px 6px', borderRadius: '4px',
                background: entry.isMe ? 'rgba(245,200,66,0.08)' : 'transparent'
              }}>
                <span style={{ fontSize: '12px', width: '18px' }}>{MEDAL[i]}</span>
                <span style={{
                  fontSize: '11px', flex: 1,
                  color: entry.isMe ? 'var(--accent-yellow)' : 'var(--text-primary)',
                  fontWeight: entry.isMe ? 700 : 400
                }}>
                  {entry.name} {entry.isMe && '(You)'}
                </span>
                <span style={{
                  fontSize: '10px', fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>
                  {entry.score} {cat.unit}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
