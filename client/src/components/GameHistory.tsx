import { useState, useEffect } from 'react';

interface GameRecord {
  date: string;
  personaName: string;
  missionTitle: string;
  missionStatus: string;
  score: number;
  rank: number;
  totalPlayers: number;
  dilemmaCount: number;
  helpedCount: number;
  duration: number;
}

function loadHistory(): GameRecord[] {
  try {
    const raw = localStorage.getItem('its-game-history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGameRecord(record: GameRecord) {
  try {
    const history = loadHistory();
    history.unshift(record);
    if (history.length > 50) history.length = 50;
    localStorage.setItem('its-game-history', JSON.stringify(history));
  } catch { /* ignore */ }
}

export default function GameHistory() {
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  if (history.length === 0) return null;

  const wins = history.filter(g => g.rank === 1).length;
  const completed = history.filter(g => g.missionStatus === 'completed').length;
  const avgScore = Math.round(history.reduce((s, g) => s + g.score, 0) / history.length);
  const totalDilemmas = history.reduce((s, g) => s + g.dilemmaCount, 0);
  const totalHelped = history.reduce((s, g) => s + g.helpedCount, 0);
  const uniquePersonas = new Set(history.map(g => g.personaName)).size;

  return (
    <div style={{
      borderRadius: '12px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      overflow: 'hidden'
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '14px 16px',
          background: 'transparent', border: 'none',
          color: 'var(--text-primary)', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📊</span>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>Your Stats</span>
          <span style={{
            fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
            background: 'rgba(245,200,66,0.1)', color: 'var(--accent-yellow)', fontWeight: 600
          }}>
            {history.length} games
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
            marginBottom: '14px'
          }}>
            {[
              { label: 'Wins', value: wins, color: '#f5c842' },
              { label: 'Completed', value: completed, color: '#22c55e' },
              { label: 'Avg Score', value: avgScore, color: '#3b82f6' },
              { label: 'Personas', value: uniquePersonas, color: '#a855f7' },
              { label: 'Dilemmas', value: totalDilemmas, color: '#f97316' },
              { label: 'Helped', value: totalHelped, color: '#14b8a6' },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '10px', borderRadius: '8px', textAlign: 'center',
                background: 'var(--bg-secondary)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            Recent Games
          </div>
          {history.slice(0, 5).map((game, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 10px', borderRadius: '6px',
              background: i === 0 ? 'rgba(245,200,66,0.04)' : 'transparent',
              marginBottom: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600,
                  background: game.missionStatus === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: game.missionStatus === 'completed' ? '#22c55e' : '#ef4444'
                }}>
                  {game.missionStatus === 'completed' ? '✓' : '✗'}
                </span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600 }}>{game.personaName}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {game.missionTitle}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
                  {game.score}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  #{game.rank}/{game.totalPlayers}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
