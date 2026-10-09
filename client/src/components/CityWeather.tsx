import { useGameStore } from '../store/gameStore';

interface WeatherState {
  condition: string;
  icon: string;
  temp: number;
  humidity: number;
  effect: string;
  color: string;
}

function getWeather(tick: number): WeatherState {
  const dayPct = (tick % 600) / 600;
  const dayNum = Math.floor(tick / 600) + 1;
  const seed = (dayNum * 7 + Math.floor(dayPct * 4)) % 8;

  const conditions: WeatherState[] = [
    { condition: 'Sunny', icon: '☀️', temp: 34, humidity: 55, effect: '+Energy drain from heat', color: 'var(--accent-yellow)' },
    { condition: 'Cloudy', icon: '⛅', temp: 29, humidity: 65, effect: 'Comfortable conditions', color: 'var(--text-muted)' },
    { condition: 'Humid', icon: '🌫️', temp: 32, humidity: 85, effect: '+Thirst increases faster', color: 'var(--accent-blue)' },
    { condition: 'Drizzle', icon: '🌧️', temp: 27, humidity: 90, effect: 'Slippery streets, slower travel', color: 'var(--accent-blue)' },
    { condition: 'Monsoon', icon: '⛈️', temp: 25, humidity: 95, effect: 'Flooding risk, limited movement', color: 'var(--accent-purple)' },
    { condition: 'Clear Night', icon: '🌙', temp: 24, humidity: 60, effect: 'Cool and quiet', color: 'var(--accent-blue)' },
    { condition: 'Hot & Dusty', icon: '🔥', temp: 38, humidity: 40, effect: 'Dehydration risk, seek shade', color: 'var(--accent-red)' },
    { condition: 'Pleasant', icon: '🌤️', temp: 28, humidity: 50, effect: 'Perfect for walking around', color: 'var(--accent-green)' },
  ];

  const isNight = dayPct > 2 / 3;
  if (isNight) return conditions[5];
  return conditions[seed];
}

export default function CityWeather() {
  const { room } = useGameStore();
  if (!room) return null;

  const weather = getWeather(room.tick);

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '10px',
      background: `color-mix(in srgb, ${weather.color} 5%, var(--bg-secondary))`,
      border: `1px solid color-mix(in srgb, ${weather.color} 15%, transparent)`
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
      }}>
        City Weather
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '28px' }}>{weather.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px', fontWeight: 700, color: weather.color
          }}>
            {weather.condition}
          </div>
          <div style={{
            fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px'
          }}>
            {weather.temp}°C · {weather.humidity}% humidity
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)',
        padding: '4px 8px', borderRadius: '4px',
        background: 'rgba(0,0,0,0.15)', fontStyle: 'italic'
      }}>
        {weather.effect}
      </div>
    </div>
  );
}
