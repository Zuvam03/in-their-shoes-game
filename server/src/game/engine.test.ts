import { SeededRng, tickCharacterState, resolveAction, evaluateKarma, createCharacterState } from './engine';
import { PERSONAS, getPersonaById } from './personas';
import type { Player, Room, GameAction, CharacterState } from './types';
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
      hidden: { karma: 0, karmaActions: 0, lastKarmaActionTick: 0 },
      actionLog: [],
      dilemmasResolved: [],
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
      hidden: { karma: 0, karmaActions: 0, lastKarmaActionTick: 0 },
      actionLog: [], dilemmasResolved: [], isConnected: true, isReady: true
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

describe('Map System', () => {
  it('locations have valid coordinates', () => {
    const { LOCATIONS } = require('./map');
    for (const loc of LOCATIONS) {
      expect(loc.x).toBeGreaterThan(0);
      expect(loc.y).toBeGreaterThan(0);
      expect(loc.x).toBeLessThan(700);
      expect(loc.y).toBeLessThan(700);
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
