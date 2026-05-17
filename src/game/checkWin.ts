import { ROWS, COLS } from './constants'
import type { Board, PlayerId } from './types'

export function checkWin(board: Board, playerId: PlayerId): boolean {
  for (let col = 0; col < COLS; col++) {
    const first = board[0][col]
    if (first.owner !== playerId) return false

    for (let row = 1; row < ROWS; row++) {
      const tile = board[row][col]
      if (tile.owner !== playerId || tile.symbol !== first.symbol) return false
    }
  }
  return true
}
