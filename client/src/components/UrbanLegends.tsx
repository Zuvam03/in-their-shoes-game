import { useGameStore } from '../store/gameStore';

const LEGENDS = [
  {
    title: 'The Ghost Tram of Esplanade',
    story: 'Old-timers say a phantom tram still runs down the tracks at midnight, carrying passengers who never arrived.',
    icon: '🚃', color: 'var(--accent-purple)'
  },
  {
    title: 'The Durga of Kumartuli',
    story: 'Artists claim their hands are guided by the goddess herself when sculpting the idols for Durga Puja.',
    icon: '🎨', color: 'var(--accent-yellow)'
  },
  {
    title: 'The Singing Fish of Hooghly',
    story: 'Fishermen at Princep Ghat whisper about ilish fish that sing Bengali songs in the moonlight.',
    icon: '🐟', color: 'var(--accent-blue)'
  },
  {
    title: 'The Fortune Cookie of New Market',
    story: 'There is a chai wallah in New Market who can predict your future from the tea leaves — if you can find him.',
    icon: '🍵', color: 'var(--accent-green)'
  },
  {
    title: 'The Bridge Builder\'s Promise',
    story: 'They say Howrah Bridge was built on a promise — that no one crossing it would ever feel truly alone.',
    icon: '🌉', color: 'var(--accent-orange)'
  },
  {
    title: 'The Library Ghost of College Street',
    story: 'A scholarly spirit is said to reshelve books at the Coffee House, leaving bookmarks with cryptic advice.',
    icon: '📚', color: 'var(--accent-red)'
  },
  {
    title: 'The Monsoon Wish',
    story: 'If you catch the first raindrop of monsoon on your tongue at Victoria Memorial, your deepest wish comes true.',
    icon: '🌧️', color: 'var(--accent-blue)'
  },
  {
    title: 'The Rickshaw Runner\'s Code',
    story: 'Kolkata\'s hand-rickshaw pullers follow an unwritten code: never refuse a passenger who truly has nowhere to go.',
    icon: '🛺', color: 'var(--accent-yellow)'
  },
];

export default function UrbanLegends() {
  const { room } = useGameStore();
  if (!room) return null;

  const idx = Math.floor(room.tick / 300) % LEGENDS.length;
  const legend = LEGENDS[idx];

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${legend.color} 4%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${legend.color} 12%, transparent)`
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
      }}>
        Urban Legend
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{legend.icon}</span>
        <div>
          <div style={{
            fontSize: '12px', fontWeight: 700, color: legend.color, marginBottom: '4px'
          }}>
            {legend.title}
          </div>
          <div style={{
            fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5,
            fontStyle: 'italic'
          }}>
            {legend.story}
          </div>
        </div>
      </div>
    </div>
  );
}
