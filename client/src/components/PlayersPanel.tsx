import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLocationById } from '../game/mapData';

export default function PlayersPanel() {
  const { room, myPlayer, mySocketId, submitAction } = useGameStore();
  const [transferTarget, setTransferTarget] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState('');

  if (!room) return null;

  const otherPlayers = Object.values(room.players).filter(p => p.id !== mySocketId);

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

  const handleShareInfo = (playerId: string) => {
    submitAction('share_info', { targetPlayerId: playerId, info: 'route_tip' });
  };

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Other Players ({otherPlayers.length})
      </div>

      {otherPlayers.length === 0 && (
        <div style={{
          padding: '20px', textAlign: 'center',
          color: 'var(--text-muted)', fontSize: '13px'
        }}>
          No other players in this match
        </div>
      )}

      {otherPlayers.map(player => {
        const location = getLocationById(player.state.location);
        const isTransferring = transferTarget === player.id;

        return (
          <div key={player.id} style={{
            padding: '12px', borderRadius: '10px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>
                  {player.name}
                  {!player.isConnected && (
                    <span style={{ color: 'var(--accent-red)', fontSize: '10px', marginLeft: '6px' }}>
                      disconnected
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {player.persona.title}
                </div>
              </div>
              <div style={{
                padding: '3px 8px', borderRadius: '20px', fontSize: '11px',
                background: player.mission.status === 'completed'
                  ? 'rgba(34,197,94,0.15)' : 'rgba(139,146,168,0.1)',
                color: player.mission.status === 'completed'
                  ? 'var(--accent-green)' : 'var(--text-muted)'
              }}>
                {player.mission.title || player.mission.status}
              </div>
            </div>

            {/* Stats visible to other players */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
              <MiniStat label="Health" value={player.state.health} color="var(--accent-red)" />
              <MiniStat label="Energy" value={player.state.energy} color="var(--accent-yellow)" />
              <MiniStat label="Mood" value={player.state.mood} color="var(--accent-purple)" />
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              📍 {location?.name || player.state.location}
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {/* Trust info */}
              <div style={{
                fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)'
              }}>
                Trust: {player.socialTrust}
              </div>
              <div style={{
                fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                background: player.communityImpact >= 0
                  ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: player.communityImpact >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
              }}>
                Impact: {player.communityImpact >= 0 ? '+' : ''}{player.communityImpact}
              </div>
            </div>

            {/* Interaction buttons */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <button
                onClick={() => handleHelp(player.id)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '6px',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                  color: 'var(--accent-green)', fontSize: '11px', fontWeight: 600
                }}
              >
                🤝 Help
              </button>
              <button
                onClick={() => handleShareInfo(player.id)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '6px',
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                  color: 'var(--accent-blue)', fontSize: '11px', fontWeight: 600
                }}
              >
                💬 Info
              </button>
              <button
                onClick={() => setTransferTarget(isTransferring ? null : player.id)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '6px',
                  background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)',
                  color: 'var(--accent-yellow)', fontSize: '11px', fontWeight: 600
                }}
              >
                💰 Send
              </button>
            </div>

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
        <div style={{ height: '100%', borderRadius: '2px', width: `${value}%`, background: color }} />
      </div>
      <div style={{ fontSize: '9px', textAlign: 'right', color: 'var(--text-muted)' }}>{Math.round(value)}</div>
    </div>
  );
}
