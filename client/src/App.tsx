import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import Landing from './components/Landing';
import Lobby from './components/Lobby';
import Briefing from './components/Briefing';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import CityEventModal from './components/CityEventModal';
import DilemmaModal from './components/DilemmaModal';
import FeedbackToast from './components/FeedbackToast';
import ConnectionOverlay from './components/ConnectionOverlay';

export default function App() {
  const { screen, connect, pendingCityEvent, pendingDilemma } = useGameStore();

  useEffect(() => {
    connect();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {screen === 'landing' && <Landing />}
      {screen === 'lobby' && <Lobby />}
      {screen === 'briefing' && <Briefing />}
      {screen === 'game' && <GameScreen />}
      {screen === 'results' && <ResultsScreen />}

      {/* Global overlays */}
      {pendingCityEvent && <CityEventModal />}
      {pendingDilemma && <DilemmaModal />}
      <FeedbackToast />
      <ConnectionOverlay />
    </div>
  );
}
