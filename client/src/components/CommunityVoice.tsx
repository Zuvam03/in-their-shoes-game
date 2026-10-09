import { useGameStore } from '../store/gameStore';

const VOICES = [
  {
    condition: (totalHelps: number) => totalHelps >= 10,
    message: '"This community truly looks out for each other. Hope is alive here."',
    speaker: 'Local Teacher',
    icon: '📚'
  },
  {
    condition: (_: number, avgTrust: number) => avgTrust >= 60,
    message: '"I feel safe walking these streets. People here can be trusted."',
    speaker: 'Street Vendor',
    icon: '🏪'
  },
  {
    condition: (_: number, __: number, gap: number) => gap > 100,
    message: '"The rich get richer and the poor stay poor. Someone needs to help."',
    speaker: 'Auto Driver',
    icon: '🛺'
  },
  {
    condition: (_: number, avgTrust: number) => avgTrust < 35,
    message: '"Nobody trusts anyone anymore. Everyone is just looking out for themselves."',
    speaker: 'Tea Stall Owner',
    icon: '☕'
  },
  {
    condition: (totalHelps: number) => totalHelps < 3,
    message: '"People walk by without even looking. Has the city lost its heart?"',
    speaker: 'Old Fisherman',
    icon: '🎣'
  },
  {
    condition: () => true,
    message: '"Kolkata has always been a city of survivors. We will get through this together."',
    speaker: 'Temple Priest',
    icon: '🙏'
  },
];

export default function CommunityVoice() {
  const { room } = useGameStore();
  if (!room) return null;

  const players = Object.values(room.players);
  if (players.length <= 1) return null;

  const totalHelps = players.reduce((s, p) => s + p.state.helpedOthersCount, 0);
  const avgTrust = Math.round(players.reduce((s, p) => s + p.socialTrust, 0) / players.length);
  const cashValues = players.map(p => p.state.cash);
  const gap = Math.max(...cashValues) - Math.min(...cashValues);

  const voice = VOICES.find(v => v.condition(totalHelps, avgTrust, gap)) || VOICES[VOICES.length - 1];

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'rgba(245,200,66,0.04)',
      border: '1px solid rgba(245,200,66,0.12)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
      }}>
        Voice of the Community
      </div>

      <div style={{
        fontSize: '11px', color: 'var(--text-secondary)',
        lineHeight: 1.5, fontStyle: 'italic', marginBottom: '4px'
      }}>
        {voice.message}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '9px', color: 'var(--text-muted)'
      }}>
        <span style={{ fontSize: '12px' }}>{voice.icon}</span>
        — {voice.speaker}
      </div>
    </div>
  );
}
