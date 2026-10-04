import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import type {
  Room, Player, GameAction, ActionResult, GameEvent, PublicRoom, PublicPlayer, CharacterState,
  SocialDilemma, ChatMessage, GameNotification
} from '../game/types';
import { PERSONAS, shufflePersonas } from '../game/personas';
import { MISSIONS, shuffleMissions } from '../game/missions';
import { LOCATIONS } from '../game/map';
import {
  createCharacterState, tickCharacterState, resolveAction, evaluateKarma,
  checkForUnexpectedFortune, generateCityEvent, calculateMatchResult, SeededRng,
  pickDilemmaForTick, buildDilemmaEvent
} from '../game/engine';
import { loadContent, getContentDilemmas } from '../content/loader';

loadContent();

const rooms = new Map<string, Room>();
const playerToRoom = new Map<string, string>(); // socketId -> roomId

const TICK_INTERVAL_MS = 1000;
const roomIntervals = new Map<string, NodeJS.Timeout>();
const roomBriefingTimers = new Map<string, NodeJS.Timeout>();

export function setupRoomHandlers(io: Server, socket: Socket): void {
  socket.on('createRoom', ({ playerName, matchDuration = 600 }) => {
    const roomId = generateRoomCode();
    const seed = Date.now();
    const room: Room = {
      id: roomId,
      hostId: socket.id,
      players: {},
      phase: 'lobby',
      matchDuration,
      tick: 0,
      gameSpeed: 1,
      cityEvents: [],
      seed
    };
    rooms.set(roomId, room);

    // Add host as first player (no persona yet — assigned at game start)
    addPlayerToRoom(room, socket.id, playerName);
    playerToRoom.set(socket.id, roomId);

    socket.join(roomId);
    socket.emit('roomUpdate', toPublicRoom(room));
    socket.emit('joinedRoom', { roomId });
    console.log(`Room ${roomId} created by ${playerName}`);
  });

  socket.on('joinRoom', ({ roomId, playerName }) => {
    const room = rooms.get(roomId.toUpperCase());
    if (!room) {
      socket.emit('error', 'Room not found. Check the code and try again.');
      return;
    }
    if (room.phase !== 'lobby') {
      socket.emit('error', 'This match has already started.');
      return;
    }
    if (Object.keys(room.players).length >= 6) {
      socket.emit('error', 'Room is full (maximum 6 players).');
      return;
    }

    addPlayerToRoom(room, socket.id, playerName);
    playerToRoom.set(socket.id, roomId);

    socket.join(roomId);
    io.to(roomId).emit('roomUpdate', toPublicRoom(room));
    socket.emit('joinedRoom', { roomId });
    console.log(`${playerName} joined room ${roomId}`);
  });

  socket.on('ready', () => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'lobby') return;

    const player = room.players[socket.id];
    if (player) {
      player.isReady = true;
      io.to(roomId).emit('roomUpdate', toPublicRoom(room));
    }
  });

  socket.on('startMatch', () => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;
    if (room.hostId !== socket.id) {
      socket.emit('error', 'Only the host can start the match.');
      return;
    }
    if (Object.keys(room.players).length < 1) {
      socket.emit('error', 'Need at least 1 player to start.');
      return;
    }

    startMatch(io, room);
  });

  socket.on('submitAction', (rawAction: Omit<GameAction, 'tick'>) => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'playing') return;

    const player = room.players[socket.id];
    if (!player) return;

    const action: GameAction = { ...rawAction, playerId: socket.id, tick: room.tick };
    const rng = new SeededRng(room.seed + room.tick);
    const result = resolveAction(action, player, room, rng);

    if (result.success) {
      // Apply state changes
      applyStateChanges(player, result.changes);

      // Evaluate and apply karma (server-side only)
      const karmaChange = evaluateKarma(action, result, player, room.tick);
      player.hidden.karma = Math.max(-100, Math.min(100, player.hidden.karma + karmaChange));
      if (karmaChange !== 0) {
        player.hidden.karmaActions++;
        player.hidden.lastKarmaActionTick = room.tick;
      }

      // Apply trust and community changes
      if (result.trustChange) {
        player.socialTrust = Math.max(0, Math.min(100, player.socialTrust + result.trustChange));
      }
      if (result.communityChange) {
        player.communityImpact = Math.max(-50, Math.min(50, player.communityImpact + result.communityChange));
      }

      // Handle target player for help/transfer
      if (action.type === 'transfer_money' && result.success) {
        const targetId = (action.payload as { targetPlayerId?: string }).targetPlayerId;
        const target = targetId ? room.players[targetId] : undefined;
        if (target && targetId) {
          const amount = (action.payload as { amount?: number }).amount || 0;
          target.state.cash += amount;
          target.state.receivedHelpCount++;
          io.to(targetId).emit('playerUpdate', target);
        }
      }

      if (action.type === 'help_player' && result.success) {
        const targetId = (action.payload as { targetPlayerId?: string }).targetPlayerId;
        const target = targetId ? room.players[targetId] : undefined;
        if (target && targetId) {
          target.state.receivedHelpCount++;
          target.state.mood = Math.min(100, target.state.mood + 8);
          io.to(targetId).emit('playerUpdate', target);
        }
      }

      // Log event
      const event: GameEvent = {
        id: uuidv4(),
        tick: room.tick,
        type: action.type,
        playerId: socket.id,
        description: result.message,
        statChanges: result.changes,
        isPublic: ['help_player', 'transfer_money', 'share_info'].includes(action.type)
      };
      player.actionLog.push(event);

      // Handle dilemma choice resolution
      if (action.type === 'dilemma_choice') {
        const { dilemmaId, choiceId, choiceLabel } = action.payload as {
          dilemmaId: string; choiceId: string; choiceLabel: string;
        };
        const dilemmaTitle = ((player as Player & { _pendingDilemma?: SocialDilemma })._pendingDilemma)?.title || '';
        player.dilemmasResolved.push({ dilemmaId, dilemmaTitle, choiceId, choiceLabel, tick: room.tick });
        delete (player as Player & { _pendingDilemma?: SocialDilemma })._pendingDilemma;
        player.activeDilemmaId = undefined;
      }

      // Handle complete_objective
      if (action.type === 'complete_objective') {
        const objectiveId = (action.payload as { objectiveId?: string }).objectiveId;
        const obj = player.mission.objectives.find(o => o.id === objectiveId);
        if (obj && player.state.location) {
          // Check if at a valid location for this objective
          const mission = player.mission.definition;
          const atRequired = !mission.requiredLocations?.length ||
            mission.requiredLocations.includes(player.state.location);
          if (atRequired) {
            obj.completed = true;
            checkMissionStatus(player, room.tick);
          }
        }
      }
    }

    socket.emit('actionResult', result);
    socket.emit('playerUpdate', player);
    io.to(roomId).emit('roomUpdate', toPublicRoom(room));

    if (result.success) {
      emitNotification(io, roomId, socket.id, 'action', result.message, room.tick, socket.id, player.name);
      if (['help_player', 'transfer_money', 'share_info'].includes(action.type)) {
        emitNotification(io, roomId, null, 'action', `${player.name}: ${result.message}`, room.tick, socket.id, player.name);
      }
    }
  });

  socket.on('readyToPlay', () => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'briefing') return;

    const player = room.players[socket.id];
    if (player) player.isReady = true;

    const allReady = Object.values(room.players).every(p => p.isReady);
    if (allReady) {
      const timer = roomBriefingTimers.get(room.id);
      if (timer) { clearTimeout(timer); roomBriefingTimers.delete(room.id); }
      room.phase = 'playing';
      io.to(room.id).emit('briefingComplete');
      io.to(room.id).emit('roomUpdate', toPublicRoom(room));
      startGameLoop(io, room);
    }
  });

  socket.on('sendChat', ({ text, target }) => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'playing') return;
    const player = room.players[socket.id];
    if (!player) return;

    const sanitized = text.trim().slice(0, 200);
    if (!sanitized) return;

    const msg: ChatMessage = {
      id: uuidv4(),
      senderId: socket.id,
      senderName: player.name,
      text: sanitized,
      tick: room.tick,
      target,
      timestamp: Date.now()
    };

    if (target === 'all') {
      io.to(roomId).emit('chatMessage', msg);
    } else {
      socket.emit('chatMessage', msg);
      if (room.players[target]) {
        io.to(target).emit('chatMessage', msg);
      }
    }
  });

  socket.on('respondToInteraction', ({ requestId, accept }) => {
    // TODO: Handle interaction responses (help requests, trades)
  });

  socket.on('disconnect', () => {
    const roomId = playerToRoom.get(socket.id);
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        const player = room.players[socket.id];
        if (player) {
          player.isConnected = false;
          io.to(roomId).emit('roomUpdate', toPublicRoom(room));
        }
      }
      playerToRoom.delete(socket.id);
    }
  });
}

function startMatch(io: Server, room: Room): void {
  const playerIds = Object.keys(room.players);
  const rng = new SeededRng(room.seed);

  // Assign personas
  const personas = shufflePersonas(playerIds.length, room.seed);
  // Assign missions (unique per player)
  const missions = shuffleMissions(playerIds.length, room.seed);

  // Assign start locations from mission options
  const startLocations = LOCATIONS.filter(l =>
    ['transport', 'residential', 'public'].includes(l.type)
  );

  playerIds.forEach((socketId, i) => {
    const player = room.players[socketId];
    const persona = personas[i % personas.length];
    const mission = missions[i % missions.length];
    const startLocOptions = mission.startLocationOptions;
    const startLoc = startLocOptions[rng.between(0, startLocOptions.length - 1)] || 'esplanade';

    player.persona = persona;
    player.state = createCharacterState(persona, startLoc);

    // Apply mission starting resources
    if (mission.startingResources) {
      Object.assign(player.state, mission.startingResources);
    }

    player.mission = {
      definition: mission,
      status: 'active',
      objectives: mission.objectives.map(o => ({ ...o, completed: false })),
      startTick: 0,
      partialProgress: 0,
      journeyNotes: []
    };
  });

  room.phase = 'briefing';
  room.startTime = Date.now();
  room.tick = 0;

  // Send each player their private data
  for (const [socketId, player] of Object.entries(room.players)) {
    io.to(socketId).emit('gameStarted', {
      yourPlayer: player,
      room: toPublicRoom(room)
    });
  }

  // Reset ready flags so players must explicitly signal readyToPlay
  for (const p of Object.values(room.players)) p.isReady = false;

  // Fallback: auto-start after 2 minutes if players never signal ready
  const briefingTimer = setTimeout(() => {
    roomBriefingTimers.delete(room.id);
    if (room.phase !== 'briefing') return;
    room.phase = 'playing';
    io.to(room.id).emit('briefingComplete');
    io.to(room.id).emit('roomUpdate', toPublicRoom(room));
    startGameLoop(io, room);
  }, 120000);
  roomBriefingTimers.set(room.id, briefingTimer);
}

function startGameLoop(io: Server, room: Room): void {
  const interval = setInterval(() => {
    if (room.phase !== 'playing') {
      clearInterval(interval);
      return;
    }

    room.tick++;
    const rng = new SeededRng(room.seed + room.tick);

    // Tick each player's character state
    for (const [socketId, player] of Object.entries(room.players)) {
      if (!player.isConnected) continue;

      const { newState, events } = tickCharacterState(player.state, player.persona, room.tick);
      player.state = newState;

      // Log any state events and notify
      for (const evt of events) {
        player.actionLog.push({
          id: uuidv4(),
          tick: room.tick,
          type: 'system',
          playerId: socketId,
          description: evt,
          isPublic: false
        });
        emitNotification(io, room.id, socketId, 'warning', evt, room.tick);
      }

      // Check for unexpected fortune
      const fortune = checkForUnexpectedFortune(player, room, rng);
      if (fortune && fortune.statChanges) {
        applyStateChanges(player, fortune.statChanges as Partial<CharacterState>);
        player.actionLog.push(fortune);
        io.to(socketId).emit('playerUpdate', player);
        io.to(socketId).emit('actionResult', {
          success: true,
          message: fortune.description,
          changes: fortune.statChanges,
          narrative: fortune.description
        });
        emitNotification(io, room.id, socketId, 'fortune', fortune.description, room.tick, socketId, player.name);
      }

      // Fire social dilemma if eligible
      const dilemmas = getContentDilemmas();
      if (dilemmas.length > 0) {
        const dilemma = pickDilemmaForTick(dilemmas, player, room.tick, rng);
        if (dilemma) {
          (player as Player & { _pendingDilemma?: SocialDilemma })._pendingDilemma = dilemma;
          player.activeDilemmaId = dilemma.id;
          const evt = buildDilemmaEvent(dilemma, room.tick);
          io.to(socketId).emit('dilemmaEvent', evt);
          emitNotification(io, room.id, socketId, 'dilemma', `Dilemma: ${dilemma.title}`, room.tick);
        }
      }

      // Send private player update
      io.to(socketId).emit('playerUpdate', player);
    }

    // Generate city events occasionally
    if (rng.chance(0.008) && room.cityEvents.filter(e => e.startTick + e.duration > room.tick).length < 3) {
      const event = generateCityEvent(room.tick, rng);
      room.cityEvents.push(event);
      io.to(room.id).emit('cityEvent', event);
      emitNotification(io, room.id, null, 'event', `${event.title}: ${event.description}`, room.tick);
    }

    // Check match time limit
    const elapsed = room.tick; // 1 tick = 1 second
    if (elapsed >= room.matchDuration) {
      endMatch(io, room);
      clearInterval(interval);
      return;
    }

    // Broadcast tick and public room state
    io.to(room.id).emit('tick', room.tick);
    io.to(room.id).emit('roomUpdate', toPublicRoom(room));

  }, TICK_INTERVAL_MS);

  roomIntervals.set(room.id, interval);
}

function endMatch(io: Server, room: Room): void {
  room.phase = 'ended';
  const briefingTimer = roomBriefingTimers.get(room.id);
  if (briefingTimer) {
    clearTimeout(briefingTimer);
    roomBriefingTimers.delete(room.id);
  }
  const interval = roomIntervals.get(room.id);
  if (interval) {
    clearInterval(interval);
    roomIntervals.delete(room.id);
  }

  const result = calculateMatchResult(room);
  room.matchResult = result;
  io.to(room.id).emit('gameEnded', result);
  console.log(`Match ended in room ${room.id}`);
}

function addPlayerToRoom(room: Room, socketId: string, name: string): void {
  // Placeholder persona until game starts
  const placeholderPersona = PERSONAS[0];

  room.players[socketId] = {
    id: socketId,
    socketId,
    name,
    persona: placeholderPersona,
    state: createCharacterState(placeholderPersona, 'esplanade'),
    mission: {
      definition: { id: '', title: '', narrative: '', startLocationOptions: [], primaryObjective: '', objectives: [], deadline: 0, complications: [], alternativePaths: [], failureCondition: '' },
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
    isReady: false
  };
}

function emitNotification(
  io: Server, roomId: string, targetSocket: string | null,
  type: GameNotification['type'], text: string, tick: number,
  playerId?: string, playerName?: string
): void {
  const notif: GameNotification = {
    id: uuidv4(), tick, type, text,
    playerId, playerName,
    isPrivate: targetSocket !== null
  };
  if (targetSocket) {
    io.to(targetSocket).emit('gameNotification', notif);
  } else {
    io.to(roomId).emit('gameNotification', notif);
  }
}

function applyStateChanges(player: Player, changes: Partial<CharacterState>): void {
  const s = player.state;
  for (const [key, value] of Object.entries(changes)) {
    const k = key as keyof CharacterState;
    const maxValues: Record<string, number> = {
      health: 100, energy: 100, hunger: 100, hydration: 100, mood: 100, stress: 100,
      overeatingPenalty: 50
    };
    const minValues: Record<string, number> = {
      health: 0, energy: 0, hunger: 0, hydration: 0, mood: 0, stress: 0,
      cash: 0, overeatingPenalty: 0
    };

    if (typeof value === 'number') {
      let newVal = value;
      if (k in maxValues) newVal = Math.min(maxValues[k], newVal);
      if (k in minValues) newVal = Math.max(minValues[k], newVal);
      (s as unknown as Record<string, unknown>)[k] = newVal;
    } else {
      (s as unknown as Record<string, unknown>)[k] = value;
    }
  }
}

function checkMissionStatus(player: Player, tick: number): void {
  const mission = player.mission;
  const required = mission.objectives.filter(o => !o.optional);
  const allRequired = required.every(o => o.completed);
  const anyRequired = required.some(o => o.completed);

  if (allRequired && required.length > 0) {
    mission.status = 'completed';
    mission.completedTick = tick;
  } else if (anyRequired) {
    mission.status = 'partial';
    mission.partialProgress = Math.round((required.filter(o => o.completed).length / required.length) * 100);
  }
}

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function toPublicRoom(room: Room): PublicRoom {
  const publicPlayers: Record<string, PublicPlayer> = {};
  for (const [id, player] of Object.entries(room.players)) {
    const { hidden, ...publicPlayer } = player;
    publicPlayers[id] = {
      ...publicPlayer,
      mission: {
        ...player.mission,
        title: player.mission.definition.title,
        status: player.mission.status
      }
    };
  }

  return {
    ...room,
    players: publicPlayers,
    playerCount: Object.keys(room.players).length
  };
}
