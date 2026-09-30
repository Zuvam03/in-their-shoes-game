import type {
  Player, CharacterState, Room, GameAction, ActionResult,
  PersonaDefinition, MissionDefinition, PlayerMission, GameEvent,
  CityEvent, EventChoice, MissionObjective, InteractionRequest
} from './types';
import { getRoute, getLocation, findShortestPath } from './map';
import { v4 as uuidv4 } from 'uuid';

// --- Seeded RNG ---
export class SeededRng {
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0; }
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) & 0xffffffff;
    return (this.state >>> 0) / 0xffffffff;
  }
  chance(probability: number): boolean { return this.next() < probability; }
  between(min: number, max: number): number { return min + Math.floor(this.next() * (max - min + 1)); }
}

// --- Default character state ---
export function createCharacterState(persona: PersonaDefinition, startLocation: string): CharacterState {
  return {
    health: 100,
    energy: persona.startingEnergy,
    hunger: 20,
    hydration: 20,
    mood: 70,
    stress: 20,
    cash: persona.startingCash,
    location: startLocation,
    helpedOthersCount: 0,
    receivedHelpCount: 0,
    lastMealTime: 0,
    overeatingPenalty: 0
  };
}

// --- Resource tick (called each second) ---
export function tickCharacterState(state: CharacterState, persona: PersonaDefinition, tick: number): {
  newState: CharacterState;
  events: string[];
} {
  const events: string[] = [];
  const s = { ...state };
  const m = persona.modifiers;

  // Hunger increases over time
  const hungerIncrease = 0.5 * m.hungerRate;
  s.hunger = Math.min(100, s.hunger + hungerIncrease);

  // Hydration increases over time
  s.hydration = Math.min(100, s.hydration + 0.4);

  // Overeating penalty decays
  if (s.overeatingPenalty > 0) {
    s.overeatingPenalty = Math.max(0, s.overeatingPenalty - 0.3);
  }

  // Hunger consequences
  if (s.hunger >= 80) {
    s.energy = Math.max(0, s.energy - 0.5);
    s.mood = Math.max(0, s.mood - 0.3);
    if (s.hunger >= 95) {
      s.health = Math.max(0, s.health - 0.4);
      if (tick % 30 === 0) events.push('You are severely hungry — find food urgently.');
    }
  }

  // Hydration consequences
  if (s.hydration >= 75) {
    s.energy = Math.max(0, s.energy - 0.3);
    if (s.hydration >= 90) {
      s.health = Math.max(0, s.health - 0.3);
      if (tick % 30 === 0) events.push('You are very thirsty — find water soon.');
    }
  }

  // Energy consequences
  if (s.energy < 20) {
    s.mood = Math.max(0, s.mood - 0.2);
    s.stress = Math.min(100, s.stress + 0.1);
  }

  // High stress consequences
  if (s.stress >= m.stressThreshold) {
    s.mood = Math.max(0, s.mood - 0.3);
    s.energy = Math.max(0, s.energy - 0.2);
  }

  // Natural mood drift toward baseline (50)
  const moodBaseline = 50;
  if (s.mood > moodBaseline) s.mood = Math.max(moodBaseline, s.mood - 0.05);
  if (s.mood < moodBaseline) s.mood = Math.min(moodBaseline, s.mood + 0.05);

  // Stress naturally decays slowly
  s.stress = Math.max(0, s.stress - 0.1);

  // Health recovery when conditions are good
  if (s.hunger < 40 && s.hydration < 40 && s.energy > 40) {
    s.health = Math.min(100, s.health + 0.05);
  }

  return { newState: s, events };
}

// --- Action resolution ---

export function resolveAction(
  action: GameAction,
  player: Player,
  room: Room,
  rng: SeededRng
): ActionResult {
  const s = { ...player.state };
  const persona = player.persona;
  const m = persona.modifiers;

  switch (action.type) {
    case 'move': return resolveMove(action, player, room, rng);
    case 'eat': return resolveEat(action, player, rng);
    case 'drink': return resolveDrink(action, player, rng);
    case 'rest': return resolveRest(action, player, rng);
    case 'work': return resolveWork(action, player, rng);
    case 'buy': return resolveBuy(action, player, rng);
    case 'help_player': return resolveHelpPlayer(action, player, room, rng);
    case 'request_help': return { success: true, message: 'Help request sent.', changes: {} };
    case 'share_info': return resolveShareInfo(action, player, room, rng);
    case 'transfer_money': return resolveTransferMoney(action, player, room);
    case 'complete_objective': return resolveCompleteObjective(action, player, room, rng);
    case 'event_choice': return resolveEventChoice(action, player, room, rng);
    default:
      return { success: false, message: 'Unknown action type.', changes: {} };
  }
}

function resolveMove(action: GameAction, player: Player, room: Room, rng: SeededRng): ActionResult {
  const { destination, mode } = action.payload as { destination: string; mode: string };
  const from = player.state.location;

  if (!destination || destination === from) {
    return { success: false, message: 'Invalid destination.', changes: {} };
  }

  const route = getRoute(from, destination);
  if (!route) {
    return { success: false, message: `No direct route from ${from} to ${destination}.`, changes: {} };
  }

  const transportMode = mode as keyof typeof route.travelTime;
  if (!route.modes.includes(transportMode as never)) {
    return { success: false, message: `${mode} not available on this route.`, changes: {} };
  }

  const travelTime = route.travelTime[transportMode] || 0;
  const cost = route.cost[transportMode] || 0;

  if (player.state.cash < cost) {
    return { success: false, message: `Insufficient cash. Need ₹${cost}, have ₹${player.state.cash}.`, changes: {} };
  }

  // Energy cost for movement
  let energyCost = 0;
  if (transportMode === 'walk') {
    energyCost = Math.round(travelTime / 60) * 5; // 5 energy per minute walking
  } else {
    energyCost = 2; // minor energy to travel
  }

  // Apply city event effects (e.g. rain)
  const activeEvents = room.cityEvents.filter(e =>
    e.startTick <= room.tick && e.startTick + e.duration > room.tick &&
    (e.affectedLocations.includes(from) || e.affectedLocations.includes(destination) || e.affectedLocations.includes('all'))
  );

  let energyMultiplier = 1;
  for (const ev of activeEvents) {
    for (const effect of ev.effects) {
      if ((effect.target === 'all' || effect.target === player.id) && effect.stat === 'energyCostMultiplier') {
        energyMultiplier *= (1 + effect.change / 100);
      }
    }
  }
  energyCost = Math.round(energyCost * energyMultiplier);

  if (player.state.energy < energyCost) {
    return { success: false, message: 'Too exhausted to make this journey right now. Rest first.', changes: {} };
  }

  const destLocation = getLocation(destination);
  const destName = destLocation?.name || destination;

  return {
    success: true,
    message: `Travelling to ${destName} by ${transportMode}.`,
    narrative: `You head to ${destName}. The journey takes ${Math.round(travelTime / 60)} minutes.`,
    changes: {
      location: destination,
      cash: player.state.cash - cost,
      energy: Math.max(0, player.state.energy - energyCost),
      hunger: Math.min(100, player.state.hunger + (transportMode === 'walk' ? 3 : 1)),
      hydration: Math.min(100, player.state.hydration + (transportMode === 'walk' ? 3 : 1))
    },
    trustChange: 0,
    communityChange: 0
  };
}

function resolveEat(action: GameAction, player: Player, rng: SeededRng): ActionResult {
  const { foodType, cost } = action.payload as { foodType: string; cost: number };
  const persona = player.persona;
  const m = persona.modifiers;
  const s = player.state;

  if (s.cash < cost) {
    return { success: false, message: `Not enough cash. Need ₹${cost}.`, changes: {} };
  }

  // Base meal effects
  let hungerReduction = 30;
  let energyGain = 15;
  let moodGain = 5;

  // Overeating penalty
  const ticksSinceLastMeal = action.tick - s.lastMealTime;
  const isOvereating = s.hunger < 30 && ticksSinceLastMeal < 120;
  if (isOvereating) {
    energyGain = -10;
    moodGain = -5;
    return {
      success: true,
      message: 'You ate even though you weren\'t very hungry. You feel uncomfortable.',
      narrative: 'Overeating leaves you feeling sluggish.',
      changes: {
        cash: s.cash - cost,
        hunger: Math.max(0, s.hunger - 10),
        energy: Math.max(0, s.energy - 10),
        mood: Math.max(0, s.mood - 5),
        overeatingPenalty: Math.min(30, s.overeatingPenalty + 20),
        lastMealTime: action.tick
      }
    };
  }

  // Preferred food bonus
  const isPreferred = persona.foodPreferences.includes(foodType as never) || persona.foodPreferences.includes('any');
  if (isPreferred) {
    moodGain = Math.round(moodGain * m.moodFromFood);
    energyGain = Math.round(energyGain * m.moodFromFood * 0.7);
  }

  // Hunger level amplifies benefit (hungry person gets more from food)
  const hungerMultiplier = 1 + (s.hunger / 100) * 0.5;
  hungerReduction = Math.round(hungerReduction * hungerMultiplier);

  const narrative = isPreferred
    ? `The ${foodType} food is exactly what you needed. You feel restored.`
    : `You eat. It\'s filling but not your favourite.`;

  return {
    success: true,
    message: `You eat a ${foodType} meal. Hunger reduced.`,
    narrative,
    changes: {
      cash: s.cash - cost,
      hunger: Math.max(0, s.hunger - hungerReduction),
      energy: Math.min(100, s.energy + energyGain),
      mood: Math.min(100, s.mood + moodGain),
      lastMealTime: action.tick,
      overeatingPenalty: 0
    }
  };
}

function resolveDrink(action: GameAction, player: Player, rng: SeededRng): ActionResult {
  const { cost = 0 } = action.payload as { cost?: number };
  const s = player.state;

  if (s.cash < cost) {
    return { success: false, message: `Not enough cash. Need ₹${cost}.`, changes: {} };
  }

  return {
    success: true,
    message: 'You drink water. Hydration restored.',
    changes: {
      cash: s.cash - cost,
      hydration: Math.max(0, s.hydration - 40),
      mood: Math.min(100, s.mood + 3)
    }
  };
}

function resolveRest(action: GameAction, player: Player, rng: SeededRng): ActionResult {
  const { duration = 120 } = action.payload as { duration?: number };
  const persona = player.persona;
  const m = persona.modifiers;
  const s = player.state;

  const energyGain = Math.round((duration / 60) * 15 * m.energyRecovery);
  const stressReduction = Math.round((duration / 60) * 8);
  const hungerIncrease = Math.round((duration / 60) * 3);

  return {
    success: true,
    message: `You rest for ${Math.round(duration / 60)} minutes. Energy restored.`,
    narrative: 'The brief rest helps. Your muscles relax and your breathing slows.',
    changes: {
      energy: Math.min(100, s.energy + energyGain),
      stress: Math.max(0, s.stress - stressReduction),
      hunger: Math.min(100, s.hunger + hungerIncrease),
      mood: Math.min(100, s.mood + 3)
    }
  };
}

function resolveWork(action: GameAction, player: Player, rng: SeededRng): ActionResult {
  const { workType = 'basic', duration = 180 } = action.payload as { workType?: string; duration?: number };
  const persona = player.persona;
  const m = persona.modifiers;
  const s = player.state;

  if (s.energy < 15) {
    return { success: false, message: 'Too exhausted to work. Rest first.', changes: {} };
  }

  const baseEarnings = workType === 'skilled' ? 80 : 40;
  const workBonus = persona.traits.workOrientation >= 8 ? 1.3 : 1.0;
  const earnings = Math.round(baseEarnings * workBonus);

  const energyCost = Math.round((duration / 60) * 10);
  const stressGain = Math.round((duration / 60) * 8 * m.stressFromWork);
  const hungerGain = Math.round((duration / 60) * 4);

  // Motivation boost for work-oriented characters
  const moodChange = persona.traits.workOrientation >= 8 ? 5 : -2;

  return {
    success: true,
    message: `Work completed. Earned ₹${earnings}.`,
    narrative: persona.traits.workOrientation >= 8
      ? 'The work energizes you — this is where you thrive.'
      : 'You finish the work. The pay is welcome, the effort was real.',
    changes: {
      cash: s.cash + earnings,
      energy: Math.max(0, s.energy - energyCost),
      stress: Math.min(100, s.stress + stressGain),
      hunger: Math.min(100, s.hunger + hungerGain),
      mood: Math.min(100, Math.max(0, s.mood + moodChange))
    }
  };
}

function resolveBuy(action: GameAction, player: Player, rng: SeededRng): ActionResult {
  const { item, cost } = action.payload as { item: string; cost: number };
  const persona = player.persona;
  const m = persona.modifiers;
  const s = player.state;

  const effectiveCost = Math.round(cost / m.spendingResistance);

  if (s.cash < effectiveCost) {
    return { success: false, message: `Not enough cash. Need ₹${effectiveCost}.`, changes: {} };
  }

  // Mood from purchase (higher for spenders, but triggers financial stress for those low on cash)
  const moodGain = persona.traits.spendingStyle >= 7 ? 12 : 5;
  const postCashStress = (s.cash - effectiveCost) < 50 ? 10 : 0;

  return {
    success: true,
    message: `Purchased ${item} for ₹${effectiveCost}.`,
    narrative: persona.traits.spendingStyle >= 7
      ? `You grab ${item}. Small joys matter.`
      : `You buy ${item}. Necessary.`,
    changes: {
      cash: s.cash - effectiveCost,
      mood: Math.min(100, s.mood + moodGain),
      stress: Math.min(100, s.stress + postCashStress)
    }
  };
}

function resolveHelpPlayer(action: GameAction, player: Player, room: Room, rng: SeededRng): ActionResult {
  const { targetPlayerId, helpType, amount } = action.payload as {
    targetPlayerId: string; helpType: string; amount?: number;
  };

  const target = room.players[targetPlayerId];
  if (!target) {
    return { success: false, message: 'That player is not in this game.', changes: {} };
  }

  const persona = player.persona;
  const m = persona.modifiers;
  const s = player.state;

  // Cost to helper
  const energyCost = 8;
  const timeCost = 60; // represented as mission deadline reduction
  const moodGain = Math.round(10 * (persona.traits.cooperation / 5) * m.cooperationBonus);

  // Check for independence penalty (loner characters)
  if (persona.id === 'independent_loner') {
    // Helping is slightly uncharacteristic but not penalized much
  }

  return {
    success: true,
    message: `You helped ${target.name}.`,
    narrative: `You take time to help ${target.name}. It costs you energy but it feels right.`,
    changes: {
      energy: Math.max(0, s.energy - energyCost),
      mood: Math.min(100, s.mood + moodGain),
      helpedOthersCount: s.helpedOthersCount + 1
    },
    karmaChange: 8,
    trustChange: 5,
    communityChange: 3
  };
}

function resolveShareInfo(action: GameAction, player: Player, room: Room, rng: SeededRng): ActionResult {
  const { targetPlayerId, info } = action.payload as { targetPlayerId: string; info: string };
  const persona = player.persona;
  const m = persona.modifiers;

  return {
    success: true,
    message: `Information shared with ${room.players[targetPlayerId]?.name || 'player'}.`,
    changes: {
      mood: Math.min(100, player.state.mood + 2)
    },
    karmaChange: 3,
    trustChange: 3,
    communityChange: 1
  };
}

function resolveTransferMoney(action: GameAction, player: Player, room: Room): ActionResult {
  const { targetPlayerId, amount } = action.payload as { targetPlayerId: string; amount: number };

  if (!amount || amount <= 0) {
    return { success: false, message: 'Invalid transfer amount.', changes: {} };
  }

  const target = room.players[targetPlayerId];
  if (!target) {
    return { success: false, message: 'Target player not found.', changes: {} };
  }

  if (player.state.cash < amount) {
    return { success: false, message: `Insufficient cash. You have ₹${player.state.cash}.`, changes: {} };
  }

  return {
    success: true,
    message: `Transferred ₹${amount} to ${target.name}.`,
    narrative: `You hand ₹${amount} to ${target.name}.`,
    changes: { cash: player.state.cash - amount },
    karmaChange: 5,
    trustChange: 8,
    communityChange: 4
  };
}

function resolveCompleteObjective(action: GameAction, player: Player, room: Room, rng: SeededRng): ActionResult {
  const { objectiveId } = action.payload as { objectiveId: string };

  const objective = player.mission.objectives.find(o => o.id === objectiveId);
  if (!objective) {
    return { success: false, message: 'Objective not found.', changes: {} };
  }

  if (objective.completed) {
    return { success: false, message: 'Objective already completed.', changes: {} };
  }

  // Check if player is at required location for this objective
  const mission = player.mission.definition;
  if (mission.requiredLocations && mission.requiredLocations.length > 0) {
    const isAtRequired = mission.requiredLocations.includes(player.state.location);
    if (!isAtRequired && !objective.optional) {
      return {
        success: false,
        message: `You need to be at a specific location to complete this. Try reaching: ${mission.requiredLocations.join(', ')}`,
        changes: {}
      };
    }
  }

  return {
    success: true,
    message: `Objective completed: ${objective.description}`,
    narrative: `You complete the objective. Progress made on your mission.`,
    changes: {
      mood: Math.min(100, player.state.mood + 10),
      stress: Math.max(0, player.state.stress - 5)
    },
    karmaChange: 2,
    trustChange: 0,
    communityChange: 0
  };
}

function resolveEventChoice(action: GameAction, player: Player, room: Room, rng: SeededRng): ActionResult {
  const { eventId, choiceId } = action.payload as { eventId: string; choiceId: string };

  const event = room.cityEvents.find(e => e.id === eventId);
  if (!event || !event.choices) {
    return { success: false, message: 'Event not found or no choices available.', changes: {} };
  }

  const choice = event.choices.find(c => c.id === choiceId);
  if (!choice) {
    return { success: false, message: 'Choice not available.', changes: {} };
  }

  const changes: Partial<CharacterState> = {};
  for (const effect of choice.effects) {
    if (effect.target === 'all' || effect.target === player.id) {
      (changes as unknown as Record<string, number>)[effect.stat] = (player.state as unknown as Record<string, number>)[effect.stat] + effect.change;
    }
  }

  return {
    success: true,
    message: `You chose: ${choice.text}`,
    narrative: `Your decision: ${choice.text}`,
    changes,
    karmaChange: choice.karmaEffect,
    trustChange: choice.socialTrustEffect,
    communityChange: choice.communityImpactEffect
  };
}

// --- Karma system ---
export function evaluateKarma(
  action: GameAction,
  result: ActionResult,
  player: Player,
  tick: number
): number {
  if (!result.success) return 0;
  let karma = result.karmaChange || 0;

  // Anti-farming: diminishing returns
  const p = player;
  const recentKarmaActions = p.hidden.karmaActions;
  if (recentKarmaActions > 5 && (tick - p.hidden.lastKarmaActionTick) < 60) {
    karma = Math.round(karma * 0.3); // Significant diminishing return
  } else if (recentKarmaActions > 10) {
    karma = Math.round(karma * 0.1);
  }

  // Cost evaluation: actions that actually cost something give more karma
  if (action.type === 'help_player' && player.state.energy < 30) {
    karma = Math.round(karma * 1.5); // Helping when tired is more meaningful
  }
  if (action.type === 'transfer_money' && player.state.cash < 100) {
    karma = Math.round(karma * 1.5); // Giving when poor is more meaningful
  }

  return Math.max(-20, Math.min(20, karma));
}

// --- Unexpected fortune (karma-influenced) ---
export function checkForUnexpectedFortune(
  player: Player,
  room: Room,
  rng: SeededRng
): GameEvent | null {
  const karma = player.hidden.karma;
  const tick = room.tick;

  // Fortune probability influenced by karma but not guaranteed
  const baseProbability = 0.002; // 0.2% per tick baseline
  const karmaBias = karma > 50 ? 0.003 : karma > 20 ? 0.001 : 0;
  const probability = baseProbability + karmaBias;

  if (!rng.chance(probability)) return null;

  // Even low-karma players can have fortune (just less likely)
  const fortunes = [
    { desc: 'A stranger offers you directions that save precious time.', stat: 'mood', change: 5 },
    { desc: 'You find a few rupees on the ground. Small luck.', stat: 'cash', change: 20 },
    { desc: 'A kind vendor gives you a free glass of water.', stat: 'hydration', change: -25 },
    { desc: 'The bus arrives just as you reach the stop. Lucky timing.', stat: 'energy', change: 5 },
    { desc: 'A brief rest spot opens up just when you need it.', stat: 'stress', change: -8 }
  ];

  const fortune = fortunes[rng.between(0, fortunes.length - 1)];

  return {
    id: uuidv4(),
    tick,
    type: 'city_event',
    playerId: player.id,
    description: fortune.desc,
    statChanges: { [fortune.stat]: fortune.change } as Partial<CharacterState>,
    isPublic: false
  };
}

// --- City Events ---
const CITY_EVENT_TEMPLATES: Array<Omit<CityEvent, 'id' | 'startTick'>> = [
  {
    type: 'weather',
    title: 'Sudden Monsoon Shower',
    description: 'A heavy downpour has begun. Walking is harder and bus times have increased.',
    affectedLocations: ['all'],
    duration: 180,
    effects: [
      { target: 'all', stat: 'energyCostMultiplier', change: 40 },
      { target: 'all', stat: 'mood', change: -5 }
    ],
    requiresChoice: true,
    choices: [
      {
        id: 'take_shelter',
        text: 'Take shelter and wait',
        effects: [{ target: 'self', stat: 'energy', change: 8 }, { target: 'self', stat: 'stress', change: -5 }],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      },
      {
        id: 'push_through',
        text: 'Push through the rain',
        effects: [{ target: 'self', stat: 'energy', change: -15 }, { target: 'self', stat: 'health', change: -5 }],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      },
      {
        id: 'help_stranded',
        text: 'Help a stranded person find shelter',
        effects: [{ target: 'self', stat: 'energy', change: -10 }, { target: 'self', stat: 'mood', change: 12 }],
        karmaEffect: 8, socialTrustEffect: 5, communityImpactEffect: 5
      }
    ]
  },
  {
    type: 'transport_disruption',
    title: 'Bus Route Disruption',
    description: 'A protest has blocked several major bus routes. Alternative transport needed.',
    affectedLocations: ['esplanade', 'college_street', 'shyambazar'],
    duration: 240,
    effects: [
      { target: 'all', stat: 'stress', change: 8 }
    ],
    requiresChoice: false
  },
  {
    type: 'opportunity',
    title: 'Quick Work Opportunity',
    description: 'A local business owner needs urgent help. Pay is good but it will take time.',
    affectedLocations: ['dalhousie_sq', 'new_market', 'salt_lake'],
    duration: 180,
    effects: [],
    requiresChoice: true,
    choices: [
      {
        id: 'accept_work',
        text: 'Take the quick job (earn ₹60, spend 3 min)',
        effects: [{ target: 'self', stat: 'cash', change: 60 }, { target: 'self', stat: 'energy', change: -15 }],
        karmaEffect: 1, socialTrustEffect: 2, communityImpactEffect: 0
      },
      {
        id: 'decline',
        text: 'Decline and continue',
        effects: [],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      }
    ]
  },
  {
    type: 'npc_request',
    title: 'Stranded Commuter',
    description: 'An elderly person is confused about which bus to take. They\'re in a hurry.',
    affectedLocations: ['howrah_station', 'esplanade', 'sealdah_station'],
    duration: 120,
    effects: [],
    requiresChoice: true,
    choices: [
      {
        id: 'help_directions',
        text: 'Stop and give directions',
        effects: [{ target: 'self', stat: 'mood', change: 8 }, { target: 'self', stat: 'energy', change: -3 }],
        karmaEffect: 6, socialTrustEffect: 4, communityImpactEffect: 4
      },
      {
        id: 'point_and_go',
        text: 'Quick point in the right direction and move on',
        effects: [{ target: 'self', stat: 'mood', change: 2 }],
        karmaEffect: 2, socialTrustEffect: 1, communityImpactEffect: 1
      },
      {
        id: 'ignore',
        text: 'You\'re in too much of a hurry',
        effects: [{ target: 'self', stat: 'mood', change: -3 }],
        karmaEffect: -3, socialTrustEffect: 0, communityImpactEffect: -2
      }
    ]
  },
  {
    type: 'crowd',
    title: 'Durga Puja Crowd',
    description: 'Puja celebrations have drawn enormous crowds. Movement is slowed citywide.',
    affectedLocations: ['esplanade', 'park_street', 'maidan', 'new_market'],
    duration: 300,
    effects: [
      { target: 'all', stat: 'energyCostMultiplier', change: 25 },
      { target: 'all', stat: 'mood', change: 3 }
    ],
    requiresChoice: false
  }
];

export function generateCityEvent(tick: number, rng: SeededRng): CityEvent {
  const template = CITY_EVENT_TEMPLATES[rng.between(0, CITY_EVENT_TEMPLATES.length - 1)];
  return {
    ...template,
    id: uuidv4(),
    startTick: tick
  };
}

// --- Match result calculation ---
export function calculateMatchResult(room: Room): import('./types').MatchResult {
  const playerResults: import('./types').PlayerResult[] = [];

  for (const [, player] of Object.entries(room.players)) {
    const mission = player.mission;
    const objectives = mission.objectives;
    const completedRequired = objectives.filter(o => !o.optional && o.completed).length;
    const totalRequired = objectives.filter(o => !o.optional).length;
    const completedOptional = objectives.filter(o => o.optional && o.completed).length;

    // Score calculation
    let score = 0;
    score += (completedRequired / Math.max(1, totalRequired)) * 60; // 60 points for required
    score += completedOptional * 10; // 10 points per optional
    score += Math.round(player.state.cash / 10); // Cash bonus (capped contribution)
    score += Math.round(player.socialTrust / 2); // Trust bonus
    score += Math.round(player.communityImpact); // Community impact
    score = Math.min(100, Math.round(score));

    // Generate journey narrative
    const narrative = generatePlayerNarrative(player, mission);

    playerResults.push({
      playerId: player.id,
      playerName: player.name,
      personaName: player.persona.title,
      missionTitle: mission.definition.title,
      missionStatus: mission.status,
      finalState: player.state,
      socialTrust: player.socialTrust,
      communityImpact: player.communityImpact,
      score,
      rank: 0, // filled in after sorting
      journey: player.actionLog.slice(-20), // last 20 events
      majorDecisions: player.actionLog
        .filter(e => ['help_player', 'transfer_money', 'event_choice'].includes(e.type))
        .map(e => e.description),
      cooperationCount: player.state.helpedOthersCount,
      helpedCount: player.state.receivedHelpCount,
      narrative
    });
  }

  // Sort and rank
  playerResults.sort((a, b) => b.score - a.score);
  playerResults.forEach((r, i) => r.rank = i + 1);

  const winner = playerResults[0];
  const highlightEvents = Object.values(room.players)
    .flatMap(p => p.actionLog)
    .filter(e => e.isPublic)
    .sort((a, b) => a.tick - b.tick)
    .slice(-10);

  return {
    winnerId: winner?.playerId,
    winnerName: winner?.playerName,
    playerResults,
    matchDurationActual: room.tick,
    totalTicks: room.tick,
    highlightEvents
  };
}

function generatePlayerNarrative(player: Player, mission: PlayerMission): string {
  const parts: string[] = [];

  parts.push(`${player.name} — ${player.persona.title}.`);

  if (mission.status === 'completed') {
    parts.push(`Mission "${mission.definition.title}" completed successfully.`);
  } else if (mission.status === 'partial') {
    parts.push(`Mission "${mission.definition.title}" partially completed.`);
  } else {
    parts.push(`Mission "${mission.definition.title}" was not completed.`);
  }

  if (player.state.helpedOthersCount > 0) {
    parts.push(`Helped ${player.state.helpedOthersCount} other player(s) during the match.`);
  }

  if (player.communityImpact > 5) {
    parts.push('Made a positive impact on the community.');
  } else if (player.communityImpact < -5) {
    parts.push('Actions had a negative effect on others around them.');
  }

  const cashChange = player.state.cash - player.persona.startingCash;
  if (cashChange > 50) {
    parts.push(`Ended the match ₹${cashChange} richer than they started.`);
  } else if (cashChange < -50) {
    parts.push(`Spent ₹${Math.abs(cashChange)} more than they started with.`);
  }

  return parts.join(' ');
}
