import { useState } from 'react';
import { useGameStore, StatBand, CashBand } from '../store/gameStore';
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

const BAND_LABELS: Record<StatBand, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'var(--accent-red)' },
  low: { label: 'Low', color: '#f59e0b' },
  moderate: { label: 'OK', color: 'var(--text-muted)' },
  good: { label: 'Good', color: 'var(--accent-green)' },
  excellent: { label: 'Strong', color: '#22d3ee' },
};

const CASH_LABELS: Record<CashBand, { label: string; color: string }> = {
  broke: { label: 'Broke', color: 'var(--accent-red)' },
  tight: { label: 'Tight', color: '#f59e0b' },
  comfortable: { label: 'OK', color: 'var(--accent-green)' },
  flush: { label: 'Flush', color: '#22d3ee' },
};

const BAND_WIDTH: Record<StatBand, number> = {
  critical: 10, low: 30, moderate: 50, good: 75, excellent: 95,
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
    const pa = getProximity(myLoc, a.approximateState.location);
    const pb = getProximity(myLoc, b.approximateState.location);
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
        {otherPlayers.filter(p => getProximity(myLoc, p.approximateState.location) === 'same').length > 0 && (
          <span style={{
            fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
            background: 'rgba(34,197,94,0.12)', color: 'var(--accent-green)',
            fontWeight: 600
          }}>
            {otherPlayers.filter(p => getProximity(myLoc, p.approximateState.location) === 'same').length} here
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
        const location = getLocationById(player.approximateState.location);
        const isTransferring = transferTarget === player.id;
        const proximity = getProximity(myLoc, player.approximateState.location);
        const proxCfg = PROXIMITY_CONFIG[proximity];
        const isExpanded = expandedPlayer === player.id;
        const emote = playerEmotes[player.id];
        const isSameLocation = proximity === 'same';
        const approx = player.approximateState;

        const statusBand = approx.energy;
        const statusLabel = statusBand === 'critical' ? 'exhausted'
          : approx.health === 'critical' ? 'struggling'
          : approx.stress === 'excellent' ? 'stressed'
          : statusBand === 'low' ? 'tired' : 'active';
        const statusColor = statusBand === 'critical' || approx.health === 'critical'
          ? 'var(--accent-red)' : 'var(--accent-green)';

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
                      background: statusColor === 'var(--accent-red)'
                        ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: statusColor,
                    }}>
                      <span style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: statusColor,
                      }} />
                      {statusLabel}
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

            {/* Approximate stats — bands instead of exact numbers */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
              marginBottom: '8px'
            }}>
              <BandStat label="Health" band={approx.health} color="var(--accent-red)" />
              <BandStat label="Energy" band={approx.energy} color="var(--accent-yellow)" />
              <BandStat label="Mood" band={approx.mood} color="var(--accent-purple)" />
            </div>

            {/* Location & trust row */}
            <div style={{
              fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span>📍 {location?.name || approx.location}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                  background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)'
                }}>
                  Trust: {player.socialTrust}
                </span>
                <span style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                  ...(() => {
                    const c = CASH_LABELS[approx.cash];
                    return {
                      background: approx.cash === 'broke' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: c.color,
                    };
                  })()
                }}>
                  💰 {CASH_LABELS[approx.cash].label}
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
                  <span style={{ fontWeight: 600 }}>Helped:</span> {player.helpedOthersCount} people
                  &nbsp;·&nbsp;
                  <span style={{ fontWeight: 600 }}>Received:</span> {player.receivedHelpCount} times
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Stress:</span>{' '}
                  <span style={{ color: BAND_LABELS[approx.stress].color }}>
                    {BAND_LABELS[approx.stress].label}
                  </span>
                  &nbsp;·&nbsp;
                  <span style={{ fontWeight: 600 }}>Hunger:</span>{' '}
                  <span style={{ color: BAND_LABELS[approx.hunger].color }}>
                    {BAND_LABELS[approx.hunger].label}
                  </span>
                </div>
                <div style={{
                  marginTop: '6px', padding: '4px 8px', borderRadius: '6px',
                  background: 'rgba(168,85,247,0.06)',
                  border: '1px solid rgba(168,85,247,0.1)',
                  fontSize: '10px', color: 'var(--text-muted)',
                  fontStyle: 'italic',
                }}>
                  {player.persona.description}
                </div>
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

function BandStat({ label, band, color }: { label: string; band: StatBand; color: string }) {
  const info = BAND_LABELS[band];
  const width = BAND_WIDTH[band];
  return (
    <div>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
      <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
        <div style={{
          height: '100%', borderRadius: '2px', width: `${width}%`, background: color,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{
        fontSize: '9px', textAlign: 'right', color: info.color,
      }}>
        {info.label}
      </div>
    </div>
  );
}
