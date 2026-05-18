# Push Match Duel — Game Design & Technical Reference

## 1. Project Overview

A browser-based two-player strategy game playable on the same device (or solo against an AI opponent). No images, no backend — pure Vue 3 + Vite + TypeScript with emoji symbols.

---

## 2. Game Description

### 2.1 Players & Boards

Two players compete on separate boards:

| | Player 1 (P1) | Player 2 (P2) |
|---|---|---|
| Board size | 6 columns × 4 rows | 6 columns × 4 rows |
| Tiles | 24 (6 symbols × 4 copies) | 24 (6 symbols × 4 copies) |
| Symbol set | Chosen at setup | Chosen at setup (different from P1) |

**Available symbol categories:**
- 🦁 Animals — `🦁 🐘 🦅 🦊 🐊 🐺`
- 🌿 Plants — `🌸 🌻 🌴 🌵 🍄 🌹`
- 🍎 Fruits — `🍎 🍊 🍋 🍇 🍓 🍑`
- ⚽ Sports — `⚽ 🏀 🏈 ⚾ 🎾 🏐`
- 🚀 Space — `🌙 🌟 🪐 ☀️ ☄️ 🚀`
- 🚗 Transport — `🚗 ✈️ 🚢 🚂 🚁 🏍️`
- 🎵 Music — `🎸 🎹 🎺 🎻 🥁 🎷`

Total tiles: 48 board tiles + 1 special start tile = **49 tiles**.

---

### 2.2 The Tile

Every tile has two faces:

```
Hidden face:   ◆   (all tiles look identical when face-down)
Revealed face: 🦁  (the tile's unique symbol)
```

TypeScript type:

```ts
type Tile = {
  id: string;
  owner: PlayerId;       // 'P1' | 'P2'
  symbol: string;        // emoji character
  revealed: boolean;
  isStartTile?: boolean; // 💠 special first tile
};
```

---

## 3. Game Setup

1. Create 48 tiles (24 per player, each symbol repeated 4×).
2. Shuffle all 48 tiles.
3. Distribute first 24 to P1's board, last 24 to P2's board.
4. Create one special **💠 Start Tile**.
5. Roll to decide who goes first — that player receives the start tile as their current tile.

---

## 4. Core Push Mechanic

A player uses their **current tile** to push into any column on their own board.

**Example — pushing column with tile X:**

```
Before:         After:
[ A ]           [ X ]   ← new tile enters at top
[ B ]    →      [ A ]
[ C ]           [ B ]
[ D ]           [ C ]
                ──────
                [ D ]   ← ejected tile (revealed)
```

The ejected tile is immediately **revealed**, then:

| Ejected tile belongs to… | Result |
|---|---|
| **Same player** | Tile stays with them; their turn continues |
| **Opponent** | Tile passes to opponent; turn switches |

---

## 5. Win Condition

A player wins when **every column** on their board contains **4 tiles of the same symbol**, all owned by that player:

```
🦁  🐘  🦅  🦊  🐊  🐺
🦁  🐘  🦅  🦊  🐊  🐺
🦁  🐘  🦅  🦊  🐊  🐺
🦁  🐘  🦅  🦊  🐊  🐺
```

**Partial win:** completing 3 or more columns also triggers a win check after each move.

**Deadlock loss:** if all of a player's non-completed columns are frozen and they have no legal move, the opponent wins.

---

## 6. Move Flow

```
Player clicks a column push button
        ↓
Deadlock check — any valid (non-frozen, non-done) column?
  No  → opponent wins immediately
        ↓
Frozen column check — is this specific column frozen?
  Yes → move blocked (silent)
        ↓
Push current tile into column (top → bottom)
        ↓
Eject bottom tile and reveal it
        ↓
Check win condition for current player
  Win → game over, reveal all tiles, show winner modal
        ↓
Check if a new column was completed
  Yes → reveal completed column tiles, play sound
       If player now has 2+ done cols AND reward not yet given → show Reward Modal
        ↓
Determine ejected tile's owner:
  Same player → stays with them, turn continues
  Opponent    → passes to opponent, turn switches
        ↓
Update UI
```

---

## 7. Special Rules

### Frozen Columns (Freeze ability)
A frozen column on a player's board cannot be pushed into for one full turn. Displayed with a ❄️ icon on the push button and a blue tint on all tiles in that column.

### Column Completion
When a column is fully matched (4 identical symbols, same owner), it:
- Gets a gold glow animation (`pulse-gold`)
- Triggers a burst animation on all 4 tiles (`col-done-burst`)
- Is excluded from AI column-picking logic

### AI Deadlock Guard
The AI tracks how many consecutive times it has pushed the same column (`aiLastCol`, `aiConsecCount`). If the count exceeds 6, it forces a random switch to a different available column.

---

## 8. Ability System (Reward Cards)

A player who completes **2 or more columns** for the first time is offered one of three ability cards (picked face-down, flip to reveal):

| Ability | Icon | Effect |
|---|---|---|
| Freeze Column | ❄️ | Target one opponent column — locked for their next turn |
| Swap Tiles | 🔄 | Pick two tiles on the opponent's board — they swap positions |
| Rotate Row | 🔁 | Pick one opponent row — shifts one step right (last tile wraps to front) |

Each player can receive a reward only **once per game**. The AI auto-claims its reward and uses it strategically before its next push.

---

## 9. AI Opponent

Difficulty levels: **Easy** and **Hard**.

**Column selection priority (hard):**
1. A: Continue a column already showing the current tile's symbol at row 0
2. B: Start a fresh (uncommitted) column
3. C: Column with the most tiles of the matching symbol (best count)
4. D: Any available non-done column

**Easy:** 40% chance to skip the priority logic and pick randomly.

**AI ability strategies:**
- **Freeze:** targets P1's column with the highest same-symbol density
- **Rotate Row:** targets the P1 row with the most revealed P1 tiles
- **Swap:** disrupts P1's strongest column by moving a matching tile out and a mismatching tile in

---

## 10. Technical Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Vue 3 (Composition API) | Reactive templates, clean component model |
| Build | Vite 5 | Fast HMR, native ESM |
| Language | TypeScript | Type safety for game logic |
| Styling | Plain CSS | No dependencies, full control |
| State | `reactive` / `ref` | Simple enough — no Pinia needed |
| Sounds | Web Audio API | No external library |
| i18n | Custom (`computed` map) | Lightweight, reactive |

---

## 11. File Structure

```
src/
├── App.vue                   # Root layout, header, modals, layout toggle
├── main.ts
│
├── components/
│   ├── GameBoard.vue         # Board grid, push buttons, freeze/swap/rotate targeting
│   ├── PlayerPanel.vue       # Player name, done count, ability card button
│   ├── TileView.vue          # Single tile with flip + burst animations
│   ├── SetupScreen.vue       # Game configuration screen (category dropdowns, AI config)
│   ├── RewardModal.vue       # Flip-card reward selection modal
│   └── HowToPlayModal.vue    # Step-by-step instructions overlay
│
├── game/
│   ├── types.ts              # PlayerId, Tile, Board, GameState, GameConfig types
│   ├── constants.ts          # ROWS, COLS, CATEGORIES (symbol sets)
│   ├── createTiles.ts        # Generate 24 tiles per player
│   ├── shuffle.ts            # Fisher-Yates shuffle
│   ├── pushColumn.ts         # Column and row push logic
│   ├── checkWin.ts           # Win condition check
│   ├── abilities.ts          # ABILITIES map, AbilityId type
│   ├── sounds.ts             # Web Audio API sound effects
│   └── gameState.ts          # Central game state + AI logic + ability execution
│
├── i18n/
│   ├── types.ts              # Translations interface
│   ├── ar.ts                 # Arabic (default, RTL)
│   ├── en.ts                 # English
│   ├── de.ts                 # German
│   └── index.ts              # currentLang ref, t computed, setLang()
│
└── styles/
    └── main.css              # All styles (reset, layout, tiles, animations, mobile)
```

---

## 12. Layout Modes

### Horizontal (desktop default)
Two player zones side by side with a center strip showing the active player's current tile.

```
[ P2 zone ]  [ center strip ]  [ P1 zone ]
```

### Vertical (tablet / mobile, auto-applied below 700px)
P2 zone on top, ejected strip in the middle, P1 zone at the bottom. Tile sizes calculated via CSS `clamp()` to fill exactly one viewport height without scroll.

---

## 13. Internationalization

Three languages supported: **Arabic** (RTL), **English**, **German**.

The default language is **auto-detected** from `navigator.languages` — the first supported language in the browser's preference list is used; falls back to English if none match.

Language switching is instant — `currentLang` is a `ref`, `t` is a `computed` that returns the matching translation object. `document.dir` and `document.documentElement.lang` are updated on switch.

---

## 14. Animations

| Animation | Trigger | CSS class / keyframe |
|---|---|---|
| Tile flip | Symbol changes | `flip-enter/leave` |
| Tile eject pop | New current tile appears | `eject-pop` |
| Column done burst | Column first completes | `col-done-burst` (one-shot) |
| Column done glow | Column is complete | `pulse-gold` (infinite) |
| Active zone pulse | Player zone is active turn | `pulse-p1` / `pulse-p2` |
| Push button pulse | Button is active and pressable | `push-pulse-p1` / `push-pulse-p2` |
| Ability card | Earned ability appears | `ability-pop-enter` |
| Reward card flip | Card selected | CSS `rotateY(180deg)` |
| Winner modal | Game ends | `modal-pop` + staggered `slide-up` |

---

## 15. Sound Effects

All sounds generated via Web Audio API (no files required):

| Event | Sound |
|---|---|
| Column push | Short low thud |
| Tile ejected | Mid-pitch click |
| Column completed | Rising chord |
| Game won | Victory fanfare |
| Dice roll (setup) | Rapid ticking |
| Draw result | Short chime |

Global mute toggle stored in a reactive `muted` ref.

---

## 16. Deployment

### Local development
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs to dist/
npm run preview   # preview production build locally
```

### Vercel (recommended — supports private repos, free)
1. Push to GitHub (public or private)
2. Connect repo at [vercel.com](https://vercel.com)
3. Vercel auto-detects Vite — deploy with zero config

### GitHub Pages (public repos only)
A pre-configured workflow at `.github/workflows/deploy.yml` builds and deploys automatically on every push to `main`. Enable under **Settings → Pages → Source: GitHub Actions**.

`VITE_BASE` is set automatically from the repository name — no manual config needed.

---

## 17. Key Invariants

These must always hold during gameplay:

1. Total tile count = **49** (48 on boards + 1 current tile in play)
2. Only **one player** has a current tile at any time
3. Push buttons are disabled when it is not the player's turn
4. Push buttons are disabled when the player has no current tile
5. No move is possible while a reward modal is open (`pendingReward !== null`)
6. No move is possible while the AI ability notification is showing (`aiAbilityNotification !== null`)
7. Completed columns cannot be targeted by Freeze (they are already locked)
8. Each player receives at most **one** reward card per game

---

## 18. Known Edge Cases Handled

| Scenario | Handling |
|---|---|
| All non-done columns frozen | Deadlock detected → opponent wins |
| AI pushing same column repeatedly | Counter resets to random after 6 consecutive pushes |
| AI earns reward during its turn | Auto-claimed after 900 ms, then AI continues |
| AI uses an ability card | Blocking modal shown — human must press "Got it" before game resumes |
| Player changes category in setup | AI randomly re-picks a different category |
| Screen resized below 700 px | Layout switches to vertical automatically |
| RTL language selected | `document.dir = 'rtl'`, all logical CSS properties adapt |
| Browser language not supported | Falls back to English |
