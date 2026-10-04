import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLocationById, getConnectedLocations } from '../game/mapData';
import ReputationBadge from './ReputationBadge';

type Proximity = 'same' | 'nearby' | 'far';

function getProximity(myLoc: string, theirLoc: string): Proximity {
  if (myLoc === theirLoc) return 'same';
  const connected = getConnectedLocations(myLoc);
  if (connected.includes(theirLoc)) return 'nearby';
  return 'far';
}

const PROXIMITY_CONFIG: Record<Proximity, { label: string; color: string; icon: string }> = {
  same: { label: 'Here', color: 'var(--accent-green)', icon: '📍' },
  nearby: { label: 'Nearby', color: 'var(--accent-blue)', icon: '↔️' },
  far: { label: 'Far', color: 'var(--text-muted)', icon: '🌐' },
};

export default function PlayersPanel() {
  const { room, myPlayer, mySocketId, submitAction, playerEmotes } = useGameStore();
  const [transferTarget, setTransferTarget] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  if (!room) return null;

  const otherPlayers = Object.values(room.players).filter(p => p.id !== mySocketId);
  const myLoc = myPlayer?.state.location || '';

  const sortedPlayers = [...otherPlayers].sort((a, b) => {
    const pa = getProximity(myLoc, a.state.location);
    const pb = getProximity(myLoc, b.state.location);
    const order: Record<Proximity, number> = { same: 0, nearby: 1, far: 2 };
    return order[pa] - order[pb];
  });

  const handleTransfer = (playerId: string) => {
    const amount = parseInt(transferAmount, 10);
    if (!amount || amount <= 0) return;
    submitAction('transfer_money', { targetPlayerId: playerId, amount });
    setTransferTarget(null);
    setTransferAmount('');
  };

  const handleHelp = (playerId: string) => {
    submitAction('help_player', { targetPlayerId: playerId, helpType: 'general' });
  };

  const handleRequestHelp = (playerId: string) => {
    submitAction('request_help', { targetPlayerId: playerId });
  };

  const handleShareInfo = (playerId: string) => {
    submitAction('share_info', { targetPlayerId: playerId, info: 'route_tip' });
  };

  return (
    <div style={{ padding: '12px' }}>
      <div style={{
        fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600,
        marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>Other Players ({otherPlayers.length})</span>
        {otherPlayers.filter(p => getProximity(myLoc, p.state.location) === 'same').length > 0 && (
          <span style={{
            fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
            background: 'rgba(34,197,94,0.12)', color: 'var(--accent-green)',
            fontWeight: 600
          }}>
            {otherPlayers.filter(p => getProximity(myLoc, p.state.location) === 'same').length} here
          </span>
        )}
      </div>

      {otherPlayers.length === 0 && (
        <div style={{
          padding: '20px', textAlign: 'center',
          color: 'var(--text-muted)', fontSize: '13px'
        }}>
          No other players in this match
        </div>
      )}

      {sortedPlayers.map(player => {
        const location = getLocationById(player.state.location);
        const isTransferring = transferTarget === player.id;
        const proximity = getProximity(myLoc, player.state.location);
        const proxCfg = PROXIMITY_CONFIG[proximity];
        const isExpanded = expandedPlayer === player.id;
        const emote = playerEmotes[player.id];
        const isSameLocation = proximity === 'same';

        return (
          <div key={player.id} style={{
            padding: '12px', borderRadius: '10px',
            background: isSameLocation
              ? 'rgba(34,197,94,0.04)'
              : 'var(--bg-secondary)',
            border: `1px solid ${isSameLocation ? 'rgba(34,197,94,0.15)' : 'var(--border)'}`,
            marginBottom: '10px',
            transition: 'all 0.2s ease'
          }}>
            {/* Header row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              marginBottom: '8px', cursor: 'pointer'
            }}
              onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600, fontSize: '13px',
                  display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'
                }}>
                  {player.name}
                  {emote && (
                    <span style={{ fontSize: '14px', animation: 'fadeIn 0.3s ease' }}>
                      {emote.emoji}
                    </span>
                  )}
                  {!player.isConnected ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      color: 'var(--accent-red)', fontSize: '10px',
                      padding: '1px 6px', borderRadius: '8px',
                      background: 'rgba(239,68,68,0.1)'
                    }}>
                      <span style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: 'var(--accent-red)'
                      }} />
                      offline
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      fontSize: '10px', padding: '1px 6px', borderRadius: '8px',
                      background: player.state.energy < 20
                        ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: player.state.energy < 20
                        ? 'var(--accent-red)' : 'var(--accent-green)'
                    }}>
                      <span style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: player.state.energy < 20
                          ? 'var(--accent-red)' : 'var(--accent-green)'
                      }} />
                      {player.state.energy < 20 ? 'exhausted' :
                       player.state.health < 30 ? 'struggling' :
                       player.state.stress > 70 ? 'stressed' : 'active'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {player.persona.title}
                </div>
              </div>

              {/* Reputation badge */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'
              }}>
                <ReputationBadge trust={player.socialTrust} size="small" />
                <div style={{
                  padding: '2px 6px', borderRadius: '8px', fontSize: '9px',
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px',
                  background: `${proxCfg.color}12`, color: proxCfg.color
                }}>
                  {proxCfg.icon} {proxCfg.label}
                </div>
              </div>
            </div>

            {/* Stats visible to other players */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
              marginBottom: '8px'
            }}>
              <MiniStat label="Health" value={player.state.health} color="var(--accent-red)" />
              <MiniStat label="Energy" value={player.state.energy} color="var(--accent-yellow)" />
              <MiniStat label="Mood" value={player.state.mood} color="var(--accent-purple)" />
            </div>

            {/* Location & trust row */}
            <div style={{
              fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span>📍 {location?.name || player.state.location}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                  background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)'
                }}>
                  Trust: {player.socialTrust}
                </span>
                <span style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                  background: player.communityImpact >= 0
                    ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: player.communityImpact >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  Impact: {player.communityImpact >= 0 ? '+' : ''}{player.communityImpact}
                </span>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div style={{
                padding: '8px', borderRadius: '8px', marginBottom: '8px',
                background: 'rgba(0,0,0,0.15)', fontSize: '11px',
                color: 'var(--text-secondary)', lineHeight: 1.5
              }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Mission:</span>{' '}
                  {player.mission.title || player.mission.status}
                  <span style={{
                    marginLeft: '6px', padding: '1px 6px', borderRadius: '8px',
                    fontSize: '9px', fontWeight: 600,
                    background: player.mission.status === 'completed'
                      ? 'rgba(34,197,94,0.15)' : 'rgba(139,146,168,0.1)',
                    color: player.mission.status === 'completed'
                      ? 'var(--accent-green)' : 'var(--text-muted)'
                  }}>
                    {player.mission.status}
                  </span>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Helped:</span> {player.state.helpedOthersCount} people
                  &nbsp;·&nbsp;
                  <span style={{ fontWeight: 600 }}>Received:</span> {player.state.receivedHelpCount} times
                </div>
                {player.persona.strengths && player.persona.strengths.length > 0 && (
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>Strengths:</span>{' '}
                    {player.persona.strengths.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Interaction buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => handleHelp(player.id)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '6px',
                  background: isSameLocation
                    ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                  border: `1px solid rgba(34,197,94,${isSameLocation ? '0.3' : '0.2'})`,
                  color: 'var(--accent-green)', fontSize: '11px', fontWeight: 600
                }}
                title={isSameLocation ? 'Help (proximity bonus!)' : 'Help'}
              >
                🤝 Help{isSameLocation ? '+' : ''}
              </button>
              <button
                onClick={() => handleRequestHelp(player.id)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '6px',
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px solid rgba(168,85,247,0.2)',
                  color: 'var(--accent-purple)', fontSize: '11px', fontWeight: 600
                }}
              >
                🙏 Ask
              </button>
              <button
                onClick={() => handleShareInfo(player.id)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '6px',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  color: 'var(--accent-blue)', fontSize: '11px', fontWeight: 600
                }}
              >
                💬 Info
              </button>
              <button
                onClick={() => setTransferTarget(isTransferring ? null : player.id)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '6px',
                  background: 'rgba(245,200,66,0.1)',
                  border: '1px solid rgba(245,200,66,0.2)',
                  color: 'var(--accent-yellow)', fontSize: '11px', fontWeight: 600
                }}
              >
                💰 Send
              </button>
            </div>

            {/* Proximity bonus hint */}
            {isSameLocation && (
              <div style={{
                marginTop: '6px', padding: '4px 8px', borderRadius: '6px',
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.1)',
                fontSize: '10px', color: 'var(--accent-green)',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                ✨ Same location — social actions are more effective!
              </div>
            )}

            {/* Transfer UI */}
            {isTransferring && (
              <div style={{
                marginTop: '8px', display: 'flex', gap: '6px'
              }}>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  placeholder="₹ amount"
                  min="1"
                  max={myPlayer?.state.cash || 999}
                  style={{
                    flex: 1, padding: '6px 8px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px'
                  }}
                />
                <button
                  onClick={() => handleTransfer(player.id)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px',
                    background: 'var(--accent-yellow)', color: '#000',
                    fontWeight: 700, fontSize: '11px'
                  }}
                >
                  Send
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
      <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
        <div style={{
          height: '100%', borderRadius: '2px', width: `${value}%`, background: color
        }} />
      </div>
      <div style={{
        fontSize: '9px', textAlign: 'right', color: 'var(--text-muted)'
      }}>
        {Math.round(value)}
      </div>
    </div>
  );
}
