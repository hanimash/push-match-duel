import type { PlayerId, Tile } from './types'

export function createTiles(p1Symbols: readonly string[], p2Symbols: readonly string[]): Tile[] {
  const tiles: Tile[] = []
  let counter = 0

  const add = (owner: PlayerId, symbols: readonly string[]) => {
    for (const symbol of symbols) {
      for (let i = 0; i < 4; i++) {
        tiles.push({ id: `${owner}-${symbol}-${counter++}`, owner, symbol, revealed: false })
      }
    }
  }

  add('P1', p1Symbols)
  add('P2', p2Symbols)
  return tiles
}
