import {GlobalType} from './enums'
import {Card} from './card'
import {Player, PlayerDraftState, PlayerState} from './player'
import {AwardFunding, MapState, MilestoneClaim} from './map'

export type GlobalParameters = {[p in GlobalType]: number}

export interface GameState {
  phase: string
  generation: number
  players: Player[]
  firstPlayer: Player
  playerState: {
    [key: string]: PlayerState
  }
  passed: {
    [key: string]: boolean
  }
  player: Player
  actionsDone: number
  map: MapState
  deck: string[]
  discards: Card[]
  milestones: MilestoneClaim[]
  awards: AwardFunding[]
  globalParameters: GlobalParameters

  draft: {
    [key: string]: PlayerDraftState
  }

  choosingCards: {
    [key: string]: string[]
  }

  choosingCorporations: {
    [key: string]: string[]
  }

  log: any[]
}

export type Transform = (state: GameState, action?: any) => GameState
