// Core game types shared between client and server

export type TransportMode = 'walk' | 'bus' | 'metro' | 'tram' | 'taxi';

export interface Location {
  id: string;
  name: string;
  district: string;
  type: 'transport' | 'food' | 'shop' | 'office' | 'medical' | 'public' | 'residential' | 'education';
  x: number;
  y: number;
  resources: Partial<Record<string, number>>;
  description: string;
}

export interface Route {
  from: string;
  to: string;
  modes: TransportMode[];
  travelTime: Record<TransportMode, number>; // in seconds
  cost: Record<TransportMode, number>; // in rupees
}

// --- Persona System ---

export type TraitKey =
  | 'analyticalThinking'
  | 'emotionalSensitivity'
  | 'appetite'
  | 'workOrientation'
  | 'spendingStyle'
  | 'socialOrientation'
  | 'riskTolerance'
  | 'resilience'
  | 'adaptability'
  | 'cooperation';

export type MotivationKey =
  | 'careerAdvancement'
  | 'financialSecurity'
  | 'socialAcceptance'
  | 'personalIndependence'
  | 'familyResponsibility'
  | 'fairness'
  | 'helpingOthers'
  | 'achievement'
  | 'comfort';

export type FoodPreference = 'street' | 'restaurant' | 'vegetarian' | 'meat' | 'sweet' | 'spicy' | 'any';

export interface PersonaTraits {
  analyticalThinking: number; // 1-10
  emotionalSensitivity: number; // 1-10
  appetite: number; // 1-10 (1=small, 10=very hungry often)
  workOrientation: number; // 1-10
  spendingStyle: number; // 1-10 (1=frugal, 10=lavish)
  socialOrientation: number; // 1-10 (1=loner, 10=social)
  riskTolerance: number; // 1-10
  resilience: number; // 1-10
  adaptability: number; // 1-10
  cooperation: number; // 1-10
}

export interface PersonaMotivations {
  careerAdvancement: number; // 1-10
  financialSecurity: number; // 1-10
  socialAcceptance: number; // 1-10
  personalIndependence: number; // 1-10
  familyResponsibility: number; // 1-10
  fairness: number; // 1-10
  helpingOthers: number; // 1-10
  achievement: number; // 1-10
  comfort: number; // 1-10
}

export interface PersonaSocialContext {
  class: 'working' | 'lower-middle' | 'middle' | 'upper-middle' | 'privileged';
  communityIdentity: string;
  politicalPressures: string[];
  hiddenObligations: string[];
  decisionWeights: {
    groupLoyalty: number;      // 1-10
    selfPreservation: number;  // 1-10
    principledAction: number;  // 1-10
    statusAnxiety: number;     // 1-10
    communityDuty: number;     // 1-10
  };
  insightLines: string[];      // shown post-game in Persona Lens
  dilemmaProfile: string;      // one-line descriptor
}

export interface PersonaDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  backstory: string;
  traits: PersonaTraits;
  motivations: PersonaMotivations;
  foodPreferences: FoodPreference[];
  startingCash: number;
  startingEnergy: number;
  traitInteractions: string[];
  strengths: string[];
  vulnerabilities: string[];
  // Mechanical modifiers
  modifiers: PersonaModifiers;
  // Social/political context (optional, enriches dilemma resolution + post-game lens)
  socialContext?: PersonaSocialContext;
}

export interface PersonaModifiers {
  hungerRate: number;        // multiplier for hunger increase rate
  energyRecovery: number;    // multiplier for energy recovery from rest
  moodFromFood: number;      // bonus mood from preferred food
  stressFromWork: number;    // multiplier for stress when working
  moodFromSocial: number;    // mood change from positive social interactions
  analyticsBonus: number;    // bonus info from analytical actions
  spendingResistance: number;// multiplier for spending actions (>1 = resists, <1 = spends more)
  socialRecovery: number;    // mood recovery from social interactions
  riskRewardBonus: number;   // extra reward on successful risk actions
  cooperationBonus: number;  // bonus effectiveness when cooperating
  stressThreshold: number;   // stress level at which penalties begin
  independencePenalty: number; // mood penalty for relying on others repeatedly
}

// --- Character State (dynamic) ---

export interface CharacterState {
  health: number;    // 0-100
  energy: number;    // 0-100
  hunger: number;    // 0-100 (0=full, 100=starving)
  hydration: number; // 0-100 (0=hydrated, 100=parched)
  mood: number;      // 0-100
  stress: number;    // 0-100
  cash: number;
  location: string;  // location id
  helpedOthersCount: number;
  receivedHelpCount: number;
  lastMealTime: number; // game tick
  overeatingPenalty: number; // energy penalty from overeating
}

// --- Mission System ---

export type MissionStatus = 'active' | 'completed' | 'failed' | 'partial';

export interface MissionObjective {
  id: string;
  description: string;
  completed: boolean;
  optional: boolean;
  reward?: Partial<CharacterState>;
}

export interface MissionDefinition {
  id: string;
  title: string;
  narrative: string;
  startLocationOptions: string[];
  primaryObjective: string;
  objectives: Omit<MissionObjective, 'completed'>[];
  deadline: number; // in game ticks
  startingResources?: Partial<CharacterState>;
  complications: string[];
  alternativePaths: string[];
  partialSuccessCondition?: string;
  failureCondition: string;
  requiredLocations?: string[];
  blockedBy?: string[];
}

export interface PlayerMission {
  definition: MissionDefinition;
  status: MissionStatus;
  objectives: MissionObjective[];
  startTick: number;
  completedTick?: number;
  partialProgress: number; // 0-100
  journeyNotes: string[];
}

// --- Multiplayer ---

export interface Player {
  id: string;
  socketId: string;
  name: string;
  persona: PersonaDefinition;
  state: CharacterState;
  mission: PlayerMission;
  socialTrust: number;       // 0-100, public
  communityImpact: number;   // -50 to +50, public
  hidden: {
    karma: number;           // -100 to +100, server-only
    karmaActions: number;    // count for anti-farming
    lastKarmaActionTick: number;
  };
  actionLog: GameEvent[];
  dilemmasResolved: DilemmaRecord[];
  activeDilemmaId?: string;  // pending dilemma waiting for player response
  isConnected: boolean;
  isReady: boolean;
}

export type GamePhase = 'lobby' | 'briefing' | 'playing' | 'ended';

export interface Room {
  id: string;
  hostId: string;
  players: Record<string, Player>;
  phase: GamePhase;
  matchDuration: number; // seconds (300, 600, 1200)
  startTime?: number;
  endTime?: number;
  tick: number;          // game tick (incremented by server)
  gameSpeed: number;     // ticks per second
  cityEvents: CityEvent[];
  pendingInteractions: InteractionRequest[];
  matchResult?: MatchResult;
  seed: number;          // for reproducible randomness
}

// --- Social Dilemmas ---

export type SocialDilemmaType =
  | 'ethics_vs_survival'
  | 'loyalty_vs_principle'
  | 'class_encounter'
  | 'political_pressure'
  | 'community_obligation'
  | 'bystander';

export interface DilemmaChoice {
  id: string;
  text: string;
  shortLabel: string;
  statChanges: Partial<CharacterState>;
  karmaChange: number;
  trustChange: number;
  communityChange: number;
  conscienceEffect: number;  // mood change reflecting inner conflict
  narrativeOutcome: string;
  personaResonance?: Record<string, 'natural' | 'against' | 'neutral'>;
}

export interface SocialDilemma {
  id: string;
  title: string;
  setup: string;
  dilemmaType: SocialDilemmaType;
  choices: DilemmaChoice[];
  triggerLocation?: string;
  minTick?: number;
  maxTick?: number;
  probabilityPerTick: number;
  personaContext: Record<string, string>;  // per-persona explanation of natural lean
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

// --- City Events ---

export type CityEventType =
  | 'weather'
  | 'transport_disruption'
  | 'resource_shortage'
  | 'opportunity'
  | 'npc_request'
  | 'crowd'
  | 'emergency'
  | 'cultural'
  | 'market'
  | 'heat';

export interface CityEvent {
  id: string;
  type: CityEventType;
  title: string;
  description: string;
  affectedLocations: string[];
  startTick: number;
  duration: number;      // in ticks
  effects: EventEffect[];
  requiresChoice: boolean;
  choices?: EventChoice[];
}

export interface EventEffect {
  target: 'all' | string; // 'all' or player id or location id
  stat: string;
  change: number;
  condition?: string;
}

export interface EventChoice {
  id: string;
  text: string;
  effects: EventEffect[];
  karmaEffect: number;
  socialTrustEffect: number;
  communityImpactEffect: number;
}

// --- Actions ---

export type ActionType =
  | 'move'
  | 'eat'
  | 'drink'
  | 'rest'
  | 'work'
  | 'buy'
  | 'help_player'
  | 'request_help'
  | 'share_info'
  | 'transfer_money'
  | 'complete_objective'
  | 'event_choice'
  | 'dilemma_choice';

export interface GameAction {
  playerId: string;
  type: ActionType;
  payload: Record<string, unknown>;
  tick: number;
}

export interface ActionResult {
  success: boolean;
  message: string;
  changes: Partial<CharacterState>;
  narrative?: string;
  karmaChange?: number;    // server-only, not sent to client
  trustChange?: number;
  communityChange?: number;
  objectiveProgress?: string[];
}

// --- Game Events (log) ---

export interface GameEvent {
  id: string;
  tick: number;
  type: ActionType | 'city_event' | 'mission_update' | 'system';
  playerId?: string;
  description: string;
  statChanges?: Partial<CharacterState>;
  isPublic: boolean;      // visible to other players
}

// --- End of Game ---

export interface DilemmaRecord {
  dilemmaId: string;
  dilemmaTitle: string;
  choiceId: string;
  choiceLabel: string;
  tick: number;
}

export interface ScoreBreakdown {
  missionPoints: number;
  optionalBonus: number;
  cashBonus: number;
  trustBonus: number;
  communityBonus: number;
  total: number;
}

export interface PerformanceInsight {
  category: 'strength' | 'weakness' | 'tip';
  text: string;
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
  scoreBreakdown: ScoreBreakdown;
  performanceInsights: PerformanceInsight[];
}

export interface MatchResult {
  winnerId?: string;
  winnerName?: string;
  playerResults: PlayerResult[];
  matchDurationActual: number;
  totalTicks: number;
  highlightEvents: GameEvent[];
}

// --- Socket Events ---

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  tick: number;
  target: 'all' | string; // 'all' or a specific player id
  timestamp: number;
}

export interface GameNotification {
  id: string;
  tick: number;
  type: 'action' | 'event' | 'fortune' | 'warning' | 'chat' | 'system' | 'dilemma' | 'proximity';
  text: string;
  playerId?: string;
  playerName?: string;
  isPrivate: boolean;
}

export interface ServerToClientEvents {
  roomUpdate: (room: Omit<Room, 'players'> & { players: Record<string, PublicPlayer> }) => void;
  playerUpdate: (player: Player) => void;
  actionResult: (result: ActionResult) => void;
  cityEvent: (event: CityEvent) => void;
  dilemmaEvent: (event: DilemmaEvent) => void;
  gameStarted: (data: { yourPlayer: Player; room: PublicRoom }) => void;
  gameEnded: (result: MatchResult) => void;
  error: (message: string) => void;
  tick: (tick: number) => void;
  interactionRequest: (request: InteractionRequest) => void;
  chatMessage: (msg: ChatMessage) => void;
  chatReaction: (reaction: { messageId: string; emoji: string; fromPlayerId: string; fromPlayerName: string }) => void;
  playerEmote: (data: { playerId: string; playerName: string; emoji: string }) => void;
  gameNotification: (notification: GameNotification) => void;
  briefingComplete: () => void;
  joinedRoom: (data: { roomId: string }) => void;
}

export interface ClientToServerEvents {
  joinRoom: (data: { roomId: string; playerName: string }) => void;
  createRoom: (data: { playerName: string; matchDuration: number }) => void;
  startMatch: () => void;
  submitAction: (action: Omit<GameAction, 'tick'>) => void;
  respondToInteraction: (data: { requestId: string; accept: boolean }) => void;
  setGameSpeed: (data: { speed: number }) => void;
  chatReaction: (data: { messageId: string; emoji: string }) => void;
  playerEmote: (data: { emoji: string }) => void;
  ready: () => void;
  readyToPlay: () => void;
  sendChat: (data: { text: string; target: 'all' | string }) => void;
}

export interface InteractionRequest {
  id: string;
  fromPlayerId: string;
  fromPlayerName: string;
  type: 'help_request' | 'money_transfer' | 'info_share';
  message: string;
  amount?: number;
  expiresAtTick: number;
}

// --- Public views (safe to send to clients) ---
export type PublicPlayer = Omit<Player, 'hidden'> & {
  mission: Omit<PlayerMission, 'definition'> & { title: string; status: MissionStatus };
};

export type PublicRoom = Omit<Room, 'players'> & {
  players: Record<string, PublicPlayer>;
  playerCount: number;
};
