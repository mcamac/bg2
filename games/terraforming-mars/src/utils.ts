import {cloneDeep, pull, zip} from 'lodash'
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
  Tile,
  Position,
} from './types'
import {isOcean} from './tiles'
import {getCardByName} from './cards'

export const DecreaseAnyProduction = (delta: number, type: string) => {}
export const DecreaseAnyInventory = (delta: number, type: string) => {}
export const ChangeAnyCardResource = (delta: number, type: string) => {}
export const ChangeCardResource = (n: number, type: string) => (
  state: GameState,
  action: {sold: string[]},
  choice,
  card: Card
): GameState => {
  if (!state.playerState[state.player].cardResources[card.name])
    state.playerState[state.player].cardResources[card.name] = 0

  state.playerState[state.player].cardResources[card.name]++
  return state
}

export const SellCards = () => (state: GameState, action: {sold: string[]}, choice): GameState => {
  state = ChangeInventory(choice.sold.length, ResourceType.Money)(state)
  state.playerState[state.player].hand = pull(state.playerState[state.player].hand, ...choice.sold)
  return state
}

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
export const IncreaseTemperature = (n: number) => (state: GameState, action, choice): GameState => {
  state.playerState[state.player].TR += n
  state.globalParameters.Heat += n
  return state
}
export const RaiseOxygen = (delta: number) => {}

export const PlaceOceans = (n: number) => (state: GameState, action, choice): GameState => {
  for (let i = 0; i < n; i++) {
    if (!isOcean(choice.locations[i])) throw Error('Not an ocean tile')
    state = placeTile(state, {owner: state.player, type: TileType.Ocean}, choice.locations[i])
  }
  state.playerState[state.player].TR += n
  state.globalParameters.Oceans += n
  return state
}

export const PlaceCity = () => (state: GameState, action, choice): GameState => {
  return placeTile(state, {owner: state.player, type: TileType.City}, choice.location)
}

export const PlaceGreenery = () => (state: GameState, action, choice): GameState => {
  // todo: check adjacency
  state = placeTile(state, {owner: state.player, type: TileType.Greenery}, choice.location)
  state.globalParameters.Oxygen += 1
  state.playerState[state.player].TR += 1
  return state
}

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

/* After card triggers */

export const IsSubset = (required: any[], options: any[]) => {
  let isInOptions = required.map(x => options.find(y => x === y) != null)
  return isInOptions.every(x => x)
}

export const PlayedTagMatches = (tags: Tag[]): ((card: Card, cardPlayer: Player, owner: Player) => boolean) => {
  return (card: Card, cardPlayer: Player, owner: Player) => {
    if (owner === cardPlayer) {
      let playedTagMatches = IsSubset(tags, card.tags ? card.tags : [])
      return playedTagMatches
    } else {
      return false
    }
  }
}

export const AnyPlayedTagMatches = (tags: Tag[]): ((card: Card, cardPlayer: Player, owner: Player) => boolean) => {
  return (card: Card, cardPlayer: Player, owner: Player) => {
    let playedTagMatches = IsSubset(tags, card.tags ? card.tags : [])
    return playedTagMatches
  }
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
  PlaceGreenery,
  SellCards,
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

export const applyEffects = (state: GameState, action, effects: any[], card?: Card): GameState => {
  zip(action.choices || [], effects).forEach(([choice, effect]) => {
    const effectFn = fromJSON(effect)
    state = effectFn(state, action, choice, card)
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

export const applyAfterTileTriggers = (
  state: GameState,
  tile: Tile,
  position: Position
): GameState => {
  state.players.forEach(player => {
    state.playerState[player].played.map(getCardByName).forEach(card => {
      if (card.afterTileTriggers) {
        const [types, effects] = card.afterTileTriggers
        if (types.indexOf(tile.type) >= 0) {
          state = applyEffects(state, {player, choices: []}, effects, card)
        }
      }
    })
  })
  return state
}

const placeTile = (state: GameState, tile: Tile, position: Position): GameState => {
  const [x, y] = position
  const key = `${x},${y}`
  state.map[key] = tile
  // todo: check restrictions on tiles

  state = applyAfterTileTriggers(state, tile, position)

  return state
}
