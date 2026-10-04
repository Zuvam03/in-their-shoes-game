import { useGameStore } from '../store/gameStore';

function calculateEmpathyScore(
  helpedCount: number, receivedCount: number,
  trust: number, impact: number,
  dilemmaCount: number, chatCount: number
): { score: number; grade: string; color: string; description: string } {
  const raw = Math.min(100, Math.max(0,
    helpedCount * 8 +
    trust * 0.4 +
    impact * 1.5 +
    dilemmaCount * 5 +
    chatCount * 0.5 -
    Math.max(0, receivedCount - helpedCount) * 3
  ));

  if (raw >= 80) return { score: raw, grade: 'Deeply Empathetic', color: '#22c55e', description: 'You consistently put others before yourself' };
  if (raw >= 60) return { score: raw, grade: 'Compassionate', color: '#3b82f6', description: 'You show genuine care for the community' };
  if (raw >= 40) return { score: raw, grade: 'Aware', color: '#f5c842', description: 'You notice others\' struggles and sometimes help' };
  if (raw >= 20) return { score: raw, grade: 'Self-Focused', color: '#f97316', description: 'You prioritize your own survival' };
  return { score: raw, grade: 'Detached', color: '#ef4444', description: 'You haven\'t connected with the community yet' };
}

export default function EmpathyScore() {
  const { myPlayer, chatMessages, mySocketId } = useGameStore();
  if (!myPlayer) return null;

  const myChatCount = chatMessages.filter(m => m.senderId === mySocketId).length;
  const dilemmaCount = myPlayer.actionLog.filter(a => a.type === 'dilemma_choice').length;

  const empathy = calculateEmpathyScore(
    myPlayer.state.helpedOthersCount,
    myPlayer.state.receivedHelpCount,
    myPlayer.socialTrust,
    myPlayer.communityImpact,
    dilemmaCount,
    myChatCount
  );

  const arcLength = 200;
  const progress = (empathy.score / 100) * arcLength;

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        Empathy Index
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Arc */}
        <svg width="60" height="36" viewBox="0 0 60 36" style={{ flexShrink: 0 }}>
          <path
            d="M 5 32 A 25 25 0 0 1 55 32"
            fill="none" stroke="var(--border)" strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 5 32 A 25 25 0 0 1 55 32"
            fill="none" stroke={empathy.color} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${arcLength}`}
          />
          <text x="30" y="28" textAnchor="middle"
            style={{ fontSize: '14px', fontWeight: 700, fill: empathy.color }}>
            {Math.round(empathy.score)}
          </text>
        </svg>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: empathy.color }}>
            {empathy.grade}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {empathy.description}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px',
        marginTop: '8px'
      }}>
        <MiniMetric label="Helped" value={myPlayer.state.helpedOthersCount} icon="🤝" />
        <MiniMetric label="Dilemmas" value={dilemmaCount} icon="⚖️" />
        <MiniMetric label="Chats" value={myChatCount} icon="💬" />
      </div>
    </div>
  );
}

function MiniMetric({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{
      padding: '4px', borderRadius: '6px',
      background: 'rgba(0,0,0,0.1)', textAlign: 'center'
    }}>
      <span style={{ fontSize: '11px' }}>{icon}</span>
      <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
