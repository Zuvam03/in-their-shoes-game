import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import CityMap from './CityMap';
import CharacterPanel from './CharacterPanel';
import ActionPanel from './ActionPanel';
import MissionPanel from './MissionPanel';
import PlayersPanel from './PlayersPanel';
import ChatPanel from './ChatPanel';
import EventFeed from './EventFeed';
import DilemmaModal from './DilemmaModal';
import SettingsPanel from './SettingsPanel';
import AchievementToast from './AchievementToast';
import TutorialOverlay from './TutorialOverlay';
import InteractionModal from './InteractionModal';
import Minimap from './Minimap';
import LocationDetail from './LocationDetail';
import JourneyTimeline from './JourneyTimeline';
import QuickEmoteBar from './QuickEmoteBar';
import StatusEffectsBar from './StatusEffectsBar';
import FloatingNumbers from './FloatingNumbers';
import ActionResultToast from './ActionResultToast';
import MissionHUD from './MissionHUD';
import MatchTimeline from './MatchTimeline';
import LiveLeaderboard from './LiveLeaderboard';
import ContextualHints from './ContextualHints';
import WeatherWidget from './WeatherWidget';
import QuickActions from './QuickActions';
import KeyboardShortcuts from './KeyboardShortcuts';
import { playActionSuccess, playActionFail, playWarning, playCoinEarn, playCoinSpend, playChat, playDilemma, playFortune, playGameStart, playGameEnd } from '../game/sounds';

type Tab = 'map' | 'character' | 'mission' | 'players' | 'chat' | 'feed' | 'journey';

export default function GameScreen() {
  const { room, myPlayer, unreadChatCount, unreadNotifCount, soundEnabled, toggleSound, notifications, chatMessages, lastActionResult, pendingDilemma } = useGameStore();
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Warn before closing during active game
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // Keyboard shortcuts for tab switching
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'SELECT') return;
      const tabKeys: Record<string, Tab> = { '1': 'map', '2': 'character', '3': 'mission', '4': 'players', '5': 'chat', '6': 'feed', '7': 'journey' };
      if (tabKeys[e.key]) {
        e.preventDefault();
        setActiveTab(tabKeys[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Play game start sound on mount
  useEffect(() => {
    if (soundEnabled) playGameStart();
  }, []);

  // Sound effects
  useEffect(() => {
    if (!soundEnabled || !lastActionResult) return;
    if (lastActionResult.success) {
      if (lastActionResult.changes.cash !== undefined && lastActionResult.changes.cash > (myPlayer?.state.cash || 0)) {
        playCoinEarn();
      } else if (lastActionResult.changes.cash !== undefined && lastActionResult.changes.cash < (myPlayer?.state.cash || 0)) {
        playCoinSpend();
      } else {
        playActionSuccess();
      }
    } else {
      playActionFail();
    }
  }, [lastActionResult]);

  useEffect(() => {
    if (!soundEnabled) return;
    const last = notifications[notifications.length - 1];
    if (!last) return;
    if (last.type === 'warning') playWarning();
    else if (last.type === 'fortune') playFortune();
  }, [notifications.length]);

  useEffect(() => {
    if (!soundEnabled || chatMessages.length === 0) return;
    const last = chatMessages[chatMessages.length - 1];
    if (last && last.senderId !== myPlayer?.id) playChat();
  }, [chatMessages.length]);

  useEffect(() => {
    if (soundEnabled && pendingDilemma) playDilemma();
  }, [pendingDilemma]);

  if (!myPlayer || !room) return null;

  const timeLeft = room.matchDuration - room.tick;
  const timeMin = Math.floor(Math.max(0, timeLeft) / 60);
  const timeSec = Math.max(0, timeLeft) % 60;
  const timeIsLow = timeLeft < 60;
  const timeIsCritical = timeLeft < 30;

  // Live score estimate
  const completedRequired = myPlayer.mission.objectives.filter((o: { optional: boolean; completed: boolean }) => !o.optional && o.completed).length;
  const totalRequired = myPlayer.mission.objectives.filter((o: { optional: boolean }) => !o.optional).length;
  const completedOptional = myPlayer.mission.objectives.filter((o: { optional: boolean; completed: boolean }) => o.optional && o.completed).length;
  const liveScore = Math.min(100, Math.max(0,
    Math.round((completedRequired / Math.max(1, totalRequired)) * 60)
    + completedOptional * 10
    + Math.round(myPlayer.state.cash / 10)
    + Math.round(myPlayer.socialTrust / 2)
    + Math.round(myPlayer.communityImpact)
  ));

  const nearbyPlayers = Object.values(room.players)
    .filter(p => p.id !== myPlayer.id && p.state.location === myPlayer.state.location && p.isConnected);

  const tabs: { key: Tab; icon: string; label: string; badge?: number }[] = [
    { key: 'map', icon: '🗺️', label: 'Map' },
    { key: 'character', icon: '👤', label: 'Stats' },
    { key: 'mission', icon: '🎯', label: 'Mission' },
    { key: 'players', icon: '👥', label: 'Players' },
    { key: 'chat', icon: '💬', label: 'Chat', badge: unreadChatCount },
    { key: 'feed', icon: '📋', label: 'Events', badge: unreadNotifCount },
    { key: 'journey', icon: '📜', label: 'Journey' }
  ];

  if (isMobile) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Compact header */}
        <div style={{
          height: '40px', minHeight: '40px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          padding: '0 8px', gap: '8px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 8px', borderRadius: '12px',
            background: timeIsCritical ? 'rgba(239,68,68,0.2)' : timeIsLow ? 'rgba(245,200,66,0.15)' : 'var(--bg-card)',
            color: timeIsCritical ? 'var(--accent-red)' : timeIsLow ? 'var(--accent-yellow)' : 'var(--text-primary)',
            fontWeight: 700, fontSize: '13px'
          }}>
            ⏱ {timeMin}:{timeSec.toString().padStart(2, '0')}
          </div>

          <div style={{ flex: 1 }} />

          <MiniStatBar label="HP" value={myPlayer.state.health} color="var(--accent-red)" />
          <MiniStatBar label="EN" value={myPlayer.state.energy} color="var(--accent-yellow)" />

          <div style={{
            padding: '4px 8px', borderRadius: '12px',
            background: 'rgba(34, 197, 94, 0.1)',
            fontWeight: 700, color: 'var(--accent-green)', fontSize: '12px'
          }}>
            ₹{myPlayer.state.cash}
          </div>

          <div style={{
            padding: '4px 6px', borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.1)',
            fontWeight: 700, color: 'var(--accent-purple)', fontSize: '11px'
          }}>
            {liveScore}pts
          </div>

          <button onClick={() => setShowSettings(true)} style={{
            background: 'none', border: 'none', fontSize: '14px',
            color: 'var(--text-secondary)', padding: '2px'
          }}>
            ⚙️
          </button>
        </div>

        {/* Match timeline */}
        <MatchTimeline />

        {/* Status effects */}
        <div style={{ padding: '0 8px' }}>
          <StatusEffectsBar />
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {activeTab === 'map' && (
            <>
              <CityMap />
              <MissionHUD />
              <WeatherWidget />
              <ContextualHints />
            </>
          )}
          {activeTab === 'character' && <div style={{ height: '100%', overflowY: 'auto' }}><CharacterPanel /></div>}
          {activeTab === 'mission' && <div style={{ height: '100%', overflowY: 'auto' }}><MissionPanel /></div>}
          {activeTab === 'players' && <div style={{ height: '100%', overflowY: 'auto' }}><PlayersPanel /></div>}
          {activeTab === 'chat' && <ChatPanel />}
          {activeTab === 'feed' && <EventFeed />}
          {activeTab === 'journey' && <div style={{ height: '100%', overflowY: 'auto' }}><JourneyTimeline /></div>}
          {activeTab === 'map' && (
            <div style={{
              position: 'absolute', bottom: '0', left: '0', right: '0',
              background: 'linear-gradient(transparent, var(--bg-secondary))',
              padding: '8px', maxHeight: '45%', overflowY: 'auto'
            }}>
              <QuickEmoteBar />
              <ActionPanel />
            </div>
          )}
        </div>

        {/* Bottom tab bar */}
        <div style={{
          height: '52px', minHeight: '52px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          display: 'flex'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '2px',
                background: activeTab === tab.key ? 'rgba(245,200,66,0.08)' : 'transparent',
                color: activeTab === tab.key ? 'var(--accent-yellow)' : 'var(--text-muted)',
                borderTop: activeTab === tab.key ? '2px solid var(--accent-yellow)' : '2px solid transparent',
                fontSize: '10px', fontWeight: 600, position: 'relative'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {(tab.badge || 0) > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '50%', marginRight: '-16px',
                  background: 'var(--accent-red)', color: '#fff',
                  fontSize: '9px', fontWeight: 700,
                  width: '14px', height: '14px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {tab.badge! > 9 ? '9+' : tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <FloatingNumbers />
        <ActionResultToast />
        <DilemmaModal />
        <InteractionModal />
        <AchievementToast />
        <TutorialOverlay />
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </div>
    );
  }

  // Desktop layout
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
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏙️ Kolkata City Survival
          {room.gameSpeed !== 1 && (
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '2px 6px',
              borderRadius: '8px',
              background: room.gameSpeed > 1 ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
              color: room.gameSpeed > 1 ? 'var(--accent-red)' : 'var(--accent-blue)'
            }}>
              {room.gameSpeed}x
            </span>
          )}
        </div>

        {room.cityEvents.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '20px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '11px', color: '#f87171', fontWeight: 600
          }}>
            ⚠ {room.cityEvents[0].title}
          </div>
        )}

        {nearbyPlayers.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '20px',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
            fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600
          }}>
            👥 {nearbyPlayers.map(p => p.name).join(', ')} nearby
          </div>
        )}

        <div style={{ flex: 1 }} />

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

        <div style={{
          padding: '6px 12px', borderRadius: '20px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          fontWeight: 700, color: 'var(--accent-green)', fontSize: '14px'
        }}>
          ₹{myPlayer.state.cash}
        </div>

        <div style={{
          padding: '5px 10px', borderRadius: '20px',
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          fontWeight: 700, color: 'var(--accent-purple)', fontSize: '12px'
        }}
          title="Estimated score based on current progress"
        >
          Score: {liveScore}
        </div>

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

        <button onClick={toggleSound} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '6px', padding: '5px 8px', fontSize: '14px',
          color: soundEnabled ? 'var(--text-primary)' : 'var(--text-muted)'
        }}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        <button onClick={() => setShowSettings(true)} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '6px', padding: '5px 8px', fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          ⚙️
        </button>
      </div>

      {/* Match timeline */}
      <MatchTimeline />

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
          {/* Minimap + Stat bars */}
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
            <Minimap />
          </div>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
            <StatBar label="Health" value={myPlayer.state.health} color="var(--accent-red)" icon="❤️" />
            <StatBar label="Energy" value={myPlayer.state.energy} color="var(--accent-yellow)" icon="⚡" />
            <StatBar label="Hunger" value={myPlayer.state.hunger} color="var(--accent-orange)" icon="🍛" inverted />
            <StatBar label="Hydration" value={myPlayer.state.hydration} color="var(--accent-blue)" icon="💧" inverted />
            <StatBar label="Mood" value={myPlayer.state.mood} color="var(--accent-purple)" icon="😊" />
            <StatBar label="Stress" value={myPlayer.state.stress} color="#ef4444" icon="😰" inverted />
            <StatusEffectsBar />
          </div>

          {/* Tab navigation */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)', flexWrap: 'wrap'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: '6px 2px', minWidth: '40px',
                  background: activeTab === tab.key ? 'rgba(245,200,66,0.1)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--accent-yellow)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--accent-yellow)' : '2px solid transparent',
                  fontSize: '10px', fontWeight: 600, textTransform: 'capitalize',
                  position: 'relative'
                }}
              >
                <span>{tab.icon}</span>
                <div>{tab.label}</div>
                {(tab.badge || 0) > 0 && (
                  <span style={{
                    position: 'absolute', top: '2px', right: '4px',
                    background: 'var(--accent-red)', color: '#fff',
                    fontSize: '8px', fontWeight: 700,
                    width: '12px', height: '12px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {tab.badge! > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'character' && <CharacterPanel />}
            {activeTab === 'mission' && <MissionPanel />}
            {activeTab === 'players' && <PlayersPanel />}
            {activeTab === 'chat' && <ChatPanel />}
            {activeTab === 'feed' && <EventFeed />}
            {activeTab === 'journey' && <JourneyTimeline />}
            {activeTab === 'map' && (
              <div style={{ padding: '12px' }}>
                <LocationDetail />
                <QuickEmoteBar />
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
          <MissionHUD />
          <LiveLeaderboard />
          <WeatherWidget />
          <QuickActions />
          <ContextualHints />
        </div>
      </div>

      <FloatingNumbers />
      <ActionResultToast />
      <DilemmaModal />
      <InteractionModal />
      <AchievementToast />
      <TutorialOverlay />
      <KeyboardShortcuts />
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
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

function MiniStatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{label}</span>
      <div style={{
        width: '32px', height: '4px', background: 'var(--border)',
        borderRadius: '2px', overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          width: `${Math.round(value)}%`, background: color,
          transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  );
}
