# In Their Shoes — Kolkata City Survival

A real-time multiplayer web game where players step into the lives of people navigating survival in Kolkata. Each player is assigned a unique persona — a street vendor, a rickshaw puller, a domestic worker, a student — and must make real decisions about food, shelter, work, health, and community while racing against the clock to complete a personal mission.

The game is designed to build empathy by forcing players to experience systemic inequality firsthand. Every choice has consequences. Helping others costs energy you might need. Skipping a meal saves money but drains health. The city throws events at you — monsoons, market crashes, festivals — and you adapt or fall behind.

## Quick Start

```bash
# Install dependencies (npm workspaces)
npm install

# Run both server and client in dev mode
npm run dev

# Server runs on http://localhost:3001
# Client runs on http://localhost:5173
```

### Production Build

```bash
npm run build       # Builds both server and client
npm start           # Starts the production server
```

### Tests

```bash
npm test            # Runs server (Jest) + client (Vitest) tests
```

## How to Play

1. **Create or join a room** — share the 4-character room code with friends
2. **Lobby** — host sets game speed (0.5x to 2x), everyone marks ready
3. **Briefing** — read your persona's backstory and mission objectives
4. **Tutorial** — optional walkthrough of the UI (skip if returning player)
5. **Play** — navigate the city, manage resources, complete objectives, help others
6. **Results** — see final scores, ranks, mission outcomes, and share your results

## Architecture

```
in-their-shoes-game/
├── client/               React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/   130 UI components
│   │   ├── game/         Client game data (map, sounds, achievements)
│   │   └── store/        Zustand state management
│   └── index.html
├── server/               Node.js + Express + Socket.io
│   └── src/
│       ├── game/         Engine, types, personas, missions, map
│       ├── handlers/     Room & socket event handlers
│       └── content/      Dynamic content loader
└── package.json          Workspaces root
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Zustand |
| Backend | Node.js, Express, Socket.io |
| State sync | Socket.io real-time events |
| Audio | Web Audio API (synthesized, no asset files) |
| Testing | Jest (server), Vitest (client) |
| Build | npm workspaces, `concurrently` for dev |

### Key Design Decisions

- **No external assets** — all audio is synthesized via Web Audio API oscillators, all icons are emoji/unicode, all styling is inline CSS with CSS custom properties for theming
- **Server-authoritative** — the game engine runs on the server; clients send actions, server resolves them and broadcasts state
- **Seeded RNG** — deterministic random events using a seeded PRNG, ensuring fair gameplay across all players
- **Persona-driven balance** — each persona has different starting stats, cash, and energy, creating asymmetric but fair gameplay

## Game Systems

### Core Loop
Each game tick (1 per second at 1x speed), the server runs resource drain (hunger, energy, hydration decay), checks mission progress, spawns city events, and resolves queued actions. A full match runs 600 ticks per in-game day.

### 12 Player Actions
`move` | `eat` | `drink` | `rest` | `work` | `buy` | `help_player` | `share_info` | `transfer_money` | `complete_objective` | `event_choice` | `dilemma_choice`

### Content
- **12 unique personas** with distinct backstories, traits, starting conditions
- **8 missions** with branching objectives, deadlines, alternative paths, and complications
- **25+ city locations** across Kolkata districts (transport, food, shops, offices, medical, public, residential, education)
- **Dynamic city events** — monsoons, strikes, festivals, market crashes
- **Social dilemmas** — moral choices that affect trust, community impact, and karma

### Scoring
Final score combines mission completion, resource management, social trust, community impact, karma, and dilemmas resolved. Players are ranked and can share results as a downloadable image card.

## Game Screens

| Screen | What it does |
|--------|-------------|
| **Landing** | Create/join rooms, game history stats |
| **Lobby** | Player list, speed settings, ready state, tips |
| **Briefing** | Persona reveal, mission objectives, city context |
| **Game (8 tabs)** | Map, Character, Mission, Players, Chat, Feed, Journey, Achievements |
| **Results** | Scores, ranks, mission outcomes, share card |

## Development

### Environment Variables
None required for development — the server defaults to port 3001 and the client proxies `/socket.io` to it via Vite config.

### Project Structure Details

**Server** (3,676 lines across 6 core files):
- `engine.ts` — game tick, action resolution, event spawning, karma system
- `types.ts` — all TypeScript interfaces (Player, Room, Mission, etc.)
- `room.ts` — Socket.io handlers, room lifecycle, state broadcasting
- `map.ts` — location graph, route finding, district data
- `personas.ts` — 12 persona definitions with traits and backstories
- `missions.ts` — 8 mission definitions with objectives and alternative paths

**Client** (17,500+ lines across 130 components):
- Core gameplay: `GameScreen`, `CityMap`, `ActionPanel`, `CharacterPanel`
- Social: `ChatPanel`, `PlayersPanel`, `DilemmaModal`, `InteractionModal`
- HUD: `MissionHUD`, `MatchTimeline`, `StatusEffectsBar`, `ConnectionQuality`
- Insights: `EmpathyMap`, `SystemicInsights`, `PrivilegeMeter`, `InequalityIndex`
- Polish: `AmbientOverlay`, `DayNightCycle`, `FloatingNumbers`, `CityNewsTicker`

## License

Private project.
