import type { MissionDefinition } from './types';

export const MISSIONS: MissionDefinition[] = [
  {
    id: 'last_train_home',
    title: 'Last Train Home',
    narrative: 'Your last practical train leaves Howrah Station soon. You\'re stuck across the city with barely enough money for transport. A route disruption has closed the usual path — and someone on the way might need your help.',
    startLocationOptions: ['college_street', 'park_street', 'gariahat', 'salt_lake'],
    primaryObjective: 'Reach Howrah Station before the deadline',
    objectives: [
      { id: 'reach_howrah', description: 'Reach Howrah Station before time runs out', optional: false },
      { id: 'save_money', description: 'Arrive with at least ₹50 to spare', optional: true }
    ],
    deadline: 420, // 7 min at 1 tick/sec
    startingResources: { cash: 120 },
    complications: [
      'A bus route via Esplanade is delayed by 10 minutes',
      'Another player may be trying to reach the same station'
    ],
    alternativePaths: [
      'Take the metro to Esplanade and walk from there',
      'Take a cheaper bus route via Bhawanipore',
      'Help a stranded traveller — they know a shortcut'
    ],
    partialSuccessCondition: 'Reach any transport hub within the deadline',
    failureCondition: 'Time runs out before reaching Howrah Station',
    requiredLocations: ['howrah_station']
  },
  {
    id: 'exam_tomorrow',
    title: 'Exam Tomorrow',
    narrative: 'Tomorrow\'s exam can change everything. You need study material from College Street and a quiet place to prepare. Your stress is already high, your energy is low, and the evening is eating itself away.',
    startLocationOptions: ['lake_gardens', 'bhawanipore', 'gariahat', 'shyambazar'],
    primaryObjective: 'Obtain study material and prepare at a suitable location',
    objectives: [
      { id: 'get_books', description: 'Obtain study material from College Street', optional: false },
      { id: 'study_location', description: 'Find a quiet place to study (Home, Library area)', optional: false },
      { id: 'manage_stress', description: 'Keep stress below 70 when you begin studying', optional: true }
    ],
    deadline: 540,
    startingResources: { energy: 55, stress: 40 },
    complications: [
      'The book you need may be out of stock — a competing player might find it first',
      'Procrastination events may appear en route'
    ],
    alternativePaths: [
      'Borrow material from another player on College Street',
      'Find an online resource at the Salt Lake IT Park',
      'Negotiate with a bookshop owner'
    ],
    partialSuccessCondition: 'Obtain study material but study location not reached in time',
    failureCondition: 'Study material not obtained before deadline',
    requiredLocations: ['college_street']
  },
  {
    id: 'durga_puja_dash',
    title: 'Durga Puja Dash',
    narrative: 'The city is electric during Puja. You must deliver an important package to Kumartuli before the pandal opens — but crowds slow every route and competing players are navigating the same chaos.',
    startLocationOptions: ['park_street', 'esplanade', 'bhawanipore'],
    primaryObjective: 'Deliver the package to Kumartuli before the celebration begins',
    objectives: [
      { id: 'pick_up_package', description: 'Collect the package from New Market', optional: false },
      { id: 'deliver_package', description: 'Deliver it to Kumartuli before the deadline', optional: false },
      { id: 'help_fellow_traveller', description: 'Help another player navigate the crowds', optional: true }
    ],
    deadline: 480,
    startingResources: {},
    complications: [
      'Crowds at all central locations slow movement by 30%',
      'Transport delays on buses near the Esplanade'
    ],
    alternativePaths: [
      'Walk the whole route and avoid crowded transport entirely',
      'Coordinate with another player to split the route',
      'Find a tram that avoids the crowd'
    ],
    partialSuccessCondition: 'Package picked up but not delivered in time',
    failureCondition: 'Package not picked up before deadline',
    requiredLocations: ['new_market', 'kumartuli']
  },
  {
    id: 'first_salary_problem',
    title: 'First Salary Problem',
    narrative: 'Your salary just arrived — the first real one. You must pay rent at Dalhousie Square today. But there\'s a purchase you\'ve wanted, a friend asking for a loan, and a work opportunity that could double your day\'s earnings.',
    startLocationOptions: ['sealdah_station', 'lake_gardens', 'shyambazar'],
    primaryObjective: 'Pay rent at Dalhousie Square before end of day',
    objectives: [
      { id: 'pay_rent', description: 'Transfer ₹200 at Dalhousie Square (rent)', optional: false },
      { id: 'earn_extra', description: 'Complete a work task for bonus income', optional: true },
      { id: 'help_friend', description: 'Respond to a friend\'s request for ₹50', optional: true }
    ],
    deadline: 600,
    startingResources: { cash: 280 },
    complications: [
      'A tempting purchase opportunity appears en route',
      'A friend NPC requests ₹50 — lending reduces your buffer'
    ],
    alternativePaths: [
      'Work extra at the office before paying rent',
      'Ignore the friend and prioritize the mission',
      'Accept help from another player to cover any shortfall'
    ],
    partialSuccessCondition: 'Reached Dalhousie but insufficient cash for rent',
    failureCondition: 'Rent not paid before deadline',
    requiredLocations: ['dalhousie_sq']
  },
  {
    id: 'last_available_order',
    title: 'Last Available Order',
    narrative: 'You\'re hungry and the food stalls are running out for the night. The cheap options are sold out — the good ones are expensive. Another player has the same problem and the same stall in mind.',
    startLocationOptions: ['maidan', 'hooghly_bank', 'esplanade'],
    primaryObjective: 'Find and eat a satisfying meal before hunger becomes critical',
    objectives: [
      { id: 'eat_meal', description: 'Eat a meal before hunger reaches 80', optional: false },
      { id: 'preferred_meal', description: 'Find a meal that matches your preferences', optional: true },
      { id: 'share_food', description: 'Share food information with a hungry player', optional: true }
    ],
    deadline: 300,
    startingResources: { hunger: 65, cash: 100 },
    complications: [
      'Street Food Row may sell out — first player to arrive gets the preferred option',
      'A nearby stall has cheaper but less satisfying food'
    ],
    alternativePaths: [
      'Rush to Street Food Row first',
      'Go to Park Street for guaranteed food at higher price',
      'Coordinate with another player to share a meal'
    ],
    partialSuccessCondition: 'Ate something but not preferred meal',
    failureCondition: 'Hunger reaches 100 before eating',
    requiredLocations: ['street_food_row', 'park_street', 'new_market']
  },
  {
    id: 'caught_in_monsoon',
    title: 'Caught in Monsoon',
    narrative: 'The sky opens without warning. The streets flood in minutes. Your shoes are already soaked and your destination is still across the city. Shelter, transport, or push through — every option has a cost.',
    startLocationOptions: ['salt_lake', 'gariahat', 'lake_gardens', 'kumartuli'],
    primaryObjective: 'Reach Howrah Station despite the monsoon disruption',
    objectives: [
      { id: 'reach_destination', description: 'Reach Howrah Station', optional: false },
      { id: 'stay_healthy', description: 'Arrive with health above 60', optional: true },
      { id: 'help_stranded', description: 'Help a stranded NPC find shelter', optional: true }
    ],
    deadline: 500,
    startingResources: { energy: 60 },
    complications: [
      'Rain event active: walking costs more energy, bus times increase by 40%',
      'A stranded person appears at an intersection — helping costs 90 seconds'
    ],
    alternativePaths: [
      'Shelter at a nearby location, wait for rain to ease (costs time)',
      'Pay for a taxi to ignore the rain entirely',
      'Push through walking despite energy cost'
    ],
    partialSuccessCondition: 'Reached intermediate shelter within deadline',
    failureCondition: 'Health drops to 0 or destination not reached',
    requiredLocations: ['howrah_station']
  },
  {
    id: 'urgent_medicine_run',
    title: 'Urgent Medicine Run',
    narrative: 'Someone depending on you needs a specific medicine. It might be at PG Hospital or Local Clinic, but stock is limited. The journey is long and you\'re tired already.',
    startLocationOptions: ['lake_gardens', 'gariahat', 'bhawanipore', 'shyambazar'],
    primaryObjective: 'Obtain the required medicine and return with it',
    objectives: [
      { id: 'get_medicine', description: 'Obtain the medicine from a medical location', optional: false },
      { id: 'return_in_time', description: 'Return to starting district within deadline', optional: false },
      { id: 'conserve_energy', description: 'Arrive with at least 30 energy remaining', optional: true }
    ],
    deadline: 480,
    startingResources: { cash: 180, energy: 65 },
    complications: [
      'PG Hospital has the medicine but is further away',
      'Local Clinic may have a substitute — cheaper but slower acting',
      'Another player may be at the same clinic'
    ],
    alternativePaths: [
      'Rush to PG Hospital — certain but expensive',
      'Try Local Clinic first — cheaper and closer but risky if out of stock',
      'Ask another player near a clinic to pick it up'
    ],
    partialSuccessCondition: 'Medicine obtained but return journey not completed',
    failureCondition: 'Medicine not obtained before deadline',
    requiredLocations: ['pg_hospital', 'local_clinic']
  },
  {
    id: 'friend_who_never_shows',
    title: 'The Friend Who Never Shows Up',
    narrative: 'You arranged to meet someone at Esplanade. They\'re late — again. Waiting costs you time toward your own deadline. Leaving means missing an opportunity. The choice reveals more about you than it does about them.',
    startLocationOptions: ['esplanade'],
    primaryObjective: 'Decide whether to wait, leave, or adapt your plan',
    objectives: [
      { id: 'resolve_meeting', description: 'Resolve the waiting situation (wait, leave, or send word)', optional: false },
      { id: 'secondary_objective', description: 'Complete your secondary errand at Dalhousie Square', optional: false },
      { id: 'make_time', description: 'Complete both without missing either deadline', optional: true }
    ],
    deadline: 450,
    startingResources: {},
    complications: [
      'Waiting timer: every 60 seconds waited, mood drops slightly',
      'Leaving immediately gives 90 second bonus but affects trust',
      'The friend eventually appears at 5 minutes with info that helps the mission'
    ],
    alternativePaths: [
      'Leave immediately and rely on your own knowledge',
      'Wait for the friend — they have useful information',
      'Send a message via another player and proceed to Dalhousie'
    ],
    partialSuccessCondition: 'Resolved waiting situation but secondary objective incomplete',
    failureCondition: 'Both objectives missed due to indecision',
    requiredLocations: ['esplanade', 'dalhousie_sq']
  }
];

export function getMissionById(id: string): MissionDefinition | undefined {
  return MISSIONS.find(m => m.id === id);
}

export function shuffleMissions(playerCount: number, seed: number): MissionDefinition[] {
  const pool = [...MISSIONS];
  let s = seed ^ 0xdeadbeef;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(playerCount, pool.length));
}

export function validateMissionFeasibility(
  mission: MissionDefinition,
  startLocation: string,
  availableTransportModes: string[]
): { feasible: boolean; reason?: string } {
  if (mission.startLocationOptions.includes(startLocation) ||
      mission.startLocationOptions.length === 0) {
    return { feasible: true };
  }
  // Check if there's a path from start to any required location
  if (mission.requiredLocations && mission.requiredLocations.length > 0) {
    // Basic feasibility: at least one route mode available
    if (availableTransportModes.length === 0) {
      return { feasible: false, reason: 'No transport modes available from start location' };
    }
  }
  return { feasible: true };
}
