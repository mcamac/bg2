import {Position, GameState, Tile, ResourceBonus, MapState, TileType} from './types'
import {OCEAN_POSITIONS, VOLCANO_POSITIONS, RESOURCE_BONUSES} from './constants'

export const isValid = ([x, y]: Position): boolean => {
  const xMin = Math.max(-4, -4 - y)
  const xMax = Math.min(4, 4 - y)
  return xMin <= x && x <= xMax
}

export const isOcean = ([x, y]: Position): boolean => {
  const key = makeKeyFromPosition([x, y])
  return OCEAN_POSITIONS.map(makeKeyFromPosition).indexOf(key) >= 0
}

export const isVolcano = ([x, y]: Position): boolean => {
  const key = makeKeyFromPosition([x, y])
  return VOLCANO_POSITIONS.map(makeKeyFromPosition).indexOf(key) >= 0
}

const ADJACENT_OFFSETS: Position[] = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]]

export const getAdjacentTiles = ([x, y]: Position): Position[] => {
  return ADJACENT_OFFSETS.map(([dx, dy]) => [x + dx, y + dy] as Position).filter(isValid)
}

export const isAdjacentToOwn = (state: GameState, [x, y]: Position): boolean => {
  return getAdjacentTiles([x, y])
    .map(makeKeyFromPosition)
    .map(
      key =>
        state.map[key] &&
        state.map[key].type !== TileType.Ocean &&
        state.map[key].owner == state.player
    )
    .some(x => x)
}

export const getTileBonus = ([x, y]: Position): ResourceBonus[] => {
  return RESOURCE_BONUSES[makeKeyFromPosition([x, y])] || []
}

export const makeKeyFromPosition = ([x, y]: Position): string => {
  return `${x},${y}`
}

export const makePositionFromKey = (s: string): Position => {
  const position = s.split(',').map(x => parseInt(x, 10))
  if (position.length !== 2) {
    throw new Error('Invalid position key.')
  }
  return position as Position
}
