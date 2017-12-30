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
  StandardProject,
} from './types'
import {isOcean} from './tiles'
import {getCardByName} from './cards'
import {draw} from './deck'

export const DecreaseAnyProduction = (delta: number, type: string) => (
  state: GameState,
  action,
  choice: {player: string},
  card: Card
): GameState => {
  state.playerState[choice.player].resources[type].production -= delta
  return state
}

export const DecreaseAnyInventory = (delta: number, type: string) => (
  state: GameState,
  action,
  choice: {player: string},
  card: Card
): GameState => {
  state.playerState[choice.player].resources[type].count -= delta
  return state
}

export const ChangeAnyCardResource = (n: number, type: string, minimum?: number) => (
  state: GameState,
  action: {sold: string[]},
  choice: {card: string},
  card: Card
): GameState => {
  // todo: check type, min

  if (!state.playerState[state.player].cardResources[card.name])
    state.playerState[state.player].cardResources[card.name] = 0

  state.playerState[state.player].cardResources[card.name] += n
  return state
}

export const ChangeCardResource = (n: number, type: string) => (
  state: GameState,
  action: {sold: string[]},
  choice,
  card: Card
): GameState => {
  if (!state.playerState[state.player].cardResources[card.name])
    state.playerState[state.player].cardResources[card.name] = 0

  state.playerState[state.player].cardResources[card.name] += n
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

export const DrawAndChoose = (nDraw: number, nKeep: number): Transform => state => {
  let [drawn, newState] = draw(nDraw, state)
  state = newState
  state.playerState[state.player].choices.push({
    type: 'KeepCards',
    cards: drawn,
    nKeep,
    effects: [['KeepCards', drawn, nKeep]],
  })
  return state
}

export const Draw = (n: number) => (state: GameState, action, choice): GameState => {
  let [drawn, newState] = draw(n, state)
  newState.playerState[state.player].hand = newState.playerState[state.player].hand.concat(drawn)
  return newState
}

export const IncreaseTR = (n: number | any[]) => (state: GameState): GameState => {
  if (typeof n !== 'number') {
    const [effect, ...args] = n
    n = <number>REGISTRY[effect](...args)
  }
  state.playerState[state.player].TR += n
  state.playerState[state.player].hasIncreasedTRThisGeneration = true
  return state
}

export const IncreaseResourceValue = (n: number, resource: ResourceType) => (
  state: GameState
): GameState => {
  state.playerState[state.player].conversions[resource] += n
  return state
}

export const IncreaseTemperature = (n: number) => (state: GameState, action, choice): GameState => {
  if (state.globalParameters.Heat < 0 && state.globalParameters.Heat + 2 * n >= 0) {
    // Player gets to place an ocean
    state.playerState[state.player].choices.push({
      type: 'PlaceOcean',
      effects: [['PlaceOceans']],
    })
  }
  state.playerState[state.player].TR += n
  state.playerState[state.player].hasIncreasedTRThisGeneration = true
  state.globalParameters.Heat += 2 * n
  return state
}
export const RaiseOxygen = (delta: number) => {}

export const PlaceOceans = () => (state: GameState, action, choice): GameState => {
  if (!isOcean(choice.location)) throw Error('Not an ocean tile')
  state = placeTile(state, {owner: state.player, type: TileType.Ocean}, choice.location)
  state.playerState[state.player].TR += 1
  state.playerState[state.player].hasIncreasedTRThisGeneration = true
  state.globalParameters.Oceans += 1
  return state
}

export const PlaceCity = () => (state: GameState, action, choice): GameState => {
  return placeTile(state, {owner: state.player, type: TileType.City}, choice.location)
}

export const PlaceIndustrialCenter = () => (state: GameState, action, choice): GameState => {
  // todo: check adjacency
  return placeTile(state, {owner: state.player, type: TileType.IndustrialCenter}, choice.location)
}

export const PlaceGreenery = () => (state: GameState, action, choice): GameState => {
  // todo: check adjacency
  state = placeTile(state, {owner: state.player, type: TileType.Greenery}, choice.location)
  state.globalParameters.Oxygen += 1
  state.playerState[state.player].TR += 1
  state.playerState[state.player].hasIncreasedTRThisGeneration = true
  return state
}

export const KeepCards = cards => (state: GameState, action, choice): GameState => {
  state.playerState[state.player].hand = state.playerState[state.player].hand.concat(choice.cards)
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

export const PlayedTagMatches = (
  tags: Tag[][]
): ((card: Card, cardPlayer: Player, owner: Player) => boolean) => {
  return (card: Card, cardPlayer: Player, owner: Player) => {
    if (owner === cardPlayer) {
      let playedTagMatches = tags.map(x => IsSubset(x, card.tags ? card.tags : [])).some(x => x)
      return playedTagMatches
    } else {
      return false
    }
  }
}

export const AnyPlayedTagMatches = (
  tags: Tag[][]
): ((card: Card, cardPlayer: Player, owner: Player) => boolean) => {
  return (card: Card, cardPlayer: Player, owner: Player) => {
    let playedTagMatches = tags.map(x => IsSubset(x, card.tags ? card.tags : [])).some(x => x)
    return playedTagMatches
  }
}

export const PlayedMinCost = (
  min: number
): ((card: Card, cardPlayer: Player, owner: Player) => boolean) => {
  return (card: Card, cardPlayer: Player, owner: Player) => {
    if (owner == cardPlayer) {
      return card.cost >= min
    } else {
      return false
    }
  }
}

const AFTER_CARD_REGISTRY = {
  PlayedTagMatches,
  AnyPlayedTagMatches,
  PlayedMinCost,
}

export const applyAfterCardTrigger = (
  state: GameState,
  card: Card,
  player: Player,
  curCard: Card,
  curPlayer: Player
) => {
  if (card.afterCardTriggers) {
    let [opName, ...args] = card.afterCardTriggers[0]
    let effects = card.afterCardTriggers[1]

    let condition = AFTER_CARD_REGISTRY[opName](...args)
    if (condition(curCard, curPlayer, player)) {
      applyEffects(state, {player, choices: []}, effects) // Is it always true that choice is 0?
    }
  }
}

export const applyAfterCardTriggers = (
  state: GameState,
  currentCard: Card,
  currentPlayer: Player
) => {
  state.players.forEach(otherPlayer => {
    state.playerState[otherPlayer].played.map(getCardByName).forEach(otherCard => {
      applyAfterCardTrigger(state, otherCard, otherPlayer, currentCard, currentPlayer)
    })
  })
  return state
}

/* After project triggers */

export const StandardProjectMatches = (
  projects: StandardProject[]
): ((project: StandardProject) => boolean) => {
  return (project: StandardProject) => projects.indexOf(project) >= 0
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
  DrawAndChoose,
  IncreaseTR,
  IncreaseTemperature,
  IncreaseResourceValue,
  RaiseOxygen,
  PlaceOceans,
  PlaceCity,
  PlaceGreenery,
  PlaceIndustrialCenter,
  SellCards,
  // Choices only
  KeepCards,
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
