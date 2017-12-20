import {GameState, Transform, Tag} from './types'

export const DecreaseAnyProduction = (delta: number, type: string) => {}
export const DecreaseAnyInventory = (delta: number, type: string) => {}
export const ChangeAnyCardResource = (delta: number, type: string) => {}
export const ChangeCardResource = (delta: number, type: string) => {}

export const ChangeInventory = (delta: number | ((state: GameState) => number), type: string) => {}
export const ChangeProduction = (delta: number | ((state: GameState) => number), type: string) => {}

export const Draw = (n: number) => {}

export const IncreaseTR = (delta: number | ((state: GameState) => number)) => {}
export const IncreaseTemperature = (delta: number) => {}
export const RaiseOxygen = (delta: number) => {}
export const PlaceOceans = (n: number) => {}

export const PlaceCity = {}
export const PlaceGreenery = {}
export const PlaceGreeneryOnOcean = {}
export const PlaceNoctis = {}
export const PlaceResearchOutpost = {}
export const LandClaim = {}
export const RoboticWorkforce = {}
export const ArtificialLake = {}
export const UrbanizedArea = {}
export const Mohole = {}

export const Choice = (...args: any[]) => {}
export const Branch = (condition: (state: GameState) => boolean, ifTrue, ifFalse) => {}

export const Discount = (delta: number, tags?: Tag[]) => {}
export const AfterCard = (tags: Tag[], effects: any[]) => {}
export const AfterTile = {}

export const HasTags = (minimum: number, tag: Tag): ((state: GameState) => boolean) => {
  return state => true
}

export const GetTags = (tag: Tag, ratio?: number): ((state: GameState) => number) => {
  return state => 0
}

export const GetAllTags = (tag: Tag): ((state: GameState) => number) => {
  return state => 0
}

export const GetOpponentTags = (tag: Tag): ((state: GameState) => number) => {
  return state => 0
}

export const GetCities = (): ((state: GameState) => number) => {
  return state => 0
}

export const GetCitiesOnMars = (): ((state: GameState) => number) => {
  return state => 0
}

type NumGetter = (state: GameState, action?: any) => number

export const GetX: NumGetter = (state, action) => {
  return 0
}

export const Neg = (fn: NumGetter): NumGetter => {
  return (state, action) => -fn(state, action)
}
