import { useGameStore } from '../store/gameStore';
import { LOCATIONS } from '../game/mapData';

const SOUNDSCAPES: Record<string, { sounds: string[]; ambience: string }> = {
  transport: {
    sounds: ['🚂 Train whistles', '📢 PA announcements', '👣 Shuffling feet'],
    ambience: 'Bustling station echoes'
  },
  food: {
    sounds: ['🍳 Sizzling pans', '🗣️ Vendors calling', '🥄 Clinking utensils'],
    ambience: 'Rich aromas and chatter'
  },
  shop: {
    sounds: ['💰 Cash registers', '📦 Boxes shuffling', '🛍️ Bargaining voices'],
    ambience: 'Market bustle and haggling'
  },
  office: {
    sounds: ['⌨️ Typing', '📞 Phone rings', '🚪 Doors closing'],
    ambience: 'Quiet professional hum'
  },
  medical: {
    sounds: ['🔔 Call bells', '👟 Soft footsteps', '📋 Clipboard sounds'],
    ambience: 'Antiseptic calm'
  },
  public: {
    sounds: ['🐦 Birds chirping', '🌿 Rustling leaves', '🚶 Passing footsteps'],
    ambience: 'Open air and distant traffic'
  },
  residential: {
    sounds: ['📺 TV murmurs', '🍳 Cooking sounds', '👶 Children playing'],
    ambience: 'Domestic warmth'
  },
  education: {
    sounds: ['📖 Page turning', '✏️ Writing', '🗣️ Lectures'],
    ambience: 'Studious concentration'
  },
};

export default function SoundscapeIndicator() {
  const { myPlayer, room } = useGameStore();
  if (!myPlayer || !room) return null;

  const loc = LOCATIONS.find(l => l.id === myPlayer.state.location);
  if (!loc) return null;

  const dayPct = (room.tick % 600) / 600;
  const isNight = dayPct > 2 / 3;

  const soundscape = SOUNDSCAPES[loc.type] || SOUNDSCAPES.public;
  const displaySounds = isNight
    ? ['🌙 Crickets chirping', '🦉 Distant owls', '🌃 City hum']
    : soundscape.sounds;

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'rgba(59,130,246,0.04)',
      border: '1px solid rgba(59,130,246,0.12)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
      }}>
        🎵 Soundscape
      </div>

      <div style={{
        fontSize: '10px', color: 'var(--accent-blue)', fontStyle: 'italic',
        marginBottom: '6px'
      }}>
        {isNight ? 'Night sounds of Kolkata' : soundscape.ambience}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {displaySounds.map((sound, i) => (
          <div key={i} style={{
            fontSize: '10px', color: 'var(--text-secondary)',
            padding: '2px 0'
          }}>
            {sound}
          </div>
        ))}
      </div>
    </div>
  );
}
