import { useState } from 'react';
import { useGameStore, Vendor, VendorItem, MicroInteraction, ResourceScarcity } from '../store/gameStore';

const VENDOR_TYPE_ICONS: Record<string, string> = {
  food: '🍛', drink: '☕', medicine: '💊', goods: '🛍️', service: '🔧'
};

const EFFECT_LABELS: Record<string, { label: string; icon: string; good: boolean }> = {
  energy: { label: 'Energy', icon: '⚡', good: true },
  hunger: { label: 'Hunger', icon: '🍛', good: false },
  hydration: { label: 'Thirst', icon: '💧', good: false },
  mood: { label: 'Mood', icon: '😊', good: true },
  stress: { label: 'Stress', icon: '😰', good: false },
  health: { label: 'Health', icon: '❤️', good: true },
};

function EffectPills({ effects }: { effects: Partial<Record<string, number>> }) {
  const entries = Object.entries(effects).filter(([, v]) => v !== undefined && v !== 0);
  if (entries.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '3px' }}>
      {entries.map(([key, val]) => {
        const info = EFFECT_LABELS[key];
        if (!info) return null;
        const isPositive = info.good ? val! > 0 : val! < 0;
        return (
          <span key={key} style={{
            fontSize: '9px', padding: '1px 5px', borderRadius: '4px',
            background: isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: isPositive ? '#4ade80' : '#f87171',
          }}>
            {info.icon} {val! > 0 ? '+' : ''}{val}
          </span>
        );
      })}
    </div>
  );
}

function VendorCard({ vendor, onBuy, cash, disabled }: {
  vendor: Vendor; onBuy: (vendorId: string, itemId: string) => void;
  cash: number; disabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const icon = VENDOR_TYPE_ICONS[vendor.type] || '🏪';

  return (
    <div style={{
      borderRadius: '10px', overflow: 'hidden',
      border: '1px solid var(--border)',
      background: 'var(--bg-card)',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '8px 10px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {vendor.name}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>
            {vendor.personality}
          </div>
        </div>
        <span style={{
          fontSize: '10px', color: 'var(--text-muted)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
        }}>▼</span>
      </button>

      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '6px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {vendor.items.map((item: VendorItem) => {
            const canAfford = cash >= item.cost;
            return (
              <button
                key={item.id}
                onClick={() => onBuy(vendor.id, item.id)}
                disabled={disabled || !canAfford}
                style={{
                  padding: '6px 8px', borderRadius: '6px',
                  background: canAfford ? 'var(--bg-secondary)' : 'rgba(0,0,0,0.15)',
                  border: '1px solid var(--border)',
                  cursor: disabled || !canAfford ? 'not-allowed' : 'pointer',
                  opacity: canAfford ? 1 : 0.5,
                  textAlign: 'left',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {item.name}
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, flexShrink: 0,
                    color: canAfford ? 'var(--accent-green)' : 'var(--accent-red)',
                  }}>
                    ₹{item.cost}
                  </span>
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.description}
                </div>
                <EffectPills effects={item.effects as Record<string, number>} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InteractionCard({ interaction, onChoose, disabled }: {
  interaction: MicroInteraction; onChoose: (interactionId: string, choiceId: string) => void;
  disabled: boolean;
}) {
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <div style={{
      borderRadius: '10px', overflow: 'hidden',
      border: '1px solid rgba(168,85,247,0.2)',
      background: 'rgba(168,85,247,0.04)',
    }}>
      <div style={{
        padding: '10px 12px',
        display: 'flex', alignItems: 'flex-start', gap: '8px',
      }}>
        <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>✨</span>
        <div style={{
          fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5,
          fontStyle: 'italic',
        }}>
          {interaction.text}
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(168,85,247,0.12)',
        padding: '6px',
        display: 'flex', flexDirection: 'column', gap: '4px',
      }}>
        {interaction.choices.map(choice => (
          <button
            key={choice.id}
            onClick={() => {
              setChosen(choice.id);
              onChoose(interaction.id, choice.id);
            }}
            disabled={disabled || chosen !== null}
            style={{
              padding: '7px 10px', borderRadius: '6px',
              background: chosen === choice.id
                ? 'rgba(168,85,247,0.15)'
                : 'var(--bg-secondary)',
              border: chosen === choice.id
                ? '1px solid rgba(168,85,247,0.3)'
                : '1px solid var(--border)',
              cursor: disabled || chosen !== null ? 'not-allowed' : 'pointer',
              opacity: chosen !== null && chosen !== choice.id ? 0.4 : 1,
              textAlign: 'left', fontSize: '11px',
              color: 'var(--text-primary)',
              transition: 'opacity 0.3s',
            }}
          >
            {chosen === choice.id ? '✓ ' : ''}{choice.label}
            <EffectPills effects={choice.effects as Record<string, number>} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LocationContent() {
  const snapshot = useGameStore(s => s.currentLocationSnapshot);
  const myPlayer = useGameStore(s => s.myPlayer);
  const submitAction = useGameStore(s => s.submitAction);
  const lastActionTick = useGameStore(s => s.lastActionTick);
  const room = useGameStore(s => s.room);

  if (!snapshot || !myPlayer || !room) return null;

  const currentTick = room.tick || 0;
  const cooldown = Math.max(0, 3 - (currentTick - lastActionTick));
  const isOnCooldown = cooldown > 0 && lastActionTick > 0;

  const vendors = snapshot.vendors || [];
  const interactions = snapshot.interactions || [];

  const handleBuy = (vendorId: string, itemId: string) => {
    submitAction('buy_from_vendor' as never, { vendorId, itemId });
  };

  const handleInteraction = (interactionId: string, choiceId: string) => {
    submitAction('micro_interaction' as never, { interactionId, choiceId });
  };

  const hasContent = vendors.length > 0 || interactions.length > 0;
  if (!hasContent) return null;

  const atmo = snapshot.atmosphere;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Atmosphere banner */}
      {atmo && atmo.crowd && (
        <div style={{
          padding: '8px 10px', borderRadius: '8px',
          background: 'rgba(245,200,66,0.04)',
          border: '1px solid rgba(245,200,66,0.1)',
          display: 'flex', flexDirection: 'column', gap: '3px',
        }}>
          <div style={{
            fontSize: '10px', color: 'var(--text-muted)',
            display: 'flex', gap: '8px', flexWrap: 'wrap',
          }}>
            <span>👥 {atmo.crowd}</span>
            <span>🔊 {atmo.noise}</span>
            {atmo.smell && <span>👃 {atmo.smell}</span>}
          </div>
          {atmo.visualDetail && (
            <div style={{
              fontSize: '10px', color: 'var(--text-secondary)',
              fontStyle: 'italic', lineHeight: 1.4,
            }}>
              {atmo.visualDetail}
            </div>
          )}
        </div>
      )}

      {/* Resource scarcity */}
      {snapshot.scarcity && (
        <ScarcityIndicator scarcity={snapshot.scarcity} />
      )}

      {/* Micro-interactions */}
      {interactions.length > 0 && (
        <div>
          <div style={{
            fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '5px',
          }}>
            What's happening here
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {interactions.map(inter => (
              <InteractionCard
                key={inter.id}
                interaction={inter}
                onChoose={handleInteraction}
                disabled={isOnCooldown}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vendors */}
      {vendors.length > 0 && (
        <div>
          <div style={{
            fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '5px',
          }}>
            Vendors nearby
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {vendors.map(vendor => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onBuy={handleBuy}
                cash={myPlayer.state.cash}
                disabled={isOnCooldown}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScarcityIndicator({ scarcity }: { scarcity: ResourceScarcity }) {
  const resources = [
    { key: 'food', label: 'Food', value: scarcity.foodAvailability, icon: '🍛' },
    { key: 'water', label: 'Water', value: scarcity.waterAvailability, icon: '💧' },
    { key: 'medicine', label: 'Medicine', value: scarcity.medicineAvailability, icon: '💊' },
    { key: 'work', label: 'Work', value: scarcity.workAvailability, icon: '💼' },
  ];

  const hasScarcity = resources.some(r => r.value < 0.4);
  const hasHighPrices = scarcity.priceMultiplier > 1.2;

  if (!hasScarcity && !hasHighPrices) return null;

  function barColor(val: number): string {
    if (val < 0.2) return 'var(--accent-red)';
    if (val < 0.4) return 'var(--accent-orange)';
    if (val < 0.7) return 'var(--accent-yellow)';
    return 'var(--accent-green)';
  }

  function levelLabel(val: number): string {
    if (val < 0.2) return 'Scarce';
    if (val < 0.4) return 'Low';
    if (val < 0.7) return 'OK';
    return 'Good';
  }

  return (
    <div style={{
      padding: '8px', borderRadius: '8px',
      background: hasScarcity ? 'rgba(239,68,68,0.04)' : 'rgba(245,200,66,0.04)',
      border: `1px solid ${hasScarcity ? 'rgba(239,68,68,0.12)' : 'rgba(245,200,66,0.12)'}`,
    }}>
      <div style={{
        fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.4px', marginBottom: '6px',
        color: hasScarcity ? 'var(--accent-red)' : 'var(--accent-yellow)',
      }}>
        Resource Availability
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        {resources.filter(r => r.value < 0.7).map(r => (
          <div key={r.key} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 6px', borderRadius: '4px',
            background: 'var(--bg-secondary)',
          }}>
            <span style={{ fontSize: '10px' }}>{r.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                height: '3px', borderRadius: '2px',
                background: 'var(--border)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${r.value * 100}%`,
                  background: barColor(r.value),
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
            <span style={{
              fontSize: '8px', fontWeight: 600,
              color: barColor(r.value),
            }}>
              {levelLabel(r.value)}
            </span>
          </div>
        ))}
      </div>
      {hasHighPrices && (
        <div style={{
          marginTop: '4px', fontSize: '9px', color: 'var(--accent-orange)',
          display: 'flex', alignItems: 'center', gap: '3px',
        }}>
          <span>📈</span> Prices +{Math.round(scarcity.priceMultiplier * 100 - 100)}% above normal
        </div>
      )}
    </div>
  );
}
