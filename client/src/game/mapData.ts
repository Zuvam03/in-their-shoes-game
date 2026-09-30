export interface LocationInfo {
  id: string;
  name: string;
  district: string;
  type: 'transport' | 'food' | 'shop' | 'office' | 'medical' | 'public' | 'residential' | 'education';
  x: number;
  y: number;
  description: string;
  availableActions: ActionInfo[];
}

export interface ActionInfo {
  id: string;
  label: string;
  actionType: string;
  payload: Record<string, unknown>;
  cost?: number;
  energyCost?: number;
  description: string;
  icon: string;
}

export interface RouteInfo {
  from: string;
  to: string;
  modes: string[];
}

export const LOCATION_COLORS: Record<string, string> = {
  transport: '#3b82f6',
  food: '#f97316',
  shop: '#a855f7',
  office: '#6366f1',
  medical: '#ef4444',
  public: '#10b981',
  residential: '#84cc16',
  education: '#f59e0b'
};

export const LOCATION_ICONS: Record<string, string> = {
  transport: '🚉',
  food: '🍛',
  shop: '🛍️',
  office: '🏢',
  medical: '🏥',
  public: '🌳',
  residential: '🏠',
  education: '📚'
};

export const LOCATIONS: LocationInfo[] = [
  {
    id: 'howrah_station',
    name: 'Howrah Station',
    district: 'Howrah',
    type: 'transport',
    x: 120, y: 310,
    description: 'The grand old station, always teeming with people.',
    availableActions: [
      { id: 'drink_water', label: 'Drink water (free)', actionType: 'drink', payload: { cost: 0 }, description: 'Free drinking water at the station', icon: '💧' },
      { id: 'buy_snack', label: 'Buy platform snack (₹15)', actionType: 'eat', payload: { foodType: 'street', cost: 15 }, cost: 15, description: 'Quick platform snack', icon: '🍪' }
    ]
  },
  {
    id: 'esplanade',
    name: 'Esplanade',
    district: 'Central Kolkata',
    type: 'transport',
    x: 280, y: 290,
    description: 'The crossroads of the city. Every bus, tram, and metro passes here.',
    availableActions: [
      { id: 'buy_puchka', label: 'Puchka from vendor (₹20)', actionType: 'eat', payload: { foodType: 'street', cost: 20 }, cost: 20, description: 'Famous Kolkata puchka', icon: '🫓' },
      { id: 'drink_chai', label: 'Tea stall chai (₹5)', actionType: 'drink', payload: { cost: 5 }, cost: 5, description: 'Roadside chai', icon: '☕' }
    ]
  },
  {
    id: 'sealdah_station',
    name: 'Sealdah Station',
    district: 'North Kolkata',
    type: 'transport',
    x: 370, y: 220,
    description: 'Eastern gateway for suburban trains.',
    availableActions: [
      { id: 'buy_food', label: 'Station food stall (₹25)', actionType: 'eat', payload: { foodType: 'street', cost: 25 }, cost: 25, description: 'Station food stall', icon: '🍱' },
      { id: 'drink_water', label: 'Water fountain (free)', actionType: 'drink', payload: { cost: 0 }, description: 'Free station water', icon: '💧' }
    ]
  },
  {
    id: 'college_street',
    name: 'College Street',
    district: 'North Kolkata',
    type: 'education',
    x: 310, y: 200,
    description: "The city's intellectual heart. Books, students, old paper.",
    availableActions: [
      { id: 'buy_books', label: 'Buy study materials (₹50)', actionType: 'buy', payload: { item: 'study materials', cost: 50 }, cost: 50, description: 'Books and study materials', icon: '📚' },
      { id: 'complete_obj_books', label: 'Get required books (mission)', actionType: 'complete_objective', payload: { objectiveId: 'get_books' }, description: 'Complete the books objective', icon: '✅' },
      { id: 'drink_chai', label: 'Coffee house tea (₹8)', actionType: 'drink', payload: { cost: 8 }, cost: 8, description: 'Iconic coffee house', icon: '☕' }
    ]
  },
  {
    id: 'park_street',
    name: 'Park Street',
    district: 'South Central',
    type: 'food',
    x: 270, y: 360,
    description: 'The restaurant mile. Every cuisine, every price point.',
    availableActions: [
      { id: 'restaurant_meal', label: 'Restaurant meal (₹80)', actionType: 'eat', payload: { foodType: 'restaurant', cost: 80 }, cost: 80, description: 'Full restaurant meal', icon: '🍽️' },
      { id: 'street_roll', label: 'Kathi roll (₹40)', actionType: 'eat', payload: { foodType: 'street', cost: 40 }, cost: 40, description: 'Famous Kolkata kathi roll', icon: '🌯' },
      { id: 'cold_drink', label: 'Cold drink (₹15)', actionType: 'drink', payload: { cost: 15 }, cost: 15, description: 'Cold beverage', icon: '🥤' }
    ]
  },
  {
    id: 'maidan',
    name: 'Maidan',
    district: 'Central',
    type: 'public',
    x: 230, y: 340,
    description: 'Vast open green. A rare place to breathe and recover.',
    availableActions: [
      { id: 'rest_park', label: 'Rest in the park (2 min)', actionType: 'rest', payload: { duration: 120 }, energyCost: 0, description: 'Relaxing rest on the grass', icon: '😴' },
      { id: 'buy_water', label: 'Buy bottled water (₹12)', actionType: 'drink', payload: { cost: 12 }, cost: 12, description: 'Cold water from a vendor', icon: '💧' },
      { id: 'buy_nimbu', label: 'Nimbu pani (₹10)', actionType: 'drink', payload: { cost: 10 }, cost: 10, description: 'Refreshing lemon water', icon: '🍋' }
    ]
  },
  {
    id: 'victoria_memorial',
    name: 'Victoria Memorial Area',
    district: 'Central',
    type: 'public',
    x: 240, y: 400,
    description: 'Historical monument and gardens. Visiting restores mood.',
    availableActions: [
      { id: 'visit_memorial', label: 'Walk the gardens', actionType: 'rest', payload: { duration: 90 }, description: 'A peaceful walk in the gardens', icon: '🏛️' },
      { id: 'buy_snack', label: 'Gardens snack (₹20)', actionType: 'eat', payload: { foodType: 'street', cost: 20 }, cost: 20, description: 'Snack from a gardens vendor', icon: '🍿' }
    ]
  },
  {
    id: 'new_market',
    name: 'New Market',
    district: 'Central',
    type: 'shop',
    x: 260, y: 260,
    description: 'Legendary market with everything. Best prices in the city.',
    availableActions: [
      { id: 'buy_goods', label: 'Buy goods (₹60)', actionType: 'buy', payload: { item: 'market goods', cost: 60 }, cost: 60, description: 'General market shopping', icon: '🛍️' },
      { id: 'buy_food_market', label: 'Fresh food (₹25)', actionType: 'eat', payload: { foodType: 'vegetarian', cost: 25 }, cost: 25, description: 'Fresh food from the market', icon: '🥗' },
      { id: 'pick_package', label: 'Collect package (mission)', actionType: 'complete_objective', payload: { objectiveId: 'pick_up_package' }, description: 'Collect your delivery package', icon: '📦' }
    ]
  },
  {
    id: 'gariahat',
    name: 'Gariahat Market',
    district: 'South Kolkata',
    type: 'shop',
    x: 280, y: 480,
    description: "South Kolkata's biggest market.",
    availableActions: [
      { id: 'buy_goods', label: 'Shopping (₹50)', actionType: 'buy', payload: { item: 'Gariahat goods', cost: 50 }, cost: 50, description: 'Sarees, handicrafts, trinkets', icon: '🛍️' },
      { id: 'eat_street', label: 'Street food (₹18)', actionType: 'eat', payload: { foodType: 'street', cost: 18 }, cost: 18, description: 'Gariahat street food', icon: '🍛' }
    ]
  },
  {
    id: 'shyambazar',
    name: 'Shyambazar',
    district: 'North Kolkata',
    type: 'residential',
    x: 290, y: 160,
    description: 'Classic north Kolkata neighbourhood. Famous puchkas.',
    availableActions: [
      { id: 'eat_puchka', label: 'Neighbourhood puchka (₹15)', actionType: 'eat', payload: { foodType: 'street', cost: 15 }, cost: 15, description: 'Best puchka in north Kolkata', icon: '🫓' },
      { id: 'rest_home', label: 'Quick rest (1 min)', actionType: 'rest', payload: { duration: 60 }, description: 'Rest at a nearby bench', icon: '😴' }
    ]
  },
  {
    id: 'lake_gardens',
    name: 'Lake Gardens',
    district: 'South Kolkata',
    type: 'residential',
    x: 310, y: 520,
    description: 'Quiet residential area. Good for rest.',
    availableActions: [
      { id: 'long_rest', label: 'Proper rest (3 min)', actionType: 'rest', payload: { duration: 180 }, description: 'A longer, restorative rest', icon: '😴' },
      { id: 'eat_home', label: 'Local dhaba (₹35)', actionType: 'eat', payload: { foodType: 'vegetarian', cost: 35 }, cost: 35, description: 'Home-style dhaba meal', icon: '🍱' }
    ]
  },
  {
    id: 'bhawanipore',
    name: 'Bhawanipore',
    district: 'South Central',
    type: 'residential',
    x: 240, y: 440,
    description: 'Residential neighbourhood with excellent local dhabas.',
    availableActions: [
      { id: 'eat_dhaba', label: 'Local dhaba meal (₹30)', actionType: 'eat', payload: { foodType: 'vegetarian', cost: 30 }, cost: 30, description: 'Authentic local dhaba', icon: '🍱' },
      { id: 'drink_water_free', label: 'Water (free)', actionType: 'drink', payload: { cost: 0 }, description: 'Free water from a filter', icon: '💧' }
    ]
  },
  {
    id: 'kumartuli',
    name: 'Kumartuli',
    district: 'North Kolkata',
    type: 'public',
    x: 260, y: 140,
    description: "The potters' quarter. Fascinating artisan neighbourhood.",
    availableActions: [
      { id: 'deliver_package', label: 'Deliver package (mission)', actionType: 'complete_objective', payload: { objectiveId: 'deliver_package' }, description: 'Deliver your package here', icon: '📦' },
      { id: 'eat_local', label: 'Local snack (₹12)', actionType: 'eat', payload: { foodType: 'street', cost: 12 }, cost: 12, description: 'Neighbourhood snack stall', icon: '🍪' }
    ]
  },
  {
    id: 'street_food_row',
    name: 'Street Food Row',
    district: 'Central',
    type: 'food',
    x: 300, y: 280,
    description: 'Legendary puchka, kathi rolls, and jhalmuri stalls.',
    availableActions: [
      { id: 'eat_puchka', label: 'Puchka (₹15)', actionType: 'eat', payload: { foodType: 'street', cost: 15 }, cost: 15, description: 'Classic Kolkata puchka', icon: '🫓' },
      { id: 'eat_jhalmuri', label: 'Jhalmuri (₹10)', actionType: 'eat', payload: { foodType: 'street', cost: 10 }, cost: 10, description: 'Spicy puffed rice mix', icon: '🌶️' },
      { id: 'eat_roll', label: 'Egg roll (₹30)', actionType: 'eat', payload: { foodType: 'street', cost: 30 }, cost: 30, description: 'Famous Kolkata egg roll', icon: '🌯' },
      { id: 'eat_biryani', label: 'Biryani (₹70)', actionType: 'eat', payload: { foodType: 'meat', cost: 70 }, cost: 70, description: 'Kolkata biryani with egg', icon: '🍚' },
      { id: 'complete_food_obj', label: 'Satisfy craving (mission)', actionType: 'complete_objective', payload: { objectiveId: 'eat_meal' }, description: 'Complete your food mission', icon: '✅' }
    ]
  },
  {
    id: 'dalhousie_sq',
    name: 'Dalhousie Square',
    district: 'CBD',
    type: 'office',
    x: 330, y: 270,
    description: 'Commercial and government district. Work and formal errands.',
    availableActions: [
      { id: 'work_basic', label: 'Quick work task (₹40)', actionType: 'work', payload: { workType: 'basic', duration: 180 }, description: 'Basic work task — 3 minutes', icon: '💼' },
      { id: 'pay_rent', label: 'Pay rent/bills (mission)', actionType: 'complete_objective', payload: { objectiveId: 'pay_rent' }, description: 'Pay your essential bills', icon: '🏦' },
      { id: 'secondary_errand', label: 'Complete errand (mission)', actionType: 'complete_objective', payload: { objectiveId: 'secondary_objective' }, description: 'Complete your secondary errand', icon: '✅' }
    ]
  },
  {
    id: 'salt_lake',
    name: 'Salt Lake IT Park',
    district: 'East Kolkata',
    type: 'office',
    x: 480, y: 230,
    description: 'Modern tech hub. Better paying work but further away.',
    availableActions: [
      { id: 'work_skilled', label: 'Skilled work task (₹80)', actionType: 'work', payload: { workType: 'skilled', duration: 240 }, description: 'IT work task — 4 minutes', icon: '💻' },
      { id: 'work_basic', label: 'Support task (₹40)', actionType: 'work', payload: { workType: 'basic', duration: 180 }, description: 'Basic support task', icon: '💼' },
      { id: 'online_resource', label: 'Online resource (mission)', actionType: 'complete_objective', payload: { objectiveId: 'study_location' }, description: 'Use online resources for studying', icon: '🖥️' }
    ]
  },
  {
    id: 'pg_hospital',
    name: 'PG Hospital Area',
    district: 'Central',
    type: 'medical',
    x: 360, y: 300,
    description: 'Major hospital district. Restore health and obtain medicine.',
    availableActions: [
      { id: 'get_treatment', label: 'Get treatment (₹80)', actionType: 'buy', payload: { item: 'medical treatment', cost: 80 }, cost: 80, description: 'Professional medical care', icon: '💊' },
      { id: 'get_medicine', label: 'Get medicine (mission)', actionType: 'complete_objective', payload: { objectiveId: 'get_medicine' }, description: 'Obtain the required medicine', icon: '💉' },
      { id: 'drink_water', label: 'Hospital water (free)', actionType: 'drink', payload: { cost: 0 }, description: 'Free water at the hospital', icon: '💧' }
    ]
  },
  {
    id: 'local_clinic',
    name: 'Local Clinic',
    district: 'South Central',
    type: 'medical',
    x: 250, y: 420,
    description: 'Community health clinic. Cheaper, basic care.',
    availableActions: [
      { id: 'basic_treatment', label: 'Basic treatment (₹30)', actionType: 'buy', payload: { item: 'basic treatment', cost: 30 }, cost: 30, description: 'Basic medical care', icon: '🩺' },
      { id: 'get_medicine_alt', label: 'Alternative medicine (mission)', actionType: 'complete_objective', payload: { objectiveId: 'get_medicine' }, description: 'Get substitute medicine here', icon: '💊' }
    ]
  },
  {
    id: 'hooghly_bank',
    name: 'Hooghly Riverbank',
    district: 'West Kolkata',
    type: 'public',
    x: 150, y: 260,
    description: 'Banks of the Hooghly. Peaceful, with tea stalls and open skies.',
    availableActions: [
      { id: 'sit_riverside', label: 'Sit by the river (2 min)', actionType: 'rest', payload: { duration: 120 }, description: 'Peaceful rest by the Hooghly', icon: '🌊' },
      { id: 'drink_chai', label: 'Riverside chai (₹8)', actionType: 'drink', payload: { cost: 8 }, cost: 8, description: 'Tea at a riverside stall', icon: '☕' },
      { id: 'buy_chanachur', label: 'Chanachur (₹10)', actionType: 'eat', payload: { foodType: 'street', cost: 10 }, cost: 10, description: 'Spicy mix snack', icon: '🌶️' }
    ]
  },
  {
    id: 'kalighat',
    name: 'Kalighat',
    district: 'South Kolkata',
    type: 'transport',
    x: 250, y: 450,
    description: 'Famous temple area and metro station.',
    availableActions: [
      { id: 'eat_prasad', label: 'Temple prasad (₹5)', actionType: 'eat', payload: { foodType: 'sweet', cost: 5 }, cost: 5, description: 'Sweet temple offering', icon: '🍬' },
      { id: 'drink_water', label: 'Temple water (free)', actionType: 'drink', payload: { cost: 0 }, description: 'Free water at the temple', icon: '💧' }
    ]
  }
];

export const ROUTES: RouteInfo[] = [
  { from: 'howrah_station', to: 'esplanade', modes: ['walk', 'bus', 'tram'] },
  { from: 'esplanade', to: 'sealdah_station', modes: ['walk', 'bus', 'metro'] },
  { from: 'esplanade', to: 'new_market', modes: ['walk'] },
  { from: 'esplanade', to: 'college_street', modes: ['walk', 'bus'] },
  { from: 'esplanade', to: 'park_street', modes: ['walk', 'bus'] },
  { from: 'esplanade', to: 'maidan', modes: ['walk'] },
  { from: 'park_street', to: 'victoria_memorial', modes: ['walk', 'taxi'] },
  { from: 'park_street', to: 'bhawanipore', modes: ['walk', 'bus'] },
  { from: 'bhawanipore', to: 'kalighat', modes: ['walk', 'metro'] },
  { from: 'kalighat', to: 'gariahat', modes: ['walk', 'bus', 'metro'] },
  { from: 'gariahat', to: 'lake_gardens', modes: ['walk', 'bus'] },
  { from: 'sealdah_station', to: 'college_street', modes: ['walk', 'bus'] },
  { from: 'college_street', to: 'shyambazar', modes: ['walk', 'bus', 'tram'] },
  { from: 'shyambazar', to: 'kumartuli', modes: ['walk'] },
  { from: 'new_market', to: 'dalhousie_sq', modes: ['walk', 'bus'] },
  { from: 'new_market', to: 'street_food_row', modes: ['walk'] },
  { from: 'dalhousie_sq', to: 'pg_hospital', modes: ['walk', 'bus'] },
  { from: 'salt_lake', to: 'sealdah_station', modes: ['bus', 'metro'] },
  { from: 'hooghly_bank', to: 'howrah_station', modes: ['walk'] },
  { from: 'hooghly_bank', to: 'esplanade', modes: ['walk', 'bus'] },
  { from: 'maidan', to: 'victoria_memorial', modes: ['walk'] },
  { from: 'victoria_memorial', to: 'bhawanipore', modes: ['walk', 'bus'] },
  { from: 'local_clinic', to: 'bhawanipore', modes: ['walk'] },
  { from: 'sealdah_station', to: 'dalhousie_sq', modes: ['walk', 'bus'] }
];

export function getLocationById(id: string): LocationInfo | undefined {
  return LOCATIONS.find(l => l.id === id);
}

export function getConnectedLocations(locationId: string): string[] {
  const connected = new Set<string>();
  for (const route of ROUTES) {
    if (route.from === locationId) connected.add(route.to);
    if (route.to === locationId) connected.add(route.from);
  }
  return Array.from(connected);
}

export function getRoutesBetween(from: string, to: string): RouteInfo | undefined {
  return ROUTES.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));
}

export const TRAVEL_TIMES: Record<string, Record<string, number>> = {
  walk: { default: 480 },
  bus: { default: 240 },
  metro: { default: 180 },
  tram: { default: 360 },
  taxi: { default: 150 }
};

export const TRAVEL_COSTS: Record<string, Record<string, number>> = {
  walk: { default: 0 },
  bus: { default: 8 },
  metro: { default: 15 },
  tram: { default: 6 },
  taxi: { default: 80 }
};
