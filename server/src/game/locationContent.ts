import type { Location } from './types';
import { SeededRng } from './engine';

// --- Vendor System ---

export interface Vendor {
  id: string;
  name: string;
  type: 'food' | 'drink' | 'goods' | 'medicine' | 'service';
  description: string;
  availableFrom: number; // dayPct 0-1
  availableUntil: number;
  items: VendorItem[];
  personality: string;
}

export interface VendorItem {
  id: string;
  name: string;
  cost: number;
  effects: Partial<Record<string, number>>;
  description: string;
  limited?: number; // stock per match
}

// --- NPC System ---

export interface NPC {
  id: string;
  name: string;
  role: string;
  description: string;
  availableFrom: number;
  availableUntil: number;
  dialogue: string[];
  interactionType: 'talk' | 'help' | 'trade' | 'quest';
}

// --- Micro-Interaction System ---

export interface MicroInteraction {
  id: string;
  text: string;
  choices: MicroChoice[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  weather: 'rain' | 'heat' | 'clear' | 'any';
  oneShot: boolean;
}

export interface MicroChoice {
  id: string;
  label: string;
  effects: Partial<Record<string, number>>;
  karmaChange: number;
  narrative: string;
}

// --- Location Snapshot ---

export interface LocationSnapshot {
  locationId: string;
  vendors: Vendor[];
  npcs: NPC[];
  interactions: MicroInteraction[];
  atmosphere: AtmosphereState;
  scarcity: ResourceScarcity;
}

export interface AtmosphereState {
  crowd: 'empty' | 'sparse' | 'moderate' | 'busy' | 'packed';
  noise: 'silent' | 'quiet' | 'moderate' | 'loud' | 'deafening';
  smell: string;
  visualDetail: string;
  mood: string;
}

export interface ResourceScarcity {
  foodAvailability: number;  // 0-1, affects prices and stock
  waterAvailability: number;
  medicineAvailability: number;
  workAvailability: number;
  priceMultiplier: number;   // 0.5 (cheap day) to 2.0 (expensive day)
}

// --- Content Pools ---

const VENDOR_POOL: Record<string, Vendor[]> = {
  howrah_station: [
    {
      id: 'chai_wallah_ramu', name: 'Ramu Chaiwala', type: 'drink',
      description: 'Has been making chai on Platform 3 for thirty years. Knows every train driver by name.',
      availableFrom: 0.05, availableUntil: 0.9,
      items: [
        { id: 'cutting_chai', name: 'Cutting Chai', cost: 5, effects: { energy: 8, mood: 5, hydration: -15 }, description: 'Half a glass of very strong tea' },
        { id: 'special_chai', name: 'Special Masala Chai', cost: 10, effects: { energy: 12, mood: 8, hydration: -12 }, description: 'Ginger, cardamom, a pinch of pepper' }
      ],
      personality: 'Talks nonstop about the old Kolkata'
    },
    {
      id: 'samosa_vendor', name: 'Fatima Bi', type: 'food',
      description: 'Fries samosas in a blackened kadhai. The queue never ends.',
      availableFrom: 0.1, availableUntil: 0.75,
      items: [
        { id: 'samosa', name: 'Aloo Samosa', cost: 8, effects: { hunger: -20, energy: 5, mood: 4 }, description: 'Crispy, spiced potato filling', limited: 30 },
        { id: 'samosa_plate', name: 'Samosa Plate (2)', cost: 15, effects: { hunger: -35, energy: 8, mood: 6 }, description: 'Two samosas with green chutney' }
      ],
      personality: 'Stern but generous with chutney'
    },
    {
      id: 'water_seller_howrah', name: 'Bottled Water Boy', type: 'drink',
      description: 'A teenager selling water bottles from a styrofoam box.',
      availableFrom: 0.0, availableUntil: 1.0,
      items: [
        { id: 'water_bottle', name: 'Water Bottle', cost: 15, effects: { hydration: -40 }, description: 'Sealed 500ml bottle' }
      ],
      personality: 'Quick, no small talk'
    }
  ],
  esplanade: [
    {
      id: 'jhalmuri_dada', name: 'Jhalmuri Dada', type: 'food',
      description: 'Mixes jhalmuri in a paper cone with theatrical flair. Each one different.',
      availableFrom: 0.15, availableUntil: 0.85,
      items: [
        { id: 'jhalmuri', name: 'Jhalmuri', cost: 10, effects: { hunger: -15, mood: 6 }, description: 'Puffed rice, peanuts, onion, mustard oil, green chilli' },
        { id: 'jhalmuri_special', name: 'Special Jhalmuri', cost: 15, effects: { hunger: -20, mood: 8, energy: 3 }, description: 'Extra everything — chanachur, coconut, raw mango' }
      ],
      personality: 'Whistles Rabindra Sangeet while mixing'
    },
    {
      id: 'lassi_stall', name: 'Gopaldas Lassi', type: 'drink',
      description: 'Thick, sweet lassi in clay cups. The clay is half the flavour.',
      availableFrom: 0.2, availableUntil: 0.7,
      items: [
        { id: 'sweet_lassi', name: 'Sweet Lassi', cost: 20, effects: { hydration: -35, hunger: -10, mood: 8 }, description: 'Yogurt, sugar, cardamom in a bhar' },
        { id: 'mango_lassi', name: 'Mango Lassi', cost: 30, effects: { hydration: -30, hunger: -12, mood: 12 }, description: 'Seasonal — only when the alphonsos arrive' }
      ],
      personality: 'Quiet dignity, refuses to hurry'
    }
  ],
  park_street: [
    {
      id: 'momo_aunty', name: 'Momo Aunty', type: 'food',
      description: 'Darjeeling transplant, steams momos in a three-tier bamboo tower.',
      availableFrom: 0.25, availableUntil: 0.9,
      items: [
        { id: 'veg_momo', name: 'Veg Momos (8)', cost: 30, effects: { hunger: -30, energy: 8, mood: 8 }, description: 'Cabbage, carrot, spring onion — chilli sauce on the side' },
        { id: 'chicken_momo', name: 'Chicken Momos (8)', cost: 40, effects: { hunger: -35, energy: 12, mood: 10 }, description: 'Minced chicken, ginger — fiery red sauce' }
      ],
      personality: 'Calls everyone "babu", remembers regulars'
    },
    {
      id: 'kebab_roll', name: 'Nizam Kathi Roll', type: 'food',
      description: 'Legendary kathi roll stand. Paratha wrapped around skewered kebab.',
      availableFrom: 0.3, availableUntil: 0.95,
      items: [
        { id: 'egg_roll', name: 'Egg Roll', cost: 25, effects: { hunger: -25, energy: 10, mood: 6 }, description: 'Egg paratha, onion, lime, green chilli' },
        { id: 'mutton_roll', name: 'Mutton Roll', cost: 50, effects: { hunger: -40, energy: 15, mood: 10 }, description: 'Slow-cooked mutton in buttery paratha' }
      ],
      personality: 'Takes pride in every fold'
    }
  ],
  new_market: [
    {
      id: 'nahoum_bakery', name: 'Nahoum and Sons', type: 'food',
      description: 'Jewish bakery since 1902. Fruit cakes, puffs, and cold coffee.',
      availableFrom: 0.15, availableUntil: 0.7,
      items: [
        { id: 'chicken_puff', name: 'Chicken Puff', cost: 20, effects: { hunger: -20, mood: 6 }, description: 'Flaky pastry with spiced chicken' },
        { id: 'cold_coffee', name: 'Cold Coffee', cost: 25, effects: { hydration: -20, energy: 10, mood: 5 }, description: 'Sweet, thick, from another era' }
      ],
      personality: 'Unhurried service, paper bags'
    },
    {
      id: 'medicine_shop', name: 'Sharma Medical', type: 'medicine',
      description: 'Narrow shop stacked floor to ceiling with medicines.',
      availableFrom: 0.15, availableUntil: 0.85,
      items: [
        { id: 'paracetamol', name: 'Paracetamol Strip', cost: 12, effects: { health: 10 }, description: 'Basic fever and pain relief' },
        { id: 'ors_packet', name: 'ORS Packet', cost: 8, effects: { hydration: -30, health: 5 }, description: 'Oral rehydration salts — dissolve in water' },
        { id: 'bandage', name: 'Bandage Roll', cost: 15, effects: { health: 8 }, description: 'Cotton bandage for minor wounds' }
      ],
      personality: 'Reads prescriptions through thick glasses'
    }
  ],
  street_food_row: [
    {
      id: 'puchka_king', name: 'Puchka Raja', type: 'food',
      description: 'The undisputed puchka champion of central Kolkata. Five flavours of water.',
      availableFrom: 0.2, availableUntil: 0.9,
      items: [
        { id: 'puchka_plate', name: 'Puchka (6 pieces)', cost: 10, effects: { hunger: -15, mood: 10 }, description: 'Crispy shells, tamarind and mint water, spiced potato' },
        { id: 'dahi_puchka', name: 'Dahi Puchka (6)', cost: 15, effects: { hunger: -15, mood: 12, hydration: -5 }, description: 'Sweet yogurt version with tamarind and pomegranate' }
      ],
      personality: 'Counts puchkas aloud, theatrically'
    },
    {
      id: 'kathi_roll_stall', name: 'Zeeshan Roll Corner', type: 'food',
      description: 'Smoky rolls from a coal tandoor. The queue stretches past the lamp post.',
      availableFrom: 0.35, availableUntil: 0.95,
      items: [
        { id: 'double_egg_roll', name: 'Double Egg Roll', cost: 30, effects: { hunger: -30, energy: 12, mood: 7 }, description: 'Two eggs, extra onion, kashundi' },
        { id: 'paneer_roll', name: 'Paneer Tikka Roll', cost: 35, effects: { hunger: -28, energy: 10, mood: 8 }, description: 'Charred paneer with mint chutney' }
      ],
      personality: 'Yells orders, never writes them down'
    }
  ],
  college_street: [
    {
      id: 'coffee_house', name: 'Coffee House', type: 'drink',
      description: 'The legendary Indian Coffee House. Marble tables, ceiling fans, endless arguments.',
      availableFrom: 0.15, availableUntil: 0.8,
      items: [
        { id: 'icf_coffee', name: 'Filter Coffee', cost: 12, effects: { energy: 10, mood: 8, hydration: -10 }, description: 'Served in a metal tumbler. Unchanged since 1942.' },
        { id: 'icf_chicken_sandwich', name: 'Chicken Sandwich', cost: 25, effects: { hunger: -20, energy: 5, mood: 4 }, description: 'White bread, mystery chicken, green chutney' }
      ],
      personality: 'Waiters in white with red headbands'
    },
    {
      id: 'book_seller', name: 'Rabindra Book Stall', type: 'goods',
      description: 'Second-hand books piled on a blue tarp. Treasures hidden under trash.',
      availableFrom: 0.15, availableUntil: 0.75,
      items: [
        { id: 'used_book', name: 'Used Book', cost: 10, effects: { mood: 5 }, description: 'Dog-eared paperback. Could be anything.' },
        { id: 'study_guide', name: 'Study Guide', cost: 30, effects: { mood: 3 }, description: 'Competitive exam preparation book' }
      ],
      personality: 'Argues the price of every book'
    }
  ],
  maidan: [
    {
      id: 'coconut_seller', name: 'Nariyal Paani', type: 'drink',
      description: 'Hacks green coconuts with a machete. One cut, one straw.',
      availableFrom: 0.2, availableUntil: 0.75,
      items: [
        { id: 'coconut_water', name: 'Tender Coconut', cost: 25, effects: { hydration: -35, energy: 5, mood: 4 }, description: 'Fresh coconut water with a spoon of malai' }
      ],
      personality: 'Counts coconuts, talks about cricket'
    },
    {
      id: 'ice_cream_cart', name: 'Kwality Ice Cream Cart', type: 'food',
      description: 'A bicycle with a white freezer box. Bells jingling.',
      availableFrom: 0.3, availableUntil: 0.7,
      items: [
        { id: 'orange_bar', name: 'Orange Bar', cost: 10, effects: { mood: 6, hydration: -8, hunger: -5 }, description: 'Bright orange, slightly icy' },
        { id: 'kulfi', name: 'Malai Kulfi', cost: 20, effects: { mood: 10, hydration: -5, hunger: -8 }, description: 'Dense, pistachio-flecked, on a stick' }
      ],
      personality: 'Rings the bell whether anyone is listening or not'
    }
  ],
  shyambazar: [
    {
      id: 'puchka_stall_shyam', name: 'Ratan Puchkawala', type: 'food',
      description: 'Three generations of puchka makers. The spice blend is a family secret.',
      availableFrom: 0.25, availableUntil: 0.85,
      items: [
        { id: 'puchka_shyam', name: 'Puchka (8 pieces)', cost: 12, effects: { hunger: -18, mood: 10 }, description: 'Crunchier shells, tangier water than anywhere else' }
      ],
      personality: 'Proud, competitive about puchka quality'
    },
    {
      id: 'mishti_doi_shop', name: 'Balaram Mullick', type: 'food',
      description: 'Famous sweetshop. The mishti doi arrives in clay pots at dawn.',
      availableFrom: 0.1, availableUntil: 0.8,
      items: [
        { id: 'mishti_doi', name: 'Mishti Doi', cost: 20, effects: { hunger: -10, mood: 12, energy: 3 }, description: 'Caramelised yogurt in a clay pot — sweet, cool, perfect' },
        { id: 'rosogolla', name: 'Rosogolla (2)', cost: 15, effects: { hunger: -8, mood: 10 }, description: 'Spongy, syrupy, the pride of Bengal' }
      ],
      personality: 'Will lecture you on the proper way to eat rosogolla'
    }
  ],
  kalighat: [
    {
      id: 'temple_prasad', name: 'Prasad Stall', type: 'food',
      description: 'Sells temple offerings: luchi, begun bhaja, and khichuri.',
      availableFrom: 0.1, availableUntil: 0.7,
      items: [
        { id: 'prasad_plate', name: 'Prasad Thali', cost: 15, effects: { hunger: -25, mood: 8, energy: 5 }, description: 'Blessed food from the temple kitchen' }
      ],
      personality: 'Devout, speaks softly'
    }
  ],
  hooghly_bank: [
    {
      id: 'tea_stall_ghat', name: 'Ghat ka Chai', type: 'drink',
      description: 'Chai brewed on a kerosene stove at the river steps. View of the Howrah Bridge.',
      availableFrom: 0.05, availableUntil: 0.85,
      items: [
        { id: 'ghat_chai', name: 'Ghat Chai', cost: 7, effects: { energy: 6, mood: 8, hydration: -12 }, description: 'Sweet, milky tea in a clay cup. The river breeze is free.' }
      ],
      personality: 'Philosopher-chaiwala, asks about your day'
    }
  ],
  gariahat: [
    {
      id: 'telebhaja_stall', name: 'Telebhaja Corner', type: 'food',
      description: 'Everything deep-fried: beguni, potato chop, fish fry. The oil never cools.',
      availableFrom: 0.3, availableUntil: 0.85,
      items: [
        { id: 'beguni', name: 'Beguni (3 pieces)', cost: 10, effects: { hunger: -15, mood: 6 }, description: 'Batter-fried eggplant slices' },
        { id: 'fish_fry', name: 'Fish Fry', cost: 30, effects: { hunger: -25, energy: 8, mood: 8 }, description: 'Bhetki fish, crumb-fried, with kasundi' }
      ],
      personality: 'Fast hands, newspaper-wrapped portions'
    }
  ],
  kumartuli: [
    {
      id: 'clay_chai', name: 'Artisan Tea Corner', type: 'drink',
      description: 'Tea served in cups the potters made that morning. Every cup is unique.',
      availableFrom: 0.15, availableUntil: 0.7,
      items: [
        { id: 'artisan_chai', name: 'Potter Quarter Chai', cost: 8, effects: { energy: 5, mood: 10, hydration: -10 }, description: 'The clay cup flavour is part of the experience' }
      ],
      personality: 'Covered in clay dust, smiles with his eyes'
    }
  ],
  bhawanipore: [
    {
      id: 'dhaba_bhawaani', name: 'Bhawani Dhaba', type: 'food',
      description: 'A hole-in-the-wall with four tables. Rice, dal, sabzi. Nothing fancy, everything good.',
      availableFrom: 0.25, availableUntil: 0.8,
      items: [
        { id: 'thali_basic', name: 'Basic Thali', cost: 25, effects: { hunger: -40, energy: 10, mood: 5 }, description: 'Rice, dal, aloo bhaja, papad' },
        { id: 'thali_full', name: 'Full Thali', cost: 40, effects: { hunger: -55, energy: 15, mood: 8 }, description: 'Rice, dal, fish curry, sabzi, chutney, payesh' }
      ],
      personality: 'Serves silently, generous portions'
    }
  ],
  lake_gardens: [
    {
      id: 'evening_chai', name: 'Lakeside Chai', type: 'drink',
      description: 'A wooden bench, a thermos, and two cups. Chai by the lake.',
      availableFrom: 0.4, availableUntil: 0.85,
      items: [
        { id: 'lake_chai', name: 'Evening Chai', cost: 8, effects: { energy: 5, mood: 10, stress: -8, hydration: -10 }, description: 'The view does half the work' }
      ],
      personality: 'Retired schoolteacher, talks about old Kolkata'
    }
  ],
  victoria_memorial: [
    {
      id: 'ice_gola', name: 'Gola Vendor', type: 'drink',
      description: 'Shaved ice with lurid syrups. Children screaming for kala khatta.',
      availableFrom: 0.2, availableUntil: 0.7,
      items: [
        { id: 'ice_gola', name: 'Ice Gola', cost: 10, effects: { hydration: -15, mood: 8 }, description: 'Pick your colour: orange, kala khatta, or rose' }
      ],
      personality: 'Dripping with syrup, perpetually cheerful'
    }
  ],
  dalhousie_sq: [
    {
      id: 'lunch_dabba', name: 'Lunch Tiffin Service', type: 'food',
      description: 'Office workers line up for home-style lunch boxes. Rice, dal, fish, salad.',
      availableFrom: 0.35, availableUntil: 0.55,
      items: [
        { id: 'tiffin_veg', name: 'Veg Tiffin', cost: 30, effects: { hunger: -40, energy: 10, mood: 5 }, description: 'Rice, dal, mixed veg, pickle' },
        { id: 'tiffin_fish', name: 'Fish Tiffin', cost: 45, effects: { hunger: -50, energy: 15, mood: 8 }, description: 'Rice, dal, fish curry, salad, papad' }
      ],
      personality: 'All business during lunch rush'
    }
  ],
  salt_lake: [
    {
      id: 'cafe_coffee', name: 'IT Park Cafe', type: 'drink',
      description: 'Air-conditioned, overpriced, but the WiFi works. Everyone stares at laptops.',
      availableFrom: 0.15, availableUntil: 0.8,
      items: [
        { id: 'cappuccino', name: 'Cappuccino', cost: 80, effects: { energy: 12, mood: 5, hydration: -15 }, description: 'Foam art and everything. Almost Bangalore.' },
        { id: 'sandwich', name: 'Club Sandwich', cost: 120, effects: { hunger: -30, energy: 8, mood: 4 }, description: 'Triple-decker with fries. Corporate lunch.' }
      ],
      personality: 'Barista calls out orders in English'
    }
  ],
  pg_hospital: [
    {
      id: 'hospital_canteen', name: 'Hospital Canteen', type: 'food',
      description: 'Fluorescent lights, steel tables, functional food. Open all hours.',
      availableFrom: 0.0, availableUntil: 1.0,
      items: [
        { id: 'canteen_rice', name: 'Rice and Dal', cost: 20, effects: { hunger: -30, energy: 5 }, description: 'Sustenance, not cuisine' },
        { id: 'canteen_tea', name: 'Hospital Chai', cost: 5, effects: { energy: 4, hydration: -8 }, description: 'Watery, lukewarm. But it is tea.' }
      ],
      personality: 'Stone-faced, serves fast'
    }
  ],
  local_clinic: [
    {
      id: 'pharmacy_local', name: 'Gupta Pharmacy', type: 'medicine',
      description: 'Green cross painted on the wall. Open when Dr Gupta feels like it.',
      availableFrom: 0.2, availableUntil: 0.75,
      items: [
        { id: 'basic_medicine', name: 'Basic Medicine', cost: 15, effects: { health: 12 }, description: 'Whatever Dr Gupta recommends' },
        { id: 'cough_syrup', name: 'Cough Syrup', cost: 20, effects: { health: 8, energy: -3 }, description: 'Makes you drowsy but stops the cough' }
      ],
      personality: 'Dispensing advice nobody asked for'
    }
  ]
};

// --- Micro-Interaction Pools ---

const MICRO_INTERACTION_POOL: Record<string, MicroInteraction[]> = {
  howrah_station: [
    {
      id: 'lost_traveller', text: 'A bewildered traveller asks you for directions to the metro. They look exhausted.',
      timeOfDay: 'any', weather: 'any', oneShot: true,
      choices: [
        { id: 'help_directions', label: 'Walk them there', effects: { energy: -5, mood: 8 }, karmaChange: 5, narrative: 'You walk them through the crowd. They thank you with genuine relief.' },
        { id: 'point', label: 'Point the way', effects: { mood: 3 }, karmaChange: 2, narrative: 'You gesture vaguely toward the metro entrance. Good enough.' },
        { id: 'ignore', label: 'Keep walking', effects: {}, karmaChange: -1, narrative: 'You pretend not to hear. Everyone does it.' }
      ]
    },
    {
      id: 'porter_dropped', text: 'A porter stumbles and spills a suitcase. Clothes scatter across the platform.',
      timeOfDay: 'morning', weather: 'any', oneShot: true,
      choices: [
        { id: 'help_gather', label: 'Help gather clothes', effects: { energy: -3, mood: 6 }, karmaChange: 6, narrative: 'You kneel and help. The porter nods — no words, just a grateful look.' },
        { id: 'watch', label: 'Stop and watch', effects: { mood: -2 }, karmaChange: 0, narrative: 'Others gather around to stare. The porter scrambles alone.' }
      ]
    },
    {
      id: 'station_rain', text: 'Rain starts suddenly. People crowd under the station awning. A woman with a baby has no cover.',
      timeOfDay: 'any', weather: 'rain', oneShot: true,
      choices: [
        { id: 'share_cover', label: 'Make space for her', effects: { mood: 8 }, karmaChange: 5, narrative: 'You shift aside. She squeezes in, smiling gratefully, the baby cooing.' },
        { id: 'offer_umbrella', label: 'Offer your umbrella', effects: { mood: 10, cash: -20 }, karmaChange: 8, narrative: 'She refuses twice before accepting. You get soaked but feel lighter.' }
      ]
    }
  ],
  esplanade: [
    {
      id: 'bus_queue_cut', text: 'Someone cuts the bus queue. The person behind you mutters angrily.',
      timeOfDay: 'any', weather: 'any', oneShot: true,
      choices: [
        { id: 'speak_up', label: 'Tell them to wait', effects: { stress: 5, mood: 5 }, karmaChange: 4, narrative: 'The queue-cutter glares but shuffles back. A few people nod at you.' },
        { id: 'let_go', label: 'Let it go', effects: { stress: 2 }, karmaChange: 0, narrative: 'Not your battle today. The mutterer keeps muttering.' },
        { id: 'join_cutting', label: 'Cut the queue yourself', effects: { stress: -3, mood: -3 }, karmaChange: -5, narrative: 'If they can do it, why not you? Guilt tastes like convenience.' }
      ]
    },
    {
      id: 'flower_seller', text: 'A girl selling mogra garlands catches your eye. "Five rupees only, dada."',
      timeOfDay: 'evening', weather: 'any', oneShot: false,
      choices: [
        { id: 'buy_flowers', label: 'Buy a garland', effects: { cash: -5, mood: 8 }, karmaChange: 3, narrative: 'The white flowers smell impossibly sweet. She grins and runs off.' },
        { id: 'decline', label: 'Smile and walk on', effects: {}, karmaChange: 0, narrative: 'She does not insist. Another customer will come.' }
      ]
    }
  ],
  park_street: [
    {
      id: 'street_musician', text: 'A blind man plays Rabindra Sangeet on a harmonium. The notes drift above the traffic.',
      timeOfDay: 'evening', weather: 'clear', oneShot: false,
      choices: [
        { id: 'listen_donate', label: 'Stop and listen, drop money', effects: { cash: -10, mood: 15, stress: -10 }, karmaChange: 5, narrative: 'You sit on the pavement and close your eyes. For a moment, the city disappears.' },
        { id: 'listen_only', label: 'Slow down and listen', effects: { mood: 8, stress: -5 }, karmaChange: 1, narrative: 'You walk slower, letting the music follow you down the street.' },
        { id: 'pass', label: 'Walk past', effects: {}, karmaChange: 0, narrative: 'There is always music somewhere in this city.' }
      ]
    },
    {
      id: 'restaurant_leftover', text: 'A restaurant throws out perfectly good food at closing. A homeless man watches from across the street.',
      timeOfDay: 'night', weather: 'any', oneShot: true,
      choices: [
        { id: 'ask_restaurant', label: 'Ask restaurant to give it to him', effects: { energy: -3, mood: 10 }, karmaChange: 8, narrative: 'The manager shrugs and hands over a bag. The man eats quietly, back against the wall.' },
        { id: 'buy_something', label: 'Buy him something from inside', effects: { cash: -30, mood: 12 }, karmaChange: 7, narrative: 'You bring out a plate. He eats without looking up. Thanks are sometimes silent.' },
        { id: 'walk_past', label: 'Walk past', effects: { mood: -5 }, karmaChange: -2, narrative: 'The food goes in the bin. The man stays where he is.' }
      ]
    }
  ],
  new_market: [
    {
      id: 'bargaining_lesson', text: 'An old vendor catches you looking at a price tag. "First time at New Market?"',
      timeOfDay: 'any', weather: 'any', oneShot: true,
      choices: [
        { id: 'learn_bargain', label: 'Ask for tips', effects: { mood: 5 }, karmaChange: 2, narrative: 'He teaches you the art of walking away. "They always call you back."' },
        { id: 'buy_direct', label: 'Just buy what you need', effects: { cash: -10 }, karmaChange: 0, narrative: 'You pay full price. He shakes his head with fatherly disapproval.' }
      ]
    }
  ],
  maidan: [
    {
      id: 'football_game', text: 'A group of boys are short one player for a football match. They wave at you.',
      timeOfDay: 'afternoon', weather: 'clear', oneShot: true,
      choices: [
        { id: 'play', label: 'Join the game', effects: { energy: -15, mood: 20, stress: -15, hunger: 10 }, karmaChange: 3, narrative: 'You play barefoot on the grass. For twenty minutes you are twelve years old again.' },
        { id: 'cheer', label: 'Watch and cheer', effects: { mood: 8, stress: -5 }, karmaChange: 1, narrative: 'You sit on the grass and shout encouragement. The losing team blames you.' },
        { id: 'decline_game', label: 'Wave back, keep walking', effects: {}, karmaChange: 0, narrative: 'They find someone else within seconds. The game goes on.' }
      ]
    },
    {
      id: 'bench_conversation', text: 'An old man on a bench pats the space next to him. "Sit. Tell me about your day."',
      timeOfDay: 'evening', weather: 'any', oneShot: true,
      choices: [
        { id: 'sit_talk', label: 'Sit and talk', effects: { energy: 5, mood: 12, stress: -10 }, karmaChange: 4, narrative: 'He listens like nobody has talked to him in weeks. Maybe they have not.' },
        { id: 'polite_decline', label: 'Politely decline', effects: {}, karmaChange: 0, narrative: 'He nods and goes back to watching the sky change colour.' }
      ]
    }
  ],
  college_street: [
    {
      id: 'student_debate', text: 'Two students argue about a poem outside Coffee House. One of them appeals to you as a tiebreaker.',
      timeOfDay: 'afternoon', weather: 'any', oneShot: true,
      choices: [
        { id: 'join_debate', label: 'Offer your opinion', effects: { mood: 8, energy: -3 }, karmaChange: 2, narrative: 'They both disagree with you, then argue about why. Classic College Street.' },
        { id: 'buy_coffee', label: 'Buy them all a coffee instead', effects: { cash: -30, mood: 10 }, karmaChange: 5, narrative: 'The debate continues over coffee. You learn that Jibanananda Das is better than Tagore. Or worse. It depends.' }
      ]
    }
  ],
  hooghly_bank: [
    {
      id: 'sunset_moment', text: 'The sun sets over the Howrah Bridge. The river turns gold. Everything pauses.',
      timeOfDay: 'evening', weather: 'clear', oneShot: false,
      choices: [
        { id: 'watch_sunset', label: 'Stop and watch', effects: { mood: 15, stress: -12 }, karmaChange: 0, narrative: 'Sometimes the city gives you something for free. This is one of those times.' }
      ]
    },
    {
      id: 'fisherman_chat', text: 'A fisherman mending his net looks up. "Want to try casting? The river is gentle today."',
      timeOfDay: 'morning', weather: 'clear', oneShot: true,
      choices: [
        { id: 'try_fishing', label: 'Try casting the net', effects: { energy: -8, mood: 12, stress: -8 }, karmaChange: 2, narrative: 'The net flies wrong but the fisherman laughs kindly. You try again. This time it fans out.' },
        { id: 'just_watch', label: 'Watch him work', effects: { mood: 6 }, karmaChange: 0, narrative: 'His hands move in patterns older than the bridge above him.' }
      ]
    }
  ],
  kumartuli: [
    {
      id: 'artisan_work', text: 'A sculptor shaping a Durga idol notices you watching. "Want to smooth the clay?"',
      timeOfDay: 'any', weather: 'any', oneShot: true,
      choices: [
        { id: 'help_sculpt', label: 'Help with the clay', effects: { energy: -5, mood: 15, stress: -10 }, karmaChange: 4, narrative: 'Your hands sink into cool river clay. The sculptor guides your fingers. For a moment you make something beautiful.' },
        { id: 'observe', label: 'Watch quietly', effects: { mood: 8 }, karmaChange: 0, narrative: 'Straw and clay becoming a goddess. The transformation is quiet and complete.' }
      ]
    }
  ],
  gariahat: [
    {
      id: 'saree_seller', text: 'A saree seller unfurls a Baluchari silk with a theatrical sweep. "Just look. Looking is free."',
      timeOfDay: 'any', weather: 'any', oneShot: false,
      choices: [
        { id: 'admire', label: 'Admire the weave', effects: { mood: 5 }, karmaChange: 0, narrative: 'The silk catches the light. Twelve colours in one thread. He tells you about the weavers of Bishnupur.' },
        { id: 'haggle', label: 'Ask the price', effects: { mood: 3 }, karmaChange: 0, narrative: 'He names a number. You both know it is the starting point of a long negotiation.' }
      ]
    }
  ],
  victoria_memorial: [
    {
      id: 'tourist_photo', text: 'A tourist family asks if you can take their photo with the Memorial in the background.',
      timeOfDay: 'any', weather: 'clear', oneShot: true,
      choices: [
        { id: 'take_photo', label: 'Take a great photo', effects: { mood: 6 }, karmaChange: 3, narrative: 'You take five shots from different angles. They are delighted. The father insists on a selfie with you.' },
        { id: 'decline_photo', label: 'Say you are in a hurry', effects: {}, karmaChange: 0, narrative: 'They find someone else. The photo gets taken either way.' }
      ]
    }
  ],
  dalhousie_sq: [
    {
      id: 'office_stress', text: 'A young office worker sits on a bench, head in hands. Their phone keeps buzzing.',
      timeOfDay: 'afternoon', weather: 'any', oneShot: true,
      choices: [
        { id: 'sit_with', label: 'Sit next to them, say nothing', effects: { energy: -2, mood: 6 }, karmaChange: 4, narrative: 'After a minute they look up. "Thanks for not asking if I am okay." They go back inside.' },
        { id: 'offer_water', label: 'Offer water', effects: { mood: 8 }, karmaChange: 5, narrative: 'They drink the whole bottle. "Bad day." You nod. Some things do not need explaining.' }
      ]
    }
  ],
  salt_lake: [
    {
      id: 'delivery_driver', text: 'A delivery driver drops their bag of orders. Containers spill across the pavement.',
      timeOfDay: 'any', weather: 'any', oneShot: true,
      choices: [
        { id: 'help_pickup', label: 'Help pick everything up', effects: { energy: -3, mood: 8 }, karmaChange: 5, narrative: 'Together you salvage most of the orders. He thanks you and rides off, still late.' },
        { id: 'walk_on', label: 'Walk on', effects: {}, karmaChange: -1, narrative: 'He scrambles to save the orders. The curry stains the pavement.' }
      ]
    }
  ],
  bhawanipore: [
    {
      id: 'stray_dog', text: 'A stray dog follows you, tail wagging cautiously. It looks thin.',
      timeOfDay: 'any', weather: 'any', oneShot: true,
      choices: [
        { id: 'feed_dog', label: 'Buy it a biscuit packet', effects: { cash: -10, mood: 12 }, karmaChange: 4, narrative: 'It eats quickly, then sits at your feet, looking up. Some bonds need no language.' },
        { id: 'pet_dog', label: 'Pet it gently', effects: { mood: 6 }, karmaChange: 1, narrative: 'It leans into your hand. Warmth from something that asks nothing.' },
        { id: 'shoo', label: 'Shoo it away', effects: { mood: -3 }, karmaChange: -2, narrative: 'It trots away, tail low. It will try the next person.' }
      ]
    }
  ],
  pg_hospital: [
    {
      id: 'hospital_wait', text: 'The waiting room is packed. A mother with a sick child has been here for hours.',
      timeOfDay: 'any', weather: 'any', oneShot: true,
      choices: [
        { id: 'give_seat', label: 'Give up your place in line', effects: { energy: -5, mood: 10 }, karmaChange: 7, narrative: 'She looks at you like you have performed a miracle. It was just a queue number.' },
        { id: 'buy_food', label: 'Bring them food from the canteen', effects: { cash: -25, mood: 8 }, karmaChange: 6, narrative: 'The child eats slowly. The mother holds your hand for a second before letting go.' }
      ]
    }
  ],
  local_clinic: [
    {
      id: 'medicine_short', text: 'The pharmacy is out of a common medicine. Another patient needs it urgently.',
      timeOfDay: 'any', weather: 'any', oneShot: true,
      choices: [
        { id: 'share_medicine', label: 'Share yours if you have it', effects: { health: -5, mood: 12 }, karmaChange: 8, narrative: 'They need it more. You hand over the strip and the pharmacist nods approval.' },
        { id: 'suggest_elsewhere', label: 'Suggest another pharmacy', effects: { mood: 4 }, karmaChange: 2, narrative: 'You point them toward Sharma Medical at New Market. It is far, but they have stock.' }
      ]
    }
  ],
  lake_gardens: [
    {
      id: 'morning_walk', text: 'Morning walkers circle the lake in pairs and threes. An elderly woman walks alone, unsteadily.',
      timeOfDay: 'morning', weather: 'any', oneShot: true,
      choices: [
        { id: 'walk_with', label: 'Walk alongside her', effects: { energy: -3, mood: 10 }, karmaChange: 5, narrative: 'She talks about her late husband who used to walk this route. You complete his half of the circle.' },
        { id: 'nod', label: 'Nod and continue', effects: {}, karmaChange: 0, narrative: 'She walks on. The lake reflects clouds that look like questions.' }
      ]
    }
  ]
};

// --- Atmosphere Templates ---

const ATMOSPHERE_POOL: Record<string, Partial<Record<string, AtmosphereState[]>>> = {
  morning: {
    clear: [
      { crowd: 'moderate', noise: 'moderate', smell: 'diesel smoke and frying oil', visualDetail: 'long shadows stretch across the pavement', mood: 'purposeful' },
      { crowd: 'busy', noise: 'loud', smell: 'fresh bread and exhaust', visualDetail: 'sunlight catches the dust in the air', mood: 'industrious' }
    ],
    rain: [
      { crowd: 'sparse', noise: 'moderate', smell: 'wet earth and diesel', visualDetail: 'puddles mirror the grey sky', mood: 'subdued' },
      { crowd: 'sparse', noise: 'quiet', smell: 'petrichor and damp cloth', visualDetail: 'umbrellas crowd the narrow footpath', mood: 'reflective' }
    ],
    heat: [
      { crowd: 'moderate', noise: 'moderate', smell: 'hot asphalt and sweat', visualDetail: 'heat shimmer rises from the road', mood: 'sluggish' }
    ]
  },
  afternoon: {
    clear: [
      { crowd: 'busy', noise: 'loud', smell: 'street food and traffic', visualDetail: 'the sun is directly overhead, shadows disappear', mood: 'relentless' },
      { crowd: 'packed', noise: 'deafening', smell: 'fried snacks and smoke', visualDetail: 'every inch of shade is occupied', mood: 'overwhelming' }
    ],
    rain: [
      { crowd: 'moderate', noise: 'moderate', smell: 'damp concrete and chai', visualDetail: 'rainwater runs in channels along the gutter', mood: 'sheltering' }
    ],
    heat: [
      { crowd: 'sparse', noise: 'quiet', smell: 'baked earth and exhaustion', visualDetail: 'the street is bleached white by the sun', mood: 'oppressive' },
      { crowd: 'empty', noise: 'silent', smell: 'stillness and dust', visualDetail: 'even the crows have found shade', mood: 'enduring' }
    ]
  },
  evening: {
    clear: [
      { crowd: 'busy', noise: 'loud', smell: 'cooking smoke and jasmine', visualDetail: 'golden light paints the buildings amber', mood: 'warm' },
      { crowd: 'moderate', noise: 'moderate', smell: 'frying onions and incense', visualDetail: 'street lights flicker on one by one', mood: 'winding down' }
    ],
    rain: [
      { crowd: 'sparse', noise: 'quiet', smell: 'wet iron and smoke', visualDetail: 'neon signs reflect in the wet road', mood: 'melancholy' }
    ],
    heat: [
      { crowd: 'moderate', noise: 'moderate', smell: 'cooling earth and chai', visualDetail: 'the air finally begins to move', mood: 'relieved' }
    ]
  },
  night: {
    clear: [
      { crowd: 'sparse', noise: 'quiet', smell: 'cold smoke and distant food', visualDetail: 'shadows are sharper under the street lights', mood: 'watchful' },
      { crowd: 'empty', noise: 'silent', smell: 'dew and old stone', visualDetail: 'the city breathes differently at night', mood: 'solitary' }
    ],
    rain: [
      { crowd: 'empty', noise: 'moderate', smell: 'rain on hot concrete', visualDetail: 'headlights smear through the downpour', mood: 'isolated' }
    ],
    heat: [
      { crowd: 'sparse', noise: 'quiet', smell: 'warm stone and tiredness', visualDetail: 'the heat hangs in the air like a held breath', mood: 'restless' }
    ]
  }
};

// --- Generator Functions ---

export function generateLocationSnapshots(
  locations: Location[],
  rng: SeededRng,
  matchSeed: number
): Map<string, LocationSnapshot> {
  const snapshots = new Map<string, LocationSnapshot>();
  const scarcityRng = new SeededRng(matchSeed + 777);

  for (const loc of locations) {
    const vendorPool = VENDOR_POOL[loc.id] || [];
    // Select 60-80% of vendors for this match
    const vendorCount = Math.max(1, Math.floor(vendorPool.length * (0.6 + rng.next() * 0.2)));
    const selectedVendors = shuffleArray(vendorPool, rng).slice(0, vendorCount);

    const interactionPool = MICRO_INTERACTION_POOL[loc.id] || [];
    // Select 2-4 interactions for this match
    const interCount = Math.min(interactionPool.length, 2 + rng.between(0, 2));
    const selectedInteractions = shuffleArray(interactionPool, rng).slice(0, interCount);

    const scarcity = generateScarcity(loc, scarcityRng);

    // Apply scarcity to vendor prices
    for (const vendor of selectedVendors) {
      for (const item of vendor.items) {
        item.cost = Math.round(item.cost * scarcity.priceMultiplier);
      }
    }

    snapshots.set(loc.id, {
      locationId: loc.id,
      vendors: selectedVendors,
      npcs: [],
      interactions: selectedInteractions,
      atmosphere: getDefaultAtmosphere(),
      scarcity
    });
  }

  return snapshots;
}

function generateScarcity(loc: Location, rng: SeededRng): ResourceScarcity {
  const base = 0.5 + rng.next() * 0.5; // 0.5 - 1.0

  const typeMultipliers: Record<string, Partial<ResourceScarcity>> = {
    food: { foodAvailability: base * 1.3, waterAvailability: base },
    transport: { foodAvailability: base * 0.7, waterAvailability: base * 0.8 },
    shop: { foodAvailability: base, waterAvailability: base * 0.9 },
    office: { foodAvailability: base * 0.6, waterAvailability: base * 0.7, workAvailability: base * 1.4 },
    medical: { medicineAvailability: base * 1.3 },
    public: { foodAvailability: base * 0.8, waterAvailability: base },
    residential: { foodAvailability: base * 1.1, waterAvailability: base * 1.1 },
    education: { foodAvailability: base * 0.7, waterAvailability: base * 0.8 }
  };

  const mods = typeMultipliers[loc.type] || {};

  // Price multiplier: some matches are cheap, some are expensive
  const priceBase = 0.7 + rng.next() * 0.6; // 0.7 - 1.3

  return {
    foodAvailability: clamp(mods.foodAvailability ?? base, 0.2, 1.0),
    waterAvailability: clamp(mods.waterAvailability ?? base, 0.2, 1.0),
    medicineAvailability: clamp(mods.medicineAvailability ?? base * 0.8, 0.2, 1.0),
    workAvailability: clamp(mods.workAvailability ?? base, 0.3, 1.0),
    priceMultiplier: Math.round(priceBase * 10) / 10
  };
}

export function getAtmosphereForTick(
  tick: number,
  activeWeather: 'rain' | 'heat' | 'clear'
): AtmosphereState {
  const dayPct = (tick % 600) / 600;
  let timeOfDay: string;
  if (dayPct < 0.25) timeOfDay = 'morning';
  else if (dayPct < 0.55) timeOfDay = 'afternoon';
  else if (dayPct < 0.67) timeOfDay = 'evening';
  else timeOfDay = 'night';

  const pool = ATMOSPHERE_POOL[timeOfDay]?.[activeWeather]
    || ATMOSPHERE_POOL[timeOfDay]?.['clear']
    || [getDefaultAtmosphere()];

  // Deterministic pick based on tick
  return pool[tick % pool.length];
}

export function getAvailableVendors(
  snapshot: LocationSnapshot,
  tick: number
): Vendor[] {
  const dayPct = (tick % 600) / 600;
  return snapshot.vendors.filter(v =>
    dayPct >= v.availableFrom && dayPct <= v.availableUntil
  );
}

export function getAvailableInteractions(
  snapshot: LocationSnapshot,
  tick: number,
  activeWeather: 'rain' | 'heat' | 'clear',
  usedInteractions: Set<string>
): MicroInteraction[] {
  const dayPct = (tick % 600) / 600;
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (dayPct < 0.25) timeOfDay = 'morning';
  else if (dayPct < 0.55) timeOfDay = 'afternoon';
  else if (dayPct < 0.67) timeOfDay = 'evening';
  else timeOfDay = 'night';

  return snapshot.interactions.filter(inter => {
    if (inter.oneShot && usedInteractions.has(inter.id)) return false;
    if (inter.timeOfDay !== 'any' && inter.timeOfDay !== timeOfDay) return false;
    if (inter.weather !== 'any' && inter.weather !== activeWeather) return false;
    return true;
  });
}

// --- Helpers ---

function getDefaultAtmosphere(): AtmosphereState {
  return {
    crowd: 'moderate',
    noise: 'moderate',
    smell: 'city dust and distant cooking',
    visualDetail: 'the usual rhythm of the street',
    mood: 'ordinary'
  };
}

function shuffleArray<T>(arr: T[], rng: SeededRng): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.between(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
