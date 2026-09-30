import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import Landing from './components/Landing';
import Lobby from './components/Lobby';
import Briefing from './components/Briefing';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import CityEventModal from './components/CityEventModal';
import FeedbackToast from './components/FeedbackToast';

export default function App() {
  const { screen, connect, connected, pendingCityEvent } = useGameStore();

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
      <FeedbackToast />
    </div>
  );
}
