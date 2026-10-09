import { useGameStore } from '../store/gameStore';

const QUOTES: Record<string, string[]> = {
  low_health: [
    '"Every step hurts, but I keep walking."',
    '"My body aches, but my spirit refuses to break."',
    '"I have survived worse days than this."',
  ],
  low_energy: [
    '"Just need to rest my eyes for a moment..."',
    '"The city never sleeps, but I must."',
    '"Tiredness weighs on me like the monsoon clouds."',
  ],
  hungry: [
    '"The smell of biryani from the stall torments me."',
    '"An empty stomach makes the mind wander."',
    '"I remember when food was not something I had to worry about."',
  ],
  rich: [
    '"With money in my pocket, the city feels different."',
    '"I can finally afford to think about tomorrow."',
    '"Perhaps I can help someone else now."',
  ],
  helped: [
    '"Their grateful smile was worth more than rupees."',
    '"We are stronger together — that much I know now."',
    '"In helping others, I found my own strength."',
  ],
  stressed: [
    '"The noise of the city is deafening today."',
    '"Breathe. Just breathe. One moment at a time."',
    '"Even Kolkata\'s chaos has a rhythm, if you listen."',
  ],
  happy: [
    '"The Howrah Bridge never looked so beautiful."',
    '"Today is a good day to be alive in this city."',
    '"I can hear the river singing tonight."',
  ],
  default: [
    '"Kolkata teaches you patience, whether you want it or not."',
    '"Every face in this crowd has a story."',
    '"Tomorrow will bring new chances."',
  ],
};

function pickQuote(key: string, seed: number): string {
  const arr = QUOTES[key] || QUOTES.default;
  return arr[seed % arr.length];
}

export default function PersonaQuote() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const state = myPlayer.state;
  const seed = Math.floor(room.tick / 120);

  let category = 'default';
  if (state.health < 25) category = 'low_health';
  else if (state.energy < 20) category = 'low_energy';
  else if (state.hunger > 75) category = 'hungry';
  else if (state.stress > 70) category = 'stressed';
  else if (state.mood > 70) category = 'happy';
  else if (state.cash > 100) category = 'rich';
  else if (state.helpedOthersCount >= 3) category = 'helped';

  const quote = pickQuote(category, seed);

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'rgba(168,85,247,0.04)',
      border: '1px solid rgba(168,85,247,0.12)',
      fontStyle: 'italic'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
      }}>
        Inner Voice
      </div>
      <div style={{
        fontSize: '11px', color: 'var(--accent-purple)', lineHeight: 1.6
      }}>
        {quote}
      </div>
      <div style={{
        fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px',
        textAlign: 'right', fontStyle: 'normal'
      }}>
        — {myPlayer.persona.name}
      </div>
    </div>
  );
}
