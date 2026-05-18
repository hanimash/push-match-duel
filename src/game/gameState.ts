import { reactive, ref, watch } from 'vue'
import { ROWS, COLS } from './constants'
import { createTiles } from './createTiles'
import { shuffle } from './shuffle'
import { pushColumn, pushRow } from './pushColumn'
import { checkWin } from './checkWin'
import { playPush, playEject, playColumnDone, playWin } from './sounds'
import type { GameState, Board, Tile, PlayerId, GameConfig, ActiveAbilityState } from './types'
import { ABILITY_IDS } from './abilities'
import type { AbilityId } from './abilities'

// Both players push ↓ (buttons above their board, tile enters row 0, exits row 3)
const COL_DIRECTION: Record<PlayerId, 'top' | 'bottom'> = {
  P1: 'top',
  P2: 'top',
}

const ROW_DIRECTION: Record<PlayerId, 'fromLeft' | 'fromRight'> = {
  P1: 'fromLeft',
  P2: 'fromRight',
}

function tilesToBoard(tiles: Tile[]): Board {
  const board: Board = []
  for (let row = 0; row < ROWS; row++) {
    board[row] = []
    for (let col = 0; col < COLS; col++) {
      board[row][col] = tiles[row * COLS + col]
    }
  }
  return board
}

function createStartTile(owner: PlayerId): Tile {
  return { id: 'start', owner, symbol: '💠', revealed: true, isStartTile: true }
}

function createInitialState(config: GameConfig): GameState {
  const allTiles = shuffle(createTiles(config.p1Symbols, config.p2Symbols))
  const first = config.firstPlayer
  const second: PlayerId = first === 'P1' ? 'P2' : 'P1'
  return {
    boards: {
      P1: tilesToBoard(allTiles.slice(0, 24)),
      P2: tilesToBoard(allTiles.slice(24, 48)),
    },
    currentTile: { [first]: createStartTile(first), [second]: null } as Record<PlayerId, Tile | null>,
    currentPlayer: first,
    winner: null,
    lastEjected: null,
    abilities:     { P1: null, P2: null },
    frozenCols:    { P1: [],   P2: []   },
    pendingReward: null,
    rewardGiven:   { P1: false, P2: false },
    activeAbility: null,
  }
}

export const state = reactive<{ game: GameState | null }>({ game: null })
export const aiEnabled = ref(false)
export const aiDifficulty = ref<'easy' | 'hard'>('hard')
export const playerNames = reactive<Record<'P1' | 'P2', string>>({ P1: 'Player 1', P2: 'Player 2' })

export function newGame(config: GameConfig) {
  clearAi()
  aiEnabled.value = config.mode === 'pvc'
  aiDifficulty.value = config.aiDifficulty
  playerNames.P1 = config.p1Name
  playerNames.P2 = config.p2Name
  state.game = createInitialState(config)
}

function completedColumns(board: Board, playerId: PlayerId): number {
  let count = 0
  for (let col = 0; col < COLS; col++) {
    const first = board[0][col]
    if (first.owner !== playerId) continue
    let ok = true
    for (let row = 1; row < ROWS; row++) {
      const t = board[row][col]
      if (t.owner !== playerId || t.symbol !== first.symbol) { ok = false; break }
    }
    if (ok) count++
  }
  return count
}

export function executeMove(index: number, pushType: 'column' | 'row' = 'column') {
  const game = state.game
  if (!game || game.winner) return
  if (game.pendingReward !== null) return   // wait until reward is claimed/skipped

  const player = game.currentPlayer
  const tile = game.currentTile[player]
  if (!tile) return

  // Deadlock guard: if every non-done column is frozen the player has no legal move → opponent wins
  if (pushType === 'column') {
    const validCols = aiCols(game.boards[player]).filter(c => !game.frozenCols[player].includes(c))
    if (validCols.length === 0) {
      const winner: PlayerId = player === 'P1' ? 'P2' : 'P1'
      game.winner = winner
      playWin()
      return
    }
  }

  // Block push into a frozen column
  if (pushType === 'column' && game.frozenCols[player].includes(index)) return

  playPush()

  const prevDone = completedColumns(game.boards[player], player)

  const result =
    pushType === 'column'
      ? pushColumn(game.boards[player], index, tile, COL_DIRECTION[player])
      : pushRow(game.boards[player], index, tile, ROW_DIRECTION[player])

  const { newBoard, ejectedTile } = result
  ejectedTile.revealed = true
  game.boards[player] = newBoard
  game.lastEjected = ejectedTile

  playEject()

  if (checkWin(newBoard, player)) {
    for (const row of newBoard) for (const t of row) t.revealed = true
    game.boards[player] = newBoard
    game.winner = player
    game.currentTile[player] = null
    playWin()
    return
  }

  const newDone = completedColumns(newBoard, player)
  if (newDone > prevDone) {
    // Reveal every tile in every completed column
    for (let col = 0; col < COLS; col++) {
      const first = newBoard[0][col]
      if (first.owner !== player) continue
      let ok = true
      for (let row = 1; row < ROWS; row++) {
        const t = newBoard[row][col]
        if (t.owner !== player || t.symbol !== first.symbol) { ok = false; break }
      }
      if (ok) for (let row = 0; row < ROWS; row++) newBoard[row][col].revealed = true
    }
    playColumnDone()
    // First time reaching 2 completed columns → reward card offer
    if (newDone >= 2 && !game.rewardGiven[player]) {
      game.rewardGiven[player] = true
      game.pendingReward = player
    }
  }

  const opponent: PlayerId = player === 'P1' ? 'P2' : 'P1'

  if (ejectedTile.owner === player) {
    game.currentTile[player] = ejectedTile
  } else {
    game.currentTile[player] = null
    game.currentTile[opponent] = ejectedTile
    game.currentPlayer = opponent
    // Player's turn ended — clear any freeze penalty on the player (applied by opponent last turn)
    game.frozenCols[player] = []
  }
}

// ══════════════ Ability System ══════════════

/** Player picks a card from the reward modal (or passes null to skip) */
export function claimReward(player: PlayerId, abilityId: AbilityId | null) {
  const game = state.game
  if (!game || game.pendingReward !== player) return
  if (abilityId !== null) game.abilities[player] = abilityId
  game.pendingReward = null
}

/** Enter targeting mode for the stored ability */
export function activateAbility(player: PlayerId) {
  const game = state.game
  if (!game || game.abilities[player] === null) return
  const ability = game.abilities[player]!
  if (ability === 'swap_tiles') {
    game.activeAbility = { player, ability, first: null }
  } else {
    game.activeAbility = { player, ability } as ActiveAbilityState
  }
}

/** Cancel mid-execution targeting */
export function cancelAbility() {
  const game = state.game
  if (game) game.activeAbility = null
}

/** Freeze: called when player clicks a column on the opponent's board */
export function applyFreeze(col: number) {
  const game = state.game
  if (!game) return
  const active = game.activeAbility
  if (!active || active.ability !== 'freeze_column') return
  const opponent: PlayerId = active.player === 'P1' ? 'P2' : 'P1'
  if (!game.frozenCols[opponent].includes(col)) game.frozenCols[opponent].push(col)
  game.abilities[active.player] = null
  game.activeAbility = null
}

/** Swap: called on each tile click on opponent's board; executes on the second click */
export function applySwapClick(row: number, col: number) {
  const game = state.game
  if (!game) return
  const active = game.activeAbility
  if (!active || active.ability !== 'swap_tiles') return
  const opponent: PlayerId = active.player === 'P1' ? 'P2' : 'P1'
  if (active.first === null) {
    game.activeAbility = { player: active.player, ability: 'swap_tiles', first: [row, col] }
  } else {
    const [r1, c1] = active.first
    const board = game.boards[opponent]
    const tmp = board[r1][c1]
    board[r1][c1] = board[row][col]
    board[row][col] = tmp
    game.abilities[active.player] = null
    game.activeAbility = null
  }
}

/** Rotate Row: called when player clicks a row label on the opponent's board */
export function applyRotateRow(row: number) {
  const game = state.game
  if (!game) return
  const active = game.activeAbility
  if (!active || active.ability !== 'rotate_row') return
  const opponent: PlayerId = active.player === 'P1' ? 'P2' : 'P1'
  const r = game.boards[opponent][row]
  // Rotate right: last tile wraps to front  [A,B,C,D,E,F] → [F,A,B,C,D,E]
  game.boards[opponent][row] = [r[COLS - 1], ...r.slice(0, COLS - 1)]
  game.abilities[active.player] = null
  game.activeAbility = null
}

// ══════════════ AI Logic ══════════════

let aiTimeout: ReturnType<typeof setTimeout> | null = null
let aiLastCol = -1
let aiConsecCount = 0
let notifTimer: ReturnType<typeof setTimeout> | null = null

export const aiAbilityNotification = ref<AbilityId | null>(null)

function clearAi() {
  if (aiTimeout) { clearTimeout(aiTimeout); aiTimeout = null }
  aiLastCol = -1
  aiConsecCount = 0
}

function showAiNotification(id: AbilityId) {
  if (notifTimer) clearTimeout(notifTimer)
  aiAbilityNotification.value = id
  // Does NOT auto-clear — player must press "Got it" via dismissAiAbility()
}

export function dismissAiAbility() {
  aiAbilityNotification.value = null
  // Resume AI push after human acknowledges
  if (state.game && !state.game.winner && state.game.currentPlayer === 'P2' && aiEnabled.value) {
    aiTimeout = setTimeout(aiPush, 600)
  }
}

// Returns true when a column is fully filled with P2 tiles of the same symbol —
// pushing into it would only cycle the same tile forever.
function isColumnDone(board: Board, col: number): boolean {
  const first = board[0][col]
  if (first.owner !== 'P2') return false
  for (let row = 1; row < ROWS; row++) {
    const t = board[row][col]
    if (t.owner !== 'P2' || t.symbol !== first.symbol) return false
  }
  return true
}

// ─── AI helpers ────────────────────────────────────────────────────────────
function aiPick(arr: number[]): number { return arr[Math.floor(Math.random() * arr.length)] }
function aiCols(board: Board): number[] {
  return Array.from({ length: COLS }, (_, i) => i).filter(col => !isColumnDone(board, col))
}
function aiCountSym(board: Board, col: number, sym: string): number {
  let n = 0
  for (let row = 0; row < ROWS; row++) if (board[row][col].symbol === sym) n++
  return n
}

function pickBestColumn(): number {
  const game = state.game
  if (!game) return Math.floor(Math.random() * COLS)

  const board = game.boards['P2']
  const tile  = game.currentTile['P2']
  if (!tile) return Math.floor(Math.random() * COLS)

  const frozen    = game.frozenCols['P2']
  const available = aiCols(board).filter(col => !frozen.includes(col))
  // If all playable columns are frozen fall back to any non-done column
  if (available.length === 0) {
    const fallback = aiCols(board)
    return fallback.length > 0 ? aiPick(fallback) : Math.floor(Math.random() * COLS)
  }

  // Easy: 40% random pick
  if (aiDifficulty.value === 'easy' && Math.random() < 0.4)
    return aiPick(available)

  // ── Star tile: find any uncommitted column (hidden top OR star top) ──
  if (tile.isStartTile) {
    const fresh = available.filter(col =>
      !board[0][col].revealed || board[0][col].isStartTile
    )
    return aiPick(fresh.length > 0 ? fresh : available)
  }

  const sym = tile.symbol

  // ── A: continue a column already showing sym at row 0 ───────────────
  const matching = available.filter(col => {
    const top = board[0][col]
    return top.revealed && !top.isStartTile && top.symbol === sym
  })
  if (matching.length > 0) return aiPick(matching)

  // ── B: uncommitted column — row-0 hidden OR has the neutral star tile ─
  const fresh = available.filter(col =>
    !board[0][col].revealed || board[0][col].isStartTile
  )
  if (fresh.length > 0) return aiPick(fresh)

  // ── C: best by count of sym tiles already in column (randomise ties) ─
  let topScore = -1
  let topCols: number[] = []
  for (const col of available) {
    const score = aiCountSym(board, col, sym)
    if (score > topScore)       { topScore = score; topCols = [col] }
    else if (score === topScore) { topCols.push(col) }
  }
  if (topCols.length > 0) return aiPick(topCols)

  // ── D: last resort — any non-done column ────────────────────────────
  return aiPick(available)
}

// ─── AI ability strategies ──────────────────────────────────────────────────

function aiBestFreezeCol(): number {
  const board = state.game!.boards['P1']
  let best = 0, bestScore = -1
  for (let col = 0; col < COLS; col++) {
    const symCounts: Record<string, number> = {}
    for (let row = 0; row < ROWS; row++) {
      const t = board[row][col]
      if (t.owner === 'P1') symCounts[t.symbol] = (symCounts[t.symbol] ?? 0) + 1
    }
    const score = Math.max(0, ...Object.values(symCounts))
    if (score > bestScore) { bestScore = score; best = col }
  }
  return best
}

function aiBestRotateRow(): number {
  const board = state.game!.boards['P1']
  let best = 0, bestScore = -1
  for (let row = 0; row < ROWS; row++) {
    const score = board[row].filter(t => t.owner === 'P1' && t.revealed).length
    if (score > bestScore) { bestScore = score; best = row }
  }
  return best
}

function aiBestSwapPair(): [[number, number], [number, number]] | null {
  const board = state.game!.boards['P1']
  // Find P1's strongest column (most tiles of one symbol) to disrupt
  let bestCol = -1, bestSym = '', bestScore = 0
  for (let col = 0; col < COLS; col++) {
    const counts: Record<string, number> = {}
    for (let row = 0; row < ROWS; row++) {
      const t = board[row][col]
      counts[t.symbol] = (counts[t.symbol] ?? 0) + 1
    }
    for (const [sym, n] of Object.entries(counts)) {
      if (n > bestScore) { bestScore = n; bestSym = sym; bestCol = col }
    }
  }
  if (bestCol === -1 || bestScore < 2) return null
  // Find a matching tile in that column to move out
  let matchPos: [number, number] | null = null
  for (let row = 0; row < ROWS; row++) {
    if (board[row][bestCol].symbol === bestSym) { matchPos = [row, bestCol]; break }
  }
  if (!matchPos) return null
  // Find a non-matching tile elsewhere to swap in (to break the column)
  let mismatchPos: [number, number] | null = null
  for (let col = 0; col < COLS && !mismatchPos; col++) {
    if (col === bestCol) continue
    for (let row = 0; row < ROWS; row++) {
      if (board[row][col].symbol !== bestSym) { mismatchPos = [row, col]; break }
    }
  }
  return mismatchPos ? [matchPos, mismatchPos] : null
}

function aiUseAbility() {
  const game = state.game
  if (!game || !game.abilities['P2']) return
  const ab = game.abilities['P2']!
  activateAbility('P2')
  if (ab === 'freeze_column') {
    applyFreeze(aiBestFreezeCol())
  } else if (ab === 'rotate_row') {
    applyRotateRow(aiBestRotateRow())
  } else if (ab === 'swap_tiles') {
    const pair = aiBestSwapPair()
    if (pair) {
      applySwapClick(pair[0][0], pair[0][1])
      applySwapClick(pair[1][0], pair[1][1])
    } else {
      cancelAbility()
      return
    }
  }
  showAiNotification(ab)
}

function aiPush() {
  const game = state.game
  if (!game || game.winner || game.currentPlayer !== 'P2') return
  if (!aiEnabled.value || !game.currentTile['P2']) return

  // Deadlock: AI has a tile but every non-done column is frozen → P1 wins
  const validCols = aiCols(game.boards['P2']).filter(c => !game.frozenCols['P2'].includes(c))
  if (validCols.length === 0) {
    game.winner = 'P1'
    playWin()
    return
  }

  let col = pickBestColumn()

  if (col === aiLastCol) {
    aiConsecCount++
    if (aiConsecCount > 6) {
      const board = game.boards['P2']
      const frozen = game.frozenCols['P2']
      const others = aiCols(board).filter(c => c !== aiLastCol && !frozen.includes(c))
      if (others.length > 0) {
        col = aiPick(others)
        aiLastCol = col
        aiConsecCount = 1
      }
    }
  } else {
    aiLastCol = col
    aiConsecCount = 1
  }

  executeMove(col, 'column')
  if (state.game && !state.game.winner && state.game.currentPlayer === 'P2' && aiEnabled.value) {
    aiTimeout = setTimeout(aiMove, 700 + Math.random() * 500)
  }
}

function aiMove() {
  const game = state.game
  if (!game || game.winner || game.currentPlayer !== 'P2') return
  if (!aiEnabled.value || !game.currentTile['P2']) return

  // Use stored ability first — AI push is deferred until player dismisses the notification
  if (game.abilities['P2'] !== null) {
    aiUseAbility()
    return
  }

  aiPush()
}

// AI auto-claims reward when it earns one
watch(
  () => state.game?.pendingReward,
  (pending) => {
    if (pending === 'P2' && aiEnabled.value) {
      setTimeout(() => {
        const picked = ABILITY_IDS[Math.floor(Math.random() * ABILITY_IDS.length)]
        claimReward('P2', picked)
        // Resume AI moves if it's still P2's turn
        if (state.game && !state.game.winner && state.game.currentPlayer === 'P2') {
          aiTimeout = setTimeout(aiMove, 600)
        }
      }, 900)
    }
  }
)

// Trigger AI when turn switches to P2
watch(
  () => state.game?.currentPlayer,
  (player) => {
    clearAi()
    if (player === 'P2' && aiEnabled.value && state.game && !state.game.winner) {
      aiTimeout = setTimeout(aiMove, 900 + Math.random() * 600)
    }
  }
)

// Trigger AI if toggled on while it's already P2's turn
watch(aiEnabled, (enabled) => {
  clearAi()
  if (enabled && state.game?.currentPlayer === 'P2' && !state.game?.winner) {
    aiTimeout = setTimeout(aiMove, 400)
  }
})
