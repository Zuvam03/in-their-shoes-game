import { useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function ResultsShareCard() {
  const { matchResult, mySocketId } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  if (!matchResult) return null;
  const myResult = matchResult.playerResults.find(r => r.playerId === mySocketId);
  if (!myResult) return null;

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 600, h = 400;
    canvas.width = w;
    canvas.height = h;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0d0f14');
    grad.addColorStop(0.5, '#13161e');
    grad.addColorStop(1, '#0d0f14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const accent = ctx.createLinearGradient(0, 0, w, 0);
    accent.addColorStop(0, '#f5c842');
    accent.addColorStop(1, '#f97316');
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, w, 4);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5c842';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('In Their Shoes', w / 2, 40);

    ctx.fillStyle = '#8b92a8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Kolkata City Survival', w / 2, 58);

    ctx.fillStyle = '#e0e4ec';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`${myResult.playerName} as ${myResult.personaName}`, w / 2, 95);

    ctx.fillStyle = '#8b92a8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Mission: ${myResult.missionTitle}`, w / 2, 118);

    const statusColors: Record<string, string> = {
      completed: '#22c55e', partial: '#f5c842', failed: '#ef4444', active: '#8b92a8'
    };
    ctx.fillStyle = statusColors[myResult.missionStatus] || '#8b92a8';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(myResult.missionStatus.toUpperCase(), w / 2, 140);

    const stats = [
      { label: 'Score', value: `${myResult.score}`, color: '#f5c842' },
      { label: 'Rank', value: `#${myResult.rank}`, color: '#3b82f6' },
      { label: 'Trust', value: `${myResult.socialTrust}`, color: '#22c55e' },
      { label: 'Community', value: `${myResult.communityImpact >= 0 ? '+' : ''}${myResult.communityImpact}`, color: '#14b8a6' },
    ];

    const cardW = 120, cardH = 70, startX = (w - stats.length * cardW - (stats.length - 1) * 10) / 2;
    stats.forEach((stat, i) => {
      const x = startX + i * (cardW + 10);
      const y = 165;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 8);
      ctx.fill();

      ctx.fillStyle = '#8b92a8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.label, x + cardW / 2, y + 22);

      ctx.fillStyle = stat.color;
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(stat.value, x + cardW / 2, y + 52);
    });

    ctx.textAlign = 'center';

    if (myResult.dilemmasResolved.length > 0) {
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`${myResult.dilemmasResolved.length} Moral Dilemma${myResult.dilemmasResolved.length > 1 ? 's' : ''} Faced`, w / 2, 265);

      ctx.fillStyle = '#8b92a8';
      ctx.font = '11px sans-serif';
      const dilemmaText = myResult.dilemmasResolved
        .slice(0, 2)
        .map(d => `${d.dilemmaTitle}: ${d.choiceLabel}`)
        .join('  |  ');
      ctx.fillText(dilemmaText, w / 2, 285);
    }

    if (myResult.narrative) {
      ctx.fillStyle = '#8b92a8';
      ctx.font = 'italic 11px sans-serif';
      const words = myResult.narrative.split(' ');
      let line = '';
      let y = 310;
      const maxLines = 3;
      let lineCount = 0;
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > w - 80) {
          if (lineCount >= maxLines - 1) {
            ctx.fillText(line.trim() + '...', w / 2, y);
            break;
          }
          ctx.fillText(line.trim(), w / 2, y);
          line = word + ' ';
          y += 16;
          lineCount++;
        } else {
          line = test;
        }
      }
      if (lineCount < maxLines) {
        ctx.fillText(line.trim(), w / 2, y);
      }
    }

    ctx.fillStyle = '#555';
    ctx.font = '10px sans-serif';
    ctx.fillText('In Their Shoes — Walk a mile in someone else\'s life', w / 2, h - 15);
  };

  const downloadCard = () => {
    generateCard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'in-their-shoes-results.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyText = () => {
    const text = [
      `In Their Shoes — Kolkata City Survival`,
      ``,
      `${myResult.playerName} as ${myResult.personaName}`,
      `Mission: ${myResult.missionTitle} (${myResult.missionStatus})`,
      `Score: ${myResult.score} | Rank #${myResult.rank}/${matchResult.playerResults.length}`,
      `Trust: ${myResult.socialTrust} | Community: ${myResult.communityImpact >= 0 ? '+' : ''}${myResult.communityImpact}`,
      myResult.dilemmasResolved.length > 0
        ? `Dilemmas: ${myResult.dilemmasResolved.map(d => `${d.dilemmaTitle} → ${d.choiceLabel}`).join(', ')}`
        : '',
      ``,
      `"${myResult.narrative}"`,
    ].filter(Boolean).join('\n');
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      padding: '20px', borderRadius: '14px',
      background: 'var(--bg-card)', border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'
      }}>
        <span style={{ fontSize: '20px' }}>📤</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>Share Your Journey</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Download a card or copy your results
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={downloadCard}
          style={{
            flex: 1, padding: '12px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
            border: '1px solid rgba(59,130,246,0.3)',
            color: 'var(--accent-blue)', fontWeight: 600, fontSize: '13px'
          }}
        >
          🖼️ Download Card
        </button>
        <button
          onClick={copyText}
          style={{
            flex: 1, padding: '12px', borderRadius: '10px',
            background: copied ? 'rgba(34,197,94,0.15)' : 'var(--bg-secondary)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
            color: copied ? 'var(--accent-green)' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '13px'
          }}
        >
          {copied ? '✅ Copied!' : '📋 Copy Text'}
        </button>
      </div>
    </div>
  );
}
