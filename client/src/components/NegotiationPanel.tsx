import { useState } from 'react';
import { useGameStore, getTrustLevel, type TrustLevel, type NegotiationOffer } from '../store/gameStore';

const TRUST_CONFIG: Record<TrustLevel, { color: string; icon: string; label: string }> = {
  distrusted: { color: '#ef4444', icon: '🚫', label: 'Distrusted' },
  stranger: { color: '#f59e0b', icon: '❓', label: 'Stranger' },
  acquaintance: { color: '#3b82f6', icon: '👋', label: 'Acquaintance' },
  trusted: { color: '#22c55e', icon: '🤝', label: 'Trusted' },
  ally: { color: '#a855f7', icon: '💎', label: 'Ally' },
};

function TrustBadge({ trust }: { trust: number }) {
  const level = getTrustLevel(trust);
  const config = TRUST_CONFIG[level];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
      background: `${config.color}15`, color: config.color,
      fontWeight: 600,
    }}>
      {config.icon} {config.label}
    </span>
  );
}

function NegotiationStatus({ offer }: { offer: NegotiationOffer }) {
  const statusConfig: Record<string, { bg: string; color: string; text: string }> = {
    pending: { bg: 'rgba(245,200,66,0.1)', color: 'var(--accent-yellow)', text: 'Awaiting response...' },
    countered: { bg: 'rgba(168,85,247,0.1)', color: '#a855f7', text: 'Counter-offer!' },
    accepted: { bg: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)', text: 'Deal accepted!' },
    declined: { bg: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', text: 'Declined' },
    expired: { bg: 'rgba(100,100,100,0.1)', color: 'var(--text-muted)', text: 'Expired' },
  };

  const config = statusConfig[offer.status] || statusConfig.pending;

  return (
    <div style={{
      padding: '6px 10px', borderRadius: '6px',
      background: config.bg, color: config.color,
      fontSize: '11px', fontWeight: 600, textAlign: 'center',
    }}>
      {config.text}
      {offer.status === 'pending' || offer.status === 'countered' ? (
        <span style={{ fontSize: '9px', fontWeight: 400, marginLeft: '6px', opacity: 0.7 }}>
          Round {offer.round}/{offer.maxRounds}
        </span>
      ) : null}
    </div>
  );
}

function OfferHistory({ offer }: { offer: NegotiationOffer }) {
  if (offer.history.length <= 1) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '3px',
      marginTop: '6px', padding: '6px 8px', borderRadius: '6px',
      background: 'var(--bg-secondary)',
    }}>
      <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        History
      </div>
      {offer.history.map((round, i) => (
        <div key={i} style={{
          fontSize: '10px', color: 'var(--text-secondary)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '2px 0',
          borderBottom: i < offer.history.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          <span>{round.playerName} offered ₹{round.offeredAmount}</span>
          {round.requestedAmount > 0 && (
            <span style={{ color: 'var(--accent-orange)' }}>asked ₹{round.requestedAmount}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function NegotiationPanel() {
  const { myPlayer, room, mySocketId, startNegotiation } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [offerAmount, setOfferAmount] = useState(10);
  const [requestAmount, setRequestAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [showPanel, setShowPanel] = useState(false);

  if (!myPlayer || !room || room.phase !== 'playing') return null;

  const nearbyPlayers = Object.values(room.players).filter(
    p => p.id !== mySocketId &&
    p.approximateState.location === myPlayer.state.location &&
    p.isConnected
  );

  if (nearbyPlayers.length === 0) return null;

  const myTrust = getTrustLevel(myPlayer.socialTrust);
  const myTrustConfig = TRUST_CONFIG[myTrust];

  const handleNegotiate = () => {
    if (!selectedPlayer || offerAmount <= 0 || offerAmount > myPlayer.state.cash) return;
    startNegotiation(selectedPlayer, 'money', offerAmount, requestAmount, message || 'Would you like to make a deal?');
    setSelectedPlayer(null);
    setOfferAmount(10);
    setRequestAmount(0);
    setMessage('');
    setShowPanel(false);
  };

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        style={{
          padding: '6px 12px', borderRadius: '8px',
          background: 'rgba(168,85,247,0.08)',
          border: '1px solid rgba(168,85,247,0.2)',
          color: '#a855f7', fontSize: '11px',
          fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}
      >
        🤝 Negotiate
      </button>
    );
  }

  const selectedInfo = selectedPlayer ? nearbyPlayers.find(p => p.id === selectedPlayer) : null;

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'var(--bg-card)', border: '1px solid rgba(168,85,247,0.2)',
      marginTop: '8px', animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{
          fontSize: '12px', fontWeight: 600, color: '#a855f7',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          🤝 Negotiate
          <TrustBadge trust={myPlayer.socialTrust} />
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

      <div style={{
        fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>Your cash: <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>₹{myPlayer.state.cash}</span></span>
        <span style={{ color: myTrustConfig.color }}>
          {myTrustConfig.icon} Your reputation: {myTrustConfig.label}
        </span>
      </div>

      <div style={{
        fontSize: '9px', color: 'var(--text-muted)', marginBottom: '8px',
        fontStyle: 'italic',
      }}>
        {myPlayer.socialTrust >= 55
          ? 'Vendors give you better prices. People trust your deals.'
          : myPlayer.socialTrust >= 35
          ? 'You\'re building a reputation. Keep helping others.'
          : 'Low trust means higher prices and harder negotiations.'}
      </div>

      {/* Player selection */}
      <div style={{
        display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap'
      }}>
        {nearbyPlayers.map(p => {
          const pTrust = getTrustLevel(p.socialTrust);
          const pConfig = TRUST_CONFIG[pTrust];
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlayer(p.id)}
              style={{
                padding: '5px 10px', borderRadius: '8px',
                background: selectedPlayer === p.id ? 'rgba(168,85,247,0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${selectedPlayer === p.id ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`,
                color: selectedPlayer === p.id ? '#a855f7' : 'var(--text-secondary)',
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
              <span style={{
                fontSize: '8px', padding: '1px 4px', borderRadius: '3px',
                background: `${pConfig.color}15`, color: pConfig.color,
              }}>
                {pConfig.icon}
              </span>
            </button>
          );
        })}
      </div>

      {selectedPlayer && selectedInfo && (
        <>
          {/* Trust comparison */}
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '8px',
            padding: '6px 8px', borderRadius: '6px',
            background: 'var(--bg-secondary)',
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>You</div>
              <TrustBadge trust={myPlayer.socialTrust} />
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', alignSelf: 'center' }}>⇄</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{selectedInfo.name}</div>
              <TrustBadge trust={selectedInfo.socialTrust} />
            </div>
          </div>

          {/* Offer amount */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', minWidth: '55px' }}>You offer:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[5, 10, 25, 50].map(a => (
                <button
                  key={a}
                  onClick={() => setOfferAmount(a)}
                  disabled={a > myPlayer.state.cash}
                  style={{
                    padding: '3px 8px', borderRadius: '6px',
                    background: offerAmount === a ? '#a855f7' : 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: offerAmount === a ? '#fff' : 'var(--text-secondary)',
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

          {/* Request amount */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', minWidth: '55px' }}>You ask:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 5, 10, 25].map(a => (
                <button
                  key={a}
                  onClick={() => setRequestAmount(a)}
                  style={{
                    padding: '3px 8px', borderRadius: '6px',
                    background: requestAmount === a ? 'var(--accent-orange)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: requestAmount === a ? '#000' : 'var(--text-secondary)',
                    fontSize: '11px', fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {a === 0 ? 'Nothing' : `₹${a}`}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Add a message (optional)"
            maxLength={80}
            style={{
              width: '100%', padding: '6px 8px', borderRadius: '6px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '11px',
              marginBottom: '8px', boxSizing: 'border-box',
            }}
          />

          <button
            onClick={handleNegotiate}
            disabled={offerAmount > myPlayer.state.cash || offerAmount <= 0}
            style={{
              width: '100%', padding: '8px', borderRadius: '8px',
              background: offerAmount <= myPlayer.state.cash && offerAmount > 0 ? '#a855f7' : 'var(--bg-secondary)',
              color: offerAmount <= myPlayer.state.cash && offerAmount > 0 ? '#fff' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '12px',
              border: '1px solid rgba(168,85,247,0.3)',
              cursor: offerAmount <= myPlayer.state.cash && offerAmount > 0 ? 'pointer' : 'default'
            }}
          >
            Propose Deal to {selectedInfo.name}
          </button>
        </>
      )}
    </div>
  );
}

export function NegotiationModal() {
  const incoming = useGameStore(s => s.incomingNegotiation);
  const active = useGameStore(s => s.activeNegotiation);
  const respondToNegotiation = useGameStore(s => s.respondToNegotiation);
  const dismissNegotiation = useGameStore(s => s.dismissNegotiation);
  const myPlayer = useGameStore(s => s.myPlayer);
  const mySocketId = useGameStore(s => s.mySocketId);

  const [counterOffer, setCounterOffer] = useState(0);
  const [counterRequest, setCounterRequest] = useState(0);
  const [showCounter, setShowCounter] = useState(false);

  const offer = incoming || active;
  if (!offer || !myPlayer) return null;

  const isResolved = offer.status === 'accepted' || offer.status === 'declined' || offer.status === 'expired';
  const canRespond = !isResolved && (
    (offer.status === 'pending' && offer.toPlayerId === mySocketId) ||
    (offer.status === 'countered' && offer.history[offer.history.length - 1]?.playerId !== mySocketId)
  );

  const otherName = offer.fromPlayerId === mySocketId ? offer.toPlayerName : offer.fromPlayerName;
  const otherTrust = offer.fromPlayerId === mySocketId ? offer.toTrust : offer.fromTrust;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(3px)'
    }}>
      <div className="slide-up" style={{
        background: 'var(--bg-card)', border: '1px solid rgba(168,85,247,0.3)',
        borderRadius: '14px', padding: '20px',
        maxWidth: '400px', width: '90%',
        boxShadow: '0 6px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', fontSize: '28px', marginBottom: '8px' }}>🤝</div>
        <h3 style={{
          textAlign: 'center', fontSize: '15px', fontWeight: 700,
          marginBottom: '6px', color: '#a855f7'
        }}>
          Negotiation with {otherName}
        </h3>

        {/* Trust display */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '12px',
          marginBottom: '10px',
        }}>
          <TrustBadge trust={myPlayer.socialTrust} />
          <span style={{ color: 'var(--text-muted)', fontSize: '10px', alignSelf: 'center' }}>⇄</span>
          <TrustBadge trust={otherTrust} />
        </div>

        <NegotiationStatus offer={offer} />

        {/* Current terms */}
        <div style={{
          margin: '10px 0', padding: '8px', borderRadius: '8px',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '11px', marginBottom: '4px',
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {offer.fromPlayerName} offers:
            </span>
            <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>₹{offer.offeredAmount}</span>
          </div>
          {offer.requestedAmount > 0 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '11px',
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {offer.fromPlayerName} asks:
              </span>
              <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>₹{offer.requestedAmount}</span>
            </div>
          )}
          {offer.message && (
            <div style={{
              fontSize: '10px', color: 'var(--text-muted)',
              fontStyle: 'italic', marginTop: '4px',
              borderTop: '1px solid var(--border)', paddingTop: '4px',
            }}>
              "{offer.message}"
            </div>
          )}
        </div>

        <OfferHistory offer={offer} />

        {/* Actions */}
        {canRespond && !showCounter && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            <button
              onClick={() => respondToNegotiation(offer.id, 'decline')}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer',
              }}
            >
              Decline
            </button>
            {offer.round < offer.maxRounds && (
              <button
                onClick={() => {
                  setCounterOffer(offer.requestedAmount || 5);
                  setCounterRequest(Math.round(offer.offeredAmount * 0.7));
                  setShowCounter(true);
                }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '8px',
                  background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)',
                  color: 'var(--accent-yellow)', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Counter
              </button>
            )}
            <button
              onClick={() => respondToNegotiation(offer.id, 'accept')}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px',
                background: 'var(--accent-green)',
                color: '#000', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
              }}
            >
              Accept
            </button>
          </div>
        )}

        {canRespond && showCounter && (
          <div style={{ marginTop: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', minWidth: '55px' }}>You offer:</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[5, 10, 20, 30].map(a => (
                  <button
                    key={a}
                    onClick={() => setCounterOffer(a)}
                    disabled={a > myPlayer.state.cash}
                    style={{
                      padding: '2px 6px', borderRadius: '4px',
                      background: counterOffer === a ? 'var(--accent-yellow)' : 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: counterOffer === a ? '#000' : 'var(--text-secondary)',
                      fontSize: '10px', fontWeight: 600,
                      opacity: a > myPlayer.state.cash ? 0.3 : 1,
                      cursor: a > myPlayer.state.cash ? 'default' : 'pointer',
                    }}
                  >
                    ₹{a}
                  </button>
                ))}
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', minWidth: '55px' }}>You ask:</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[0, 5, 15, 25].map(a => (
                  <button
                    key={a}
                    onClick={() => setCounterRequest(a)}
                    style={{
                      padding: '2px 6px', borderRadius: '4px',
                      background: counterRequest === a ? 'var(--accent-orange)' : 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: counterRequest === a ? '#000' : 'var(--text-secondary)',
                      fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {a === 0 ? 'Nothing' : `₹${a}`}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setShowCounter(false)}
                style={{
                  flex: 1, padding: '7px', borderRadius: '6px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={() => {
                  respondToNegotiation(offer.id, 'counter', counterOffer, counterRequest);
                  setShowCounter(false);
                }}
                disabled={counterOffer > myPlayer.state.cash}
                style={{
                  flex: 2, padding: '7px', borderRadius: '6px',
                  background: 'var(--accent-yellow)',
                  color: '#000', fontWeight: 700, fontSize: '11px', cursor: 'pointer',
                }}
              >
                Send Counter-Offer
              </button>
            </div>
          </div>
        )}

        {isResolved && (
          <button
            onClick={dismissNegotiation}
            style={{
              width: '100%', marginTop: '10px', padding: '8px', borderRadius: '8px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer',
            }}
          >
            Close
          </button>
        )}

        {!canRespond && !isResolved && (
          <div style={{
            marginTop: '8px', textAlign: 'center',
            fontSize: '10px', color: 'var(--text-muted)',
          }}>
            Waiting for {otherName} to respond...
          </div>
        )}
      </div>
    </div>
  );
}
