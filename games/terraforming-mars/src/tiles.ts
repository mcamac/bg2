import {Position, GameState, Tile} from './types'
import {OCEAN_POSITIONS} from './constants'

export const isValid = ([x, y]: Position): boolean => {
  const xMin = Math.max(-4, -4 - y)
  const xMax = Math.min(4, 4 - y)
  return xMin <= x && x <= xMax
}

export const isOcean = ([x, y]: Position): boolean => {
  return OCEAN_POSITIONS.map(p => `${p[0]},${p[1]}`).indexOf(`${x},${y}`) >= 0
}

const ADJACENT_OFFSETS: Position[] = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]]

export const getAdjacentTiles = ([x, y]: Position): Position[] => {
  return ADJACENT_OFFSETS.map(([dx, dy]) => [x + dx, y + dy] as Position).filter(isValid)
}
