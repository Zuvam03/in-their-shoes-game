import { useGameStore } from '../store/gameStore';

interface Relationship {
  playerId: string;
  name: string;
  helpGiven: number;
  helpReceived: number;
  chatCount: number;
  isNearby: boolean;
  tier: 'stranger' | 'acquaintance' | 'ally' | 'partner';
  score: number;
}

function buildRelationships(
  myId: string,
  players: Record<string, { id: string; name: string; state: { location: string }; isConnected: boolean }>,
  myLocation: string,
  chatMessages: Array<{ senderId: string; target: string }>,
  actionLog: Array<{ type: string; description: string; playerId?: string }>
): Relationship[] {
  const others = Object.values(players).filter(p => p.id !== myId);
  return others.map(p => {
    const chatCount = chatMessages.filter(m =>
      (m.senderId === myId && m.target === p.id) ||
      (m.senderId === p.id && (m.target === myId || m.target === 'all'))
    ).length;

    const helpGiven = actionLog.filter(e =>
      e.type === 'help' && e.description.includes(p.name)
    ).length;

    const helpReceived = actionLog.filter(e =>
      e.type === 'received_help' && e.playerId === p.id
    ).length;

    const isNearby = p.state.location === myLocation && p.isConnected;

    const score = Math.min(100, chatCount * 3 + helpGiven * 15 + helpReceived * 10 + (isNearby ? 5 : 0));

    const tier: Relationship['tier'] =
      score >= 60 ? 'partner' :
      score >= 30 ? 'ally' :
      score >= 10 ? 'acquaintance' : 'stranger';

    return { playerId: p.id, name: p.name, helpGiven, helpReceived, chatCount, isNearby, tier, score };
  });
}

const TIER_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  stranger: { color: 'var(--text-muted)', icon: '👤', label: 'Stranger' },
  acquaintance: { color: 'var(--accent-blue)', icon: '🤝', label: 'Acquaintance' },
  ally: { color: 'var(--accent-green)', icon: '💪', label: 'Ally' },
  partner: { color: 'var(--accent-yellow)', icon: '⭐', label: 'Partner' },
};

export default function RelationshipTracker() {
  const { myPlayer, room, chatMessages } = useGameStore();
  if (!myPlayer || !room) return null;

  const relationships = buildRelationships(
    myPlayer.id,
    room.players,
    myPlayer.state.location,
    chatMessages,
    myPlayer.actionLog
  );

  if (relationships.length === 0) return null;

  const sorted = [...relationships].sort((a, b) => b.score - a.score);

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      marginBottom: '10px'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px'
      }}>
        Relationships
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sorted.map(rel => {
          const cfg = TIER_CONFIG[rel.tier];
          return (
            <div key={rel.playerId} style={{
              padding: '8px 10px', borderRadius: '8px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              {/* Avatar */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: `hsl(${rel.name.charCodeAt(0) * 7}deg 55% 35%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
                border: rel.isNearby ? '2px solid var(--accent-green)' : '2px solid transparent'
              }}>
                {rel.name[0]?.toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {rel.name}
                  </span>
                  <span style={{
                    fontSize: '9px', padding: '1px 6px', borderRadius: '8px',
                    background: `${cfg.color}18`, color: cfg.color, fontWeight: 600
                  }}>
                    {cfg.icon} {cfg.label}
                  </span>
                  {rel.isNearby && (
                    <span style={{ fontSize: '9px', color: 'var(--accent-green)' }}>nearby</span>
                  )}
                </div>

                {/* Progress bar */}
                <div style={{
                  height: '3px', background: 'var(--border)', borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: `${rel.score}%`,
                    background: cfg.color,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Interaction counts */}
              <div style={{
                display: 'flex', gap: '6px', fontSize: '9px', color: 'var(--text-muted)', flexShrink: 0
              }}>
                {rel.chatCount > 0 && <span title="Messages">💬{rel.chatCount}</span>}
                {rel.helpGiven > 0 && <span title="Help given">🤲{rel.helpGiven}</span>}
                {rel.helpReceived > 0 && <span title="Help received">🙏{rel.helpReceived}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
