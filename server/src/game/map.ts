import type { Location, Route, TransportMode } from './types';

export const LOCATIONS: Location[] = [
  // Transport Hubs
  {
    id: 'howrah_station',
    name: 'Howrah Station',
    district: 'Howrah',
    type: 'transport',
    x: 90, y: 340,
    resources: { water: 1 },
    description: 'The grand old station of Kolkata, always teeming with people. Starting point for many journeys.'
  },
  {
    id: 'esplanade',
    name: 'Esplanade',
    district: 'Central Kolkata',
    type: 'transport',
    x: 340, y: 340,
    resources: { food: 1, water: 1 },
    description: 'The crossroads of the city. Every bus, tram, and metro passes through here.'
  },
  {
    id: 'sealdah_station',
    name: 'Sealdah Station',
    district: 'North Kolkata',
    type: 'transport',
    x: 500, y: 155,
    resources: { food: 1 },
    description: 'Eastern gateway for suburban trains. Busy and always in motion.'
  },
  // Cultural/Public Spaces
  {
    id: 'college_street',
    name: 'College Street',
    district: 'North Kolkata',
    type: 'education',
    x: 380, y: 175,
    resources: { knowledge: 1 },
    description: 'The city\'s intellectual heart. Books, students, and the smell of old paper. Study materials available.'
  },
  {
    id: 'park_street',
    name: 'Park Street',
    district: 'South Central',
    type: 'food',
    x: 370, y: 430,
    resources: { food: 2, water: 1 },
    description: 'The restaurant mile of Kolkata. Every cuisine, every price point. Food restores more here.'
  },
  {
    id: 'maidan',
    name: 'Maidan',
    district: 'Central',
    type: 'public',
    x: 250, y: 400,
    resources: { energy: 1, water: 1 },
    description: 'The vast open green heart of the city. A rare place to breathe and recover energy.'
  },
  {
    id: 'victoria_memorial',
    name: 'Victoria Memorial Area',
    district: 'Central',
    type: 'public',
    x: 260, y: 490,
    resources: { mood: 1 },
    description: 'Historical monument and gardens. Visiting restores mood and offers a brief calm.'
  },
  // Markets
  {
    id: 'new_market',
    name: 'New Market',
    district: 'Central',
    type: 'shop',
    x: 320, y: 265,
    resources: { food: 2, goods: 2, water: 1 },
    description: 'Legendary market with everything from food to clothes. Best prices in the city.'
  },
  {
    id: 'gariahat',
    name: 'Gariahat Market',
    district: 'South Kolkata',
    type: 'shop',
    x: 420, y: 610,
    resources: { goods: 2, food: 1 },
    description: 'South Kolkata\'s biggest market. Sarees, handicrafts, street food.'
  },
  // Residential
  {
    id: 'shyambazar',
    name: 'Shyambazar',
    district: 'North Kolkata',
    type: 'residential',
    x: 360, y: 105,
    resources: { food: 1 },
    description: 'A classic north Kolkata neighbourhood. Famous for its puchkas and political posters.'
  },
  {
    id: 'lake_gardens',
    name: 'Lake Gardens',
    district: 'South Kolkata',
    type: 'residential',
    x: 490, y: 660,
    resources: { energy: 1 },
    description: 'A quiet residential area around the lakes. Good for rest and recovery.'
  },
  {
    id: 'bhawanipore',
    name: 'Bhawanipore',
    district: 'South Central',
    type: 'residential',
    x: 300, y: 550,
    resources: { food: 1 },
    description: 'A residential neighbourhood with excellent local dhabas and sweets shops.'
  },
  // Food Spots
  {
    id: 'kumartuli',
    name: 'Kumartuli',
    district: 'North Kolkata',
    type: 'public',
    x: 220, y: 90,
    resources: { mood: 1, knowledge: 1 },
    description: 'The potters\' quarter — artisans making idols. Fascinating to walk through.'
  },
  {
    id: 'street_food_row',
    name: 'Street Food Row',
    district: 'Central',
    type: 'food',
    x: 420, y: 305,
    resources: { food: 2, water: 1 },
    description: 'A legendary stretch of puchka, kathi rolls, and jhalmuri stalls.'
  },
  // Offices/Work
  {
    id: 'dalhousie_sq',
    name: 'Dalhousie Square',
    district: 'Central Business District',
    type: 'office',
    x: 500, y: 270,
    resources: { money: 1 },
    description: 'The commercial and government district. Work opportunities and formal errands available.'
  },
  {
    id: 'salt_lake',
    name: 'Salt Lake IT Park',
    district: 'East Kolkata',
    type: 'office',
    x: 710, y: 200,
    resources: { money: 2, knowledge: 1 },
    description: 'Modern tech hub. Better paying work but further away.'
  },
  // Medical
  {
    id: 'pg_hospital',
    name: 'PG Hospital Area',
    district: 'Central',
    type: 'medical',
    x: 550, y: 340,
    resources: { health: 2 },
    description: 'Major hospital district. Can restore health and obtain medicine.'
  },
  {
    id: 'local_clinic',
    name: 'Local Clinic',
    district: 'South Central',
    type: 'medical',
    x: 350, y: 510,
    resources: { health: 1 },
    description: 'Community health clinic. Cheaper than the hospital, basic care.'
  },
  // Water/Hydration
  {
    id: 'hooghly_bank',
    name: 'Hooghly Riverbank',
    district: 'West Kolkata',
    type: 'public',
    x: 155, y: 275,
    resources: { water: 2, mood: 1, energy: 1 },
    description: 'The banks of the Hooghly. Peaceful, with tea stalls and open skies.'
  },
  // Metro stations
  {
    id: 'kalighat',
    name: 'Kalighat',
    district: 'South Kolkata',
    type: 'transport',
    x: 280, y: 600,
    resources: { food: 1 },
    description: 'Famous temple area and metro station. Cultural importance and street vendors.'
  }
];

export const ROUTES: Route[] = [
  // Howrah ↔ Esplanade
  {
    from: 'howrah_station', to: 'esplanade',
    modes: ['walk', 'bus', 'tram'],
    travelTime: { walk: 720, bus: 300, metro: 0, tram: 420, taxi: 200 },
    cost: { walk: 0, bus: 7, metro: 0, tram: 5, taxi: 80 }
  },
  // Esplanade ↔ Sealdah
  {
    from: 'esplanade', to: 'sealdah_station',
    modes: ['walk', 'bus', 'metro'],
    travelTime: { walk: 600, bus: 240, metro: 180, tram: 0, taxi: 180 },
    cost: { walk: 0, bus: 10, metro: 15, tram: 0, taxi: 100 }
  },
  // Esplanade ↔ New Market
  {
    from: 'esplanade', to: 'new_market',
    modes: ['walk'],
    travelTime: { walk: 300, bus: 0, metro: 0, tram: 0, taxi: 60 },
    cost: { walk: 0, bus: 0, metro: 0, tram: 0, taxi: 40 }
  },
  // Esplanade ↔ College Street
  {
    from: 'esplanade', to: 'college_street',
    modes: ['walk', 'bus'],
    travelTime: { walk: 540, bus: 240, metro: 0, tram: 0, taxi: 150 },
    cost: { walk: 0, bus: 8, metro: 0, tram: 0, taxi: 70 }
  },
  // Esplanade ↔ Park Street
  {
    from: 'esplanade', to: 'park_street',
    modes: ['walk', 'bus'],
    travelTime: { walk: 480, bus: 200, metro: 0, tram: 0, taxi: 120 },
    cost: { walk: 0, bus: 8, metro: 0, tram: 0, taxi: 60 }
  },
  // Esplanade ↔ Maidan
  {
    from: 'esplanade', to: 'maidan',
    modes: ['walk'],
    travelTime: { walk: 360, bus: 0, metro: 0, tram: 0, taxi: 80 },
    cost: { walk: 0, bus: 0, metro: 0, tram: 0, taxi: 50 }
  },
  // Park Street ↔ Victoria Memorial
  {
    from: 'park_street', to: 'victoria_memorial',
    modes: ['walk', 'taxi'],
    travelTime: { walk: 420, bus: 0, metro: 0, tram: 0, taxi: 100 },
    cost: { walk: 0, bus: 0, metro: 0, tram: 0, taxi: 60 }
  },
  // Park Street ↔ Bhawanipore
  {
    from: 'park_street', to: 'bhawanipore',
    modes: ['walk', 'bus'],
    travelTime: { walk: 480, bus: 220, metro: 0, tram: 0, taxi: 120 },
    cost: { walk: 0, bus: 8, metro: 0, tram: 0, taxi: 70 }
  },
  // Bhawanipore ↔ Kalighat
  {
    from: 'bhawanipore', to: 'kalighat',
    modes: ['walk', 'metro'],
    travelTime: { walk: 360, bus: 0, metro: 150, tram: 0, taxi: 100 },
    cost: { walk: 0, bus: 0, metro: 12, tram: 0, taxi: 60 }
  },
  // Kalighat ↔ Gariahat
  {
    from: 'kalighat', to: 'gariahat',
    modes: ['walk', 'bus', 'metro'],
    travelTime: { walk: 420, bus: 200, metro: 180, tram: 0, taxi: 120 },
    cost: { walk: 0, bus: 8, metro: 12, tram: 0, taxi: 70 }
  },
  // Gariahat ↔ Lake Gardens
  {
    from: 'gariahat', to: 'lake_gardens',
    modes: ['walk', 'bus'],
    travelTime: { walk: 600, bus: 260, metro: 0, tram: 0, taxi: 150 },
    cost: { walk: 0, bus: 10, metro: 0, tram: 0, taxi: 80 }
  },
  // Sealdah ↔ College Street
  {
    from: 'sealdah_station', to: 'college_street',
    modes: ['walk', 'bus'],
    travelTime: { walk: 360, bus: 180, metro: 0, tram: 0, taxi: 90 },
    cost: { walk: 0, bus: 7, metro: 0, tram: 0, taxi: 50 }
  },
  // College Street ↔ Shyambazar
  {
    from: 'college_street', to: 'shyambazar',
    modes: ['walk', 'bus', 'tram'],
    travelTime: { walk: 600, bus: 240, metro: 0, tram: 300, taxi: 160 },
    cost: { walk: 0, bus: 8, metro: 0, tram: 6, taxi: 80 }
  },
  // Shyambazar ↔ Kumartuli
  {
    from: 'shyambazar', to: 'kumartuli',
    modes: ['walk'],
    travelTime: { walk: 360, bus: 0, metro: 0, tram: 0, taxi: 80 },
    cost: { walk: 0, bus: 0, metro: 0, tram: 0, taxi: 50 }
  },
  // New Market ↔ Dalhousie Sq
  {
    from: 'new_market', to: 'dalhousie_sq',
    modes: ['walk', 'bus'],
    travelTime: { walk: 480, bus: 220, metro: 0, tram: 0, taxi: 120 },
    cost: { walk: 0, bus: 8, metro: 0, tram: 0, taxi: 60 }
  },
  // New Market ↔ Street Food Row
  {
    from: 'new_market', to: 'street_food_row',
    modes: ['walk'],
    travelTime: { walk: 240, bus: 0, metro: 0, tram: 0, taxi: 50 },
    cost: { walk: 0, bus: 0, metro: 0, tram: 0, taxi: 30 }
  },
  // Dalhousie ↔ PG Hospital
  {
    from: 'dalhousie_sq', to: 'pg_hospital',
    modes: ['walk', 'bus'],
    travelTime: { walk: 480, bus: 220, metro: 0, tram: 0, taxi: 120 },
    cost: { walk: 0, bus: 8, metro: 0, tram: 0, taxi: 70 }
  },
  // Salt Lake ↔ Sealdah
  {
    from: 'salt_lake', to: 'sealdah_station',
    modes: ['bus', 'metro'],
    travelTime: { walk: 0, bus: 540, metro: 360, tram: 0, taxi: 280 },
    cost: { walk: 0, bus: 15, metro: 20, tram: 0, taxi: 150 }
  },
  // Hooghly Bank ↔ Howrah Station
  {
    from: 'hooghly_bank', to: 'howrah_station',
    modes: ['walk'],
    travelTime: { walk: 360, bus: 0, metro: 0, tram: 0, taxi: 90 },
    cost: { walk: 0, bus: 0, metro: 0, tram: 0, taxi: 50 }
  },
  // Hooghly Bank ↔ Esplanade
  {
    from: 'hooghly_bank', to: 'esplanade',
    modes: ['walk', 'bus'],
    travelTime: { walk: 600, bus: 280, metro: 0, tram: 0, taxi: 160 },
    cost: { walk: 0, bus: 8, metro: 0, tram: 0, taxi: 90 }
  },
  // Maidan ↔ Victoria Memorial
  {
    from: 'maidan', to: 'victoria_memorial',
    modes: ['walk'],
    travelTime: { walk: 300, bus: 0, metro: 0, tram: 0, taxi: 60 },
    cost: { walk: 0, bus: 0, metro: 0, tram: 0, taxi: 40 }
  },
  // Victoria Memorial ↔ Bhawanipore
  {
    from: 'victoria_memorial', to: 'bhawanipore',
    modes: ['walk', 'bus'],
    travelTime: { walk: 420, bus: 200, metro: 0, tram: 0, taxi: 100 },
    cost: { walk: 0, bus: 8, metro: 0, tram: 0, taxi: 60 }
  },
  // Local Clinic ↔ Bhawanipore
  {
    from: 'local_clinic', to: 'bhawanipore',
    modes: ['walk'],
    travelTime: { walk: 240, bus: 0, metro: 0, tram: 0, taxi: 60 },
    cost: { walk: 0, bus: 0, metro: 0, tram: 0, taxi: 40 }
  },
  // Sealdah Station ↔ Dalhousie Sq
  {
    from: 'sealdah_station', to: 'dalhousie_sq',
    modes: ['walk', 'bus'],
    travelTime: { walk: 540, bus: 240, metro: 0, tram: 0, taxi: 140 },
    cost: { walk: 0, bus: 8, metro: 0, tram: 0, taxi: 80 }
  }
];

// Build adjacency map for pathfinding
export function buildAdjacencyMap(): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const route of ROUTES) {
    if (!adj.has(route.from)) adj.set(route.from, []);
    if (!adj.has(route.to)) adj.set(route.to, []);
    adj.get(route.from)!.push(route.to);
    adj.get(route.to)!.push(route.from);
  }
  return adj;
}

export function getRoute(from: string, to: string): Route | undefined {
  return ROUTES.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));
}

export function getLocation(id: string): Location | undefined {
  return LOCATIONS.find(l => l.id === id);
}

export function findShortestPath(from: string, to: string, mode: TransportMode): { path: string[]; time: number; cost: number } | null {
  if (from === to) return { path: [from], time: 0, cost: 0 };

  // BFS pathfinding
  type Node = { locationId: string; path: string[]; time: number; cost: number };
  const queue: Node[] = [{ locationId: from, path: [from], time: 0, cost: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { locationId, path, time, cost } = queue.shift()!;
    if (visited.has(locationId)) continue;
    visited.add(locationId);

    const routes = ROUTES.filter(r =>
      (r.from === locationId || r.to === locationId) && r.modes.includes(mode)
    );

    for (const route of routes) {
      const next = route.from === locationId ? route.to : route.from;
      if (visited.has(next)) continue;

      const newTime = time + (route.travelTime[mode] || Infinity);
      const newCost = cost + (route.cost[mode] || Infinity);
      const newPath = [...path, next];

      if (next === to) return { path: newPath, time: newTime, cost: newCost };
      queue.push({ locationId: next, path: newPath, time: newTime, cost: newCost });
    }
  }

  return null; // no path
}

export function getAvailableTransportModes(from: string, to: string): TransportMode[] {
  const route = getRoute(from, to);
  if (!route) return [];
  return route.modes;
}
