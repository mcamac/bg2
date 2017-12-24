import {cloneDeep, zip} from 'lodash'
import {
  GameState,
  Transform,
  Tag,
  GlobalType,
  Player,
  CardResource,
  ResourceType,
  Card,
  TileType,
} from './types'

export const DecreaseAnyProduction = (delta: number, type: string) => {}
export const DecreaseAnyInventory = (delta: number, type: string) => {}
export const ChangeAnyCardResource = (delta: number, type: string) => {}
export const ChangeCardResource = (delta: number, type: string) => {}

export const ChangeInventory = (
  delta: number | ((state: GameState) => number),
  resource: string
): Transform => state => {
  const playerState = state.playerState[state.player]
  playerState.resources[resource].count += delta
  return state
}

export const ChangeProduction = (
  delta: number | ((state: GameState) => number),
  resource: string
): Transform => state => {
  const playerState = state.playerState[state.player]
  playerState.resources[resource].production += delta
  return state
}

export const Draw = (n: number) => {}

export const IncreaseTR = (delta: number | ((state: GameState) => number)) => {}
export const IncreaseTemperature = (delta: number) => {}
export const RaiseOxygen = (delta: number) => {}
export const PlaceOceans = (n: number) => {}

export const PlaceCity = () => (state: GameState, action, choice): GameState => {
  state.map[choice.location] = {
    owner: state.player,
    type: TileType.City,
  }
  return state
}

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

export const Discount = (delta: number, tags?: Tag[]) => ({
  delta,
  tags,
})

export const AfterCard = (tags: Tag[], effects: any[]) => {}
export const AfterTile = {}

/* Global Parameter Requirement Checks (for playing cards) */

export const GlobalTypeWithinRange = (
  param: GlobalType,
  min: number,
  max: number
): ((state: GameState) => boolean) => {
  return state => state.globalParameters[param] >= min && state.globalParameters[param] <= max
}

export const MinOxygen = (thresh: number) =>
  GlobalTypeWithinRange(GlobalType.Oxygen, thresh, Infinity)

export const MaxOxygen = (thresh: number) =>
  GlobalTypeWithinRange(GlobalType.Oxygen, -Infinity, thresh)

export const MinHeat = (thresh: number) => GlobalTypeWithinRange(GlobalType.Heat, thresh, Infinity)

export const MaxHeat = (thresh: number) => GlobalTypeWithinRange(GlobalType.Heat, -Infinity, thresh)

export const MinOceans = (thresh: number) =>
  GlobalTypeWithinRange(GlobalType.Oceans, thresh, Infinity)

export const MaxOceans = (thresh: number) =>
  GlobalTypeWithinRange(GlobalType.Oceans, -Infinity, thresh)

/* Card Tag Requirement Check */

export const HasTags = (minimum: number, tag: Tag): ((state: GameState) => boolean) => {
  return state => true
}

export const HasCitiesOnMars = (minimum: number): ((state: GameState) => boolean) => {
  return state => true
}

/* Compute VP as a function of card resources */

export const VPIfCardHasResources = (
  resource: CardResource,
  minimum: number,
  vp: number
): ((state: GameState) => number) => {
  return state => (GetCardResources(resource)(state) > minimum ? 0 : vp)
}

export const VPForTags = (tag: Tag, ratio: number = 1): ((state: GameState) => number) => {
  return state => Math.floor(GetTags(tag)(state) / ratio)
}

export const VPForCardResources = (
  resource: CardResource,
  ratio: number = 1
): ((state: GameState) => number) => {
  return state => Math.floor(GetCardResources(resource)(state) / ratio)
}

export const VPForCitiesOnMars = (ratio: number = 1): ((state: GameState) => number) => {
  return state => Math.floor(GetCitiesOnMars()(state) / ratio)
}

export const GetCardResources = (resource: CardResource): ((state: GameState) => number) => {
  return state => 0
}

export const GetTags = (tag: Tag, ratio?: number): ((state: GameState) => number) => {
  return state => 0
}

export const GetAllTags = (tag: Tag): ((state: GameState) => number) => {
  return state => 0
}

export const GetPlayerTags = (tag: Tag, player: Player): ((state: GameState) => number) => {
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

const REGISTRY = {
  DecreaseAnyProduction,
  DecreaseAnyInventory,
  ChangeCardResource,
  ChangeAnyCardResource,
  ChangeInventory,
  ChangeProduction,
  Draw,
  IncreaseTR,
  IncreaseTemperature,
  RaiseOxygen,
  PlaceOceans,
  PlaceCity,
}

const fromJSON = obj => {
  if (obj instanceof Array && typeof obj[0] === 'string') {
    const [opName, ...args] = obj
    if (!REGISTRY[opName]) return null
    return REGISTRY[opName](...args.map(fromJSON))
  } else {
    return obj
  }
}

export const applyEffects = (state: GameState, action, effects: any[]): GameState => {
  zip(action.choices, effects).forEach(([choice, effect]) => {
    const effectFn = fromJSON(effect)
    state = effectFn(state, action, choice)
  })

  return state
}

export function isSubset<T>(l1: T[], l2: T[]): boolean {
  const s1 = new Set(l1)
  const s2 = new Set(l2)
  for (var elem of Array.from(s1.values())) {
    if (!s2.has(elem)) {
      return false
    }
  }
  return true
}

export const changeInventory = (
  state: GameState,
  player: Player,
  resource: ResourceType,
  delta: number
): GameState => {
  state.playerState[player].resources[resource].count += delta
  if (state.playerState[player].resources[resource].count < 0) {
    throw Error('Not enough resources')
  }
  return state
}

export const cloneState: Transform = state => cloneDeep(state)
export function clone<T>(x: T): T {
  return cloneDeep(x)
}

const REQUIREMENTS_REGISTRY = {
  MinOxygen,
  MaxOxygen,
  MinOceans,
  MaxOceans,
  MinHeat,
  MaxHeat,
  HasTags,
  HasCitiesOnMars,
}

const fromJSONRequires = obj => {
  if (obj instanceof Array) {
    const [opName, ...args] = obj
    if (!REQUIREMENTS_REGISTRY[opName]) {
      // maybe this shouldn't throw an error
      throw Error('could not find ' + opName)
    }
    return REQUIREMENTS_REGISTRY[opName](...args)
  } else {
    return obj
  }
}

export const checkCardRequirements = (card: Card, state: GameState): boolean => {
  // todo: check if can pay for it as well?
  let requirementArray = card.requires ? card.requires : []
  if (requirementArray) {
    let requirementResults = requirementArray.map(requirement =>
      fromJSONRequires(requirement)(state)
    )
    if (requirementResults.every(x => x)) {
      return true
    } else {
      return false
    }
  } else {
    return true
  }
}
