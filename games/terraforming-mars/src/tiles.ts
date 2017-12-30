import {Position, GameState, Tile, ResourceBonus, MapState, TileType} from './types'
import {OCEAN_POSITIONS, VOLCANO_POSITIONS, RESOURCE_BONUSES} from './constants'

export const isValid = ([x, y]: Position): boolean => {
  const xMin = Math.max(-4, -4 - y)
  const xMax = Math.min(4, 4 - y)
  return xMin <= x && x <= xMax
}

export const isOcean = ([x, y]: Position): boolean => {
  return OCEAN_POSITIONS.map(p => `${p[0]},${p[1]}`).indexOf(`${x},${y}`) >= 0
}

export const isVolcano = ([x, y]: Position): boolean => {
  return VOLCANO_POSITIONS.map(p => `${p[0]},${p[1]}`).indexOf(`${x},${y}`) >= 0
}

const ADJACENT_OFFSETS: Position[] = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]]

export const getAdjacentTiles = ([x, y]: Position): Position[] => {
  return ADJACENT_OFFSETS.map(([dx, dy]) => [x + dx, y + dy] as Position).filter(isValid)
}

export const isAdjacentToOwn = (state: GameState, [x, y]: Position): boolean => {
  return getAdjacentTiles([x, y])
    .map(
      ([ax, ay]) =>
        state.map[`${ax},${ay}`] &&
        state.map[`${ax},${ay}`].type !== TileType.Ocean &&
        state.map[`${ax},${ay}`].owner == state.player
    )
    .some(x => x)
}

export const getTileBonus = ([x, y]: Position): ResourceBonus[] => {
  return RESOURCE_BONUSES[`${x},${y}`] || []
}
