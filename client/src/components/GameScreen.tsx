import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import CityMap from './CityMap';
import CharacterPanel from './CharacterPanel';
import ActionPanel from './ActionPanel';
import MissionPanel from './MissionPanel';
import PlayersPanel from './PlayersPanel';

type Tab = 'map' | 'character' | 'mission' | 'players';

export default function GameScreen() {
  const { room, myPlayer } = useGameStore();
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [showSidebar, setShowSidebar] = useState(true);

  if (!myPlayer || !room) return null;

  const timeLeft = room.matchDuration - room.tick;
  const timeMin = Math.floor(Math.max(0, timeLeft) / 60);
  const timeSec = Math.max(0, timeLeft) % 60;
  const timeIsLow = timeLeft < 60;
  const timeIsCritical = timeLeft < 30;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        height: '48px', minHeight: '48px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: '12px',
        zIndex: 10
      }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-yellow)' }}>
          🏙️ Kolkata City Survival
        </div>

        <div style={{ flex: 1 }} />

        {/* Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: '20px',
          background: timeIsCritical
            ? 'rgba(239, 68, 68, 0.2)'
            : timeIsLow
              ? 'rgba(245, 200, 66, 0.15)'
              : 'var(--bg-card)',
          border: `1px solid ${timeIsCritical ? 'rgba(239,68,68,0.4)' : timeIsLow ? 'rgba(245,200,66,0.3)' : 'var(--border)'}`,
          color: timeIsCritical ? 'var(--accent-red)' : timeIsLow ? 'var(--accent-yellow)' : 'var(--text-primary)',
          fontWeight: 700, fontSize: '15px',
          ...(timeIsCritical ? { animation: 'pulse 1s infinite' } : {})
        }}>
          ⏱ {timeMin}:{timeSec.toString().padStart(2, '0')}
        </div>

        {/* Cash */}
        <div style={{
          padding: '6px 12px', borderRadius: '20px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          fontWeight: 700, color: 'var(--accent-green)', fontSize: '14px'
        }}>
          ₹{myPlayer.state.cash}
        </div>

        {/* Mission status */}
        <div style={{
          padding: '5px 10px', borderRadius: '20px', fontSize: '12px',
          background: myPlayer.mission.status === 'completed'
            ? 'rgba(34,197,94,0.15)'
            : myPlayer.mission.status === 'failed'
              ? 'rgba(239,68,68,0.15)'
              : myPlayer.mission.status === 'partial'
                ? 'rgba(245,200,66,0.1)'
                : 'var(--bg-card)',
          color: myPlayer.mission.status === 'completed'
            ? 'var(--accent-green)'
            : myPlayer.mission.status === 'failed'
              ? 'var(--accent-red)'
              : myPlayer.mission.status === 'partial'
                ? 'var(--accent-yellow)'
                : 'var(--text-secondary)',
          border: '1px solid var(--border)'
        }}>
          {myPlayer.mission.title || myPlayer.mission.definition.title}
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', overflow: 'hidden'
      }}>
        {/* Left sidebar */}
        <div style={{
          width: showSidebar ? '280px' : '0',
          minWidth: showSidebar ? '280px' : '0',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.2s ease, min-width 0.2s ease'
        }}>
          {/* Stat bars */}
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
            <StatBar label="Health" value={myPlayer.state.health} color="var(--accent-red)" icon="❤️" />
            <StatBar label="Energy" value={myPlayer.state.energy} color="var(--accent-yellow)" icon="⚡" />
            <StatBar label="Hunger" value={myPlayer.state.hunger} color="var(--accent-orange)" icon="🍛" inverted />
            <StatBar label="Hydration" value={myPlayer.state.hydration} color="var(--accent-blue)" icon="💧" inverted />
            <StatBar label="Mood" value={myPlayer.state.mood} color="var(--accent-purple)" icon="😊" />
            <StatBar label="Stress" value={myPlayer.state.stress} color="#ef4444" icon="😰" inverted />
          </div>

          {/* Tab navigation */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)'
          }}>
            {(['map', 'character', 'mission', 'players'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '8px 4px',
                  background: activeTab === tab ? 'rgba(245,200,66,0.1)' : 'transparent',
                  color: activeTab === tab ? 'var(--accent-yellow)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab ? '2px solid var(--accent-yellow)' : '2px solid transparent',
                  fontSize: '11px', fontWeight: 600, textTransform: 'capitalize'
                }}
              >
                {tab === 'map' ? '🗺️' : tab === 'character' ? '👤' : tab === 'mission' ? '🎯' : '👥'}
                <div>{tab}</div>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'character' && <CharacterPanel />}
            {activeTab === 'mission' && <MissionPanel />}
            {activeTab === 'players' && <PlayersPanel />}
            {activeTab === 'map' && (
              <div style={{ padding: '12px' }}>
                <ActionPanel />
              </div>
            )}
          </div>
        </div>

        {/* Map area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              position: 'absolute', top: '12px', left: '12px',
              zIndex: 5, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: '6px',
              padding: '6px 10px', color: 'var(--text-secondary)', fontSize: '12px'
            }}
          >
            {showSidebar ? '◀ Hide' : '▶ Show'} Panel
          </button>
          <CityMap />
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, color, icon, inverted = false }: {
  label: string; value: number; color: string; icon: string; inverted?: boolean;
}) {
  const displayValue = Math.round(value);
  const barWidth = `${displayValue}%`;
  const isWarning = inverted ? displayValue > 65 : displayValue < 30;
  const isCritical = inverted ? displayValue > 85 : displayValue < 15;

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '3px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px' }}>{icon}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 600,
          color: isCritical ? 'var(--accent-red)' : isWarning ? 'var(--accent-yellow)' : 'var(--text-primary)'
        }}>
          {displayValue}
        </span>
      </div>
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          width: inverted ? `${displayValue}%` : barWidth,
          background: isCritical
            ? 'var(--accent-red)'
            : isWarning
              ? 'var(--accent-yellow)'
              : color,
          transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  );
}
