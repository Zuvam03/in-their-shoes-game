import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function TradePanel() {
  const { myPlayer, room, submitAction, mySocketId } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [amount, setAmount] = useState(10);
  const [showPanel, setShowPanel] = useState(false);

  if (!myPlayer || !room || room.phase !== 'playing') return null;

  const nearbyPlayers = Object.values(room.players).filter(
    p => p.id !== mySocketId &&
    p.state.location === myPlayer.state.location &&
    p.isConnected
  );

  if (nearbyPlayers.length === 0) return null;

  const handleTransfer = () => {
    if (!selectedPlayer || amount <= 0 || amount > myPlayer.state.cash) return;
    submitAction('transfer_money', { targetPlayerId: selectedPlayer, amount });
    setSelectedPlayer(null);
    setAmount(10);
    setShowPanel(false);
  };

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        style={{
          padding: '6px 12px', borderRadius: '8px',
          background: 'rgba(245,200,66,0.08)',
          border: '1px solid rgba(245,200,66,0.2)',
          color: 'var(--accent-yellow)', fontSize: '11px',
          fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}
      >
        💸 Trade Money
      </button>
    );
  }

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      marginTop: '8px', animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{
          fontSize: '12px', fontWeight: 600, color: 'var(--accent-yellow)',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          💸 Send Money
        </div>
        <button
          onClick={() => setShowPanel(false)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>

      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
        Your cash: <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>₹{myPlayer.state.cash}</span>
      </div>

      {/* Player selection */}
      <div style={{
        display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap'
      }}>
        {nearbyPlayers.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlayer(p.id)}
            style={{
              padding: '5px 10px', borderRadius: '8px',
              background: selectedPlayer === p.id ? 'rgba(245,200,66,0.15)' : 'var(--bg-secondary)',
              border: `1px solid ${selectedPlayer === p.id ? 'rgba(245,200,66,0.3)' : 'var(--border)'}`,
              color: selectedPlayer === p.id ? 'var(--accent-yellow)' : 'var(--text-secondary)',
              fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <span style={{
              width: '16px', height: '16px', borderRadius: '50%',
              background: `hsl(${p.name.charCodeAt(0) * 7}deg 55% 35%)`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8px', color: '#fff', fontWeight: 700
            }}>
              {p.name[0]?.toUpperCase()}
            </span>
            {p.name}
          </button>
        ))}
      </div>

      {selectedPlayer && (
        <>
          {/* Amount */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Amount:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[5, 10, 25, 50].map(a => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  disabled={a > myPlayer.state.cash}
                  style={{
                    padding: '3px 8px', borderRadius: '6px',
                    background: amount === a ? 'var(--accent-yellow)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: amount === a ? '#000' : 'var(--text-secondary)',
                    fontSize: '11px', fontWeight: 600,
                    opacity: a > myPlayer.state.cash ? 0.3 : 1,
                    cursor: a > myPlayer.state.cash ? 'default' : 'pointer'
                  }}
                >
                  ₹{a}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleTransfer}
            disabled={amount > myPlayer.state.cash}
            style={{
              width: '100%', padding: '8px', borderRadius: '8px',
              background: amount <= myPlayer.state.cash ? 'var(--accent-green)' : 'var(--bg-secondary)',
              color: amount <= myPlayer.state.cash ? '#000' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '12px',
              border: '1px solid var(--border)',
              cursor: amount <= myPlayer.state.cash ? 'pointer' : 'default'
            }}
          >
            Send ₹{amount} to {nearbyPlayers.find(p => p.id === selectedPlayer)?.name}
          </button>
        </>
      )}
    </div>
  );
}
