import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { setVolume as setSoundVolume } from '../game/sounds';

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
  deadline: number;
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
  gameSpeed: number;
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

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  tick: number;
  target: 'all' | string;
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

export type UIScreen = 'landing' | 'lobby' | 'briefing' | 'game' | 'results';

const MAX_NOTIFICATIONS = 50;
const MAX_CHAT_MESSAGES = 100;
const RECONNECT_MAX_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY = 2000;

function saveSession(roomId: string, playerName: string) {
  try { sessionStorage.setItem('its_session', JSON.stringify({ roomId, playerName })); } catch {}
}
function loadSession(): { roomId: string; playerName: string } | null {
  try {
    const raw = sessionStorage.getItem('its_session');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function clearSession() {
  try { sessionStorage.removeItem('its_session'); } catch {}
}

interface GameState {
  // Connection
  socket: Socket | null;
  connected: boolean;
  mySocketId: string | null;
  reconnecting: boolean;
  reconnectAttempt: number;

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

  // Incoming interaction requests
  pendingInteraction: { id: string; fromPlayerName: string; type: string; message: string } | null;

  // Selected persona panel
  viewingPersonaId: string | null;

  // Chat
  chatMessages: ChatMessage[];
  chatReactions: Record<string, Array<{ emoji: string; fromPlayerName: string }>>;
  unreadChatCount: number;

  // Notifications
  notifications: GameNotification[];
  unreadNotifCount: number;

  // Settings
  soundEnabled: boolean;
  volume: number;

  // Action cooldown
  lastActionTick: number;

  // Stat trends (previous snapshot for comparison)
  prevStats: { health: number; energy: number; hunger: number; hydration: number; mood: number; stress: number; cash: number } | null;

  // Quick emotes
  playerEmotes: Record<string, { emoji: string; tick: number }>;

  // Actions
  connect: () => void;
  createRoom: (name: string, duration: number, gameSpeed?: number) => void;
  setGameSpeed: (speed: number) => void;
  joinRoom: (roomId: string, name: string) => void;
  setReady: () => void;
  startMatch: () => void;
  submitAction: (type: ActionType, payload: Record<string, unknown>) => void;
  respondToEvent: (eventId: string, choiceId: string) => void;
  respondToInteraction: (requestId: string, accept: boolean) => void;
  respondToDilemma: (dilemmaId: string, choiceId: string, choiceLabel: string) => void;
  dismissBriefing: () => void;
  setViewingPersona: (id: string | null) => void;
  clearFeedback: () => void;
  sendChat: (text: string, target: 'all' | string) => void;
  sendReaction: (messageId: string, emoji: string) => void;
  sendEmote: (emoji: string) => void;
  markChatRead: () => void;
  markNotifsRead: () => void;
  toggleSound: () => void;
  setVolume: (v: number) => void;
  playAgain: () => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  connected: false,
  mySocketId: null,
  reconnecting: false,
  reconnectAttempt: 0,
  roomId: null,
  room: null,
  myPlayer: null,
  screen: 'landing',
  lastActionResult: null,
  actionFeedback: null,
  pendingCityEvent: null,
  pendingInteraction: null,
  pendingDilemma: null,
  matchResult: null,
  viewingPersonaId: null,
  chatMessages: [],
  chatReactions: {},
  unreadChatCount: 0,
  lastActionTick: 0,
  prevStats: null,
  playerEmotes: {},
  notifications: [],
  unreadNotifCount: 0,
  soundEnabled: true,
  volume: 0.7,

  connect: () => {
    if (get().socket?.connected) return;

    const socket = io(SERVER_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: RECONNECT_MAX_ATTEMPTS,
      reconnectionDelay: RECONNECT_BASE_DELAY,
      reconnectionDelayMax: 10000
    });

    socket.on('connect', () => {
      const state = get();
      set({ connected: true, mySocketId: socket.id || null, reconnecting: false, reconnectAttempt: 0 });

      if (state.reconnecting && state.screen !== 'landing' && state.screen !== 'results') {
        const session = loadSession();
        if (session) {
          socket.emit('joinRoom', { roomId: session.roomId, playerName: session.playerName });
        }
      }
    });

    socket.on('disconnect', () => {
      const state = get();
      if (state.screen === 'game' || state.screen === 'briefing' || state.screen === 'lobby') {
        set({ connected: false, reconnecting: true });
      } else {
        set({ connected: false });
      }
    });

    socket.io.on('reconnect_attempt', (attempt: number) => {
      set({ reconnectAttempt: attempt });
    });

    socket.io.on('reconnect_failed', () => {
      set({ reconnecting: false, reconnectAttempt: 0 });
    });

    socket.on('joinedRoom', ({ roomId }: { roomId: string }) => {
      set({ roomId, screen: 'lobby' });
      const session = loadSession();
      if (session) saveSession(roomId, session.playerName);
    });

    socket.on('roomUpdate', (room: PublicRoom) => {
      set({ room });
    });

    socket.on('gameStarted', ({ yourPlayer, room }: { yourPlayer: Player; room: PublicRoom }) => {
      set({ myPlayer: yourPlayer, room, screen: 'briefing', chatMessages: [], notifications: [], unreadChatCount: 0, unreadNotifCount: 0 });
    });

    socket.on('briefingComplete', () => {
      set({ screen: 'game' });
    });

    socket.on('playerUpdate', (player: Player) => {
      const prev = get().myPlayer;
      if (prev) {
        set({
          myPlayer: player,
          prevStats: {
            health: prev.state.health,
            energy: prev.state.energy,
            hunger: prev.state.hunger,
            hydration: prev.state.hydration,
            mood: prev.state.mood,
            stress: prev.state.stress,
            cash: prev.state.cash
          }
        });
      } else {
        set({ myPlayer: player });
      }
    });

    socket.on('actionResult', (result: ActionResult) => {
      set(s => ({
        lastActionResult: result,
        actionFeedback: result.message,
        lastActionTick: s.room?.tick || 0
      }));
      setTimeout(() => set({ actionFeedback: null }), 3000);
    });

    socket.on('cityEvent', (event: CityEvent) => {
      if (event.requiresChoice) {
        set({ pendingCityEvent: event });
      }
    });

    socket.on('interactionRequest', (request: { id: string; fromPlayerName: string; type: string; message: string }) => {
      set({ pendingInteraction: request });
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

    socket.on('chatMessage', (msg: ChatMessage) => {
      set(s => ({
        chatMessages: [...s.chatMessages.slice(-(MAX_CHAT_MESSAGES - 1)), msg],
        unreadChatCount: s.unreadChatCount + 1
      }));
    });

    socket.on('chatReaction', (reaction: { messageId: string; emoji: string; fromPlayerName: string }) => {
      set(s => {
        const existing = s.chatReactions[reaction.messageId] || [];
        return {
          chatReactions: {
            ...s.chatReactions,
            [reaction.messageId]: [...existing, { emoji: reaction.emoji, fromPlayerName: reaction.fromPlayerName }]
          }
        };
      });
    });

    socket.on('playerEmote', (data: { playerId: string; playerName: string; emoji: string }) => {
      set(s => ({
        playerEmotes: {
          ...s.playerEmotes,
          [data.playerId]: { emoji: data.emoji, tick: s.room?.tick || 0 }
        }
      }));
      setTimeout(() => {
        set(s => {
          const emotes = { ...s.playerEmotes };
          delete emotes[data.playerId];
          return { playerEmotes: emotes };
        });
      }, 3000);
    });

    socket.on('gameNotification', (notif: GameNotification) => {
      set(s => ({
        notifications: [...s.notifications.slice(-(MAX_NOTIFICATIONS - 1)), notif],
        unreadNotifCount: s.unreadNotifCount + 1
      }));
    });

    set({ socket });
  },

  createRoom: (name, duration, gameSpeed = 1) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('createRoom', { playerName: name, matchDuration: duration, gameSpeed });
    saveSession('pending', name);
  },

  setGameSpeed: (speed) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('setGameSpeed', { speed });
  },

  joinRoom: (roomId, name) => {
    const { socket } = get();
    if (!socket) return;
    const normalized = roomId.toUpperCase();
    socket.emit('joinRoom', { roomId: normalized, playerName: name });
    saveSession(normalized, name);
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

  respondToInteraction: (requestId, accept) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('respondToInteraction', { requestId, accept });
    set({ pendingInteraction: null });
  },

  respondToDilemma: (dilemmaId, choiceId, choiceLabel) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('submitAction', { type: 'dilemma_choice', payload: { dilemmaId, choiceId, choiceLabel } });
    set({ pendingDilemma: null });
  },

  dismissBriefing: () => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('readyToPlay');
  },

  setViewingPersona: (id) => set({ viewingPersonaId: id }),

  clearFeedback: () => set({ actionFeedback: null, lastActionResult: null }),

  sendChat: (text, target) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('sendChat', { text, target });
  },

  sendReaction: (messageId, emoji) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('chatReaction', { messageId, emoji });
  },

  sendEmote: (emoji) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('playerEmote', { emoji });
  },

  markChatRead: () => set({ unreadChatCount: 0 }),

  markNotifsRead: () => set({ unreadNotifCount: 0 }),

  toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),

  setVolume: (v) => {
    set({ volume: v });
    setSoundVolume(v);
  },

  playAgain: () => {
    clearSession();
    set({
      roomId: null,
      room: null,
      myPlayer: null,
      screen: 'landing',
      lastActionResult: null,
      actionFeedback: null,
      pendingCityEvent: null,
      pendingInteraction: null,
      pendingDilemma: null,
      matchResult: null,
      viewingPersonaId: null,
      chatMessages: [],
      chatReactions: {},
      notifications: [],
      unreadChatCount: 0,
      unreadNotifCount: 0,
      lastActionTick: 0,
      prevStats: null,
      playerEmotes: {},
      reconnecting: false,
      reconnectAttempt: 0
    });
  }
}));
