import { useGameStore } from '../store/gameStore';

const FACTS = [
  { fact: 'Kolkata is home to the oldest metro rail in India, operational since 1984.', icon: '🚇' },
  { fact: 'The Victoria Memorial was built between 1906-1921 and houses 28,394 artifacts.', icon: '🏛️' },
  { fact: 'Kolkata\'s hand-pulled rickshaws are among the last in the world, carrying about 150,000 passengers daily.', icon: '🛺' },
  { fact: 'The Howrah Bridge carries over 100,000 vehicles and 150,000 pedestrians daily without any nuts or bolts.', icon: '🌉' },
  { fact: 'Kolkata has over 700 bookstalls along College Street, making it one of the largest book markets in the world.', icon: '📚' },
  { fact: 'An estimated 100,000+ people live on Kolkata\'s streets, many working as day laborers and street vendors.', icon: '🏙️' },
  { fact: 'Durga Puja is Kolkata\'s biggest festival, with over 3,000 pandals set up across the city.', icon: '🎉' },
  { fact: 'New Market, established in 1874, was the first purpose-built indoor market in Kolkata.', icon: '🏪' },
  { fact: 'Kolkata produces 85% of India\'s hand-rolled cigars and is the center of jute manufacturing.', icon: '🏭' },
  { fact: 'The Indian Coffee House on College Street has been serving intellectuals since 1942.', icon: '☕' },
  { fact: 'About 33% of Kolkata\'s population lives in informal settlements with limited access to clean water.', icon: '💧' },
  { fact: 'Kolkata has the highest number of street food stalls per capita in India, with puchka being the most popular.', icon: '🍛' },
  { fact: 'The average daily wage for informal workers in Kolkata is ₹200-400, well below the living wage.', icon: '💰' },
  { fact: 'Mother Teresa\'s Missionaries of Charity, headquartered in Kolkata, serves 4,500+ people daily.', icon: '🙏' },
  { fact: 'Kolkata\'s tram system, started in 1873, is the oldest operating electric tramway in Asia.', icon: '🚃' },
];

export default function CityFacts() {
  const { room } = useGameStore();
  if (!room) return null;

  const idx1 = Math.floor(room.tick / 200) % FACTS.length;
  const idx2 = (idx1 + 7) % FACTS.length;
  const selected = [FACTS[idx1], FACTS[idx2]];

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: 'rgba(245,200,66,0.04)',
      border: '1px solid rgba(245,200,66,0.12)'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
      }}>
        📖 Did You Know?
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {selected.map((item, i) => (
          <div key={i} style={{
            display: 'flex', gap: '8px', padding: '6px',
            borderRadius: '6px', background: 'rgba(0,0,0,0.1)'
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
            <div style={{
              fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5
            }}>
              {item.fact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
