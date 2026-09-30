import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

// Types (mirrored from server — safe to duplicate since they're purely structural)
export type TransportMode = 'walk' | 'bus' | 'metro' | 'tram' | 'taxi';
export type GamePhase = 'lobby' | 'briefing' | 'playing' | 'ended';
export type MissionStatus = 'active' | 'completed' | 'failed' | 'partial';
export type ActionType = 'move' | 'eat' | 'drink' | 'rest' | 'work' | 'buy' | 'help_player' | 'request_help' | 'share_info' | 'transfer_money' | 'complete_objective' | 'event_choice' | 'dilemma_choice';

export type SocialDilemmaType = 'ethics_vs_survival' | 'loyalty_vs_principle' | 'class_encounter' | 'political_pressure' | 'community_obligation' | 'bystander';

export interface DilemmaChoice {
  id: string;
  text: string;
  shortLabel: string;
  statChanges: Partial<CharacterState>;
  karmaChange: number;
  trustChange: number;
  communityChange: number;
  conscienceEffect: number;
  narrativeOutcome: string;
  personaResonance?: Record<string, 'natural' | 'against' | 'neutral'>;
}

export interface DilemmaEvent {
  id: string;
  dilemmaId: string;
  title: string;
  setup: string;
  dilemmaType: SocialDilemmaType;
  choices: DilemmaChoice[];
  tick: number;
  expiresAtTick: number;
  personaContext: Record<string, string>;
}

export interface DilemmaRecord {
  dilemmaId: string;
  dilemmaTitle: string;
  choiceId: string;
  choiceLabel: string;
  tick: number;
}

export interface CharacterState {
  health: number;
  energy: number;
  hunger: number;
  hydration: number;
  mood: number;
  stress: number;
  cash: number;
  location: string;
  helpedOthersCount: number;
  receivedHelpCount: number;
  lastMealTime: number;
  overeatingPenalty: number;
}

export interface PersonaTraits {
  analyticalThinking: number;
  emotionalSensitivity: number;
  appetite: number;
  workOrientation: number;
  spendingStyle: number;
  socialOrientation: number;
  riskTolerance: number;
  resilience: number;
  adaptability: number;
  cooperation: number;
}

export interface PersonaMotivations {
  careerAdvancement: number;
  financialSecurity: number;
  socialAcceptance: number;
  personalIndependence: number;
  familyResponsibility: number;
  fairness: number;
  helpingOthers: number;
  achievement: number;
  comfort: number;
}

export interface PersonaSocialContext {
  class: string;
  communityIdentity: string;
  politicalPressures: string[];
  hiddenObligations: string[];
  decisionWeights: {
    groupLoyalty: number;
    selfPreservation: number;
    principledAction: number;
    statusAnxiety: number;
    communityDuty: number;
  };
  insightLines: string[];
  dilemmaProfile: string;
}

export interface PersonaDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  backstory: string;
  traits: PersonaTraits;
  motivations: PersonaMotivations;
  foodPreferences: string[];
  startingCash: number;
  startingEnergy: number;
  strengths: string[];
  vulnerabilities: string[];
  traitInteractions: string[];
  socialContext?: PersonaSocialContext;
}

export interface MissionObjective {
  id: string;
  description: string;
  completed: boolean;
  optional: boolean;
}

export interface MissionDefinition {
  id: string;
  title: string;
  narrative: string;
  primaryObjective: string;
  complications: string[];
  alternativePaths: string[];
  partialSuccessCondition?: string;
  failureCondition: string;
}

export interface PlayerMission {
  definition: MissionDefinition;
  status: MissionStatus;
  objectives: MissionObjective[];
  startTick: number;
  completedTick?: number;
  partialProgress: number;
  journeyNotes: string[];
  title?: string;
}

export interface GameEvent {
  id: string;
  tick: number;
  type: string;
  playerId?: string;
  description: string;
  statChanges?: Partial<CharacterState>;
  isPublic: boolean;
}

export interface Player {
  id: string;
  socketId: string;
  name: string;
  persona: PersonaDefinition;
  state: CharacterState;
  mission: PlayerMission;
  socialTrust: number;
  communityImpact: number;
  actionLog: GameEvent[];
  isConnected: boolean;
  isReady: boolean;
}

export interface PublicPlayer {
  id: string;
  socketId: string;
  name: string;
  persona: PersonaDefinition;
  state: CharacterState;
  mission: { title: string; status: MissionStatus; objectives: MissionObjective[]; partialProgress: number };
  socialTrust: number;
  communityImpact: number;
  isConnected: boolean;
  isReady: boolean;
}

export interface PublicRoom {
  id: string;
  hostId: string;
  players: Record<string, PublicPlayer>;
  phase: GamePhase;
  matchDuration: number;
  tick: number;
  playerCount: number;
  cityEvents: CityEvent[];
}

export interface EventChoice {
  id: string;
  text: string;
  effects: Array<{ target: string; stat: string; change: number }>;
  karmaEffect: number;
  socialTrustEffect: number;
  communityImpactEffect: number;
}

export interface CityEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  affectedLocations: string[];
  startTick: number;
  duration: number;
  requiresChoice: boolean;
  choices?: EventChoice[];
}

export interface ActionResult {
  success: boolean;
  message: string;
  changes: Partial<CharacterState>;
  narrative?: string;
}

export interface PlayerResult {
  playerId: string;
  playerName: string;
  personaName: string;
  missionTitle: string;
  missionStatus: MissionStatus;
  finalState: CharacterState;
  socialTrust: number;
  communityImpact: number;
  score: number;
  rank: number;
  journey: GameEvent[];
  majorDecisions: string[];
  cooperationCount: number;
  helpedCount: number;
  narrative: string;
  dilemmasResolved: DilemmaRecord[];
  personaLens?: string[];
}

export interface MatchResult {
  winnerId?: string;
  winnerName?: string;
  playerResults: PlayerResult[];
  matchDurationActual: number;
  totalTicks: number;
  highlightEvents: GameEvent[];
}

export type UIScreen = 'landing' | 'lobby' | 'briefing' | 'game' | 'results';

interface GameState {
  // Connection
  socket: Socket | null;
  connected: boolean;
  mySocketId: string | null;

  // Room
  roomId: string | null;
  room: PublicRoom | null;

  // My player (private)
  myPlayer: Player | null;

  // Game state
  screen: UIScreen;
  lastActionResult: ActionResult | null;
  actionFeedback: string | null;
  pendingCityEvent: CityEvent | null;
  pendingDilemma: DilemmaEvent | null;
  matchResult: MatchResult | null;

  // Selected persona panel
  viewingPersonaId: string | null;

  // Actions
  connect: () => void;
  createRoom: (name: string, duration: number) => void;
  joinRoom: (roomId: string, name: string) => void;
  setReady: () => void;
  startMatch: () => void;
  submitAction: (type: ActionType, payload: Record<string, unknown>) => void;
  respondToEvent: (eventId: string, choiceId: string) => void;
  respondToDilemma: (dilemmaId: string, choiceId: string, choiceLabel: string) => void;
  setViewingPersona: (id: string | null) => void;
  clearFeedback: () => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  connected: false,
  mySocketId: null,
  roomId: null,
  room: null,
  myPlayer: null,
  screen: 'landing',
  lastActionResult: null,
  actionFeedback: null,
  pendingCityEvent: null,
  pendingDilemma: null,
  matchResult: null,
  viewingPersonaId: null,

  connect: () => {
    if (get().socket?.connected) return;

    const socket = io(SERVER_URL, { autoConnect: true, transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      set({ connected: true, mySocketId: socket.id || null });
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    socket.on('joinedRoom', ({ roomId }: { roomId: string }) => {
      set({ roomId, screen: 'lobby' });
    });

    socket.on('roomUpdate', (room: PublicRoom) => {
      set({ room });
    });

    socket.on('gameStarted', ({ yourPlayer, room }: { yourPlayer: Player; room: PublicRoom }) => {
      set({ myPlayer: yourPlayer, room, screen: 'briefing' });
      // Auto-transition to game after briefing
      setTimeout(() => set({ screen: 'game' }), 5000);
    });

    socket.on('playerUpdate', (player: Player) => {
      set({ myPlayer: player });
    });

    socket.on('actionResult', (result: ActionResult) => {
      set({
        lastActionResult: result,
        actionFeedback: result.message
      });
      setTimeout(() => set({ actionFeedback: null }), 3000);
    });

    socket.on('cityEvent', (event: CityEvent) => {
      if (event.requiresChoice) {
        set({ pendingCityEvent: event });
      }
    });

    socket.on('dilemmaEvent', (event: DilemmaEvent) => {
      set({ pendingDilemma: event });
    });

    socket.on('gameEnded', (result: MatchResult) => {
      set({ matchResult: result, screen: 'results' });
    });

    socket.on('error', (msg: string) => {
      set({ actionFeedback: `Error: ${msg}` });
      setTimeout(() => set({ actionFeedback: null }), 4000);
    });

    set({ socket });
  },

  createRoom: (name, duration) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('createRoom', { playerName: name, matchDuration: duration });
  },

  joinRoom: (roomId, name) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('joinRoom', { roomId: roomId.toUpperCase(), playerName: name });
  },

  setReady: () => {
    get().socket?.emit('ready');
  },

  startMatch: () => {
    get().socket?.emit('startMatch');
  },

  submitAction: (type, payload) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('submitAction', { type, payload });
  },

  respondToEvent: (eventId, choiceId) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('submitAction', { type: 'event_choice', payload: { eventId, choiceId } });
    set({ pendingCityEvent: null });
  },

  respondToDilemma: (dilemmaId, choiceId, choiceLabel) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('submitAction', { type: 'dilemma_choice', payload: { dilemmaId, choiceId, choiceLabel } });
    set({ pendingDilemma: null });
  },

  setViewingPersona: (id) => set({ viewingPersonaId: id }),

  clearFeedback: () => set({ actionFeedback: null, lastActionResult: null })
}));
