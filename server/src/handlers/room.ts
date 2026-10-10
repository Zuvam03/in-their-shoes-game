import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import type {
  Room, Player, GameAction, ActionResult, GameEvent, PublicRoom, PublicPlayer, CharacterState,
  SocialDilemma, ChatMessage, GameNotification, InteractionRequest
} from '../game/types';
import { PERSONAS, shufflePersonas } from '../game/personas';
import { MISSIONS, shuffleMissions } from '../game/missions';
import { LOCATIONS } from '../game/map';
import {
  createCharacterState, tickCharacterState, resolveAction, evaluateKarma,
  checkForUnexpectedFortune, generateCityEvent, calculateMatchResult, SeededRng,
  pickDilemmaForTick, buildDilemmaEvent, checkForDeath, generateDeathNarrative,
  getLowStateBlockReason
} from '../game/engine';
import { loadContent, getContentDilemmas, getContentPersonas } from '../content/loader';

loadContent();

const rooms = new Map<string, Room>();
const playerToRoom = new Map<string, string>(); // socketId -> roomId

const TICK_INTERVAL_MS = 1000;
const roomIntervals = new Map<string, NodeJS.Timeout>();
const roomBriefingTimers = new Map<string, NodeJS.Timeout>();
const roomPrevLocations = new Map<string, Map<string, string>>();

export function setupRoomHandlers(io: Server, socket: Socket): void {
  socket.on('createRoom', ({ playerName, matchDuration = 600, gameSpeed = 1 }) => {
    const roomId = generateRoomCode();
    const seed = Date.now();
    const validSpeed = [0.5, 1, 1.5, 2].includes(gameSpeed) ? gameSpeed : 1;
    const room: Room = {
      id: roomId,
      hostId: socket.id,
      players: {},
      phase: 'lobby',
      matchDuration,
      tick: 0,
      gameSpeed: validSpeed,
      cityEvents: [],
      pendingInteractions: [],
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
    const normalizedId = roomId.toUpperCase();
    const room = rooms.get(normalizedId);
    if (!room) {
      socket.emit('error', 'Room not found. Check the code and try again.');
      return;
    }

    // Reconnection: if game is in progress, find disconnected player by name
    if (room.phase === 'playing' || room.phase === 'briefing') {
      const disconnected = Object.values(room.players).find(
        p => p.name === playerName && !p.isConnected
      );
      if (disconnected) {
        const oldId = disconnected.id;
        // Migrate player to new socket
        disconnected.id = socket.id;
        disconnected.socketId = socket.id;
        disconnected.isConnected = true;
        room.players[socket.id] = disconnected;
        delete room.players[oldId];

        playerToRoom.set(socket.id, normalizedId);
        socket.join(normalizedId);

        socket.emit('joinedRoom', { roomId: normalizedId });
        if (room.phase === 'playing') {
          socket.emit('gameStarted', { yourPlayer: disconnected, room: toPublicRoom(room) });
          socket.emit('briefingComplete');
        } else {
          socket.emit('gameStarted', { yourPlayer: disconnected, room: toPublicRoom(room) });
        }
        io.to(normalizedId).emit('roomUpdate', toPublicRoom(room));
        console.log(`${playerName} reconnected to room ${normalizedId}`);
        return;
      }
      socket.emit('error', 'This match has already started. Enter the same name to reconnect.');
      return;
    }

    if (room.phase !== 'lobby') {
      socket.emit('error', 'This match has already ended.');
      return;
    }
    if (Object.keys(room.players).length >= 6) {
      socket.emit('error', 'Room is full (maximum 6 players).');
      return;
    }

    addPlayerToRoom(room, socket.id, playerName);
    playerToRoom.set(socket.id, normalizedId);

    socket.join(normalizedId);
    io.to(normalizedId).emit('roomUpdate', toPublicRoom(room));
    socket.emit('joinedRoom', { roomId: normalizedId });
    console.log(`${playerName} joined room ${normalizedId}`);
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

    // Block actions from dead players
    if (!player.isAlive) {
      socket.emit('actionResult', { success: false, message: 'You have collapsed. Your journey is over.', changes: {} });
      return;
    }

    // Check low-state blocks
    const blockReason = getLowStateBlockReason(player, rawAction.type);
    if (blockReason) {
      socket.emit('actionResult', { success: false, message: blockReason, changes: {} });
      return;
    }

    const action: GameAction = { ...rawAction, playerId: socket.id, tick: room.tick };
    const rng = new SeededRng(room.seed + room.tick);
    const result = resolveAction(action, player, room, rng);

    if (result.success) {
      // Create interaction request for request_help
      if (action.type === 'request_help') {
        const targetId = (action.payload as { targetPlayerId?: string }).targetPlayerId;
        const target = targetId ? room.players[targetId] : undefined;
        if (target && targetId) {
          const request: InteractionRequest = {
            id: uuidv4(),
            fromPlayerId: socket.id,
            fromPlayerName: player.name,
            type: 'help_request',
            message: `${player.name} is asking for your help.`,
            expiresAtTick: room.tick + 120
          };
          room.pendingInteractions.push(request);
          io.to(targetId).emit('interactionRequest', request);
          emitNotification(io, roomId, targetId, 'action', `${player.name} is asking for your help!`, room.tick, socket.id, player.name);
        }
      }

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

  socket.on('setGameSpeed', ({ speed }: { speed: number }) => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'lobby') return;
    if (room.hostId !== socket.id) {
      socket.emit('error', 'Only the host can change game speed.');
      return;
    }
    if ([0.5, 1, 1.5, 2].includes(speed)) {
      room.gameSpeed = speed;
      io.to(roomId).emit('roomUpdate', toPublicRoom(room));
    }
  });

  socket.on('chatReaction', ({ messageId, emoji }: { messageId: string; emoji: string }) => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'playing') return;
    const player = room.players[socket.id];
    if (!player) return;

    const allowed = ['👍', '❤️', '😂', '😮', '😢', '🔥'];
    if (!allowed.includes(emoji)) return;

    io.to(roomId).emit('chatReaction', {
      messageId,
      emoji,
      fromPlayerId: socket.id,
      fromPlayerName: player.name
    });
  });

  socket.on('playerEmote', ({ emoji }: { emoji: string }) => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'playing') return;
    const player = room.players[socket.id];
    if (!player) return;

    const allowed = ['👋', '😊', '😤', '🏃', '💪', '😩', '🙏', '🎉'];
    if (!allowed.includes(emoji)) return;

    io.to(roomId).emit('playerEmote', {
      playerId: socket.id,
      playerName: player.name,
      emoji
    });
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

  socket.on('respondToInteraction', ({ requestId, accept }: { requestId: string; accept: boolean }) => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'playing') return;
    const player = room.players[socket.id];
    if (!player) return;

    const idx = room.pendingInteractions.findIndex(r => r.id === requestId);
    if (idx === -1) return;
    const request = room.pendingInteractions[idx];

    // Only the target can respond — the request was emitted to a specific socket,
    // but we don't store targetSocketId on InteractionRequest so we verify via fromPlayerId
    if (request.fromPlayerId === socket.id) return; // requester can't respond to own request

    room.pendingInteractions.splice(idx, 1);
    const requester = room.players[request.fromPlayerId];
    if (!requester) return;

    if (accept) {
      const sameLocation = player.state.location === requester.state.location;
      const proximityBonus = sameLocation ? 1.5 : 1;

      player.state.energy = Math.max(0, player.state.energy - 5);
      player.socialTrust = Math.min(100, player.socialTrust + Math.round(3 * proximityBonus));
      player.communityImpact += Math.round(2 * proximityBonus);
      player.state.helpedOthersCount++;
      requester.state.mood = Math.min(100, requester.state.mood + Math.round(10 * proximityBonus));
      requester.state.receivedHelpCount++;

      const bonusText = sameLocation ? ' (proximity bonus!)' : '';
      io.to(request.fromPlayerId).emit('actionResult', {
        success: true,
        message: `${player.name} accepted your help request!${bonusText}`,
        changes: { mood: requester.state.mood }
      });
      io.to(request.fromPlayerId).emit('playerUpdate', requester);
      io.to(socket.id).emit('playerUpdate', player);

      emitNotification(io, roomId, request.fromPlayerId, 'action', `${player.name} helped you!${bonusText}`, room.tick, socket.id, player.name);
      emitNotification(io, roomId, socket.id, 'action', `You helped ${requester.name}.${bonusText}`, room.tick, socket.id, player.name);
    } else {
      io.to(request.fromPlayerId).emit('actionResult', {
        success: false,
        message: `${player.name} couldn't help right now.`,
        changes: {}
      });
    }
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

  // Assign personas (include content-loaded personas in the pool)
  const personas = shufflePersonas(playerIds.length, room.seed, getContentPersonas());
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
  const tickMs = Math.round(TICK_INTERVAL_MS / room.gameSpeed);
  const interval = setInterval(() => {
    if (room.phase !== 'playing') {
      clearInterval(interval);
      return;
    }

    room.tick++;
    const rng = new SeededRng(room.seed + room.tick);

    // Tick each player's character state
    for (const [socketId, player] of Object.entries(room.players)) {
      if (!player.isConnected || !player.isAlive) continue;

      const { newState, events } = tickCharacterState(player.state, player.persona, room.tick);
      player.state = newState;

      // Environmental effects — weather and night
      const isNightTime = room.tick > 0 && ((room.tick % 600) > 400);
      const activeWeather = room.cityEvents.some(e =>
        e.type === 'weather' &&
        e.startTick + e.duration > room.tick &&
        (e.affectedLocations.includes('all') || e.affectedLocations.includes(player.state.location))
      );
      const activeHeat = room.cityEvents.some(e =>
        e.type === 'heat' &&
        e.startTick + e.duration > room.tick &&
        (e.affectedLocations.includes('all') || e.affectedLocations.includes(player.state.location))
      );

      if (activeWeather) {
        player.state.hydration = Math.min(100, player.state.hydration + 0.15);
        player.state.mood = Math.max(0, player.state.mood - 0.08);
        if (room.tick % 60 === 0 && !events.length) {
          events.push('The rain makes everything harder.');
        }
      }
      if (activeHeat) {
        player.state.hydration = Math.min(100, player.state.hydration + 0.25);
        player.state.energy = Math.max(0, player.state.energy - 0.1);
        if (room.tick % 60 === 0 && !events.length) {
          events.push('The heat is draining you.');
        }
      }
      if (isNightTime) {
        player.state.stress = Math.min(100, player.state.stress + 0.08);
        player.state.energy = Math.max(0, player.state.energy - 0.05);
      }

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

      // Check for death
      if (checkForDeath(player)) {
        player.isAlive = false;
        player.deathTick = room.tick;
        player.mission.status = 'failed';

        const narrative = generateDeathNarrative(player, room.tick);

        player.actionLog.push({
          id: uuidv4(),
          tick: room.tick,
          type: 'system',
          playerId: socketId,
          description: `${player.name} has collapsed. ${narrative.cause}.`,
          isPublic: true
        });

        io.to(socketId).emit('playerDied', {
          playerId: socketId,
          playerName: player.name,
          personaTitle: player.persona.title,
          narrative
        });

        // Notify all other players
        for (const [otherId, other] of Object.entries(room.players)) {
          if (otherId === socketId || !other.isConnected) continue;
          emitNotification(io, room.id, otherId, 'death',
            `${player.name} (${player.persona.title}) has collapsed at ${narrative.lastLocation}.`,
            room.tick, socketId, player.name);
        }

        // Check if all players are dead — end match early
        const anyAlive = Object.values(room.players).some(p => p.isAlive && p.isConnected);
        if (!anyAlive) {
          io.to(socketId).emit('playerUpdate', player);
          endMatch(io, room);
          clearInterval(interval);
          return;
        }
      }

      // Send private player update
      io.to(socketId).emit('playerUpdate', player);
    }

    // Proximity notifications — detect arrivals and departures
    let prevLocs = roomPrevLocations.get(room.id);
    if (!prevLocs) {
      prevLocs = new Map();
      roomPrevLocations.set(room.id, prevLocs);
    }
    for (const [socketId, player] of Object.entries(room.players)) {
      if (!player.isConnected) continue;
      const prevLoc = prevLocs.get(socketId);
      const curLoc = player.state.location;
      if (prevLoc && prevLoc !== curLoc) {
        const locName = LOCATIONS.find(l => l.id === curLoc)?.name || curLoc;
        for (const [otherId, other] of Object.entries(room.players)) {
          if (otherId === socketId || !other.isConnected) continue;
          if (other.state.location === curLoc) {
            emitNotification(io, room.id, otherId, 'proximity',
              `${player.name} arrived at ${locName}`, room.tick, socketId, player.name);
          }
          if (other.state.location === prevLoc) {
            emitNotification(io, room.id, otherId, 'proximity',
              `${player.name} left your area`, room.tick, socketId, player.name);
          }
        }
      }
      prevLocs.set(socketId, curLoc);
    }

    // Clean up expired interaction requests
    room.pendingInteractions = room.pendingInteractions.filter(r => r.expiresAtTick > room.tick);

    // Generate city events (more frequent as time runs out)
    const timeProgress = room.tick / room.matchDuration;
    const eventChance = timeProgress > 0.75 ? 0.015 : timeProgress > 0.5 ? 0.012 : 0.008;
    const maxActive = timeProgress > 0.75 ? 4 : 3;
    if (rng.chance(eventChance) && room.cityEvents.filter(e => e.startTick + e.duration > room.tick).length < maxActive) {
      const activePlayers = Object.values(room.players).filter(p => p.isConnected);
      const event = generateCityEvent(room.tick, rng, activePlayers);
      room.cityEvents.push(event);
      io.to(room.id).emit('cityEvent', event);
      emitNotification(io, room.id, null, 'event', `${event.title}: ${event.description}`, room.tick);
    }

    // Time warnings
    const remaining = room.matchDuration - room.tick;
    if (remaining === 60) {
      emitNotification(io, room.id, null, 'warning', '1 minute remaining! Complete your objectives!', room.tick);
    } else if (remaining === 30) {
      emitNotification(io, room.id, null, 'warning', '30 seconds left! Final push!', room.tick);
    }

    // Check match time limit
    const elapsed = room.tick;
    if (elapsed >= room.matchDuration) {
      endMatch(io, room);
      clearInterval(interval);
      return;
    }

    // Broadcast tick and public room state
    io.to(room.id).emit('tick', room.tick);
    io.to(room.id).emit('roomUpdate', toPublicRoom(room));

  }, tickMs);

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
  roomPrevLocations.delete(room.id);

  const result = calculateMatchResult(room);
  room.matchResult = result;
  io.to(room.id).emit('gameEnded', result);
  console.log(`Match ended in room ${room.id}`);

  setTimeout(() => {
    rooms.delete(room.id);
    for (const [socketId, rId] of playerToRoom) {
      if (rId === room.id) playerToRoom.delete(socketId);
    }
    console.log(`Room ${room.id} cleaned up`);
  }, 5 * 60 * 1000);
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
    isAlive: true,
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
