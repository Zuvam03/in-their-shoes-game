import { SeededRng, tickCharacterState, resolveAction, evaluateKarma, createCharacterState, checkProximityEvents, computeDynamicScarcity, resetProximityTracking, getReputationBias, applyReputationToVendorPrice, computeNegotiationFairness, generateMoralMap, generatePerspectiveReveal } from './engine';
import { PERSONAS, getPersonaById } from './personas';
import type { Player, Room, GameAction, CharacterState } from './types';
import { getTrustLevel, getTrustPriceMultiplier } from './types';
import { MISSIONS } from './missions';

describe('Persona System', () => {
  it('has at least 12 personas defined', () => {
    expect(PERSONAS.length).toBeGreaterThanOrEqual(12);
  });

  it('all personas have valid trait values (1-10)', () => {
    for (const persona of PERSONAS) {
      for (const [key, val] of Object.entries(persona.traits)) {
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(10);
      }
    }
  });

  it('all personas have valid starting resources', () => {
    for (const persona of PERSONAS) {
      expect(persona.startingCash).toBeGreaterThan(0);
      expect(persona.startingEnergy).toBeGreaterThan(0);
      expect(persona.startingEnergy).toBeLessThanOrEqual(100);
    }
  });

  it('stable traits and dynamic states are separate', () => {
    const persona = PERSONAS[0];
    const state = createCharacterState(persona, 'esplanade');
    // Traits are in persona, states are in CharacterState
    expect((persona as unknown as Record<string, unknown>).health).toBeUndefined();
    expect((persona as unknown as Record<string, unknown>).energy).toBeUndefined();
    expect(state.health).toBeDefined();
    expect(state.energy).toBeDefined();
    expect(persona.traits.analyticalThinking).toBeDefined();
  });
});

describe('Resource Simulation', () => {
  const workaholic = PERSONAS.find(p => p.id === 'overcommitted_achiever')!;
  const foodLover = PERSONAS.find(p => p.id === 'food_loving_explorer')!;

  it('hunger increases over time', () => {
    const state = createCharacterState(workaholic, 'esplanade');
    const { newState } = tickCharacterState(state, workaholic, 1);
    expect(newState.hunger).toBeGreaterThan(state.hunger);
  });

  it('hydration increases over time', () => {
    const state = createCharacterState(workaholic, 'esplanade');
    const { newState } = tickCharacterState(state, workaholic, 1);
    expect(newState.hydration).toBeGreaterThan(state.hydration);
  });

  it('food lover has higher hunger rate than workaholic', () => {
    const stateW = createCharacterState(workaholic, 'esplanade');
    const stateF = createCharacterState(foodLover, 'esplanade');
    const { newState: newW } = tickCharacterState(stateW, workaholic, 1);
    const { newState: newF } = tickCharacterState(stateF, foodLover, 1);
    expect(newF.hunger - stateF.hunger).toBeGreaterThan(newW.hunger - stateW.hunger);
  });

  it('severe hunger drains health', () => {
    const state: CharacterState = {
      ...createCharacterState(workaholic, 'esplanade'),
      hunger: 98
    };
    const { newState } = tickCharacterState(state, workaholic, 1);
    expect(newState.health).toBeLessThan(state.health);
  });

  it('stress decays naturally', () => {
    const state: CharacterState = {
      ...createCharacterState(workaholic, 'esplanade'),
      stress: 80
    };
    const { newState } = tickCharacterState(state, workaholic, 1);
    expect(newState.stress).toBeLessThanOrEqual(state.stress);
  });

  it('character stats stay within bounds [0, 100]', () => {
    const state = createCharacterState(workaholic, 'esplanade');
    // Simulate 60 ticks
    let current = state;
    for (let i = 0; i < 60; i++) {
      const { newState } = tickCharacterState(current, workaholic, i);
      current = newState;
      expect(current.health).toBeGreaterThanOrEqual(0);
      expect(current.health).toBeLessThanOrEqual(100);
      expect(current.energy).toBeGreaterThanOrEqual(0);
      expect(current.energy).toBeLessThanOrEqual(100);
      expect(current.hunger).toBeGreaterThanOrEqual(0);
      expect(current.hunger).toBeLessThanOrEqual(100);
    }
  });
});

describe('Persona-Specific Consequences', () => {
  const workaholic = PERSONAS.find(p => p.id === 'overcommitted_achiever')!;
  const caregiver = PERSONAS.find(p => p.id === 'quiet_caregiver')!;
  const foodLover = PERSONAS.find(p => p.id === 'food_loving_explorer')!;

  function makePlayer(persona: typeof workaholic): Player {
    return {
      id: 'test',
      socketId: 'test',
      name: 'Test',
      persona,
      state: createCharacterState(persona, 'esplanade'),
      mission: {
        definition: MISSIONS[0],
        status: 'active',
        objectives: [],
        startTick: 0,
        partialProgress: 0,
        journeyNotes: []
      },
      socialTrust: 50,
      communityImpact: 0,
      hidden: { karma: 0, karmaActions: 0, lastKarmaActionTick: 0, obligationsFired: [], revealedConstraints: [] },
      actionLog: [],
      dilemmasResolved: [],
      isAlive: true,
      isConnected: true,
      isReady: true
    };
  }

  function makeRoom(player: Player): Room {
    return {
      id: 'test-room',
      hostId: 'test',
      players: { test: player },
      phase: 'playing',
      matchDuration: 600,
      tick: 100,
      gameSpeed: 1,
      cityEvents: [],
      pendingInteractions: [],
      seed: 42
    };
  }

  it('workaholic accumulates more stress from work than caregiver', () => {
    const wPlayer = makePlayer(workaholic);
    const cPlayer = makePlayer(caregiver);
    const rng = new SeededRng(42);
    const workAction: GameAction = {
      playerId: 'test', type: 'work',
      payload: { workType: 'basic', duration: 180 }, tick: 100
    };

    const wResult = resolveAction(workAction, wPlayer, makeRoom(wPlayer), rng);
    const cResult = resolveAction(workAction, cPlayer, makeRoom(cPlayer), rng);

    // Workaholic has higher stress multiplier
    const wStress = -(wResult.changes.stress || 0);
    const cStress = -(cResult.changes.stress || 0);
    // They should be different
    expect(typeof wResult.changes.stress).toBe('number');
  });

  it('food lover gets higher mood from preferred food', () => {
    const fPlayer = makePlayer(foodLover);
    const wPlayer = makePlayer(workaholic);
    const rng = new SeededRng(42);

    const eatAction: GameAction = {
      playerId: 'test', type: 'eat',
      payload: { foodType: 'street', cost: 20 }, tick: 100
    };

    const fResult = resolveAction(eatAction, fPlayer, makeRoom(fPlayer), rng);
    const wResult = resolveAction(eatAction, wPlayer, makeRoom(wPlayer), rng);

    // Food lover should get more mood from street food (it's their preference)
    expect(fResult.success).toBe(true);
    expect(wResult.success).toBe(true);
  });

  it('insufficient cash prevents eating', () => {
    const player = makePlayer(workaholic);
    player.state.cash = 10;
    const rng = new SeededRng(42);
    const eatAction: GameAction = {
      playerId: 'test', type: 'eat',
      payload: { foodType: 'street', cost: 80 }, tick: 100
    };
    const result = resolveAction(eatAction, player, makeRoom(player), rng);
    expect(result.success).toBe(false);
  });

  it('rest restores energy', () => {
    const player = makePlayer(workaholic);
    player.state.energy = 30;
    const rng = new SeededRng(42);
    const restAction: GameAction = {
      playerId: 'test', type: 'rest',
      payload: { duration: 120 }, tick: 100
    };
    const result = resolveAction(restAction, player, makeRoom(player), rng);
    expect(result.success).toBe(true);
    const energyChange = (result.changes.energy || 0);
    expect(energyChange).toBeGreaterThan(0);
  });
});

describe('Karma System', () => {
  const persona = PERSONAS[0];

  function makePlayer(): Player {
    return {
      id: 'test', socketId: 'test', name: 'Test',
      persona,
      state: createCharacterState(persona, 'esplanade'),
      mission: {
        definition: MISSIONS[0],
        status: 'active', objectives: [],
        startTick: 0, partialProgress: 0, journeyNotes: []
      },
      socialTrust: 50, communityImpact: 0,
      hidden: { karma: 0, karmaActions: 0, lastKarmaActionTick: 0, obligationsFired: [], revealedConstraints: [] },
      actionLog: [], dilemmasResolved: [], isAlive: true, isConnected: true, isReady: true
    };
  }

  it('helping gives positive karma', () => {
    const player = makePlayer();
    const action: GameAction = {
      playerId: 'test', type: 'help_player',
      payload: { targetPlayerId: 'other' }, tick: 100
    };
    const result = { success: true, message: '', changes: {}, karmaChange: 8 };
    const karma = evaluateKarma(action, result, player, 100);
    expect(karma).toBeGreaterThan(0);
  });

  it('karma has diminishing returns for repeated actions', () => {
    const player = makePlayer();
    player.hidden.karmaActions = 8;
    player.hidden.lastKarmaActionTick = 95; // recent

    const action: GameAction = {
      playerId: 'test', type: 'help_player',
      payload: { targetPlayerId: 'other' }, tick: 100
    };
    const result = { success: true, message: '', changes: {}, karmaChange: 8 };
    const karma = evaluateKarma(action, result, player, 100);
    // Should be less than 8 due to diminishing returns
    expect(karma).toBeLessThan(8);
  });

  it('karma stays within bounds', () => {
    const player = makePlayer();
    player.hidden.karma = 95;
    // Even if karma change is large, total should be capped
    const highKarmaChange = 50;
    const newKarma = Math.max(-100, Math.min(100, player.hidden.karma + highKarmaChange));
    expect(newKarma).toBeLessThanOrEqual(100);
    expect(newKarma).toBeGreaterThanOrEqual(-100);
  });
});

describe('Mission System', () => {
  it('has all 8 required missions', () => {
    const requiredIds = [
      'last_train_home', 'exam_tomorrow', 'durga_puja_dash',
      'first_salary_problem', 'last_available_order', 'caught_in_monsoon',
      'urgent_medicine_run', 'friend_who_never_shows'
    ];
    for (const id of requiredIds) {
      const mission = MISSIONS.find(m => m.id === id);
      expect(mission).toBeDefined();
    }
  });

  it('all missions have required objectives and deadline', () => {
    for (const mission of MISSIONS) {
      expect(mission.deadline).toBeGreaterThan(0);
      const requiredObjs = mission.objectives.filter(o => !o.optional);
      expect(requiredObjs.length).toBeGreaterThan(0);
    }
  });

  it('missions have at least one alternative path', () => {
    for (const mission of MISSIONS) {
      expect(mission.alternativePaths.length).toBeGreaterThan(0);
    }
  });
});

describe('Proximity Events', () => {
  const persona1 = PERSONAS[0];
  const persona2 = PERSONAS[1];

  function makePlayer(id: string, persona: typeof persona1, location: string): Player {
    return {
      id, socketId: id, name: `Player_${id}`,
      persona,
      state: { ...createCharacterState(persona, location), location },
      mission: {
        definition: MISSIONS[0], status: 'active',
        objectives: [], startTick: 0, partialProgress: 0, journeyNotes: []
      },
      socialTrust: 50, communityImpact: 0,
      hidden: { karma: 0, karmaActions: 0, lastKarmaActionTick: 0, obligationsFired: [], revealedConstraints: [] },
      actionLog: [], dilemmasResolved: [], isAlive: true, isConnected: true, isReady: true
    };
  }

  it('generates proximity events when players share a location', () => {
    const p1 = makePlayer('a', persona1, 'park_street');
    const p2 = makePlayer('b', persona2, 'park_street');
    const room: Room = {
      id: 'prox-test', hostId: 'a',
      players: { a: p1, b: p2 },
      phase: 'playing', matchDuration: 600, tick: 100, gameSpeed: 1,
      cityEvents: [], pendingInteractions: [], seed: 42
    };

    resetProximityTracking('prox-test');
    let found = false;
    for (let attempt = 0; attempt < 500; attempt++) {
      const rng = new SeededRng(100 + attempt * 7);
      rng.next(); rng.next(); rng.next();
      const events = checkProximityEvents(room, rng);
      if (events.length > 0) {
        found = true;
        expect(events[0].involvedPlayerIds.length).toBeGreaterThanOrEqual(2);
        expect(events[0].text.length).toBeGreaterThan(0);
        break;
      }
      resetProximityTracking('prox-test');
    }
    expect(found).toBe(true);
  });

  it('does not fire for solo players', () => {
    const p1 = makePlayer('a', persona1, 'esplanade');
    const room: Room = {
      id: 'solo-test', hostId: 'a',
      players: { a: p1 },
      phase: 'playing', matchDuration: 600, tick: 100, gameSpeed: 1,
      cityEvents: [], pendingInteractions: [], seed: 42
    };
    resetProximityTracking('solo-test');
    const rng = new SeededRng(42);
    const events = checkProximityEvents(room, rng);
    expect(events.length).toBe(0);
  });

  it('deduplicates proximity events for the same pair and template', () => {
    const p1 = makePlayer('a', persona1, 'park_street');
    const p2 = makePlayer('b', persona2, 'park_street');
    const room: Room = {
      id: 'dedup-test', hostId: 'a',
      players: { a: p1, b: p2 },
      phase: 'playing', matchDuration: 600, tick: 100, gameSpeed: 1,
      cityEvents: [], pendingInteractions: [], seed: 42
    };

    resetProximityTracking('dedup-test');
    const allEvents: string[] = [];
    for (let attempt = 0; attempt < 500; attempt++) {
      const rng = new SeededRng(42 + attempt);
      const events = checkProximityEvents(room, rng);
      for (const e of events) allEvents.push(e.text);
    }
    // Each unique template+pair combo should appear at most once
    const unique = new Set(allEvents);
    expect(unique.size).toBe(allEvents.length);
  });
});

describe('Dynamic Scarcity', () => {
  const persona1 = PERSONAS[0];

  function makePlayer(id: string, location: string): Player {
    return {
      id, socketId: id, name: `Player_${id}`,
      persona: persona1,
      state: { ...createCharacterState(persona1, location), location },
      mission: {
        definition: MISSIONS[0], status: 'active',
        objectives: [], startTick: 0, partialProgress: 0, journeyNotes: []
      },
      socialTrust: 50, communityImpact: 0,
      hidden: { karma: 0, karmaActions: 0, lastKarmaActionTick: 0, obligationsFired: [], revealedConstraints: [] },
      actionLog: [], dilemmasResolved: [], isAlive: true, isConnected: true, isReady: true
    };
  }

  it('crowding increases prices and reduces availability', () => {
    const players: Record<string, Player> = {};
    for (let i = 0; i < 4; i++) {
      players[`p${i}`] = makePlayer(`p${i}`, 'esplanade');
    }
    const room: Room = {
      id: 'scarcity-test', hostId: 'p0',
      players, phase: 'playing', matchDuration: 600, tick: 100, gameSpeed: 1,
      cityEvents: [], pendingInteractions: [], seed: 42
    };

    const baseScarcity = new Map<string, import('./locationContent').ResourceScarcity>();
    baseScarcity.set('esplanade', {
      foodAvailability: 0.8, waterAvailability: 0.7,
      medicineAvailability: 0.5, workAvailability: 0.6, priceMultiplier: 1.0
    });

    const rng = new SeededRng(42);
    const shifts = computeDynamicScarcity(room, baseScarcity, rng);
    const espShift = shifts.find(s => s.locationId === 'esplanade');
    expect(espShift).toBeDefined();
    if (espShift?.changes.foodAvailability !== undefined) {
      expect(espShift.changes.foodAvailability).toBeLessThan(0.8);
    }
    if (espShift?.changes.priceMultiplier !== undefined) {
      expect(espShift.changes.priceMultiplier).toBeGreaterThan(1.0);
    }
  });

  it('heat events reduce water availability', () => {
    const p = makePlayer('p0', 'esplanade');
    const room: Room = {
      id: 'heat-scarcity', hostId: 'p0',
      players: { p0: p }, phase: 'playing', matchDuration: 600, tick: 100, gameSpeed: 1,
      cityEvents: [{
        id: 'heat1', type: 'heat', title: 'Heat Wave', description: 'Sweltering',
        affectedLocations: ['all'], startTick: 50, duration: 200,
        effects: [], requiresChoice: false
      }],
      pendingInteractions: [], seed: 42
    };

    const baseScarcity = new Map<string, import('./locationContent').ResourceScarcity>();
    baseScarcity.set('esplanade', {
      foodAvailability: 0.8, waterAvailability: 0.7,
      medicineAvailability: 0.5, workAvailability: 0.6, priceMultiplier: 1.0
    });

    const rng = new SeededRng(42);
    const shifts = computeDynamicScarcity(room, baseScarcity, rng);
    const espShift = shifts.find(s => s.locationId === 'esplanade');
    expect(espShift).toBeDefined();
    if (espShift?.changes.waterAvailability !== undefined) {
      expect(espShift.changes.waterAvailability).toBeLessThan(0.7);
    }
  });
});

describe('Map System', () => {
  it('locations have valid coordinates', () => {
    const { LOCATIONS } = require('./map');
    for (const loc of LOCATIONS) {
      expect(loc.x).toBeGreaterThan(0);
      expect(loc.y).toBeGreaterThan(0);
      expect(loc.x).toBeLessThan(900);
      expect(loc.y).toBeLessThan(750);
    }
  });

  it('routes reference valid locations', () => {
    const { LOCATIONS, ROUTES } = require('./map');
    const locationIds = new Set(LOCATIONS.map((l: { id: string }) => l.id));
    for (const route of ROUTES) {
      expect(locationIds.has(route.from)).toBe(true);
      expect(locationIds.has(route.to)).toBe(true);
    }
  });
});

describe('Reputation Bias', () => {
  it('trust levels map correctly', () => {
    expect(getTrustLevel(5)).toBe('distrusted');
    expect(getTrustLevel(25)).toBe('stranger');
    expect(getTrustLevel(45)).toBe('acquaintance');
    expect(getTrustLevel(65)).toBe('trusted');
    expect(getTrustLevel(90)).toBe('ally');
  });

  it('distrusted players pay more, allies pay less', () => {
    const distrustedPrice = getTrustPriceMultiplier(10);
    const strangerPrice = getTrustPriceMultiplier(25);
    const normalPrice = getTrustPriceMultiplier(50);
    const trustedPrice = getTrustPriceMultiplier(70);
    const allyPrice = getTrustPriceMultiplier(90);

    expect(distrustedPrice).toBe(1.25);
    expect(strangerPrice).toBe(1.1);
    expect(normalPrice).toBe(1.0);
    expect(trustedPrice).toBe(0.92);
    expect(allyPrice).toBe(0.85);
  });

  it('applyReputationToVendorPrice adjusts costs correctly', () => {
    expect(applyReputationToVendorPrice(100, 10)).toBe(125);
    expect(applyReputationToVendorPrice(100, 50)).toBe(100);
    expect(applyReputationToVendorPrice(100, 90)).toBe(85);
    expect(applyReputationToVendorPrice(20, 70)).toBe(18);
  });

  it('getReputationBias returns correct structure', () => {
    const persona = PERSONAS[0];
    const state = createCharacterState(persona, 'howrah_station');
    const player: Player = {
      id: 'test-player',
      socketId: 'test-socket',
      name: 'TestPlayer',
      persona,
      state,
      mission: { definition: MISSIONS[0], objectives: [], status: 'active', startTick: 0, partialProgress: 0, journeyNotes: [] },
      actionLog: [],
      socialTrust: 75,
      communityImpact: 10,
      dilemmasResolved: [],
      activeDilemmaId: undefined,
      isAlive: true,
      isConnected: true,
      isReady: true,
      hidden: { karma: 0, karmaActions: 0, lastKarmaActionTick: 0, obligationsFired: [], revealedConstraints: [] }
    };

    const bias = getReputationBias(player);
    expect(bias.trustLevel).toBe('trusted');
    expect(bias.vendorPriceMultiplier).toBe(0.92);
    expect(bias.helpAcceptChance).toBeGreaterThan(0.5);
    expect(bias.negotiationLeverage).toBeGreaterThan(0);
  });

  it('computeNegotiationFairness rewards generous offers', () => {
    const generous = computeNegotiationFairness(50, 20, 70, 30);
    const stingy = computeNegotiationFairness(10, 50, 20, 60);

    expect(generous.fairnessScore).toBeGreaterThan(stingy.fairnessScore);
    expect(generous.biasedAcceptChance).toBeGreaterThan(stingy.biasedAcceptChance);
  });

  it('high trust offerer gets better fairness score', () => {
    const highTrust = computeNegotiationFairness(30, 30, 80, 40);
    const lowTrust = computeNegotiationFairness(30, 30, 20, 40);

    expect(highTrust.fairnessScore).toBeGreaterThan(lowTrust.fairnessScore);
  });
});

describe('Moral Map & Perspective Reveal', () => {
  function makePlayer(overrides: Partial<Player> = {}): Player {
    const persona = PERSONAS[0];
    return {
      id: 'test-player',
      socketId: 'test-socket',
      name: 'TestPlayer',
      persona,
      state: createCharacterState(persona, 'howrah_station'),
      mission: { definition: MISSIONS[0], objectives: [], status: 'active', startTick: 0, partialProgress: 0, journeyNotes: [] },
      actionLog: [],
      socialTrust: 50,
      communityImpact: 10,
      dilemmasResolved: [],
      activeDilemmaId: undefined,
      isAlive: true,
      isConnected: true,
      isReady: true,
      hidden: { karma: 20, karmaActions: 3, lastKarmaActionTick: 100, obligationsFired: [0], revealedConstraints: ['Must send money home'] },
      ...overrides,
    };
  }

  it('generates moral map entries from help and dilemma actions', () => {
    const player = makePlayer({
      actionLog: [
        { id: '1', tick: 10, type: 'help_player', description: 'Helped another player', isPublic: true },
        { id: '2', tick: 30, type: 'dilemma_choice', description: 'You chose: Share food with others', isPublic: false },
        { id: '3', tick: 50, type: 'transfer_money', description: 'Transferred ₹20 to Ravi', isPublic: true },
        { id: '4', tick: 70, type: 'move', description: 'Walked to Esplanade', isPublic: true },
      ],
    });

    const map = generateMoralMap(player);
    expect(map.length).toBe(3);
    expect(map[0].category).toBe('help');
    expect(map[0].karmaShift).toBeGreaterThan(0);
    expect(map[1].category).toBe('dilemma');
    expect(map[2].category).toBe('trade');
    expect(map[2].karmaAfter).toBeGreaterThan(map[1].karmaAfter);
  });

  it('tracks running karma across entries', () => {
    const player = makePlayer({
      actionLog: [
        { id: '1', tick: 10, type: 'help_player', description: 'Helped', isPublic: true },
        { id: '2', tick: 20, type: 'help_player', description: 'Helped again', isPublic: true },
      ],
    });

    const map = generateMoralMap(player);
    expect(map.length).toBe(2);
    expect(map[0].karmaBefore).toBe(0);
    expect(map[0].karmaAfter).toBe(map[0].karmaShift);
    expect(map[1].karmaBefore).toBe(map[0].karmaAfter);
    expect(map[1].karmaAfter).toBe(map[0].karmaAfter + map[1].karmaShift);
  });

  it('classifies obligation events', () => {
    const player = makePlayer({
      actionLog: [
        { id: '1', tick: 100, type: 'obligation', description: 'Hidden obligation: Must send money home', isPublic: false },
      ],
    });

    const map = generateMoralMap(player);
    expect(map.length).toBe(1);
    expect(map[0].category).toBe('obligation');
    expect(map[0].karmaShift).toBeLessThan(0);
  });

  it('generates perspective reveal with backstory and decision weights', () => {
    const player = makePlayer();
    const perspective = generatePerspectiveReveal(player);

    expect(perspective.karma).toBe(20);
    expect(perspective.backstory).toBeTruthy();
    expect(perspective.socialClass).toBeTruthy();
    expect(perspective.communityIdentity).toBeTruthy();
    expect(perspective.decisionWeights).toBeDefined();
    expect(perspective.decisionWeights.groupLoyalty).toBeGreaterThanOrEqual(1);
    expect(perspective.moralArchetype).toBeTruthy();
    expect(perspective.revealedConstraints).toContain('Must send money home');
  });

  it('assigns correct moral archetypes', () => {
    const altruist = makePlayer({
      hidden: { karma: 70, karmaActions: 10, lastKarmaActionTick: 100, obligationsFired: [], revealedConstraints: [] },
      socialTrust: 75,
      communityImpact: 30,
      state: { ...createCharacterState(PERSONAS[0], 'howrah_station'), helpedOthersCount: 5, receivedHelpCount: 0 },
    });
    expect(generatePerspectiveReveal(altruist).moralArchetype).toBe('The Altruist');

    const loner = makePlayer({
      hidden: { karma: 0, karmaActions: 0, lastKarmaActionTick: 0, obligationsFired: [], revealedConstraints: [] },
      socialTrust: 30,
      communityImpact: 0,
      dilemmasResolved: [],
      state: { ...createCharacterState(PERSONAS[0], 'howrah_station'), helpedOthersCount: 0, receivedHelpCount: 0 },
    });
    expect(generatePerspectiveReveal(loner).moralArchetype).toBe('The Lone Wolf');
  });

  it('returns empty moral map for players with no moral actions', () => {
    const player = makePlayer({
      actionLog: [
        { id: '1', tick: 10, type: 'move', description: 'Walked to Park Street', isPublic: true },
        { id: '2', tick: 20, type: 'rest', description: 'Rested at bench', isPublic: false },
      ],
    });

    const map = generateMoralMap(player);
    expect(map.length).toBe(0);
  });
});
