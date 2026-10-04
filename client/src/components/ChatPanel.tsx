import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const QUICK_MESSAGES = [
  { text: 'Need help!', icon: '🆘' },
  { text: 'Anyone nearby?', icon: '📍' },
  { text: 'Thanks!', icon: '🙏' },
  { text: 'Good luck!', icon: '🍀' },
];

export default function ChatPanel() {
  const { chatMessages, chatReactions, sendChat, sendReaction, mySocketId, room, markChatRead } = useGameStore();
  const [text, setText] = useState('');
  const [target, setTarget] = useState<'all' | string>('all');
  const [reactionTarget, setReactionTarget] = useState<string | null>(null);
  const [showQuick, setShowQuick] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.focus();
  };

  const handleQuickSend = (msg: string) => {
    sendChat(msg, target);
    setShowQuick(false);
  };

  let lastSender = '';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%'
    }}>
      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '8px',
        display: 'flex', flexDirection: 'column', gap: '2px'
      }}>
        {chatMessages.length === 0 && (
          <div style={{
            color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center',
            padding: '20px 0', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>💬</span>
            <span>No messages yet. Say hello!</span>
            <span style={{ fontSize: '10px' }}>Tip: Click a message to react</span>
          </div>
        )}
        {chatMessages.map((msg, idx) => {
          const isMine = msg.senderId === mySocketId;
          const isDM = msg.target !== 'all';
          const reactions = chatReactions[msg.id] || [];
          const reactionCounts: Record<string, number> = {};
          for (const r of reactions) {
            reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
          }
          const showReactionPicker = reactionTarget === msg.id;
          const sameSenderAsPrev = msg.senderId === lastSender;
          lastSender = msg.senderId;

          const prevMsg = idx > 0 ? chatMessages[idx - 1] : null;
          const timeDiff = prevMsg ? msg.tick - prevMsg.tick : Infinity;
          const showTimestamp = timeDiff > 30;

          return (
            <div key={msg.id}>
              {showTimestamp && idx > 0 && (
                <div style={{
                  textAlign: 'center', fontSize: '9px', color: 'var(--text-muted)',
                  padding: '6px 0 2px', fontWeight: 600
                }}>
                  {formatTick(msg.tick)}
                </div>
              )}
              <div style={{
                alignSelf: isMine ? 'flex-end' : 'flex-start',
                maxWidth: '85%', position: 'relative',
                marginLeft: isMine ? 'auto' : 0,
                marginTop: sameSenderAsPrev ? '1px' : '6px'
              }}>
                {!isMine && !sameSenderAsPrev && (
                  <div style={{
                    fontSize: '10px', marginBottom: '2px',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <span style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      background: `hsl(${msg.senderName.charCodeAt(0) * 7}deg 60% 40%)`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '8px', fontWeight: 700, color: '#fff'
                    }}>
                      {msg.senderName[0]?.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                      {msg.senderName}
                    </span>
                    {isDM && <span style={{ color: 'var(--accent-purple)', fontSize: '9px' }}>DM</span>}
                  </div>
                )}
                <div
                  onClick={() => setReactionTarget(showReactionPicker ? null : msg.id)}
                  style={{
                    padding: '6px 10px', fontSize: '12px', lineHeight: 1.4, cursor: 'pointer',
                    borderRadius: isMine
                      ? sameSenderAsPrev ? '10px 10px 4px 10px' : '10px 10px 4px 10px'
                      : sameSenderAsPrev ? '10px 10px 10px 4px' : '10px 10px 10px 4px',
                    background: isMine
                      ? 'rgba(245, 200, 66, 0.15)'
                      : isDM
                        ? 'rgba(168, 85, 247, 0.1)'
                        : 'var(--bg-card)',
                    border: `1px solid ${isMine ? 'rgba(245,200,66,0.2)' : isDM ? 'rgba(168,85,247,0.2)' : 'var(--border)'}`,
                    color: 'var(--text-primary)',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {msg.text}
                  <span style={{
                    fontSize: '9px', color: 'var(--text-muted)', marginLeft: '8px',
                    fontWeight: 400
                  }}>
                    {formatTick(msg.tick)}
                  </span>
                </div>

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
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick messages */}
      {showQuick && (
        <div style={{
          display: 'flex', gap: '4px', padding: '6px 8px',
          borderTop: '1px solid var(--border)', flexWrap: 'wrap'
        }}>
          {QUICK_MESSAGES.map(qm => (
            <button
              key={qm.text}
              onClick={() => handleQuickSend(qm.text)}
              style={{
                padding: '4px 10px', borderRadius: '14px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '11px',
                display: 'flex', alignItems: 'center', gap: '4px',
                cursor: 'pointer'
              }}
            >
              <span>{qm.icon}</span> {qm.text}
            </button>
          ))}
        </div>
      )}

      {/* Target selector + input */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: '8px',
        display: 'flex', flexDirection: 'column', gap: '6px'
      }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {players.length > 0 && (
            <select
              value={target}
              onChange={e => setTarget(e.target.value)}
              style={{
                padding: '4px 8px', borderRadius: '6px', fontSize: '11px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: target === 'all' ? 'var(--text-secondary)' : 'var(--accent-purple)',
                minWidth: '80px'
              }}
            >
              <option value="all">Everyone</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>DM: {p.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowQuick(!showQuick)}
            title="Quick messages"
            style={{
              background: showQuick ? 'rgba(245,200,66,0.1)' : 'var(--bg-card)',
              border: `1px solid ${showQuick ? 'rgba(245,200,66,0.3)' : 'var(--border)'}`,
              borderRadius: '6px', padding: '4px 8px',
              color: showQuick ? 'var(--accent-yellow)' : 'var(--text-muted)',
              fontSize: '12px', cursor: 'pointer'
            }}
          >
            ⚡
          </button>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={target === 'all' ? 'Type a message...' : 'Private message...'}
            maxLength={200}
            style={{
              flex: 1, padding: '7px 10px', borderRadius: '8px',
              background: 'var(--bg-card)',
              border: `1px solid ${target === 'all' ? 'var(--border)' : 'rgba(168,85,247,0.3)'}`,
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
        <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'right' }}>
          {text.length}/200
        </div>
      </div>
    </div>
  );
}

function formatTick(tick: number): string {
  const m = Math.floor(tick / 60);
  const s = tick % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
