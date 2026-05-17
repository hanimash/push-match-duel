import { ROWS, COLS } from './constants'
import type { Board, Tile } from './types'

// Vertical push (column-based) — used in vertical layout
// 'top'    → tile enters row 0,      exits row ROWS-1
// 'bottom' → tile enters row ROWS-1, exits row 0
export function pushColumn(
  board: Board,
  colIndex: number,
  incomingTile: Tile,
  direction: 'top' | 'bottom'
): { newBoard: Board; ejectedTile: Tile } {
  const newBoard = board.map(row => [...row])

  if (direction === 'top') {
    const ejectedTile = { ...newBoard[ROWS - 1][colIndex] }
    for (let row = ROWS - 1; row > 0; row--) {
      newBoard[row][colIndex] = newBoard[row - 1][colIndex]
    }
    newBoard[0][colIndex] = { ...incomingTile }
    return { newBoard, ejectedTile }
  } else {
    const ejectedTile = { ...newBoard[0][colIndex] }
    for (let row = 0; row < ROWS - 1; row++) {
      newBoard[row][colIndex] = newBoard[row + 1][colIndex]
    }
    newBoard[ROWS - 1][colIndex] = { ...incomingTile }
    return { newBoard, ejectedTile }
  }
}

// Horizontal push (row-based) — used in horizontal layout
// 'fromLeft'  → tile enters col 0,      exits col COLS-1  (P1: pushes → from center)
// 'fromRight' → tile enters col COLS-1, exits col 0       (P2: pushes ← from center)
export function pushRow(
  board: Board,
  rowIndex: number,
  incomingTile: Tile,
  direction: 'fromLeft' | 'fromRight'
): { newBoard: Board; ejectedTile: Tile } {
  const newBoard = board.map(row => [...row])
  const row = newBoard[rowIndex]

  if (direction === 'fromLeft') {
    const ejectedTile = { ...row[COLS - 1] }
    for (let col = COLS - 1; col > 0; col--) {
      row[col] = row[col - 1]
    }
    row[0] = { ...incomingTile }
    return { newBoard, ejectedTile }
  } else {
    const ejectedTile = { ...row[0] }
    for (let col = 0; col < COLS - 1; col++) {
      row[col] = row[col + 1]
    }
    row[COLS - 1] = { ...incomingTile }
    return { newBoard, ejectedTile }
  }
}
