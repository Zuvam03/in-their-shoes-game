export interface LocationInfo {
  id: string;
  name: string;
  district: string;
  type: 'transport' | 'food' | 'shop' | 'office' | 'medical' | 'public' | 'residential' | 'education';
  x: number;
  y: number;
  description: string;
  tagline: string;
  labelDir: 'top' | 'bottom' | 'left' | 'right';
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
    x: 90, y: 340,
    description: 'The grand old station, always teeming with people.',
    tagline: 'Rail hub, cheap snacks',
    labelDir: 'left' as const,
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
    x: 340, y: 340,
    description: 'The crossroads of the city. Every bus, tram, and metro passes here.',
    tagline: 'City crossroads, puchka',
    labelDir: 'bottom' as const,
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
    x: 500, y: 155,
    description: 'Eastern gateway for suburban trains.',
    tagline: 'Suburban trains, food stalls',
    labelDir: 'right' as const,
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
    x: 380, y: 175,
    description: "The city's intellectual heart. Books, students, old paper.",
    tagline: 'Books, coffee house',
    labelDir: 'top' as const,
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
    x: 370, y: 430,
    description: 'The restaurant mile. Every cuisine, every price point.',
    tagline: 'Restaurants, kathi rolls',
    labelDir: 'right' as const,
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
    x: 250, y: 400,
    description: 'Vast open green. A rare place to breathe and recover.',
    tagline: 'Rest, open air',
    labelDir: 'bottom' as const,
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
    x: 260, y: 490,
    description: 'Historical monument and gardens. Visiting restores mood.',
    tagline: 'Gardens, mood boost',
    labelDir: 'left' as const,
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
    x: 320, y: 265,
    description: 'Legendary market with everything. Best prices in the city.',
    tagline: 'Shopping, fresh food',
    labelDir: 'top' as const,
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
    x: 420, y: 610,
    description: "South Kolkata's biggest market.",
    tagline: 'Market, street food',
    labelDir: 'right' as const,
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
    x: 360, y: 105,
    description: 'Classic north Kolkata neighbourhood. Famous puchkas.',
    tagline: 'Puchka, rest spots',
    labelDir: 'top' as const,
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
    x: 490, y: 660,
    description: 'Quiet residential area. Good for rest.',
    tagline: 'Long rest, dhaba',
    labelDir: 'right' as const,
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
    x: 300, y: 550,
    description: 'Residential neighbourhood with excellent local dhabas.',
    tagline: 'Dhaba, free water',
    labelDir: 'left' as const,
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
    x: 220, y: 90,
    description: "The potters' quarter. Fascinating artisan neighbourhood.",
    tagline: 'Artisan quarter, delivery',
    labelDir: 'top' as const,
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
    x: 420, y: 305,
    description: 'Legendary puchka, kathi rolls, and jhalmuri stalls.',
    tagline: 'Puchka, rolls, biryani',
    labelDir: 'right' as const,
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
    x: 500, y: 270,
    description: 'Commercial and government district. Work and formal errands.',
    tagline: 'Work, pay bills',
    labelDir: 'right' as const,
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
    x: 710, y: 200,
    description: 'Modern tech hub. Better paying work but further away.',
    tagline: 'IT work, high pay',
    labelDir: 'right' as const,
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
    x: 550, y: 340,
    description: 'Major hospital district. Restore health and obtain medicine.',
    tagline: 'Medical care, medicine',
    labelDir: 'right' as const,
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
    x: 350, y: 510,
    description: 'Community health clinic. Cheaper, basic care.',
    tagline: 'Cheap treatment',
    labelDir: 'right' as const,
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
    x: 155, y: 275,
    description: 'Banks of the Hooghly. Peaceful, with tea stalls and open skies.',
    tagline: 'Riverside rest, chai',
    labelDir: 'left' as const,
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
    x: 280, y: 600,
    description: 'Famous temple area and metro station.',
    tagline: 'Temple, free water',
    labelDir: 'right' as const,
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

export interface AmbientDescription {
  day: string;
  evening: string;
  night: string;
  rain: string;
  heat: string;
  crowd: string;
}

export const LOCATION_AMBIENCE: Record<string, AmbientDescription> = {
  howrah_station: {
    day: 'Porters weave through the crowd, calling out destinations. The announcement board flickers.',
    evening: 'The rush hour tide of office workers streams toward platforms. Vendors hawk chai.',
    night: 'The station thins out. Families sleep on benches. A lone dog trots past.',
    rain: 'Water drips from the station canopy. Commuters huddle under the awning.',
    heat: 'Heat shimmers off the tracks. Everyone moves slower, fanning themselves.',
    crowd: 'The station is packed — shoulder to shoulder, bags bumping, voices echoing.'
  },
  esplanade: {
    day: 'Buses, trams, and taxis jostle for space. A puchka vendor calls out prices.',
    evening: 'Neon signs flicker on. The crowd shifts from workers to evening strollers.',
    night: 'The crossroads quiets. A lone tram rattles through. Street lights cast long shadows.',
    rain: 'Puddles form on broken pavement. Umbrellas bloom like dark flowers.',
    heat: 'The asphalt radiates heat. Pedestrians hug the shaded side of the road.',
    crowd: 'A sea of people — you can barely move. Someone bumps your shoulder.'
  },
  sealdah_station: {
    day: 'Suburban trains arrive and depart in waves. The food stall smells of rice and dal.',
    evening: 'Homeward-bound commuters pour out. The station echoes with announcements.',
    night: 'Platform lights flicker. A few late travelers wait in silence.',
    rain: 'Rain drums on the tin roof. The platforms are slick and treacherous.',
    heat: 'The station is an oven. Fans spin lazily overhead, barely moving the air.',
    crowd: 'Every platform is packed. You have to push to move forward.'
  },
  college_street: {
    day: 'Students browse towering stacks of books. The smell of old paper fills the air.',
    evening: 'The Coffee House buzzes with debate. Amber light spills from its windows.',
    night: 'Closed bookshops stand like silent sentinels. A cat crosses the empty road.',
    rain: 'Vendors cover their books in plastic. Puddles reflect the building facades.',
    heat: 'The narrow lane traps the heat. Readers retreat into air-cooled shops.',
    crowd: 'Students and book-hunters jostle through the narrow lanes.'
  },
  park_street: {
    day: 'The scent of biriyani drifts from a restaurant. Cars honk in pleasant traffic.',
    evening: 'Restaurants light up. Couples stroll. The smell of kathi rolls is irresistible.',
    night: 'Park Street comes alive — music, laughter, the clinking of glasses from bars.',
    rain: 'Diners peer out through fogged restaurant windows. The road gleams.',
    heat: 'Air conditioning beckons from every doorway. The pavement sizzles.',
    crowd: 'Weekend crowds fill the pavements. Every restaurant has a queue.'
  },
  maidan: {
    day: 'Cricketers play on the vast green. A cool breeze carries the scent of grass.',
    evening: 'Joggers circle the paths. The sky turns pink behind Victoria Memorial.',
    night: 'The Maidan is dark and empty. Distant sounds of the city feel far away.',
    rain: 'The fields are waterlogged. A few brave souls walk with umbrellas.',
    heat: 'Even the open ground feels oppressive. Not a patch of shade in sight.',
    crowd: 'Festival-goers have filled the Maidan. Temporary stalls and music everywhere.'
  },
  victoria_memorial: {
    day: 'The white marble gleams. Tourists photograph the gardens. Peaceful.',
    evening: 'Golden light bathes the memorial. Horse carriages clip-clop past.',
    night: 'The memorial is illuminated, ghostly white against the dark sky.',
    rain: 'Rain patters on the gardens. The marble glistens. Few visitors linger.',
    heat: 'The gardens offer some shade, but the heat is inescapable.',
    crowd: 'Tour groups cluster around the entrance. The lawn is full of families.'
  },
  new_market: {
    day: 'Haggling echoes through the corridors. Colorful wares spill onto the pavement.',
    evening: 'Shopkeepers begin pulling down shutters. Last-minute bargains await.',
    night: 'The market is closed and quiet. Stray cats prowl the empty lanes.',
    rain: 'The covered market shelters everyone. Inside, the crowd is twice as thick.',
    heat: 'The enclosed market traps the heat. Fans battle the stifling air.',
    crowd: 'Elbow-to-elbow crowds. Vendors shout over each other. Watch your wallet.'
  },
  gariahat: {
    day: 'South Kolkata\'s market hums with life. Sarees hang like colorful waterfalls.',
    evening: 'Street food vendors set up their stalls. The smell of ghee fills the air.',
    night: 'Most shops are closed. A few food stalls glow under fluorescent tubes.',
    rain: 'The open-air market gets muddy. Shoppers skip between puddles.',
    heat: 'The narrow lanes trap the humidity. Everyone looks tired.',
    crowd: 'Weekend shoppers pack the market. Every auto-rickshaw is full.'
  },
  shyambazar: {
    day: 'The old neighbourhood is alive with the sound of rickshaws and chai stalls.',
    evening: 'The famous puchka stalls light up. Families come out for an evening snack.',
    night: 'The residential lanes are quiet. Only the sound of distant TVs.',
    rain: 'Water collects in the lanes. An old umbrella seller does brisk business.',
    heat: 'North Kolkata\'s narrow lanes offer shade but trap the humidity.',
    crowd: 'Puja season transforms the neighbourhood — pandal-hoppers everywhere.'
  },
  lake_gardens: {
    day: 'A quiet residential pocket. Birds sing in the trees. Children play cricket.',
    evening: 'Families gather on rooftops. The local dhaba starts its dinner service.',
    night: 'Peaceful. Crickets chirp. Street lights cast gentle pools of yellow.',
    rain: 'Rain on tin roofs — a rhythmic lullaby. The lanes are empty.',
    heat: 'The tree cover helps, but the humidity is unforgiving.',
    crowd: 'Unusually busy — a local festival or cricket match, perhaps.'
  },
  bhawanipore: {
    day: 'A quiet residential area. The dhaba owner waves hello from behind his counter.',
    evening: 'Evening prayers drift from the local temple. The air smells of incense.',
    night: 'Street lights hum. A dog barks in the distance. Everything is still.',
    rain: 'The lanes flood quickly here. Residents wade through ankle-deep water.',
    heat: 'Old buildings trap the heat. Everyone retreats to their fans.',
    crowd: 'A wedding procession winds through the neighbourhood, brass band and all.'
  },
  kumartuli: {
    day: 'Artisans shape clay into gods. Straw frameworks and half-finished idols everywhere.',
    evening: 'The potters finish their day\'s work. The smell of wet clay hangs in the air.',
    night: 'The workshop lanes are eerily quiet. Unfinished idols stare from the shadows.',
    rain: 'The artisans cover their clay work with tarpaulins. A worried energy fills the air.',
    heat: 'The clay dries too fast. Artisans spray water on their work constantly.',
    crowd: 'Festival buyers crowd the narrow lanes, inspecting nearly-finished idols.'
  },
  street_food_row: {
    day: 'Sizzling pans and the fragrant smell of spices. The best street food in the city.',
    evening: 'Peak hour — every stall has a queue. Biryani pots open with a burst of steam.',
    night: 'A few stalls still glow. Late-night roll makers serve the last customers.',
    rain: 'Vendors shelter their stoves under sheets. The smell of rain meets spice.',
    heat: 'The heat from cooking stoves and the weather merge into a wall of warmth.',
    crowd: 'Every stall is three-deep with customers. You have to squeeze in to order.'
  },
  dalhousie_sq: {
    day: 'Office workers in pressed shirts hurry past colonial buildings. Taxis queue.',
    evening: 'The offices empty. The square takes on a ghostly grandeur.',
    night: 'Heritage buildings stand illuminated but empty. Security guards pace.',
    rain: 'Workers shelter under awnings. The colonial buildings look dramatic in the downpour.',
    heat: 'The concrete plaza amplifies the heat. Everyone ducks into air-conditioned buildings.',
    crowd: 'A protest or rally fills the square. Slogans echo off the old facades.'
  },
  salt_lake: {
    day: 'Glass towers reflect sunlight. IT workers carry laptop bags. Modern, organized.',
    evening: 'Office lights go out floor by floor. The food court starts buzzing.',
    night: 'The IT Park is quiet. Only night-shift workers in the illuminated towers.',
    rain: 'Well-drained roads and covered walkways — rain barely slows things here.',
    heat: 'Central AC keeps the offices cool, but stepping outside is brutal.',
    crowd: 'A tech conference has doubled the usual crowd. Parking is impossible.'
  },
  pg_hospital: {
    day: 'The hospital hums with urgency. Patients, doctors, and worried families.',
    evening: 'Visiting hours end. Relatives linger outside. Medicine shops stay open.',
    night: 'The emergency ward glows. Ambulance sirens punctuate the quiet.',
    rain: 'The hospital courtyard fills with puddles. Patients shelter under the portico.',
    heat: 'The wards are uncomfortably warm. Fans work overtime.',
    crowd: 'The outpatient department is overwhelmed. The queue stretches outside.'
  },
  local_clinic: {
    day: 'A small, tidy clinic. The doctor greets patients one by one. Comforting.',
    evening: 'The clinic is about to close. The doctor sees one last patient.',
    night: 'Closed. A small sign says "Emergency — call this number."',
    rain: 'Patients drip water on the waiting room floor. The nurse offers towels.',
    heat: 'A single ceiling fan struggles. The waiting room is warm but bearable.',
    crowd: 'An unusually long queue — a stomach bug is going around the neighbourhood.'
  },
  hooghly_bank: {
    day: 'The river glitters. A ferry crosses slowly. Tea stalls line the ghat.',
    evening: 'Sunset paints the Hooghly gold. People sit in quiet contemplation.',
    night: 'The river is black and silent. Distant lights from Howrah reflect off the water.',
    rain: 'The river rises. The ghat steps are slippery. Nobody is selling chai.',
    heat: 'A breeze comes off the river — the only relief in the city.',
    crowd: 'A religious gathering fills the ghat. Chanting and the smell of flowers.'
  },
  kalighat: {
    day: 'Devotees stream toward the temple. Flower sellers call out. Sacred energy.',
    evening: 'The evening aarti bells ring. Incense smoke curls into the twilight.',
    night: 'The temple gates close. The lane is quiet except for stray dogs.',
    rain: 'Devotees hurry through the rain. The temple steps are dangerously slick.',
    heat: 'The temple compound traps the heat. Devotees fan themselves with prayer books.',
    crowd: 'A major puja day — the queue to enter the temple winds around the block.'
  }
};

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

export function findPath(from: string, to: string, mode: string): { path: string[]; time: number; cost: number } | null {
  if (from === to) return { path: [from], time: 0, cost: 0 };

  type Node = { id: string; path: string[]; time: number; cost: number };
  const queue: Node[] = [{ id: from, path: [from], time: 0, cost: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, path, time, cost } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const routes = ROUTES.filter(r =>
      (r.from === id || r.to === id) && r.modes.includes(mode)
    );

    for (const route of routes) {
      const next = route.from === id ? route.to : route.from;
      if (visited.has(next)) continue;

      const defaultTimes: Record<string, number> = { walk: 600, bus: 180, metro: 120, tram: 210, taxi: 150 };
      const defaultCosts: Record<string, number> = { walk: 0, bus: 8, metro: 10, tram: 6, taxi: 40 };
      const segTime = defaultTimes[mode] || 300;
      const segCost = defaultCosts[mode] || 0;
      const newPath = [...path, next];

      if (next === to) return { path: newPath, time: time + segTime, cost: cost + segCost };
      queue.push({ id: next, path: newPath, time: time + segTime, cost: cost + segCost });
    }
  }
  return null;
}

export function getAvailableModesForPath(from: string, to: string): string[] {
  const modes = ['walk', 'bus', 'metro', 'tram', 'taxi'];
  return modes.filter(m => findPath(from, to, m) !== null);
}
