import { useGameStore } from '../store/gameStore';

export default function MatchTimeline() {
  const { room, myPlayer } = useGameStore();

  if (!room || !myPlayer || room.phase !== 'playing') return null;

  const total = room.matchDuration;
  const tick = room.tick;
  const pct = Math.min(100, (tick / total) * 100);

  const dayLength = 600;
  const dayPct = (tick % dayLength) / dayLength;
  const isNight = dayPct > 2 / 3;
  const isSunset = dayPct > 0.55 && dayPct <= 2 / 3;
  const isMorning = dayPct < 0.15;

  const timeLabel = isNight ? 'Night' : isSunset ? 'Evening' : isMorning ? 'Morning' : 'Day';
  const timeIcon = isNight ? '🌙' : isSunset ? '🌆' : isMorning ? '🌅' : '☀️';

  const dayNumber = Math.floor(tick / dayLength) + 1;

  const deadlineTick = myPlayer.mission.definition.deadline;
  const deadlinePct = Math.min(100, (deadlineTick / total) * 100);
  const missionTimeLeft = deadlineTick - tick;

  const activeEvents = room.cityEvents.filter(e =>
    e.startTick + e.duration > tick
  );

  const eventMarkers = room.cityEvents.map(e => ({
    pct: Math.min(100, (e.startTick / total) * 100),
    endPct: Math.min(100, ((e.startTick + e.duration) / total) * 100),
    title: e.title,
    type: e.type
  }));

  const segments: { start: number; end: number; type: 'day' | 'sunset' | 'night' }[] = [];
  const totalDays = Math.ceil(total / dayLength);
  for (let d = 0; d < totalDays; d++) {
    const base = (d * dayLength / total) * 100;
    const scale = (dayLength / total) * 100;
    segments.push({ start: base, end: base + scale * 0.55, type: 'day' });
    segments.push({ start: base + scale * 0.55, end: base + scale * (2 / 3), type: 'sunset' });
    segments.push({ start: base + scale * (2 / 3), end: Math.min(100, base + scale), type: 'night' });
  }

  return (
    <div style={{
      padding: '6px 12px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: '10px'
    }}>
      {/* Day/time indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '2px 8px', borderRadius: '10px',
        background: isNight
          ? 'rgba(99,102,241,0.12)'
          : isSunset
            ? 'rgba(249,115,22,0.12)'
            : 'rgba(250,204,21,0.12)',
        fontSize: '11px', fontWeight: 600, flexShrink: 0,
        color: isNight
          ? '#a5b4fc'
          : isSunset
            ? 'var(--accent-orange)'
            : 'var(--accent-yellow)'
      }}>
        <span style={{ fontSize: '12px' }}>{timeIcon}</span>
        <span>Day {dayNumber} · {timeLabel}</span>
      </div>

      {/* Timeline bar */}
      <div style={{
        flex: 1, height: '14px', position: 'relative',
        borderRadius: '7px', overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)'
      }}>
        {/* Day/night segments */}
        {segments.map((seg, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${seg.start}%`,
            width: `${Math.max(0, seg.end - seg.start)}%`,
            background: seg.type === 'night'
              ? 'rgba(49,46,129,0.3)'
              : seg.type === 'sunset'
                ? 'rgba(180,83,9,0.15)'
                : 'rgba(250,204,21,0.06)'
          }} />
        ))}

        {/* City event spans */}
        {eventMarkers.map((em, i) => (
          <div key={`evt-${i}`} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${em.pct}%`,
            width: `${Math.max(0.5, em.endPct - em.pct)}%`,
            background: em.type === 'weather'
              ? 'rgba(59,130,246,0.2)'
              : em.type === 'heat'
                ? 'rgba(239,68,68,0.2)'
                : 'rgba(245,200,66,0.15)',
            borderLeft: '1px solid rgba(255,255,255,0.1)'
          }} title={em.title} />
        ))}

        {/* Mission deadline marker */}
        {deadlinePct < 100 && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${deadlinePct}%`,
            width: '2px',
            background: missionTimeLeft < 120
              ? 'var(--accent-red)'
              : 'var(--accent-orange)',
            zIndex: 2,
            opacity: missionTimeLeft < 120 ? 1 : 0.6
          }} title={`Mission deadline`} />
        )}

        {/* Progress fill */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0,
          width: `${pct}%`,
          background: 'linear-gradient(90deg, rgba(245,200,66,0.15) 0%, rgba(245,200,66,0.25) 100%)',
          borderRight: '2px solid var(--accent-yellow)',
          transition: 'width 1s linear',
          zIndex: 1
        }} />
      </div>

      {/* Active events */}
      {activeEvents.length > 0 && (
        <div style={{
          display: 'flex', gap: '4px', flexShrink: 0
        }}>
          {activeEvents.slice(0, 2).map((e, i) => (
            <span key={i} style={{
              fontSize: '10px', padding: '2px 6px', borderRadius: '8px',
              background: e.type === 'weather'
                ? 'rgba(59,130,246,0.12)'
                : e.type === 'heat'
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(245,200,66,0.1)',
              color: e.type === 'weather'
                ? '#60a5fa'
                : e.type === 'heat'
                  ? '#f87171'
                  : 'var(--accent-yellow)',
              fontWeight: 600, whiteSpace: 'nowrap'
            }}>
              {e.type === 'weather' ? '🌧' : e.type === 'heat' ? '🔥' : '⚠'} {e.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
