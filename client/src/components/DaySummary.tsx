import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface DaySnapshot {
  day: number;
  health: number;
  energy: number;
  cash: number;
  mood: number;
  stress: number;
  trust: number;
  actions: number;
  objectivesCompleted: number;
}

export default function DaySummary() {
  const { myPlayer, room } = useGameStore();
  const [visible, setVisible] = useState(false);
  const [snapshot, setSnapshot] = useState<DaySnapshot | null>(null);
  const lastDay = useRef(0);
  const actionCountRef = useRef(0);

  useEffect(() => {
    if (!myPlayer || !room || room.phase !== 'playing') return;
    const currentDay = Math.floor(room.tick / 600) + 1;

    if (lastDay.current > 0 && currentDay > lastDay.current) {
      const completed = myPlayer.mission.objectives.filter(o => o.completed).length;
      setSnapshot({
        day: lastDay.current,
        health: myPlayer.state.health,
        energy: myPlayer.state.energy,
        cash: myPlayer.state.cash,
        mood: myPlayer.state.mood,
        stress: myPlayer.state.stress,
        trust: myPlayer.socialTrust,
        actions: myPlayer.actionLog.length - actionCountRef.current,
        objectivesCompleted: completed
      });
      actionCountRef.current = myPlayer.actionLog.length;
      setVisible(true);
    }
    lastDay.current = currentDay;
  }, [room?.tick]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible || !snapshot) return null;

  const statColor = (val: number, low: number, high: number) =>
    val >= high ? 'var(--accent-green)' : val <= low ? 'var(--accent-red)' : 'var(--accent-yellow)';

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 700, maxWidth: '360px', width: '90%',
      animation: 'fadeIn 0.5s ease'
    }}>
      <div style={{
        background: 'rgba(13,15,20,0.97)',
        border: '1px solid rgba(245,200,66,0.3)',
        borderRadius: '16px', padding: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
      }}>
        <div style={{
          textAlign: 'center', marginBottom: '16px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>🌅</div>
          <div style={{
            fontSize: '18px', fontWeight: 800, color: 'var(--accent-yellow)'
          }}>
            Day {snapshot.day} Complete
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            A new day begins in Kolkata
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
          marginBottom: '16px'
        }}>
          <SummaryStat icon="❤️" label="Health" value={Math.round(snapshot.health)}
            color={statColor(snapshot.health, 30, 70)} />
          <SummaryStat icon="⚡" label="Energy" value={Math.round(snapshot.energy)}
            color={statColor(snapshot.energy, 25, 60)} />
          <SummaryStat icon="💰" label="Cash" value={`₹${snapshot.cash}`}
            color="var(--accent-green)" />
          <SummaryStat icon="😊" label="Mood" value={Math.round(snapshot.mood)}
            color={statColor(snapshot.mood, 30, 60)} />
          <SummaryStat icon="😰" label="Stress" value={Math.round(snapshot.stress)}
            color={statColor(100 - snapshot.stress, 30, 60)} />
          <SummaryStat icon="🤝" label="Trust" value={snapshot.trust}
            color="var(--accent-blue)" />
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: '8px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px'
        }}>
          <span>Actions taken: <b>{snapshot.actions}</b></span>
          <span>Objectives: <b>{snapshot.objectivesCompleted}</b></span>
        </div>

        <button
          onClick={() => setVisible(false)}
          style={{
            width: '100%', padding: '10px', borderRadius: '8px',
            background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)',
            color: 'var(--accent-yellow)', fontWeight: 600, fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Continue to Day {snapshot.day + 1}
        </button>
      </div>
    </div>
  );
}

function SummaryStat({ icon, label, value, color }: {
  icon: string; label: string; value: number | string; color: string;
}) {
  return (
    <div style={{
      textAlign: 'center', padding: '6px', borderRadius: '8px',
      background: 'var(--bg-secondary)'
    }}>
      <div style={{ fontSize: '14px' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
