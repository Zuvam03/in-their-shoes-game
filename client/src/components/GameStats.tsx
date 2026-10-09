import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface Stats {
  locationVisits: Record<string, number>;
  totalMoves: number;
  moneyEarned: number;
  moneySpent: number;
  actionsPerformed: number;
  helpGiven: number;
  helpReceived: number;
  dilemmasFaced: number;
  eventsEncountered: number;
  peakHealth: number;
  lowestHealth: number;
  peakCash: number;
}

const defaultStats: Stats = {
  locationVisits: {},
  totalMoves: 0,
  moneyEarned: 0,
  moneySpent: 0,
  actionsPerformed: 0,
  helpGiven: 0,
  helpReceived: 0,
  dilemmasFaced: 0,
  eventsEncountered: 0,
  peakHealth: 100,
  lowestHealth: 100,
  peakCash: 0,
};

export default function GameStats() {
  const { myPlayer, notifications, lastActionResult } = useGameStore();
  const statsRef = useRef<Stats>({ ...defaultStats });
  const prevCashRef = useRef<number>(0);
  const prevLocationRef = useRef<string>('');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!myPlayer) return;
    const stats = statsRef.current;

    if (myPlayer.state.location !== prevLocationRef.current && prevLocationRef.current) {
      stats.totalMoves++;
      stats.locationVisits[myPlayer.state.location] = (stats.locationVisits[myPlayer.state.location] || 0) + 1;
    }
    prevLocationRef.current = myPlayer.state.location;

    if (myPlayer.state.cash > prevCashRef.current && prevCashRef.current > 0) {
      stats.moneyEarned += myPlayer.state.cash - prevCashRef.current;
    } else if (myPlayer.state.cash < prevCashRef.current) {
      stats.moneySpent += prevCashRef.current - myPlayer.state.cash;
    }
    prevCashRef.current = myPlayer.state.cash;

    stats.peakHealth = Math.max(stats.peakHealth, myPlayer.state.health);
    stats.lowestHealth = Math.min(stats.lowestHealth, myPlayer.state.health);
    stats.peakCash = Math.max(stats.peakCash, myPlayer.state.cash);
    stats.helpGiven = myPlayer.state.helpedOthersCount;
    stats.helpReceived = myPlayer.state.receivedHelpCount;

    forceUpdate(n => n + 1);
  }, [myPlayer?.state.location, myPlayer?.state.cash, myPlayer?.state.health,
      myPlayer?.state.helpedOthersCount, myPlayer?.state.receivedHelpCount]);

  useEffect(() => {
    if (lastActionResult) {
      statsRef.current.actionsPerformed++;
    }
  }, [lastActionResult]);

  useEffect(() => {
    const last = notifications[notifications.length - 1];
    if (!last) return;
    if (last.type === 'dilemma') statsRef.current.dilemmasFaced++;
    if (last.type === 'event') statsRef.current.eventsEncountered++;
  }, [notifications.length]);

  const stats = statsRef.current;
  const uniqueLocations = Object.keys(stats.locationVisits).length;

  return (
    <div style={{ padding: '12px' }}>
      <div style={{
        fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600,
        marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px'
      }}>
        Session Statistics
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <StatTile icon="🚶" label="Moves" value={stats.totalMoves} />
        <StatTile icon="📍" label="Locations" value={uniqueLocations} />
        <StatTile icon="⚡" label="Actions" value={stats.actionsPerformed} />
        <StatTile icon="⚖️" label="Dilemmas" value={stats.dilemmasFaced} />
        <StatTile icon="💰" label="Earned" value={`₹${stats.moneyEarned}`} color="var(--accent-green)" />
        <StatTile icon="💸" label="Spent" value={`₹${stats.moneySpent}`} color="var(--accent-red)" />
        <StatTile icon="🤝" label="Help Given" value={stats.helpGiven} color="var(--accent-blue)" />
        <StatTile icon="🙏" label="Help Got" value={stats.helpReceived} color="var(--accent-purple)" />
      </div>

      {/* Health range */}
      <div style={{
        marginTop: '12px', padding: '8px 10px', borderRadius: '8px',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)'
      }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
          Health Range
        </div>
        <div style={{ position: 'relative', height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
          <div style={{
            position: 'absolute', height: '100%', borderRadius: '3px',
            left: `${stats.lowestHealth}%`,
            width: `${stats.peakHealth - stats.lowestHealth}%`,
            background: 'linear-gradient(90deg, var(--accent-red), var(--accent-green))'
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: '4px',
          fontSize: '9px', color: 'var(--text-muted)'
        }}>
          <span>Low: {Math.round(stats.lowestHealth)}</span>
          <span>Peak: {Math.round(stats.peakHealth)}</span>
        </div>
      </div>

      {/* Most visited */}
      {uniqueLocations > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            Most Visited
          </div>
          {Object.entries(stats.locationVisits)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([locId, count]) => (
              <div key={locId} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '11px', color: 'var(--text-secondary)',
                padding: '3px 0'
              }}>
                <span>{locId.replace(/_/g, ' ')}</span>
                <span style={{ fontWeight: 600 }}>{count}x</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function StatTile({ icon, label, value, color }: {
  icon: string; label: string; value: number | string; color?: string;
}) {
  return (
    <div style={{
      padding: '8px', borderRadius: '8px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '14px', marginBottom: '2px' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: color || 'var(--text-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
