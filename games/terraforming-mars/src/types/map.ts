import {Awards, Milestones, TileType} from './enums'
import {Player} from './player'

export interface Tile {
  type: TileType
  owner: Player
}

export type Position = [number, number]

// (-2, 4)
export interface MapState {
  [key: string]: Tile
}

export interface MilestoneClaim {
  player: Player
  milestone: Milestones
}

export interface AwardFunding {
  player: Player
  award: Awards
}
