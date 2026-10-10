import type {
  Player, CharacterState, Room, GameAction, ActionResult,
  PersonaDefinition, MissionDefinition, PlayerMission, GameEvent,
  CityEvent, EventChoice, MissionObjective, InteractionRequest,
  SocialDilemma, DilemmaEvent, DilemmaRecord, DeathNarrative,
  TransportMode
} from './types';
import { getRoute, getLocation, findShortestPath } from './map';
import { v4 as uuidv4 } from 'uuid';

// --- Seeded RNG ---
export class SeededRng {
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0; }
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) & 0xffffffff;
    return (this.state >>> 0) / 0x100000000;
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

  // Progressive difficulty: needs escalate in the final third of the match
  const urgencyMultiplier = tick > 400 ? 1.3 : tick > 300 ? 1.15 : 1.0;

  // Hunger increases over time
  const hungerIncrease = 0.5 * m.hungerRate * urgencyMultiplier;
  s.hunger = Math.min(100, s.hunger + hungerIncrease);

  // Hydration increases over time
  s.hydration = Math.min(100, s.hydration + 0.4 * urgencyMultiplier);

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

  // Energy consequences — cascading penalties
  if (s.energy < 20) {
    s.mood = Math.max(0, s.mood - 0.2);
    s.stress = Math.min(100, s.stress + 0.1);
    if (s.energy < 10) {
      s.health = Math.max(0, s.health - 0.15);
      s.mood = Math.max(0, s.mood - 0.3);
      if (tick % 20 === 0) events.push('Your body is shutting down from exhaustion.');
    } else if (tick % 40 === 0) {
      events.push('You are running on fumes. Rest soon.');
    }
  }

  // Low mood cascade — despair prevents productive action
  if (s.mood < 15) {
    s.energy = Math.max(0, s.energy - 0.15);
    s.stress = Math.min(100, s.stress + 0.15);
    if (tick % 30 === 0) events.push('Despair weighs on you. Everything feels pointless.');
  }

  // Critical health — body failing
  if (s.health < 20 && s.health > 0) {
    s.energy = Math.max(0, s.energy - 0.25);
    s.mood = Math.max(0, s.mood - 0.2);
    if (tick % 20 === 0) events.push('Your body is failing. Find food, water, or rest immediately.');
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
    case 'dilemma_choice': return resolveDilemmaChoice(action, player, room, rng);
    case 'buy_from_vendor':
    case 'micro_interaction':
      return { success: false, message: 'Handled by room handler.', changes: {} };
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

  const transportMode = mode as TransportMode;

  // Try direct route first
  let route = getRoute(from, destination);
  let totalTravelTime = 0;
  let totalCost = 0;
  let pathDescription = '';

  if (route) {
    if (!route.modes.includes(transportMode as never)) {
      return { success: false, message: `${mode} not available on this route.`, changes: {} };
    }
    totalTravelTime = route.travelTime[transportMode] || 0;
    totalCost = route.cost[transportMode] || 0;
  } else {
    // Multi-hop: find path through intermediate stops
    const pathResult = findShortestPath(from, destination, transportMode);
    if (!pathResult || pathResult.path.length < 2) {
      return { success: false, message: `No ${mode} route to ${destination}. Try a different transport mode.`, changes: {} };
    }
    totalTravelTime = pathResult.time;
    totalCost = pathResult.cost;
    const stopNames = pathResult.path.slice(1, -1).map(id => getLocation(id)?.name || id);
    if (stopNames.length > 0) {
      pathDescription = ` via ${stopNames.join(', ')}`;
    }
  }

  if (player.state.cash < totalCost) {
    return { success: false, message: `Insufficient cash. Need ₹${totalCost}, have ₹${player.state.cash}.`, changes: {} };
  }

  // Energy cost for movement — low-state penalties increase cost
  let energyCost = 0;
  if (transportMode === 'walk') {
    energyCost = Math.round(totalTravelTime / 60) * 5;
  } else {
    energyCost = 2 + Math.round(totalTravelTime / 300);
  }

  // Exhaustion penalty: movement costs more when energy is low
  if (player.state.energy < 10) {
    energyCost = Math.round(energyCost * 2);
  } else if (player.state.energy < 20) {
    energyCost = Math.round(energyCost * 1.5);
  }

  // Failing body: movement costs more when health is low
  if (player.state.health < 30) {
    energyCost = Math.round(energyCost * 1.3);
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
  const journeyMins = Math.round(totalTravelTime / 60);

  return {
    success: true,
    message: `Travelling to ${destName} by ${transportMode}${pathDescription}.`,
    narrative: `You head to ${destName}${pathDescription}. The journey takes ${journeyMins} minutes.`,
    changes: {
      location: destination,
      cash: player.state.cash - totalCost,
      energy: Math.max(0, player.state.energy - energyCost),
      hunger: Math.min(100, player.state.hunger + (transportMode === 'walk' ? 3 + Math.floor(journeyMins / 5) : 1)),
      hydration: Math.min(100, player.state.hydration + (transportMode === 'walk' ? 3 + Math.floor(journeyMins / 5) : 1))
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

  if (s.mood < 15) {
    return { success: false, message: 'You cannot bring yourself to work. The despair is too heavy.', changes: {} };
  }

  if (s.health < 15) {
    return { success: false, message: 'Your body will not cooperate. You need medical attention or rest.', changes: {} };
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

  if (player.state.mood < 15) {
    return { success: false, message: 'You are too withdrawn to help anyone right now.', changes: {} };
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
    if (!isAtRequired) {
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
    if (effect.target === 'all' || effect.target === 'self' || effect.target === player.id) {
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

function resolveDilemmaChoice(action: GameAction, player: Player, _room: Room, _rng: SeededRng): ActionResult {
  const { dilemmaId, choiceId } = action.payload as { dilemmaId: string; choiceId: string };

  const activeDilemma = (player as Player & { _pendingDilemma?: SocialDilemma }).
    _pendingDilemma;
  if (!activeDilemma || activeDilemma.id !== dilemmaId) {
    return { success: false, message: 'No matching dilemma found.', changes: {} };
  }

  const choice = activeDilemma.choices.find(c => c.id === choiceId);
  if (!choice) {
    return { success: false, message: 'Invalid choice.', changes: {} };
  }

  const changes: Partial<CharacterState> = {};
  for (const [stat, delta] of Object.entries(choice.statChanges)) {
    const current = (player.state as unknown as Record<string, number>)[stat] ?? 0;
    (changes as unknown as Record<string, number>)[stat] = current + (delta as number);
  }

  if (choice.conscienceEffect !== 0) {
    const cur = changes.mood ?? player.state.mood;
    changes.mood = Math.max(0, Math.min(100, cur + choice.conscienceEffect));
  }

  return {
    success: true,
    message: choice.narrativeOutcome,
    narrative: choice.narrativeOutcome,
    changes,
    karmaChange: choice.karmaChange,
    trustChange: choice.trustChange,
    communityChange: choice.communityChange
  };
}

export function pickDilemmaForTick(
  dilemmas: SocialDilemma[],
  player: Player,
  tick: number,
  rng: SeededRng
): SocialDilemma | null {
  if (player.activeDilemmaId) return null; // already has one pending

  const resolved = new Set(player.dilemmasResolved.map(d => d.dilemmaId));
  const eligible = dilemmas.filter(d => {
    if (resolved.has(d.id)) return false;
    if (d.triggerLocation && d.triggerLocation !== player.state.location) return false;
    if (d.minTick !== undefined && tick < d.minTick) return false;
    if (d.maxTick !== undefined && tick > d.maxTick) return false;
    return rng.chance(d.probabilityPerTick);
  });

  if (eligible.length === 0) return null;
  return eligible[rng.between(0, eligible.length - 1)];
}

export function buildDilemmaEvent(dilemma: SocialDilemma, tick: number): DilemmaEvent {
  return {
    id: uuidv4(),
    dilemmaId: dilemma.id,
    title: dilemma.title,
    setup: dilemma.setup,
    dilemmaType: dilemma.dilemmaType,
    choices: dilemma.choices,
    tick,
    expiresAtTick: tick + 120, // 2 minute window to respond
    personaContext: dilemma.personaContext
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

  const isNight = tick > 0 && ((tick % 600) > 400);

  const fortunes = [
    { desc: 'A stranger offers you directions that save precious time.', stat: 'mood', change: 5 },
    { desc: 'You find a few rupees on the ground. Small luck.', stat: 'cash', change: 20 },
    { desc: 'A kind vendor gives you a free glass of water.', stat: 'hydration', change: -25 },
    { desc: 'The bus arrives just as you reach the stop. Lucky timing.', stat: 'energy', change: 5 },
    { desc: 'A brief rest spot opens up just when you need it.', stat: 'stress', change: -8 },
    { desc: 'Someone shares their lunch with you. A kind gesture.', stat: 'hunger', change: -20 },
    { desc: 'A passerby drops a hundred-rupee note. Your lucky day!', stat: 'cash', change: 100 },
    { desc: 'A cool breeze lifts your spirits unexpectedly.', stat: 'mood', change: 10 },
    { desc: 'You find a shaded spot to catch your breath.', stat: 'energy', change: 8 },
    { desc: 'A street musician plays a melody that lifts your mood.', stat: 'mood', change: 7 },
  ];

  const misfortunes = [
    { desc: 'You step in a puddle and twist your ankle slightly.', stat: 'health', change: -5 },
    { desc: 'A pickpocket bumps into you — check your pockets!', stat: 'cash', change: -15 },
    { desc: 'The heat makes you feel dizzy for a moment.', stat: 'energy', change: -8 },
    { desc: 'You witness an argument that raises your stress.', stat: 'stress', change: 10 },
    { desc: 'A stray dog chases you down the street.', stat: 'energy', change: -6 },
    { desc: 'You realize you dropped some money earlier.', stat: 'cash', change: -25 },
    { desc: 'The crowd jostles you hard. You feel a bruise forming.', stat: 'health', change: -4 },
    { desc: 'A sudden noise startles you badly.', stat: 'stress', change: 8 },
  ];

  if (isNight) {
    misfortunes.push(
      { desc: 'A shadow moves in the alley. Your heart races.', stat: 'stress', change: 12 },
      { desc: 'You stumble on an uneven road in the dark.', stat: 'health', change: -6 }
    );
  }

  const isGoodFortune = karma > 0
    ? rng.chance(0.6 + karma / 200)
    : rng.chance(0.4 + karma / 200);

  const pool = isGoodFortune ? fortunes : misfortunes;

  const fortune = pool[rng.between(0, pool.length - 1)];
  const currentVal = (player.state as unknown as Record<string, number>)[fortune.stat] ?? 0;
  const isCash = fortune.stat === 'cash';
  const newVal = isCash
    ? Math.max(0, currentVal + fortune.change)
    : Math.max(0, Math.min(100, currentVal + fortune.change));

  return {
    id: uuidv4(),
    tick,
    type: 'city_event',
    playerId: player.id,
    description: fortune.desc,
    statChanges: { [fortune.stat]: newVal } as Partial<CharacterState>,
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
  },
  {
    type: 'resource_shortage',
    title: 'Water Supply Disruption',
    description: 'A burst pipe has cut water supply to several areas. Bottled water prices have surged.',
    affectedLocations: ['new_market', 'park_street', 'college_street'],
    duration: 240,
    effects: [
      { target: 'all', stat: 'hydration', change: 15 },
      { target: 'all', stat: 'stress', change: 5 }
    ],
    requiresChoice: true,
    choices: [
      {
        id: 'buy_water',
        text: 'Buy expensive bottled water (₹30)',
        effects: [{ target: 'self', stat: 'cash', change: -30 }, { target: 'self', stat: 'hydration', change: -20 }],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      },
      {
        id: 'share_supply',
        text: 'Share your water with others nearby',
        effects: [{ target: 'self', stat: 'hydration', change: 10 }, { target: 'self', stat: 'mood', change: 10 }],
        karmaEffect: 7, socialTrustEffect: 5, communityImpactEffect: 6
      },
      {
        id: 'endure',
        text: 'Tough it out and keep moving',
        effects: [{ target: 'self', stat: 'hydration', change: 12 }, { target: 'self', stat: 'energy', change: -8 }],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      }
    ]
  },
  {
    type: 'emergency',
    title: 'Traffic Accident Ahead',
    description: 'A serious accident has blocked a major intersection. Emergency services are on scene.',
    affectedLocations: ['esplanade', 'dalhousie_sq', 'howrah_station'],
    duration: 180,
    effects: [
      { target: 'all', stat: 'stress', change: 10 }
    ],
    requiresChoice: true,
    choices: [
      {
        id: 'help_injured',
        text: 'Stop and help the injured until medics arrive',
        effects: [{ target: 'self', stat: 'energy', change: -20 }, { target: 'self', stat: 'mood', change: 15 }],
        karmaEffect: 10, socialTrustEffect: 8, communityImpactEffect: 8
      },
      {
        id: 'call_help',
        text: 'Call emergency services and direct traffic',
        effects: [{ target: 'self', stat: 'energy', change: -5 }, { target: 'self', stat: 'mood', change: 5 }],
        karmaEffect: 5, socialTrustEffect: 3, communityImpactEffect: 4
      },
      {
        id: 'detour',
        text: 'Find an alternate route and move on',
        effects: [{ target: 'self', stat: 'energy', change: -8 }],
        karmaEffect: -1, socialTrustEffect: 0, communityImpactEffect: -1
      }
    ]
  },
  {
    type: 'cultural',
    title: 'Street Performance',
    description: 'A group of Baul folk singers is performing at the roadside, drawing a small crowd.',
    affectedLocations: ['park_street', 'maidan', 'college_street'],
    duration: 150,
    effects: [],
    requiresChoice: true,
    choices: [
      {
        id: 'watch',
        text: 'Stop and enjoy the music',
        effects: [{ target: 'self', stat: 'mood', change: 15 }, { target: 'self', stat: 'stress', change: -10 }],
        karmaEffect: 1, socialTrustEffect: 1, communityImpactEffect: 2
      },
      {
        id: 'tip',
        text: 'Leave a tip (₹20)',
        effects: [{ target: 'self', stat: 'cash', change: -20 }, { target: 'self', stat: 'mood', change: 20 }],
        karmaEffect: 4, socialTrustEffect: 3, communityImpactEffect: 5
      },
      {
        id: 'pass',
        text: 'Appreciate from afar and keep walking',
        effects: [{ target: 'self', stat: 'mood', change: 5 }],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      }
    ]
  },
  {
    type: 'market',
    title: 'Street Vendor Deal',
    description: 'A vendor is selling fresh seasonal fruit at a deep discount — but only for the next few minutes.',
    affectedLocations: ['new_market', 'gariahat', 'college_street'],
    duration: 120,
    effects: [],
    requiresChoice: true,
    choices: [
      {
        id: 'buy_fruit',
        text: 'Buy fruit for yourself (₹15)',
        effects: [{ target: 'self', stat: 'cash', change: -15 }, { target: 'self', stat: 'hunger', change: -20 }, { target: 'self', stat: 'mood', change: 5 }],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      },
      {
        id: 'buy_extra',
        text: 'Buy extra to share with someone nearby (₹30)',
        effects: [{ target: 'self', stat: 'cash', change: -30 }, { target: 'self', stat: 'hunger', change: -20 }, { target: 'self', stat: 'mood', change: 12 }],
        karmaEffect: 6, socialTrustEffect: 4, communityImpactEffect: 4
      },
      {
        id: 'skip',
        text: 'Not hungry right now',
        effects: [],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      }
    ]
  },
  {
    type: 'heat',
    title: 'Heatwave Warning',
    description: 'Temperatures have soared above 40°C. Stay hydrated and avoid prolonged walking.',
    affectedLocations: ['all'],
    duration: 300,
    effects: [
      { target: 'all', stat: 'hydration', change: 10 },
      { target: 'all', stat: 'energy', change: -5 }
    ],
    requiresChoice: false
  },
  {
    type: 'opportunity',
    title: 'Lost Tourist',
    description: 'A confused tourist is asking for help finding their hotel. They look wealthy.',
    affectedLocations: ['park_street', 'esplanade', 'victoria_memorial'],
    duration: 120,
    effects: [],
    requiresChoice: true,
    choices: [
      {
        id: 'guide_tourist',
        text: 'Walk them there personally',
        effects: [{ target: 'self', stat: 'energy', change: -12 }, { target: 'self', stat: 'cash', change: 50 }, { target: 'self', stat: 'mood', change: 10 }],
        karmaEffect: 6, socialTrustEffect: 5, communityImpactEffect: 3
      },
      {
        id: 'give_directions',
        text: 'Give clear directions',
        effects: [{ target: 'self', stat: 'mood', change: 5 }],
        karmaEffect: 3, socialTrustEffect: 2, communityImpactEffect: 1
      },
      {
        id: 'ignore_tourist',
        text: 'Walk past',
        effects: [],
        karmaEffect: -2, socialTrustEffect: 0, communityImpactEffect: -1
      }
    ]
  },
  {
    type: 'npc_request',
    title: 'Street Child Begging',
    description: 'A young child tugs at your sleeve, asking for money to buy food.',
    affectedLocations: ['new_market', 'howrah_station', 'sealdah_station', 'esplanade'],
    duration: 90,
    effects: [],
    requiresChoice: true,
    choices: [
      {
        id: 'buy_food',
        text: 'Buy them a meal instead of giving money (₹25)',
        effects: [{ target: 'self', stat: 'cash', change: -25 }, { target: 'self', stat: 'mood', change: 15 }],
        karmaEffect: 10, socialTrustEffect: 5, communityImpactEffect: 7
      },
      {
        id: 'give_money',
        text: 'Give ₹10',
        effects: [{ target: 'self', stat: 'cash', change: -10 }, { target: 'self', stat: 'mood', change: 5 }],
        karmaEffect: 3, socialTrustEffect: 2, communityImpactEffect: 2
      },
      {
        id: 'apologize',
        text: 'Apologize and move on',
        effects: [{ target: 'self', stat: 'mood', change: -5 }],
        karmaEffect: -1, socialTrustEffect: 0, communityImpactEffect: 0
      }
    ]
  },
  {
    type: 'cultural',
    title: 'Tea Stall Gathering',
    description: 'A lively debate is happening at a street tea stall. People are discussing local politics.',
    affectedLocations: ['college_street', 'shyambazar', 'gariahat'],
    duration: 120,
    effects: [],
    requiresChoice: true,
    choices: [
      {
        id: 'join_debate',
        text: 'Join the conversation over a cup of chai (₹5)',
        effects: [{ target: 'self', stat: 'cash', change: -5 }, { target: 'self', stat: 'stress', change: -12 }, { target: 'self', stat: 'mood', change: 8 }],
        karmaEffect: 2, socialTrustEffect: 3, communityImpactEffect: 2
      },
      {
        id: 'listen',
        text: 'Listen quietly from the side',
        effects: [{ target: 'self', stat: 'stress', change: -5 }, { target: 'self', stat: 'mood', change: 3 }],
        karmaEffect: 0, socialTrustEffect: 1, communityImpactEffect: 0
      },
      {
        id: 'walk_on',
        text: 'Keep walking — no time for this',
        effects: [],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      }
    ]
  },
  {
    type: 'emergency',
    title: 'Power Outage',
    description: 'A transformer has blown. Several blocks are without electricity.',
    affectedLocations: ['salt_lake', 'new_market', 'college_street'],
    duration: 200,
    effects: [
      { target: 'all', stat: 'stress', change: 8 },
      { target: 'all', stat: 'mood', change: -5 }
    ],
    requiresChoice: false
  },
  {
    type: 'market',
    title: 'Medicine Discount',
    description: 'A pharmacy is offering a health camp with free basic medicines and checkups.',
    affectedLocations: ['medical_college', 'gariahat'],
    duration: 180,
    effects: [],
    requiresChoice: true,
    choices: [
      {
        id: 'get_checkup',
        text: 'Get a free health checkup',
        effects: [{ target: 'self', stat: 'health', change: 15 }, { target: 'self', stat: 'mood', change: 5 }],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      },
      {
        id: 'volunteer',
        text: 'Help organize the queue',
        effects: [{ target: 'self', stat: 'energy', change: -10 }, { target: 'self', stat: 'health', change: 8 }, { target: 'self', stat: 'mood', change: 12 }],
        karmaEffect: 7, socialTrustEffect: 5, communityImpactEffect: 6
      },
      {
        id: 'skip_camp',
        text: 'Pass — you are doing fine',
        effects: [],
        karmaEffect: 0, socialTrustEffect: 0, communityImpactEffect: 0
      }
    ]
  }
];

export function generateCityEvent(tick: number, rng: SeededRng, players?: Player[]): CityEvent {
  let pool = [...CITY_EVENT_TEMPLATES];

  // Contextual weighting: prefer relevant events based on player states
  if (players && players.length > 0) {
    const avgHunger = players.reduce((s, p) => s + p.state.hunger, 0) / players.length;
    const avgHydration = players.reduce((s, p) => s + p.state.hydration, 0) / players.length;

    if (avgHunger > 60) {
      const foodEvents = pool.filter(e => e.type === 'market' || e.type === 'opportunity');
      pool = [...pool, ...foodEvents];
    }
    if (avgHydration > 60) {
      const waterEvents = pool.filter(e => e.type === 'resource_shortage' || e.type === 'heat');
      pool = [...pool, ...waterEvents];
    }
  }

  const template = pool[rng.between(0, pool.length - 1)];
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

    // Score calculation with breakdown
    const missionPoints = Math.round((completedRequired / Math.max(1, totalRequired)) * 60);
    const optionalBonus = completedOptional * 10;
    const cashBonus = Math.round(player.state.cash / 10);
    const trustBonus = Math.round(player.socialTrust / 2);
    const communityBonus = Math.round(player.communityImpact);

    const scoreBreakdown = { missionPoints, optionalBonus, cashBonus, trustBonus, communityBonus, total: 0 };
    const rawTotal = missionPoints + optionalBonus + cashBonus + trustBonus + communityBonus;
    const score = Math.min(100, Math.max(0, rawTotal));
    scoreBreakdown.total = score;

    // Generate journey narrative
    const narrative = generatePlayerNarrative(player, mission);
    const performanceInsights = generatePerformanceInsights(player, mission, scoreBreakdown);

    const playerResult: import('./types').PlayerResult = {
      playerId: player.id,
      playerName: player.name,
      personaName: player.persona.title,
      missionTitle: mission.definition.title,
      missionStatus: mission.status,
      finalState: player.state,
      socialTrust: player.socialTrust,
      communityImpact: player.communityImpact,
      score,
      rank: 0,
      journey: player.actionLog.slice(-20),
      majorDecisions: player.actionLog
        .filter(e => ['help_player', 'transfer_money', 'event_choice'].includes(e.type))
        .map(e => e.description),
      cooperationCount: player.state.helpedOthersCount,
      helpedCount: player.state.receivedHelpCount,
      narrative,
      dilemmasResolved: player.dilemmasResolved || [],
      personaLens: generatePersonaLens(player),
      scoreBreakdown,
      performanceInsights
    };

    if (!player.isAlive) {
      playerResult.deathNarrative = generateDeathNarrative(player, player.deathTick || room.tick);
    }

    playerResults.push(playerResult);
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

export function generatePersonaLens(player: Player): string[] {
  const lens: string[] = [];
  const sc = player.persona.socialContext;

  if (!sc) {
    lens.push(`${player.persona.name} navigated the city as ${player.persona.title}.`);
    return lens;
  }

  lens.push(...sc.insightLines);

  const dw = sc.decisionWeights;
  const dilemmas = player.dilemmasResolved || [];

  if (dilemmas.length > 0) {
    const selfInterest = dw.selfPreservation + dw.statusAnxiety;
    const communal = dw.groupLoyalty + dw.communityDuty;
    const principled = dw.principledAction;

    if (selfInterest > communal + 4) {
      lens.push(`As ${sc.communityIdentity.split(',')[0]}, self-preservation was always the rational default. The question isn't whether they chose it — it's what it cost them to keep choosing it.`);
    } else if (communal > selfInterest + 4) {
      lens.push(`Their ${sc.class} background made community obligation feel like gravity — not a choice but a force. The game revealed how much weight they were carrying.`);
    } else if (principled >= 7) {
      lens.push(`They approached each dilemma through principle first, which sounds noble until you see the toll: principled people in an unprincipled city pay a quiet, accumulating price.`);
    }

    if (sc.hiddenObligations.length > 0) {
      lens.push(`What the game couldn't show: ${sc.hiddenObligations[0].toLowerCase()}`);
    }
  }

  if (player.socialTrust > 70 && dw.communityDuty >= 7) {
    lens.push('Their high trust was not earned cheaply — it came from choices that cost energy, cash, or time they did not have. That is the definition of real community.');
  } else if (player.socialTrust < 30 && dw.selfPreservation >= 7) {
    lens.push('Low trust does not mean they are bad — it means the system they navigate punishes generosity. Understanding that is the first step past judgment.');
  }

  return lens;
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

// --- Death System ---

export function checkForDeath(player: Player): boolean {
  if (!player.isAlive) return false;
  return player.state.health <= 0;
}

export function generateDeathNarrative(player: Player, tick: number): DeathNarrative {
  const persona = player.persona;
  const sc = persona.socialContext;
  const location = player.state.location;

  // Determine cause of death
  let cause: string;
  if (player.state.hunger >= 95 && player.state.hydration >= 85) {
    cause = 'Collapsed from starvation and dehydration';
  } else if (player.state.hunger >= 95) {
    cause = 'Collapsed from severe malnutrition';
  } else if (player.state.hydration >= 90) {
    cause = 'Collapsed from severe dehydration';
  } else if (player.state.energy <= 0) {
    cause = 'Body gave out from complete exhaustion';
  } else {
    cause = 'Succumbed to accumulated physical deterioration';
  }

  // Persona-specific final moments
  const finalMoments = generateFinalMoments(persona, location, cause);
  const dependents = getPersonaDependents(persona);
  const unfinishedBusiness = getUnfinishedBusiness(player);

  return { cause, finalMoments, dependents, lastLocation: location, unfinishedBusiness };
}

function generateFinalMoments(persona: PersonaDefinition, location: string, cause: string): string {
  const sc = persona.socialContext;

  if (!sc) {
    return `${persona.name} — ${persona.title} — fell at ${location}. ${cause}. The city moved on around them, indifferent.`;
  }

  const classNarratives: Record<string, string> = {
    'working': `${persona.name} sank to the ground at ${location}, another body the city steps around. ${cause}. No ambulance was called — just a crowd that formed and dispersed. In the newspapers tomorrow, they will not even be a statistic.`,
    'lower-middle': `${persona.name} collapsed at ${location}. ${cause}. A few people stopped, but none for long. The phone in their pocket kept buzzing — calls from home they would never answer. The precariousness they always managed to hide finally became visible.`,
    'middle': `${persona.name} fell at ${location}, and for a moment the crowd froze. ${cause}. Someone from the neighborhood recognized them. "But they seemed fine yesterday," they said. Nobody sees the slow unraveling of someone who learned to perform normalcy.`,
    'upper-middle': `${persona.name} collapsed at ${location}, and the irony was stark. ${cause}. In another life, in another zip code, this would have been a hospital visit, not an ending. Privilege is a buffer, but today the buffer ran out.`,
    'privileged': `${persona.name} fell at ${location}. ${cause}. It proved what the city always knew: that beneath the surface, everyone is equally fragile. The difference was never about strength — only about how far the safety net extends.`
  };

  return classNarratives[sc.class] || classNarratives['working'];
}

function getPersonaDependents(persona: PersonaDefinition): string[] {
  const dependents: string[] = [];
  const sc = persona.socialContext;
  const backstory = persona.backstory.toLowerCase();

  if (backstory.includes('mother') || backstory.includes('maa') || backstory.includes('parent')) {
    dependents.push('An aging parent who counts the days by their phone calls');
  }
  if (backstory.includes('wife') || backstory.includes('husband') || backstory.includes('spouse') || backstory.includes('partner')) {
    dependents.push('A partner who will learn the news from a stranger');
  }
  if (backstory.includes('child') || backstory.includes('son') || backstory.includes('daughter') || backstory.includes('kids')) {
    dependents.push('Children who will grow up filling in the gaps of a missing parent');
  }
  if (backstory.includes('sister') || backstory.includes('brother') || backstory.includes('sibling')) {
    dependents.push('A sibling who always assumed there would be more time');
  }
  if (backstory.includes('student') || backstory.includes('teach') || backstory.includes('mentor')) {
    dependents.push('Students who will arrive tomorrow to find an empty chair');
  }
  if (backstory.includes('worker') || backstory.includes('employ') || backstory.includes('colleague')) {
    dependents.push('Colleagues who will divide their work among themselves by afternoon');
  }

  if (sc) {
    for (const obligation of sc.hiddenObligations) {
      const lower = obligation.toLowerCase();
      if (lower.includes('rent') || lower.includes('loan') || lower.includes('debt')) {
        dependents.push('A landlord or lender who will move to the next name on the list');
      } else if (lower.includes('community') || lower.includes('neighborhood') || lower.includes('union')) {
        dependents.push('A community that will hold a brief meeting and then carry on');
      } else if (lower.includes('patient') || lower.includes('sick') || lower.includes('medical')) {
        dependents.push('Someone whose medical bills they were quietly covering');
      }
    }
  }

  if (dependents.length === 0) {
    dependents.push('A neighborhood that knew their face but not their name');
    dependents.push('A chai stall owner who will keep their usual order ready for a few more days');
  }

  return dependents;
}

function getUnfinishedBusiness(player: Player): string[] {
  const unfinished: string[] = [];

  const incomplete = player.mission.objectives
    .filter(o => !o.completed && !o.optional)
    .map(o => o.description);
  if (incomplete.length > 0) {
    unfinished.push(`Mission incomplete: ${incomplete[0]}`);
  }

  if (player.state.cash > 50) {
    unfinished.push(`Had ₹${Math.round(player.state.cash)} left — money that will never reach who it was meant for`);
  }

  if (player.state.helpedOthersCount > 0) {
    unfinished.push(`Helped ${player.state.helpedOthersCount} people today — the last good thing they did`);
  }

  if (player.dilemmasResolved.length > 0) {
    const last = player.dilemmasResolved[player.dilemmasResolved.length - 1];
    unfinished.push(`Last moral choice: "${last.choiceLabel}" — and nobody will ever know why`);
  }

  return unfinished;
}

// --- Low-state action blocking ---

export function getLowStateBlockReason(player: Player, actionType: string): string | null {
  if (!player.isAlive) {
    return 'You have collapsed. Your journey is over.';
  }

  if (actionType === 'work' && player.state.energy < 10) {
    return 'You are too exhausted to work. Your body refuses.';
  }
  if (actionType === 'work' && player.state.mood < 15) {
    return 'You cannot bring yourself to work. The despair is too heavy.';
  }
  if (actionType === 'help_player' && player.state.mood < 15) {
    return 'You are too withdrawn to help anyone right now.';
  }
  if (actionType === 'move' && player.state.energy < 3 && player.state.health < 15) {
    return 'You cannot move. Your body has nothing left to give.';
  }

  return null;
}

function generatePerformanceInsights(
  player: Player,
  mission: PlayerMission,
  breakdown: { missionPoints: number; trustBonus: number; cashBonus: number }
): import('./types').PerformanceInsight[] {
  const insights: import('./types').PerformanceInsight[] = [];

  if (mission.status === 'completed') {
    insights.push({ category: 'strength', text: 'Completed all mission objectives — excellent focus and planning.' });
  } else if (mission.status === 'partial') {
    const pct = mission.partialProgress;
    insights.push({ category: 'weakness', text: `Mission only ${pct}% complete. Prioritize required objectives and plan your route to mission locations early.` });
  } else {
    insights.push({ category: 'weakness', text: 'Mission was not completed. Plan your route to hit mission-critical locations before time runs out.' });
  }

  if (player.state.health > 70) {
    insights.push({ category: 'strength', text: 'Maintained good health throughout — smart self-care choices.' });
  } else if (player.state.health < 30) {
    insights.push({ category: 'weakness', text: `Health dropped to ${Math.round(player.state.health)}%. Visit medical locations or rest areas when health dips below 50.` });
  }

  if (player.state.energy < 20) {
    insights.push({ category: 'weakness', text: `Energy critically low (${Math.round(player.state.energy)}%). Rest at parks, gardens, or residential areas to recover.` });
  } else if (player.state.energy > 60) {
    insights.push({ category: 'strength', text: 'Good energy management — balanced activity with rest.' });
  }

  if (player.state.hunger > 70) {
    insights.push({ category: 'weakness', text: 'Went too long without eating. Eat before hunger passes 60 to avoid health penalties.' });
  }
  if (player.state.hydration > 70) {
    insights.push({ category: 'weakness', text: 'Severe dehydration. Free water is available at stations, hospitals, and temples.' });
  }

  if (player.socialTrust > 70) {
    insights.push({ category: 'strength', text: `Social trust of ${Math.round(player.socialTrust)} — community-minded choices paid off in your score.` });
  } else if (player.socialTrust < 30) {
    insights.push({ category: 'weakness', text: 'Low social trust. Helping others and making ethical dilemma choices builds trust and boosts your score.' });
  }

  const cashChange = player.state.cash - player.persona.startingCash;
  if (cashChange > 100) {
    insights.push({ category: 'strength', text: `Earned ₹${cashChange} net — strong financial management.` });
  } else if (player.state.cash < 20) {
    insights.push({ category: 'weakness', text: 'Nearly ran out of money. Balance spending on food with work opportunities at offices.' });
  }

  if (player.communityImpact > 10) {
    insights.push({ category: 'strength', text: `Positive community impact (+${Math.round(player.communityImpact)}). Your choices made a real difference.` });
  } else if (player.communityImpact < -5) {
    insights.push({ category: 'weakness', text: 'Negative community impact. Consider helping NPCs and choosing community-friendly options in dilemmas.' });
  }

  if (player.state.stress > 60) {
    insights.push({ category: 'tip', text: 'High stress reduces mood and health over time. Visit Maidan, Hooghly Riverbank, or Victoria Memorial to decompress.' });
  }

  if (breakdown.missionPoints < 30) {
    insights.push({ category: 'tip', text: 'Mission completion is worth up to 60 points. Plan your route to reach mission locations before tackling side activities.' });
  }
  if (breakdown.trustBonus < 15) {
    insights.push({ category: 'tip', text: 'Social trust contributes to your score. Help other players and engage thoughtfully with social dilemmas.' });
  }
  if (breakdown.cashBonus < 5) {
    insights.push({ category: 'tip', text: 'Work at Dalhousie Square or Salt Lake IT Park to earn cash. Cash remaining at game end adds to your score.' });
  }

  if ((player.dilemmasResolved || []).length === 0) {
    insights.push({ category: 'tip', text: 'You did not encounter any social dilemmas. Spend more time at different locations to trigger dilemma events.' });
  } else if ((player.dilemmasResolved || []).length >= 3) {
    insights.push({ category: 'strength', text: `Engaged with ${player.dilemmasResolved.length} social dilemmas — each one shapes your persona's story and score.` });
  }

  return insights;
}
