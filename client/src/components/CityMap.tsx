import { useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  LOCATIONS, ROUTES, LOCATION_COLORS, LOCATION_ICONS,
  getConnectedLocations, getRoutesBetween, LocationInfo
} from '../game/mapData';

export default function CityMap() {
  const { myPlayer, room, submitAction } = useGameStore();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [transportMode, setTransportMode] = useState<string>('walk');
  const [showDirectory, setShowDirectory] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const currentLocation = myPlayer?.state.location;
  const otherPlayers = room
    ? Object.values(room.players).filter(p => p.id !== myPlayer?.id)
    : [];

  const connected = selectedLocation ? getConnectedLocations(selectedLocation) : [];
  const isConnectedToSelected = (id: string) => connected.includes(id);

  const handleLocationClick = (loc: LocationInfo) => {
    if (loc.id === currentLocation) {
      setSelectedLocation(null);
      return;
    }
    setSelectedLocation(loc.id);
  };

  const handleMove = () => {
    if (!selectedLocation || !currentLocation) return;
    const route = getRoutesBetween(currentLocation, selectedLocation);
    const mode = route?.modes.includes(transportMode) ? transportMode : route?.modes[0] || 'walk';
    submitAction('move', { destination: selectedLocation, mode });
    setSelectedLocation(null);
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

  const locationsByType = LOCATIONS.reduce<Record<string, LocationInfo[]>>((acc, loc) => {
    (acc[loc.type] = acc[loc.type] || []).push(loc);
    return acc;
  }, {});

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0a0d14' }}>
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
                return (
                  <div
                    key={loc.id}
                    onClick={() => { handleLocationClick(loc); setShowDirectory(false); }}
                    style={{
                      padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                      marginBottom: '4px',
                      background: isCurrent ? 'rgba(245,200,66,0.1)' : selectedLocation === loc.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                      border: isCurrent ? '1px solid rgba(245,200,66,0.2)' : '1px solid transparent',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!isCurrent && selectedLocation !== loc.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px', color: isCurrent ? 'var(--accent-yellow)' : 'var(--text-primary)' }}>
                      {loc.name} {isCurrent && '(you)'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {loc.tagline}
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
        viewBox="0 0 640 640"
        style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}
          style={{ transformOrigin: '320px 320px' }}>

          {/* Water/river background */}
          <defs>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1a3a5c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e4a7c" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Hooghly River */}
          <path
            d="M 60 100 Q 100 200 80 320 Q 70 400 90 500"
            fill="none" stroke="url(#riverGrad)" strokeWidth="28" opacity="0.6"
          />
          <path
            d="M 60 100 Q 100 200 80 320 Q 70 400 90 500"
            fill="none" stroke="#2563eb" strokeWidth="12" opacity="0.3"
          />

          {/* Grid lines */}
          {[100, 150, 200, 250, 300, 350, 400, 450, 500].map(y => (
            <line key={`h${y}`} x1="100" y1={y} x2="540" y2={y}
              stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}
          {[150, 200, 250, 300, 350, 400, 450, 500].map(x => (
            <line key={`v${x}`} x1={x} y1="100" x2={x} y2="560"
              stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}

          {/* Districts */}
          <text x="150" y="130" fill="rgba(255,255,255,0.12)" fontSize="14" fontWeight="600">North Kolkata</text>
          <text x="200" y="380" fill="rgba(255,255,255,0.12)" fontSize="14" fontWeight="600">Central</text>
          <text x="200" y="520" fill="rgba(255,255,255,0.12)" fontSize="14" fontWeight="600">South Kolkata</text>
          <text x="420" y="250" fill="rgba(255,255,255,0.12)" fontSize="14" fontWeight="600">East Kolkata</text>

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

            return (
              <line
                key={`${route.from}-${route.to}`}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={isCurrentRoute
                  ? 'var(--accent-blue)'
                  : isHighlighted
                    ? 'rgba(59,130,246,0.5)'
                    : 'rgba(255,255,255,0.12)'}
                strokeWidth={isCurrentRoute ? 2.5 : isHighlighted ? 2 : 1}
                strokeDasharray={route.modes.includes('walk') ? undefined : '5,5'}
              />
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

            const labelOffset = getLabelOffset(loc);

            return (
              <g
                key={loc.id}
                className="location-node"
                transform={`translate(${loc.x},${loc.y})`}
                onClick={() => handleLocationClick(loc)}
                onMouseEnter={() => setHoveredLocation(loc.id)}
                onMouseLeave={() => setHoveredLocation(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow ring for current location */}
                {isCurrent && (
                  <circle r="20" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle r="16" fill="none" stroke="var(--accent-blue)" strokeWidth="2" />
                )}

                {/* Reachable indicator */}
                {isConnected && !isSelected && !isCurrent && (
                  <circle r="14" fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth="1.5"
                    strokeDasharray="3,3" />
                )}

                {/* Main node */}
                <circle
                  r={isCurrent ? 12 : isHovered ? 11 : 9}
                  fill={isCurrent ? color : isHovered ? `${color}cc` : 'var(--bg-card)'}
                  stroke={color}
                  strokeWidth={isCurrent ? 3 : isHovered ? 2 : 1.5}
                  opacity={isConnected || isCurrent || !selectedLocation ? 1 : 0.4}
                />

                {/* Icon */}
                <text textAnchor="middle" dominantBaseline="central"
                  fontSize={isCurrent ? "11" : "9"} y="0.5"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {LOCATION_ICONS[loc.type]}
                </text>

                {/* My player dot */}
                {isCurrent && (
                  <circle cx="9" cy="-9" r="5" fill="var(--accent-yellow)" stroke="var(--bg-primary)" strokeWidth="1.5" />
                )}

                {/* Other players */}
                {otherPlayersHere.map((p, i) => (
                  <circle
                    key={p.id}
                    cx={-8 + i * 8} cy={-8} r="4"
                    fill={`hsl(${p.name.charCodeAt(0) * 7}deg 60% 50%)`}
                    stroke="var(--bg-primary)" strokeWidth="1"
                  />
                ))}

                {/* Always-visible label with name and tagline */}
                <g transform={`translate(${labelOffset.x}, ${labelOffset.y})`}>
                  <text
                    textAnchor={labelOffset.anchor}
                    fontSize="8"
                    fill={isCurrent ? 'var(--accent-yellow)' : isSelected ? 'var(--accent-blue)' : 'var(--text-primary)'}
                    fontWeight={isCurrent || isSelected ? 700 : 500}
                    opacity={isConnected || isCurrent || !selectedLocation ? 1 : 0.4}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {loc.name}
                  </text>
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
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover detail tooltip */}
      {hoveredLocation && (
        <div style={{
          position: 'absolute', top: '60px', right: '16px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '12px 14px',
          maxWidth: '220px', zIndex: 5
        }}>
          {(() => {
            const loc = LOCATIONS.find(l => l.id === hoveredLocation);
            if (!loc) return null;
            return (
              <>
                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '13px' }}>
                  {LOCATION_ICONS[loc.type]} {loc.name}
                </div>
                <div style={{
                  fontSize: '10px', color: LOCATION_COLORS[loc.type],
                  marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px'
                }}>
                  {loc.type} &middot; {loc.district}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>
                  {loc.description}
                </div>
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
        </div>
      )}
    </div>
  );
}

function getLabelOffset(loc: LocationInfo): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  switch (loc.labelDir) {
    case 'top':
      return { x: 0, y: -18, anchor: 'middle' };
    case 'left':
      return { x: -16, y: -2, anchor: 'end' };
    case 'right':
      return { x: 16, y: -2, anchor: 'start' };
    case 'bottom':
    default:
      return { x: 0, y: 18, anchor: 'middle' };
  }
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
