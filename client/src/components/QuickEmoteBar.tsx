import { useGameStore } from '../store/gameStore';

const EMOTES = ['👋', '😊', '😤', '🏃', '💪', '😩', '🙏', '🎉'];

export default function QuickEmoteBar() {
  const { sendEmote } = useGameStore();

  return (
    <div style={{
      display: 'flex', gap: '4px', marginBottom: '6px',
      padding: '4px 0'
    }}>
      {EMOTES.map(emoji => (
        <button
          key={emoji}
          onClick={() => sendEmote(emoji)}
          style={{
            flex: 1, padding: '4px 0', borderRadius: '6px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            fontSize: '14px', cursor: 'pointer',
            transition: 'transform 0.1s'
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
