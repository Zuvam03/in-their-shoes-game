import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function ChatPanel() {
  const { chatMessages, chatReactions, sendChat, sendReaction, mySocketId, room, markChatRead } = useGameStore();
  const [text, setText] = useState('');
  const [target, setTarget] = useState<'all' | string>('all');
  const [reactionTarget, setReactionTarget] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [chatMessages.length]);

  useEffect(() => {
    markChatRead();
  }, [chatMessages.length, markChatRead]);

  const players = room ? Object.values(room.players).filter(p => p.id !== mySocketId) : [];

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendChat(trimmed, target);
    setText('');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%'
    }}>
      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '8px',
        display: 'flex', flexDirection: 'column', gap: '4px'
      }}>
        {chatMessages.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
            No messages yet. Say hello!
          </div>
        )}
        {chatMessages.map(msg => {
          const isMine = msg.senderId === mySocketId;
          const isDM = msg.target !== 'all';
          const reactions = chatReactions[msg.id] || [];
          const reactionCounts: Record<string, number> = {};
          for (const r of reactions) {
            reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
          }
          const showReactionPicker = reactionTarget === msg.id;

          return (
            <div key={msg.id} style={{
              alignSelf: isMine ? 'flex-end' : 'flex-start',
              maxWidth: '85%', position: 'relative'
            }}>
              {!isMine && (
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  {msg.senderName}
                  {isDM && <span style={{ color: 'var(--accent-purple)' }}> (DM)</span>}
                </div>
              )}
              <div
                onClick={() => setReactionTarget(showReactionPicker ? null : msg.id)}
                style={{
                  padding: '6px 10px', borderRadius: '10px',
                  fontSize: '12px', lineHeight: 1.4, cursor: 'pointer',
                  background: isMine
                    ? 'rgba(245, 200, 66, 0.15)'
                    : isDM
                      ? 'rgba(168, 85, 247, 0.1)'
                      : 'var(--bg-card)',
                  border: `1px solid ${isMine ? 'rgba(245,200,66,0.2)' : isDM ? 'rgba(168,85,247,0.2)' : 'var(--border)'}`,
                  color: 'var(--text-primary)'
                }}
              >
                {msg.text}
              </div>

              {/* Reaction badges */}
              {Object.keys(reactionCounts).length > 0 && (
                <div style={{ display: 'flex', gap: '3px', marginTop: '2px', flexWrap: 'wrap' }}>
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <span key={emoji} style={{
                      fontSize: '10px', padding: '1px 4px', borderRadius: '8px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
                    }}>
                      {emoji} {count > 1 ? count : ''}
                    </span>
                  ))}
                </div>
              )}

              {/* Reaction picker */}
              {showReactionPicker && (
                <div style={{
                  position: 'absolute', bottom: '100%', marginBottom: '4px',
                  left: isMine ? 'auto' : '0', right: isMine ? '0' : 'auto',
                  display: 'flex', gap: '2px', padding: '4px 6px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '16px', zIndex: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  {REACTION_EMOJIS.map(emoji => (
                    <button key={emoji} onClick={(e) => {
                      e.stopPropagation();
                      sendReaction(msg.id, emoji);
                      setReactionTarget(null);
                    }} style={{
                      background: 'none', border: 'none', fontSize: '14px',
                      padding: '2px 4px', borderRadius: '4px', cursor: 'pointer'
                    }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {isMine && isDM && (
                <div style={{ fontSize: '10px', color: 'var(--accent-purple)', textAlign: 'right', marginTop: '1px' }}>
                  DM
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Target selector + input */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: '8px',
        display: 'flex', flexDirection: 'column', gap: '6px'
      }}>
        {players.length > 0 && (
          <select
            value={target}
            onChange={e => setTarget(e.target.value)}
            style={{
              padding: '4px 8px', borderRadius: '6px', fontSize: '11px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)'
            }}
          >
            <option value="all">Everyone</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>DM: {p.name}</option>
            ))}
          </select>
        )}
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            maxLength={200}
            style={{
              flex: 1, padding: '7px 10px', borderRadius: '8px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '12px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            style={{
              padding: '7px 14px', borderRadius: '8px',
              background: text.trim() ? 'var(--accent-yellow)' : 'var(--bg-card)',
              color: text.trim() ? '#000' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '12px',
              border: '1px solid var(--border)'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
