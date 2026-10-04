import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function ConnectionStatus() {
  const { room } = useGameStore();
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');

  useEffect(() => {
    const socket = (window as unknown as { __gameSocket?: { connected: boolean; on: (e: string, cb: (...args: unknown[]) => void) => void; off: (e: string, cb: (...args: unknown[]) => void) => void } }).__gameSocket;
    if (!socket) return;

    const onDisconnect = () => setStatus('disconnected');
    const onReconnecting = () => setStatus('reconnecting');
    const onConnect = () => setStatus('connected');

    socket.on('disconnect', onDisconnect);
    socket.on('reconnect_attempt', onReconnecting);
    socket.on('connect', onConnect);

    const pingInterval = setInterval(() => {
      const start = Date.now();
      const onPong = () => {
        setLatency(Date.now() - start);
        setStatus('connected');
      };
      socket.on('pong', onPong);
      setTimeout(() => socket.off('pong', onPong), 5000);
    }, 10000);

    return () => {
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect_attempt', onReconnecting);
      socket.off('connect', onConnect);
      clearInterval(pingInterval);
    };
  }, []);

  if (!room || room.phase !== 'playing') return null;
  if (status === 'connected' && (!latency || latency < 200)) return null;

  const config = {
    connected: { color: 'var(--accent-green)', bg: 'rgba(34,197,94,0.1)', icon: '●', text: latency ? `${latency}ms` : 'Connected' },
    reconnecting: { color: 'var(--accent-yellow)', bg: 'rgba(245,200,66,0.1)', icon: '◌', text: 'Reconnecting...' },
    disconnected: { color: 'var(--accent-red)', bg: 'rgba(239,68,68,0.1)', icon: '○', text: 'Disconnected' },
  }[status];

  return (
    <div style={{
      position: 'fixed', bottom: '8px', right: '8px',
      zIndex: 800, pointerEvents: 'none',
      padding: '3px 8px', borderRadius: '6px',
      background: config.bg,
      border: `1px solid ${config.color}30`,
      fontSize: '10px', fontWeight: 600,
      color: config.color,
      display: 'flex', alignItems: 'center', gap: '4px',
      backdropFilter: 'blur(4px)'
    }}>
      <span style={{
        animation: status === 'reconnecting' ? 'pulse 1s infinite' : undefined
      }}>
        {config.icon}
      </span>
      {config.text}
    </div>
  );
}
