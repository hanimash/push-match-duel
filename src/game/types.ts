import type { AbilityId } from './abilities'

export type PlayerId = 'P1' | 'P2'
export type GameMode = 'pvp' | 'pvc'

export interface GameConfig {
  mode: GameMode
  p1Symbols: string[]
  p2Symbols: string[]
  firstPlayer: PlayerId
  p1Name: string
  p2Name: string
  aiDifficulty: 'easy' | 'hard'
}

export type Tile = {
  id: string
  owner: PlayerId
  symbol: string
  revealed: boolean
  isStartTile?: boolean
}

export type Board = Tile[][]

// Describes which ability is being targeted right now (multi-step interaction)
export type ActiveAbilityState =
  | { player: PlayerId; ability: 'freeze_column' }
  | { player: PlayerId; ability: 'swap_tiles'; first: [number, number] | null }
  | { player: PlayerId; ability: 'rotate_row' }

export type GameState = {
  boards:       Record<PlayerId, Board>
  currentTile:  Record<PlayerId, Tile | null>
  currentPlayer: PlayerId
  winner:       PlayerId | null
  lastEjected:  Tile | null

  // ── Abilities ──────────────────────────────────────────────────────
  abilities:     Record<PlayerId, AbilityId | null>  // stored ability per player
  frozenCols:    Record<PlayerId, number[]>           // columns frozen on each player's board
  pendingReward: PlayerId | null                      // player waiting to pick a reward card
  rewardGiven:   Record<PlayerId, boolean>            // one reward per player per game
  activeAbility: ActiveAbilityState | null            // mid-execution ability state
}
