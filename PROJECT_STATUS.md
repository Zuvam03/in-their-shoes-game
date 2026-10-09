# Project Status — In Their Shoes

> Last updated: 2026-10-09
> Branch: `claude/sweet-faraday-p2djac`
> Build: 207 modules | 691 KB / 179 KB gzipped | 133 components | 22 server tests passing

---

## BUILT — Core Game Engine (Server)

| Feature | Status | Files | Notes |
|---------|--------|-------|-------|
| Game tick loop (1/sec at 1x) | Done | `engine.ts` | Resource drain, event spawning, mission checks each tick |
| 12 player actions | Done | `engine.ts` | move, eat, drink, rest, work, buy, help_player, share_info, transfer_money, complete_objective, event_choice, dilemma_choice |
| Seeded RNG | Done | `engine.ts` | Deterministic randomness per room |
| Karma system | Done | `engine.ts` | Tracks moral choices, diminishing returns |
| Resource drain | Done | `engine.ts` | Hunger/energy/hydration decay per tick with persona modifiers |
| City event spawning | Done | `engine.ts` | Dynamic events (monsoon, strike, festival, market crash) |
| Social dilemma system | Done | `engine.ts` | Moral dilemmas with trust/karma consequences |
| Player interaction | Done | `engine.ts` | Help, share info, transfer money between players |
| Mission progress tracking | Done | `engine.ts` | Objective completion, partial progress, alternative paths |
| Score calculation | Done | `engine.ts` | Composite score: mission + resources + trust + karma + community |
| Room lifecycle | Done | `room.ts` | Create, join, ready, start, reconnect, end match, play again |
| Socket.io event handlers | Done | `room.ts` | All client-server events wired up |
| Public player sanitization | Done | `room.ts` | Strips hidden data before broadcasting |
| 12 personas | Done | `personas.ts` | Unique backstories, traits, starting conditions |
| 8 missions | Done | `missions.ts` | Branching objectives, deadlines, alternative paths, complications |
| 25+ city locations | Done | `map.ts` | Full Kolkata city graph with routes, districts, action availability |
| Type system | Done | `types.ts` | Player, Room, Mission, CityEvent, Dilemma, etc. |
| 22 unit tests | Done | `engine.test.ts` | Resource, karma, mission, map validation |

## BUILT — Game Flow (Client)

| Screen | Status | File | What to test |
|--------|--------|------|-------------|
| Landing page (cinematic) | Done | `Landing.tsx` | Animated title reveal, SVG skyline parallax, floating city particles, atmospheric gradients, feature cards |
| Lobby (atmospheric) | Done | `Lobby.tsx` | Atmospheric dark design, floating particles, persona gallery with radar charts, animated player cards |
| Briefing (dossier reveal) | Done | `Briefing.tsx` | 6-phase staged reveal, typewriter name, animated trait bars, strengths/vulnerabilities, mission card with objectives |
| Tutorial overlay | Done | `TutorialOverlay.tsx` | Step-by-step walkthrough, skip button |
| Game screen (mobile + desktop) | Done | `GameScreen.tsx` | 8-tab interface, header stats, responsive layout |
| Results screen (cinematic) | Done | `ResultsScreen.tsx` | 7-phase staged reveal, animated counters, confetti, typewriter narrative |

## BUILT — 8 Game Tabs

| Tab | Key | Status | Components | What to test |
|-----|-----|--------|------------|-------------|
| Map | 1 | Done | `CityMap`, `LocationDetail`, `RadialActionMenu`, `Minimap` | Click locations, radial action wheel, animated travel, fog-of-war |
| Character | 2 | Done | `CharacterPanel`, `ActionPanel` | Stats bars, persona info, execute actions |
| Mission | 3 | Done | `MissionPanel`, `MissionHUD` | Objectives checklist, progress, deadline |
| Players | 4 | Done | `PlayersPanel`, `PlayerComparison` | Other players' public stats, comparison |
| Chat | 5 | Done | `ChatPanel`, `QuickEmoteBar` | Send messages, emotes, unread badge |
| Event Feed | 6 | Done | `EventFeed`, `NotificationCenter` | Game notifications, event history |
| Journey | 7 | Done | `JourneyTimeline`, `NarrativeJournal` | Action timeline, narrative entries |
| Achievements | 8 | Done | `AchievementGallery`, `AchievementProgress` | 13 achievements with progress bars |

## BUILT — HUD & Overlays

| Feature | Status | Component | What to test |
|---------|--------|-----------|-------------|
| Day/night cycle | Done | `DayNightCycle` | Visual indicator changes through day |
| Match timeline | Done | `MatchTimeline` | Time bar with day markers, deadline |
| Status effects | Done | `StatusEffectsBar` | Active buffs/debuffs with icons |
| Floating numbers | Done | `FloatingNumbers` | +/- animations on stat changes |
| Action result toast | Done | `ActionResultToast` | Success/fail feedback popup |
| Achievement toast | Done | `AchievementToast` | Unlock notification with confetti |
| Cinematic dilemma modal | Done | `DilemmaModal` | Full-screen letterboxed moral choice with typewriter text, heartbeat, consequence ripples |
| City event cinematic | Done | `CityEventCinematic` | Dramatic slide-in banner when city events start, auto-dismiss |
| Interaction modal | Done | `InteractionModal` | Player-to-player interaction UI |
| City news ticker | Done | `CityNewsTicker` | Scrolling event headlines |
| Ambient overlay | Done | `AmbientOverlay` | Time-of-day color/mood overlay |
| Connection status | Done | `ConnectionStatus` | Reconnecting/disconnected banner |
| Connection quality | Done | `ConnectionQuality` | Signal bars in header (good/fair/poor) |
| Pause menu | Done | `PauseMenu` | Game stats, sound, shortcuts, resume/quit |
| Weather widget | Done | `WeatherWidget` | Current weather conditions |
| Contextual hints | Done | `ContextualHints` | Smart tips based on player state |
| Keyboard shortcuts | Done | `KeyboardShortcuts` | 1-8 tab switch, M/C quick keys, Esc close |
| Quick actions | Done | `QuickActions` | Floating action buttons on map |
| Reflection prompt | Done | `ReflectionPrompt` | Periodic "how are you feeling?" prompts |
| Day summary | Done | `DaySummary` | End-of-day recap popup |
| Mood ring | Done | `MoodRing` | Emoji mood indicator in header |

## BUILT — Insight & Analytics Widgets

| Feature | Status | Component | What to test |
|---------|--------|-----------|-------------|
| Empathy map | Done | `EmpathyMap` | Visual breakdown of empathy actions |
| Privilege meter | Done | `PrivilegeMeter` | Persona privilege awareness |
| Inequality index | Done | `InequalityIndex` | City-wide inequality visualization |
| Systemic insights | Done | `SystemicInsights` | Systemic barriers explanation |
| Community impact | Done | `CommunityBoard`, `CommunityHealth` | Collective community stats |
| Social network | Done | `SocialNetwork` | Player relationship visualization |
| Trust map | Done | `TrustMap` | Trust between players |
| Resilience tracker | Done | `ResilienceTracker` | Recovery patterns |
| Moral compass | Done | `MoralCompass` | Ethical choice patterns |
| Life balance | Done | `LifeBalance` | Work/health/social balance |
| Story arc | Done | `StoryArc` | Narrative progression tracker |
| Choice consequences | Done | `ChoiceConsequences` | Impact of past decisions |
| City pulse | Done | `CityPulse` | City-wide activity heatmap |
| City economy | Done | `CityEconomy` | Economic conditions tracker |
| Danger zones | Done | `DangerZones` | Risky area warnings |
| Opportunity scanner | Done | `OpportunityScanner` | Available opportunities nearby |
| Risk assessment | Done | `RiskAssessment` | Current risk level display |
| Endgame preview | Done | `EndgamePreview` | Projected final outcome |
| Perspective shift | Done | `PerspectiveShift` | See situation from other personas |

## BUILT — Immersive "City Comes Alive" Systems

| Feature | Status | Component | What to test |
|---------|--------|-----------|-------------|
| Animated travel | Done | `CityMap` + `gameStore` | Player token slides along routes with cubic ease-out, trail particles |
| Radial action menu | Done | `RadialActionMenu` | Click current location → SVG pie menu with available actions |
| Fog-of-war | Done | `CityMap` + `gameStore` | Unvisited locations show "???" and dimmed nodes, discovered on arrival |
| Location vignettes | Done | `LocationDetail` | Gradient scene headers, floating emoji particles per location type |
| Night sky & fireflies | Done | `CityMap` | Stars twinkle overhead, SVG firefly animations during night cycle |
| Rain particles (SVG + CSS) | Done | `CityMap` + `index.css` | 50 streaks at varied angles, lightning flash, SVG rain inside map |
| Heat shimmer overlay | Done | `CityMap` | Wavering haze during heat events |
| Cinematic dilemma engine | Done | `DilemmaModal` | Letterbox bars, typewriter narrative, phased reveal, heartbeat on low time |
| Cinematic event banner | Done | `CityEventCinematic` | Dramatic slide-in when city events start, auto-dismiss timer |
| Exploration progress | Done | `LocationDetail` | Progress bar showing visited/total nearby locations |
| Cinematic results reveal | Done | `ResultsScreen` | 7-phase staged reveal: blackout → winner → rank/score counter → typewriter narrative → animated bars → insights → full scroll |
| Animated score counters | Done | `ResultsScreen` | Numbers count up from 0 with cubic easing |
| Confetti particle system | Done | `ResultsScreen` | Canvas-based 120-particle burst on victory |
| Score bar animations | Done | `ResultsScreen` | Each category bar fills with staggered timing |
| Persona gallery + radar charts | Done | `Lobby` | Browse all 12 personas with SVG radar charts, trait bars, strengths/weaknesses |
| Animated title reveal | Done | `Landing` | Letter-by-letter title animation with staggered timing |
| SVG city skyline | Done | `Landing` | Dual-layer parallax skyline silhouette |
| Personnel dossier reveal | Done | `Briefing` | 6-phase staged reveal with typewriter, animated trait bars, mission card |
| The Kolkata Chronicle | Done | `KolkataChronicle` | Procedurally generated sepia newspaper from match data — lead article, sidebar, dilemma column, rankings |

## BUILT — Audio System

| Feature | Status | Notes |
|---------|--------|-------|
| Web Audio API synthesis | Done | No audio files needed |
| Action sounds (success/fail) | Done | Distinct tones for each outcome |
| Warning/alert sounds | Done | Low-resource warnings |
| Coin earn/spend | Done | Cash transaction feedback |
| Chat message sound | Done | Incoming message ping |
| Dilemma sound | Done | Tension chord on moral choice |
| Fortune/event sound | Done | City event arrival |
| Game start/end | Done | Match bookend sounds |
| Ambient location audio | Done | 8 distinct patterns per location type |
| Move sound | Done | Travel feedback |
| Help/achievement sounds | Done | Social action + unlock feedback |
| Volume control | Done | Settings slider, mute toggle |
| Sound on/off toggle | Done | Persists in game state |

## BUILT — Polish & QA

| Feature | Status | Notes |
|---------|--------|-------|
| Mobile responsive layout | Done | Full game playable on 375px+ screens |
| Desktop optimized layout | Done | Side-by-side panels at 768px+ |
| Game history (localStorage) | Done | Cross-session stats tracking |
| Results share card | Done | Canvas-based PNG download |
| Lobby tips | Done | Rotating gameplay tips |
| Error boundary | Done | Graceful crash recovery |
| TypeScript strict mode | Done | Zero type errors (client + server) |
| Vite production build | Done | 644 KB / 166 KB gzipped |
| Server test suite | Done | 22/22 passing |

---

## PENDING — Not Yet Built

| Feature | Priority | Complexity | Description |
|---------|----------|-----------|-------------|
| Action cooldown timers | High | Low | Visual countdown showing when actions become available again |
| Multi-room server persistence | Medium | Medium | Rooms survive server restart (currently in-memory only) |
| Spectator mode | Medium | Medium | Watch ongoing matches without being a player |
| Replay system | Medium | High | Record and replay full matches |
| Player trading UI | Medium | Medium | TradePanel component exists but needs server-side trade protocol |
| Code splitting | Low | Medium | Dynamic imports to reduce initial 619KB bundle |
| PWA support | Low | Medium | Service worker for offline capability |
| i18n / Hindi + Bengali | Low | High | Multi-language support for broader audience |
| Database persistence | Low | High | Replace in-memory rooms with database storage |
| Authentication | Low | High | Player accounts, persistent stats across sessions |
| Custom persona creation | Low | High | User-created personas with balanced constraints |

---

## Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Old `PersonaGallery.tsx` removed | Resolved | Replaced by integrated Persona Gallery in Lobby |
| Bundle is 644KB (over 500KB Vite warning) | Low | Works fine, but code splitting would help load time |
| Server sends full Player data including `hidden` field | Low | TypeScript strips it in PublicPlayer type but wire still carries it |
| 9 components use `myPlayer.actionLog` (Player-only) | Info | Works because server sends full Player object; would break if stripped |
| 6 components use `mission.definition` (Player-only) | Info | Same as above — safe today, coupling risk |

---

## Test Checklist — Manual Playthrough

Use this when reviewing locally:

### Landing Page
- [ ] Page loads with no console errors
- [ ] "Create New Room" button works
- [ ] Player name input appears after clicking create
- [ ] Join room with code works
- [ ] Game history panel shows past games (if any)

### Lobby
- [ ] Room code displays correctly
- [ ] Copy button copies code to clipboard
- [ ] Player appears in list with "(you)" tag
- [ ] Host badge shows on correct player
- [ ] Game speed buttons work (host only)
- [ ] Ready button toggles state
- [ ] Start Match button appears for host
- [ ] Tips rotate every 5 seconds
- [ ] Leave Room returns to landing

### Briefing
- [ ] Persona name and backstory display
- [ ] Mission objectives listed
- [ ] "Enter the City" button advances to game
- [ ] Portrait/avatar renders

### Game — General
- [ ] Header shows timer, cash, score, day/night, connection quality
- [ ] All 8 tabs accessible via bottom bar (mobile) or sidebar (desktop)
- [ ] Tab badges show unread counts (chat, feed)
- [ ] Settings gear opens pause menu
- [ ] Keyboard shortcuts 1-8 switch tabs
- [ ] Esc closes modals
- [ ] No console errors during gameplay

### Game — Map Tab
- [ ] City map renders with 20 location markers
- [ ] Fog-of-war: unvisited locations show "???" labels and dimmed nodes
- [ ] Click current location opens radial action menu (pie menu)
- [ ] Click another location shows travel panel with transport modes
- [ ] Travel animates player token along route (smooth slide, not teleport)
- [ ] Trail particles visible during travel animation
- [ ] Location Detail panel shows gradient header with floating particles
- [ ] Exploration progress bar shows visited/total nearby
- [ ] Night: stars twinkle overhead, fireflies animate in SVG
- [ ] Rain event: visible rain streaks + subtle lightning flash
- [ ] City Directory button opens location list
- [ ] Minimap visible in corner
- [ ] Zoom in/out controls work
- [ ] Pinch-to-zoom works on mobile

### Game — Actions
- [ ] Eat/drink/rest actions work and update stats
- [ ] Work action earns cash
- [ ] Help player option appears when others nearby
- [ ] Action result toast shows feedback
- [ ] Floating numbers animate on stat changes
- [ ] Sound effects play on actions (if sound on)

### Game — Social
- [ ] Chat messages send and receive
- [ ] Emote bar works
- [ ] Other players visible on map
- [ ] Player interaction modal works when clicking players

### Game — Events & Dilemmas
- [ ] City events appear in feed
- [ ] Cinematic event banner slides in when new city event starts
- [ ] Banner auto-dismisses after 4 seconds
- [ ] Event choices can be made via choice modal
- [ ] Dilemma modal: full-screen letterbox presentation
- [ ] Dilemma: typewriter text reveals the narrative
- [ ] Dilemma: choices slide in with staggered animation
- [ ] Dilemma: hovering a choice shows consequence preview
- [ ] Dilemma: "feels right" / "against instinct" resonance indicators
- [ ] Dilemma: selecting a choice shows ripple + consequence reveal
- [ ] Dilemma: heartbeat effect when timer is low
- [ ] News ticker scrolls events

### Results
- [ ] Final screen shows after match ends
- [ ] Score breakdown is visible
- [ ] Player rankings display
- [ ] Share card can be downloaded
- [ ] Play Again returns to lobby/landing
- [ ] Game record saved to history

### Audio
- [ ] Sound toggle works (header button)
- [ ] Volume slider adjusts level (pause menu)
- [ ] Action sounds play correctly
- [ ] Ambient sounds change by location
- [ ] No audio glitches or overlapping

### Responsiveness
- [ ] Game plays correctly on mobile (375px width)
- [ ] Game plays correctly on desktop (1280px width)
- [ ] No horizontal scroll on any viewport
- [ ] Touch targets are large enough on mobile
