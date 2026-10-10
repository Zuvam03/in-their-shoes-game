import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  LOCATIONS, ROUTES, LOCATION_COLORS, LOCATION_ICONS,
  getConnectedLocations, getRoutesBetween, LocationInfo
} from '../game/mapData';
import RadialActionMenu from './RadialActionMenu';

export default function CityMap() {
  const { myPlayer, room, submitAction, playerEmotes, travelAnimation, visitedLocations } = useGameStore();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [transportMode, setTransportMode] = useState<string>('walk');
  const [showDirectory, setShowDirectory] = useState(false);
  const [radialTarget, setRadialTarget] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [animProgress, setAnimProgress] = useState(0);

  const currentLocation = myPlayer?.state.location;
  const otherPlayers = room
    ? Object.values(room.players).filter(p => p.id !== myPlayer?.id)
    : [];
  const activeCityEvents = room?.cityEvents || [];

  const isLocationAffected = (locId: string): boolean =>
    activeCityEvents.some(e =>
      e.affectedLocations.includes('all') || e.affectedLocations.includes(locId)
    );

  const connected = selectedLocation ? getConnectedLocations(selectedLocation) : [];
  const isConnectedToSelected = (id: string) => connected.includes(id);

  const handleLocationClick = (loc: LocationInfo) => {
    if (radialTarget) {
      setRadialTarget(null);
      return;
    }
    if (loc.id === currentLocation) {
      setRadialTarget(loc.id);
      setSelectedLocation(null);
      return;
    }
    setSelectedLocation(loc.id);
    setRadialTarget(null);
  };

  const handleMove = () => {
    if (!selectedLocation || !currentLocation) return;
    const route = getRoutesBetween(currentLocation, selectedLocation);
    const mode = route?.modes.includes(transportMode) ? transportMode : route?.modes[0] || 'walk';
    submitAction('move', { destination: selectedLocation, mode });
    setSelectedLocation(null);
    setRadialTarget(null);
  };

  const routeBetweenSelected = selectedLocation
    ? getRoutesBetween(currentLocation || '', selectedLocation)
    : null;

  const TRAVEL_TIMES: Record<string, number> = {
    walk: 480, bus: 240, metro: 180, tram: 360, taxi: 150
  };
  const TRAVEL_COSTS: Record<string, number> = {
    walk: 0, bus: 8, metro: 15, tram: 6, taxi: 80
  };

  // Travel animation frame loop
  useEffect(() => {
    if (!travelAnimation) { setAnimProgress(0); return; }
    let raf: number;
    const animate = () => {
      const elapsed = Date.now() - travelAnimation.startTime;
      const p = Math.min(1, elapsed / travelAnimation.duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimProgress(eased);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [travelAnimation]);

  const hasInitialized = useRef(false);

  const pinchDist = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('.location-node')) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onMouseUp = () => { dragging.current = false; };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(2.5, Math.max(0.5, s - e.deltaY * 0.001)));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as Element).closest('.location-node')) return;
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      dragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist.current = Math.hypot(dx, dy);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging.current) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (pinchDist.current > 0) {
        const delta = dist / pinchDist.current;
        setScale(s => Math.min(2.5, Math.max(0.5, s * delta)));
      }
      pinchDist.current = dist;
    }
  };

  const onTouchEnd = () => {
    dragging.current = false;
    pinchDist.current = 0;
  };

  const locationsByType = LOCATIONS.reduce<Record<string, LocationInfo[]>>((acc, loc) => {
    (acc[loc.type] = acc[loc.type] || []).push(loc);
    return acc;
  }, {});

  const hasWeatherEvent = activeCityEvents.some(e => e.type === 'weather');
  const hasHeatEvent = activeCityEvents.some(e => e.type === 'heat');
  const hasCrowdEvent = activeCityEvents.some(e => e.type === 'crowd');
  const tick = room?.tick || 0;
  const isNightTime = tick > 0 && ((tick % 600) > 400);

  // Compute animated player position
  let playerX = 0, playerY = 0;
  const currentLocData = LOCATIONS.find(l => l.id === currentLocation);

  // Center view on player's starting location
  useEffect(() => {
    if (!hasInitialized.current && currentLocData && svgRef.current) {
      hasInitialized.current = true;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const svgScale = Math.min(rect.width / 900, rect.height / 750);
      const px = currentLocData.x * svgScale;
      const py = currentLocData.y * svgScale;
      setPan({ x: cx - px, y: cy - py });
    }
  }, [currentLocData]);

  if (travelAnimation && animProgress < 1) {
    const fromLoc = LOCATIONS.find(l => l.id === travelAnimation.from);
    const toLoc = LOCATIONS.find(l => l.id === travelAnimation.to);
    if (fromLoc && toLoc) {
      playerX = fromLoc.x + (toLoc.x - fromLoc.x) * animProgress;
      playerY = fromLoc.y + (toLoc.y - fromLoc.y) * animProgress;
    } else if (currentLocData) {
      playerX = currentLocData.x;
      playerY = currentLocData.y;
    }
  } else if (currentLocData) {
    playerX = currentLocData.x;
    playerY = currentLocData.y;
  }

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isNightTime ? '#060810' : '#0a0d14',
      transition: 'background 2s ease'
    }}
      onClick={() => { if (radialTarget) setRadialTarget(null); }}
    >
      {/* Weather overlay — rain with lightning flashes */}
      {hasWeatherEvent && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(30,60,100,0.18) 0%, rgba(20,40,70,0.06) 100%)',
          animation: 'fadeIn 1s ease'
        }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 23 + 7) % 100}%`,
              top: `-${(i * 5) % 20}px`,
              width: i % 3 === 0 ? '1.5px' : '1px',
              height: `${14 + (i % 10)}px`,
              background: `rgba(140,180,240,${0.15 + (i % 4) * 0.08})`,
              animation: `rainDrop ${0.35 + (i % 6) * 0.08}s linear infinite`,
              animationDelay: `${(i * 0.05)}s`,
              transform: 'rotate(4deg)',
            }} />
          ))}
          {/* Lightning flash — subtle ambient flicker */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(200,220,255,0.03)',
            animation: 'lightningFlash 8s ease-in-out infinite',
          }} />
        </div>
      )}

      {/* Heat haze overlay */}
      {hasHeatEvent && !hasWeatherEvent && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(245,158,11,0.06) 0%, rgba(239,68,68,0.04) 50%, transparent 100%)',
          animation: 'heatShimmer 3s ease-in-out infinite',
        }} />
      )}

      {/* Night overlay with stars */}
      {isNightTime && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,10,0.35) 100%)'
        }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 47 + 11) % 95 + 2}%`,
              top: `${(i * 31 + 7) % 40 + 2}%`,
              width: '2px', height: '2px',
              borderRadius: '50%',
              background: i % 3 === 0 ? 'rgba(245,200,66,0.5)' : 'rgba(200,220,255,0.4)',
              boxShadow: i % 3 === 0
                ? '0 0 4px rgba(245,200,66,0.3)'
                : '0 0 3px rgba(200,220,255,0.2)',
              animation: `starTwinkle ${2 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }} />
          ))}
        </div>
      )}

      {/* Map controls */}
      <div style={{
        position: 'absolute', bottom: '16px', right: '16px',
        zIndex: 5, display: 'flex', flexDirection: 'column', gap: '4px'
      }}>
        <button onClick={() => setScale(s => Math.min(2.5, s + 0.2))} style={mapBtnStyle}>+</button>
        <button onClick={() => setScale(1)} style={mapBtnStyle}>&#x2299;</button>
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} style={mapBtnStyle}>&minus;</button>
      </div>

      {/* Directory toggle */}
      <button
        onClick={() => setShowDirectory(!showDirectory)}
        style={{
          position: 'absolute', top: '60px', left: '16px',
          zIndex: 6, background: showDirectory ? 'var(--accent-yellow)' : 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: '8px',
          padding: '6px 12px', color: showDirectory ? '#000' : 'var(--text-secondary)',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer'
        }}
      >
        {showDirectory ? '✖ Close' : '📖 Directory'}
      </button>

      {/* Location Directory Panel */}
      {showDirectory && (
        <div style={{
          position: 'absolute', top: '96px', left: '16px', bottom: '16px',
          width: '240px', zIndex: 6,
          background: 'rgba(13,15,20,0.95)',
          border: '1px solid var(--border)',
          borderRadius: '10px', overflowY: 'auto',
          padding: '12px'
        }}>
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px', color: 'var(--accent-yellow)' }}>
            City Directory
          </div>
          {Object.entries(locationsByType).map(([type, locs]) => (
            <div key={type} style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 700, color: LOCATION_COLORS[type],
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                {LOCATION_ICONS[type]} {type}
              </div>
              {locs.map(loc => {
                const isCurrent = loc.id === currentLocation;
                const isVisited = visitedLocations.has(loc.id);
                return (
                  <div
                    key={loc.id}
                    onClick={() => { handleLocationClick(loc); setShowDirectory(false); }}
                    style={{
                      padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                      marginBottom: '4px',
                      background: isCurrent ? 'rgba(245,200,66,0.1)' : selectedLocation === loc.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                      border: isCurrent ? '1px solid rgba(245,200,66,0.2)' : '1px solid transparent',
                      transition: 'background 0.15s',
                      opacity: isVisited || isCurrent ? 1 : 0.5
                    }}
                    onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!isCurrent && selectedLocation !== loc.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px', color: isCurrent ? 'var(--accent-yellow)' : 'var(--text-primary)' }}>
                      {loc.name} {isCurrent && '(you)'} {!isVisited && !isCurrent && '🔒'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {isVisited || isCurrent ? loc.tagline : 'Not yet explored'}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Move panel */}
      {selectedLocation && selectedLocation !== currentLocation && routeBetweenSelected && (
        <div style={{
          position: 'absolute', bottom: '16px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10, background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: '12px',
          padding: '14px 18px', minWidth: '280px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }} className="slide-up">
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>
            Travel to {LOCATIONS.find(l => l.id === selectedLocation)?.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            {LOCATIONS.find(l => l.id === selectedLocation)?.tagline}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {routeBetweenSelected.modes.map(mode => (
              <button
                key={mode}
                onClick={() => setTransportMode(mode)}
                style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                  background: transportMode === mode ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: transportMode === mode ? '#fff' : 'var(--text-secondary)',
                  fontWeight: transportMode === mode ? 600 : 400
                }}
              >
                {modeIcons[mode]} {mode}
                <span style={{ marginLeft: '4px', opacity: 0.8 }}>
                  {TRAVEL_COSTS[mode] === 0 ? 'free' : `₹${TRAVEL_COSTS[mode]}`}
                </span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSelectedLocation(null)}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '13px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              style={{
                flex: 2, padding: '9px', borderRadius: '8px',
                background: 'var(--accent-blue)',
                color: '#fff', fontWeight: 700, fontSize: '13px'
              }}
            >
              Travel ({Math.round(TRAVEL_TIMES[transportMode] / 60)}min)
            </button>
          </div>
        </div>
      )}

      {/* SVG Map */}
      <svg
        ref={svgRef}
        width="100%" height="100%"
        viewBox="0 0 900 750"
        style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}
          style={{ transformOrigin: '450px 375px' }}>

          {/* Defs */}
          <defs>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="#1a3a5c" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#1e4a7c" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1a3a5c" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="districtGlow">
              <feGaussianBlur stdDeviation="30" />
            </filter>
          </defs>

          {/* District zones — soft colored regions */}
          <ellipse cx="300" cy="120" rx="160" ry="80" fill="#c2410c" opacity="0.04" filter="url(#districtGlow)" />
          <text x="195" y="60" fill="rgba(194,65,12,0.18)" fontSize="13" fontWeight="700" letterSpacing="2">NORTH KOLKATA</text>

          <ellipse cx="400" cy="310" rx="200" ry="90" fill="#3b82f6" opacity="0.03" filter="url(#districtGlow)" />
          <text x="175" y="235" fill="rgba(59,130,246,0.15)" fontSize="13" fontWeight="700" letterSpacing="2">CENTRAL</text>

          <ellipse cx="340" cy="490" rx="150" ry="70" fill="#a855f7" opacity="0.03" filter="url(#districtGlow)" />
          <text x="380" y="455" fill="rgba(168,85,247,0.15)" fontSize="13" fontWeight="700" letterSpacing="2">SOUTH CENTRAL</text>

          <ellipse cx="380" cy="630" rx="170" ry="70" fill="#f59e0b" opacity="0.03" filter="url(#districtGlow)" />
          <text x="335" y="680" fill="rgba(245,158,11,0.15)" fontSize="13" fontWeight="700" letterSpacing="2">SOUTH KOLKATA</text>

          <ellipse cx="700" cy="210" rx="80" ry="60" fill="#06b6d4" opacity="0.04" filter="url(#districtGlow)" />
          <text x="660" y="145" fill="rgba(6,182,212,0.18)" fontSize="11" fontWeight="700" letterSpacing="2">EAST</text>

          {/* Hooghly River — wide organic path */}
          <path
            d="M 50 30 Q 90 120 70 250 Q 55 350 40 450 Q 30 550 50 700"
            fill="none" stroke="url(#riverGrad)" strokeWidth="40" opacity="0.5"
            strokeLinecap="round"
          />
          <path
            d="M 50 30 Q 90 120 70 250 Q 55 350 40 450 Q 30 550 50 700"
            fill="none" stroke="#2563eb" strokeWidth="16" opacity="0.2"
            strokeLinecap="round"
          />
          <path
            d="M 50 30 Q 90 120 70 250 Q 55 350 40 450 Q 30 550 50 700"
            fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.15"
            strokeLinecap="round" strokeDasharray="8 12"
          >
            <animate attributeName="stroke-dashoffset" from="40" to="0" dur="4s" repeatCount="indefinite" />
          </path>
          <text x="20" y="200" fill="rgba(96,165,250,0.12)" fontSize="10" fontWeight="600"
            transform="rotate(-82, 20, 200)" letterSpacing="3">HOOGHLY</text>

          {/* SVG rain particles inside the map */}
          {hasWeatherEvent && Array.from({ length: 16 }).map((_, i) => (
            <line key={`svgrain${i}`}
              x1={80 + (i * 53) % 720} y1={50}
              x2={78 + (i * 53) % 720} y2={62}
              stroke="rgba(120,170,230,0.2)"
              strokeWidth="1"
              opacity="0.3"
            >
              <animateTransform attributeName="transform" type="translate"
                values={`0,0;-4,${500 + (i % 3) * 80}`}
                dur={`${1.2 + (i % 4) * 0.3}s`} repeatCount="indefinite"
              />
              <animate attributeName="opacity" values="0.3;0.15;0" dur={`${1.2 + (i % 4) * 0.3}s`} repeatCount="indefinite" />
            </line>
          ))}

          {/* Fireflies at night */}
          {isNightTime && Array.from({ length: 12 }).map((_, i) => (
            <circle key={`firefly${i}`}
              cx={100 + (i * 67) % 650} cy={80 + (i * 53) % 550}
              r="1.5"
              fill={i % 2 === 0 ? 'rgba(245,200,66,0.6)' : 'rgba(129,230,217,0.5)'}
            >
              <animate attributeName="opacity" values="0;0.7;0" dur={`${3 + i % 3}s`} repeatCount="indefinite" begin={`${i * 0.7}s`} />
              <animateTransform attributeName="transform" type="translate"
                values={`0,0;${6 - (i % 3) * 4},${-8 + (i % 5) * 3};0,0`}
                dur={`${5 + i % 3}s`} repeatCount="indefinite" begin={`${i * 0.5}s`}
              />
            </circle>
          ))}

          {/* Arrow marker */}
          <defs>
            <marker id="arrowMarker" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <path d="M0,0 L6,2 L0,4" fill="var(--accent-blue)" />
            </marker>
          </defs>

          {/* Routes */}
          {ROUTES.map(route => {
            const from = LOCATIONS.find(l => l.id === route.from);
            const to = LOCATIONS.find(l => l.id === route.to);
            if (!from || !to) return null;

            const isCurrentRoute =
              (route.from === currentLocation && route.to === selectedLocation) ||
              (route.to === currentLocation && route.from === selectedLocation);

            const isHighlighted = selectedLocation &&
              ((route.from === selectedLocation && route.to === currentLocation) ||
               (route.to === selectedLocation && route.from === currentLocation) ||
               (route.from === currentLocation && isConnectedToSelected(route.to) && selectedLocation === route.to) ||
               (route.to === currentLocation && isConnectedToSelected(route.from) && selectedLocation === route.from));

            const isHoveredRoute = hoveredLocation &&
              currentLocation &&
              ((route.from === currentLocation && route.to === hoveredLocation) ||
               (route.to === currentLocation && route.from === hoveredLocation));

            const isTravelRoute = travelAnimation &&
              ((route.from === travelAnimation.from && route.to === travelAnimation.to) ||
               (route.to === travelAnimation.from && route.from === travelAnimation.to));

            const bothVisited = visitedLocations.has(route.from) && visitedLocations.has(route.to);

            return (
              <g key={`${route.from}-${route.to}`}>
                <line
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={isTravelRoute
                    ? 'var(--accent-yellow)'
                    : isCurrentRoute
                      ? 'var(--accent-blue)'
                      : isHighlighted
                        ? 'rgba(59,130,246,0.5)'
                        : isHoveredRoute
                          ? 'rgba(245,200,66,0.3)'
                          : bothVisited
                            ? 'rgba(255,255,255,0.12)'
                            : 'rgba(255,255,255,0.05)'}
                  strokeWidth={isTravelRoute ? 3 : isCurrentRoute ? 2.5 : isHighlighted || isHoveredRoute ? 2 : 1}
                  strokeDasharray={route.modes.includes('walk') ? undefined : '5,5'}
                />
                {/* Animated travel arrow on selected route */}
                {isCurrentRoute && !isTravelRoute && (
                  <line
                    x1={route.from === currentLocation ? from.x : to.x}
                    y1={route.from === currentLocation ? from.y : to.y}
                    x2={route.from === currentLocation ? to.x : from.x}
                    y2={route.from === currentLocation ? to.y : from.y}
                    stroke="var(--accent-blue)" strokeWidth="2"
                    strokeDasharray="8,6" markerEnd="url(#arrowMarker)"
                  >
                    <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1s" repeatCount="indefinite" />
                  </line>
                )}
                {/* Travel trail glow */}
                {isTravelRoute && (
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="var(--accent-yellow)" strokeWidth="6" opacity="0.2"
                    filter="url(#glow)"
                  />
                )}
              </g>
            );
          })}

          {/* Location nodes */}
          {LOCATIONS.map(loc => {
            const isCurrent = loc.id === currentLocation;
            const isSelected = loc.id === selectedLocation;
            const isConnected = selectedLocation ? isConnectedToSelected(loc.id) : false;
            const isHovered = loc.id === hoveredLocation;
            const otherPlayersHere = otherPlayers.filter(p => p.state.location === loc.id);
            const color = LOCATION_COLORS[loc.type];
            const affected = isLocationAffected(loc.id);
            const isVisited = visitedLocations.has(loc.id);
            const fogOpacity = isVisited || isCurrent ? 0 : 0.6;

            const labelOffset = getLabelOffset(loc);

            return (
              <g
                key={loc.id}
                className="location-node"
                transform={`translate(${loc.x},${loc.y})`}
                onClick={(e) => { e.stopPropagation(); handleLocationClick(loc); }}
                onMouseEnter={() => setHoveredLocation(loc.id)}
                onMouseLeave={() => setHoveredLocation(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Fog of war for unvisited */}
                {fogOpacity > 0 && (
                  <circle r="20" fill={`rgba(6,8,16,${fogOpacity})`} />
                )}

                {/* Event pulse ring */}
                {affected && (
                  <circle r="20" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Glow ring for current location */}
                {isCurrent && (
                  <>
                    <circle r="22" fill="none" stroke="var(--accent-yellow)" strokeWidth="1" opacity="0.3">
                      <animate attributeName="r" values="20;26;20" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle r="20" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
                  </>
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle r="16" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                    <animate attributeName="strokeDasharray" values="0,100;50,50;100,0" dur="0.4s" fill="freeze" />
                  </circle>
                )}

                {/* Reachable indicator */}
                {isConnected && !isSelected && !isCurrent && (
                  <circle r="14" fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth="1.5"
                    strokeDasharray="3,3" />
                )}

                {/* Main node */}
                <circle
                  r={isCurrent ? 14 : isHovered ? 13 : getNodeRadius(loc.type)}
                  fill={isCurrent ? color : isHovered ? `${color}cc` : isVisited ? 'var(--bg-card)' : 'rgba(20,22,30,0.9)'}
                  stroke={isVisited || isCurrent ? color : `${color}44`}
                  strokeWidth={isCurrent ? 3 : isHovered ? 2 : 1.5}
                  opacity={isConnected || isCurrent || !selectedLocation ? 1 : isVisited ? 0.7 : 0.3}
                />

                {/* Icon */}
                <text textAnchor="middle" dominantBaseline="central"
                  fontSize={isCurrent ? "13" : loc.type === 'transport' ? "11" : "10"} y="0.5"
                  opacity={isVisited || isCurrent ? 1 : 0.3}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {LOCATION_ICONS[loc.type]}
                </text>

                {/* Player count badge */}
                {otherPlayersHere.length > 0 && !isCurrent && (
                  <g transform="translate(10, -10)">
                    <circle r="6" fill="var(--accent-blue)" stroke="var(--bg-primary)" strokeWidth="1" />
                    <text textAnchor="middle" dominantBaseline="central"
                      fontSize="7" fill="#fff" fontWeight="700"
                      style={{ pointerEvents: 'none' }}>
                      {otherPlayersHere.length}
                    </text>
                  </g>
                )}

                {/* Other players */}
                {otherPlayersHere.map((p, i) => (
                  <g key={p.id}>
                    <circle
                      cx={-8 + i * 8} cy={-8} r="4"
                      fill={`hsl(${p.name.charCodeAt(0) * 7}deg 60% 50%)`}
                      stroke="var(--bg-primary)" strokeWidth="1"
                    />
                    {playerEmotes[p.id] && (
                      <text
                        x={-8 + i * 8} y={-18}
                        textAnchor="middle" fontSize="12"
                        style={{ pointerEvents: 'none' }}
                      >
                        <animate attributeName="opacity" values="1;1;0" dur="3s" fill="freeze" />
                        <animate attributeName="y" values="-18;-26" dur="3s" fill="freeze" />
                        {playerEmotes[p.id].emoji}
                      </text>
                    )}
                  </g>
                ))}

                {/* Label */}
                <g transform={`translate(${labelOffset.x}, ${labelOffset.y})`}>
                  <text
                    textAnchor={labelOffset.anchor}
                    fontSize="8"
                    fill={isCurrent ? 'var(--accent-yellow)' : isSelected ? 'var(--accent-blue)' : 'var(--text-primary)'}
                    fontWeight={isCurrent || isSelected ? 700 : 500}
                    opacity={isVisited || isCurrent ? (isConnected || isCurrent || !selectedLocation ? 1 : 0.4) : 0.25}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {isVisited || isCurrent ? loc.name : '???'}
                  </text>
                  {(isVisited || isCurrent) && (
                    <text
                      textAnchor={labelOffset.anchor}
                      y="10"
                      fontSize="6.5"
                      fill={color}
                      opacity={isConnected || isCurrent || !selectedLocation ? 0.8 : 0.3}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {loc.tagline}
                    </text>
                  )}
                </g>
              </g>
            );
          })}

          {/* Animated player token (smooth travel between locations) */}
          {currentLocation && (
            <g style={{ transition: travelAnimation ? 'none' : 'transform 0.3s ease' }}>
              {/* Trail particles during travel */}
              {travelAnimation && animProgress < 1 && (
                <>
                  {[0.2, 0.4, 0.6].map((offset, i) => {
                    const trailP = Math.max(0, animProgress - offset * 0.3);
                    const fromLoc = LOCATIONS.find(l => l.id === travelAnimation.from);
                    const toLoc = LOCATIONS.find(l => l.id === travelAnimation.to);
                    if (!fromLoc || !toLoc) return null;
                    const tx = fromLoc.x + (toLoc.x - fromLoc.x) * trailP;
                    const ty = fromLoc.y + (toLoc.y - fromLoc.y) * trailP;
                    return (
                      <circle key={i} cx={tx} cy={ty} r={2 - i * 0.5}
                        fill="var(--accent-yellow)" opacity={0.4 - i * 0.12} />
                    );
                  })}
                </>
              )}

              {/* Main player token */}
              <circle cx={playerX} cy={playerY} r="7"
                fill="var(--accent-yellow)" stroke="#000" strokeWidth="2"
                filter={travelAnimation ? 'url(#glow)' : undefined}
              />
              <text x={playerX} y={playerY + 0.5} textAnchor="middle" dominantBaseline="central"
                fontSize="7" fontWeight="700" fill="#000"
                style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {myPlayer?.name?.[0]?.toUpperCase() || '?'}
              </text>
            </g>
          )}

          {/* Radial action menu */}
          {radialTarget && currentLocation === radialTarget && (() => {
            const loc = LOCATIONS.find(l => l.id === radialTarget);
            if (!loc) return null;
            return (
              <RadialActionMenu
                locationId={radialTarget}
                x={loc.x}
                y={loc.y}
                scale={scale}
                onClose={() => setRadialTarget(null)}
              />
            );
          })()}
        </g>
      </svg>

      {/* Active city events */}
      {activeCityEvents.length > 0 && !hoveredLocation && (
        <div style={{
          position: 'absolute', top: '60px', right: '16px',
          zIndex: 5, display: 'flex', flexDirection: 'column', gap: '4px',
          maxWidth: '200px'
        }}>
          {activeCityEvents.map(evt => (
            <div key={evt.id} style={{
              padding: '6px 10px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              fontSize: '10px', color: '#f87171'
            }}>
              <div style={{ fontWeight: 700 }}>{evt.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '9px', marginTop: '2px' }}>
                {evt.affectedLocations.includes('all') ? 'Citywide' : evt.affectedLocations.length + ' areas'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hover detail tooltip */}
      {hoveredLocation && !radialTarget && (
        <div style={{
          position: 'absolute', top: '60px', right: '16px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '12px 14px',
          maxWidth: '230px', zIndex: 5
        }}>
          {(() => {
            const loc = LOCATIONS.find(l => l.id === hoveredLocation);
            if (!loc) return null;
            const hoveredRoute = currentLocation ? getRoutesBetween(currentLocation, loc.id) : null;
            const isCurrent = loc.id === currentLocation;
            const isVisited = visitedLocations.has(loc.id);
            const ambientNote = getAmbientNote(loc, hasWeatherEvent, hasCrowdEvent, isNightTime);
            return (
              <>
                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '13px' }}>
                  {LOCATION_ICONS[loc.type]} {isVisited || isCurrent ? loc.name : '??? Unknown'}
                  {isCurrent && <span style={{ color: 'var(--accent-yellow)', fontSize: '10px', marginLeft: '6px' }}>(here)</span>}
                </div>
                <div style={{
                  fontSize: '10px', color: LOCATION_COLORS[loc.type],
                  marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px'
                }}>
                  {loc.type} &middot; {loc.district}
                </div>
                {ambientNote && (
                  <div style={{
                    fontSize: '10px', color: 'var(--accent-teal)',
                    marginBottom: '4px', fontStyle: 'italic'
                  }}>
                    {ambientNote}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>
                  {isVisited || isCurrent ? loc.description : 'You haven\'t been here yet. Travel to discover this location.'}
                </div>

                {hoveredRoute && !isCurrent && (
                  <div style={{
                    padding: '6px 8px', borderRadius: '6px',
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.15)',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '4px' }}>
                      Travel options:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {hoveredRoute.modes.map(mode => (
                        <span key={mode} style={{
                          fontSize: '9px', padding: '2px 6px', borderRadius: '8px',
                          background: 'var(--bg-secondary)', color: 'var(--text-secondary)'
                        }}>
                          {modeIcons[mode]} {mode} {TRAVEL_COSTS[mode] === 0 ? '(free)' : `₹${TRAVEL_COSTS[mode]}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {!hoveredRoute && !isCurrent && (
                  <div style={{
                    fontSize: '10px', color: 'var(--text-muted)',
                    marginBottom: '8px', fontStyle: 'italic'
                  }}>
                    No direct route from here
                  </div>
                )}

                {(isVisited || isCurrent) && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                    {loc.availableActions.slice(0, 3).map((a, i) => (
                      <div key={i} style={{ marginBottom: '2px' }}>
                        {a.icon} {a.label}
                      </div>
                    ))}
                    {loc.availableActions.length > 3 && (
                      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        +{loc.availableActions.length - 3} more...
                      </div>
                    )}
                  </div>
                )}

                {isCurrent && (
                  <div style={{
                    marginTop: '8px', padding: '6px 8px', borderRadius: '6px',
                    background: 'rgba(245,200,66,0.08)',
                    border: '1px solid rgba(245,200,66,0.15)',
                    fontSize: '10px', color: 'var(--accent-yellow)', fontWeight: 600, textAlign: 'center'
                  }}>
                    Click to open action wheel
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Compact legend */}
      {!showDirectory && (
        <div style={{
          position: 'absolute', bottom: '16px', left: '16px',
          background: 'rgba(13,15,20,0.85)',
          border: '1px solid var(--border)',
          borderRadius: '8px', padding: '6px 10px',
          fontSize: '10px', zIndex: 4,
          display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '300px'
        }}>
          {Object.entries(LOCATION_ICONS).map(([type, icon]) => (
            <span key={type} style={{ color: LOCATION_COLORS[type], display: 'flex', alignItems: 'center', gap: '2px' }}>
              {icon} <span style={{ textTransform: 'capitalize' }}>{type}</span>
            </span>
          ))}
          <span style={{ color: 'var(--accent-yellow)' }}>&#x25CF; You</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>&#x25CF; Unexplored</span>
        </div>
      )}
    </div>
  );
}

function getNodeRadius(type: string): number {
  switch (type) {
    case 'transport': return 12;
    case 'food': return 11;
    case 'office': return 11;
    case 'shop': return 10;
    case 'medical': return 10;
    case 'public': return 10;
    default: return 8;
  }
}

function getLabelOffset(loc: LocationInfo): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  const r = getNodeRadius(loc.type) + 6;
  switch (loc.labelDir) {
    case 'top':
      return { x: 0, y: -r - 4, anchor: 'middle' };
    case 'left':
      return { x: -r - 2, y: -2, anchor: 'end' };
    case 'right':
      return { x: r + 2, y: -2, anchor: 'start' };
    case 'bottom':
    default:
      return { x: 0, y: r + 8, anchor: 'middle' };
  }
}

function getAmbientNote(loc: LocationInfo, weather: boolean, crowd: boolean, night: boolean): string | null {
  const t = loc.type;
  if (weather && night) {
    if (t === 'transport') return 'Rain drums on the platform roofs in the dark';
    if (t === 'shop') return 'Wet tarps glisten under dim bulbs';
    if (t === 'office') return 'Workers huddle under awnings';
    if (t === 'food') return 'Steam rises from stalls into the rain';
    return 'Rain streaks through the lamplight';
  }
  if (weather) {
    if (t === 'transport') return 'Rain patters on the platform roofs';
    if (t === 'shop') return 'Shoppers duck under stall canopies';
    if (t === 'residential') return 'Puddles form near the entrance';
    if (t === 'medical') return 'The queue moves slowly in the drizzle';
    return 'Umbrellas crowd the pavements';
  }
  if (crowd && night) {
    if (t === 'shop') return 'Night bazaar buzzes with extra crowds';
    if (t === 'transport') return 'Late rush chokes the platforms';
    return 'Crowds jostle in the lamplight';
  }
  if (crowd) {
    if (t === 'shop') return 'The lanes are packed shoulder to shoulder';
    if (t === 'transport') return 'Commuters spill onto the road';
    if (t === 'medical') return 'The line stretches around the corner';
    if (t === 'food') return 'Every table is taken; people wait standing';
    return 'More people than usual here';
  }
  if (night) {
    if (t === 'shop') return 'Shutters rattle down; a few vendors remain';
    if (t === 'residential') return 'Quiet settles over the sleeping area';
    if (t === 'transport') return 'Sparse late-night service runs';
    if (t === 'office') return 'Night shift workers trudge past';
    if (t === 'food') return 'Late-night dhabas glow in the dark';
    return 'Streetlights flicker over empty lanes';
  }
  return null;
}

const modeIcons: Record<string, string> = {
  walk: '🚶', bus: '🚌', metro: '🚇', tram: '🚋', taxi: '🚕'
};

const mapBtnStyle: React.CSSProperties = {
  width: '32px', height: '32px',
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: '6px', color: 'var(--text-primary)',
  fontSize: '16px', fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};
