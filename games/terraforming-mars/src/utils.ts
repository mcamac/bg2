import {cloneDeep, pull, flatMap, sum, zip} from 'lodash'
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
  ResourceBonus,
  Corporation,
} from './types'
import {isOcean, isVolcano, getTileBonus, isAdjacentToOwn, getAdjacentTiles} from './tiles'
import {getCardByName} from './cards'
import {draw} from './deck'
import {getCorporationByName} from './corporations'

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

export const ChangeAnyCardResource = (
  n: number,
  type: CardResource | null,
  minimum: number = 0
) => (state: GameState, action, choice: {card: string}): GameState => {
  const cardOwner = state.players.find(
    player => state.playerState[player].played.indexOf(choice.card) >= 0
  )
  if (!cardOwner) throw Error('Invalid card.')
  const cardObj = getCardByName(choice.card)
  if (type && cardObj.resourceHeld !== type) throw Error('Invalid card resource type.')

  if (!state.playerState[cardOwner].cardResources[choice.card])
    state.playerState[cardOwner].cardResources[choice.card] = 0

  if (state.playerState[cardOwner].cardResources[choice.card] < minimum)
    throw Error('Card does not have minimum resources.')

  state.playerState[state.player].cardResources[choice.card] += n
  return state
}

export const ChangeCardResource = (n: number, type: string) => (
  state: GameState,
  action,
  choice,
  card: Card
): GameState => {
  const playerState = state.playerState[action.player || state.player]
  if (!playerState.cardResources[card.name]) playerState.cardResources[card.name] = 0

  playerState.cardResources[card.name] += n
  return state
}

export const SellCards = () => (state: GameState, action: {sold: string[]}, choice): GameState => {
  state = ChangeInventory(choice.cards.length, ResourceType.Money)(state)
  state.playerState[state.player].hand = pull(state.playerState[state.player].hand, ...choice.cards)
  return state
}

export const ChangeInventory = (n: number | NumGetter, resource: ResourceType) => (
  state: GameState,
  action?,
  choice?
) => {
  if (typeof n !== 'number') {
    n = n(state, action, choice)
  }
  return changeInventory(state, (action && action.player) || state.player, resource, n)
}

export const ChangeProduction = (n: number | NumGetter, resource: string) => (
  state: GameState,
  action?,
  choice?
) => {
  if (typeof n !== 'number') {
    n = n(state, action, choice)
  }
  const playerState = state.playerState[(action && action.player) || state.player]
  playerState.resources[resource].production += n

  if (resource !== ResourceType.Money && playerState.resources[resource].production < 0) {
    throw Error('Not enough production')
  }

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

export const PlaceLavaFlows = () => (state: GameState, action, choice): GameState => {
  if (!isVolcano(choice.location)) throw Error('Not an volcano tile')
  state = placeTile(state, {owner: state.player, type: TileType.LavaFlows}, choice.location)
  return state
}

export const PlaceCity = () => (state: GameState, action, choice): GameState => {
  return placeTile(state, {owner: state.player, type: TileType.City}, choice.location)
}

export const PlaceSpecialCity = (name: string) => (state: GameState, action, choice): GameState => {
  return placeSpecialTile(state, {owner: state.player, type: TileType.City}, name)
}

export const PlaceMiningArea = () => (state: GameState, action, choice): GameState => {
  const bonus = getTileBonus(choice.location)
  if (bonus.indexOf(ResourceBonus.Steel) < 0 && bonus.indexOf(ResourceBonus.Titanium) < 0)
    throw Error('Invalid tile for mining area')
  if (!isAdjacentToOwn(state, choice.location)) throw Error('Not adjacent to own tile.')

  state = placeTile(state, {owner: state.player, type: TileType.MiningArea}, choice.location)
  state = ChangeProduction(1, choice.resource)(state)
  return state
}

export const PlaceMiningRights = () => (state: GameState, action, choice): GameState => {
  const bonus = getTileBonus(choice.location)
  if (bonus.indexOf(ResourceBonus.Steel) < 0 && bonus.indexOf(ResourceBonus.Titanium) < 0)
    throw Error('Invalid tile for mining area')

  state = placeTile(state, {owner: state.player, type: TileType.MiningArea}, choice.location)
  state = ChangeProduction(1, choice.resource)(state)
  return state
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

export const PlaceGreeneryOnOcean = () => (state: GameState, action, choice): GameState => {
  if (!isOcean(choice.location)) throw Error('Not an ocean tile.')
  state = placeTile(state, {owner: state.player, type: TileType.Greenery}, choice.location)
  state.globalParameters.Oxygen += 1
  state.playerState[state.player].TR += 1
  state.playerState[state.player].hasIncreasedTRThisGeneration = true
  return state
}

export const OffsetRequirements = (n: number) => (state: GameState, action, choice): GameState => {
  if (!state.playerState[state.player].globalRequirementsOffset)
    state.playerState[state.player].globalRequirementsOffset = 0

  state.playerState[state.player].globalRequirementsOffset += n
  return state
}

export const PlaceResearchOutpost = () => (state: GameState, action, choice): GameState => {
  getAdjacentTiles(choice.location).forEach(([x, y]) => {
    if (state.map[`${x},${y}`]) throw Error('Cannot be next to another tile.')
  })

  state = placeTile(state, {owner: state.player, type: TileType.City}, choice.location)
  return state
}

export const LandClaim = {}
export const RoboticWorkforce = {}
export const ArtificialLake = {}

export const PlaceNuclearZone = () => (state: GameState, action, choice): GameState => {
  state = placeTile(state, {owner: state.player, type: TileType.NuclearZone}, choice.location)
  return state
}

export const PlaceUrbanizedArea = () => (state: GameState, action, choice): GameState => {
  const nAdjacentCities = getAdjacentTiles(choice.location).filter(
    ([x, y]) => state.map[`${x},${y}`] && state.map[`${x},${y}`].type === TileType.City
  ).length

  if (nAdjacentCities < 2) throw Error('Not next to 2 cities.')

  state = placeTile(state, {owner: state.player, type: TileType.City}, choice.location)
  return state
}

export const PlaceNaturalPreserve = () => (state: GameState, action, choice): GameState => {
  getAdjacentTiles(choice.location).forEach(([x, y]) => {
    if (state.map[`${x},${y}`]) throw Error('Cannot be next to another tile.')
  })

  state = placeTile(state, {owner: state.player, type: TileType.NaturalPreserve}, choice.location)
  return state
}

export const PlaceNoctis = () => (state: GameState, action, choice): GameState => {
  state = placeTile(state, {owner: state.player, type: TileType.City}, [-2, 0])
  return state
}

export const PlaceMohole = () => (state: GameState, action, choice): GameState => {
  if (!isOcean(choice.location)) throw Error('Not an ocean tile')
  state = placeTile(state, {owner: state.player, type: TileType.MoholeArea}, choice.location)
  return state
}

export const ChooseX = effects => (state: GameState, action, choice): GameState => {
  const x = choice.x
  state = applyEffects(state, {choices: effects.map(eff => ({x}))}, effects)
  return state
}

export const Choice = (args: any[]) => (state: GameState, action, choice): GameState => {
  const chosenEffects = args[choice.index]
  state = applyEffects(state, {choices: chosenEffects.map(() => choice)}, chosenEffects)
  return state
}

export const Branch = (predicate: ((state: GameState) => boolean), ifTrue, ifFalse) => (
  state: GameState,
  action
): GameState => {
  const ok = predicate(state)
  state = applyEffects(state, action, ok ? ifTrue : ifFalse)
  return state
}

export const Discount = (delta: number, tags?: Tag[]) => ({
  delta,
  tags,
})

export const AfterCard = (tags: Tag[], effects: any[]) => {}
export const AfterTile = {}

/* Global Parameter Requirement Checks (for playing cards) */

export const GlobalTypeWithinRange = (param: GlobalType, min: number, max: number) => (
  state: GameState
): boolean => {
  let offset = state.playerState[state.player].globalRequirementsOffset || 0
  if (param === GlobalType.Heat) offset *= 2
  return (
    state.globalParameters[param] >= min - offset && state.globalParameters[param] <= max + offset
  )
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
  return state => GetTags(tag)(state) >= minimum
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

export const GetTags = (tag: Tag, ratio: number = 1) => (state: GameState): number => {
  return Math.floor(GetPlayerTags(tag, state.player)(state) / ratio)
}

export const GetAllTags = (tag: Tag) => (state: GameState): number => {
  return sum(state.players.map(player => GetPlayerTags(tag, player)(state)))
}

export const GetPlayerTags = (tag: Tag, player: Player) => (state: GameState): number => {
  const allPlayed = [
    ...state.playerState[player].played
      .map(getCardByName)
      .filter(card => tag === 'Event' || card.type !== 'Event'),
    getCorporationByName(state.playerState[player].corporation),
  ]
  return (<any>flatMap(allPlayed, card => card.tags || [])).filter(t => t === tag).length
}

export const GetOpponentTags = (tag: Tag): ((state: GameState) => number) => {
  return state => 0
}

export const GetCities = () => (state: GameState): number => {
  return 0
}

export const GetCitiesOnMars = (): ((state: GameState) => number) => {
  return state => 0
}

type NumGetter = (state: GameState, action?: any, choice?) => number

export const GetX = () => (state: GameState, action, choice): number => {
  return choice.x
}

export const Neg = (fn: NumGetter): NumGetter => (state, action, choice) => {
  return -fn(state, action, choice)
}

const REGISTRY = {
  DecreaseAnyProduction,
  DecreaseAnyInventory,
  ChangeCardResource,
  ChangeAnyCardResource,
  ChangeInventory,
  ChangeProduction,
  Choice,
  Draw,
  DrawAndChoose,
  GetAllTags,
  ChooseX,
  Neg,
  GetX,
  GetTags,
  IncreaseTR,
  IncreaseTemperature,
  IncreaseResourceValue,
  RaiseOxygen,
  PlaceOceans,
  PlaceCity,
  PlaceSpecialCity,
  PlaceUrbanizedArea,
  PlaceGreenery,
  PlaceGreeneryOnOcean,
  PlaceLavaFlows,
  PlaceMohole,
  PlaceMiningArea,
  PlaceMiningRights,
  PlaceNaturalPreserve,
  PlaceResearchOutpost,
  PlaceIndustrialCenter,
  PlaceNoctis,
  SellCards,
  Branch,
  HasTags,
  OffsetRequirements,
  // Choices only
  KeepCards,
}

const fromJSON = obj => {
  if (obj instanceof Array && typeof obj[0] === 'string') {
    const [opName, ...args] = obj
    if (!REGISTRY[opName]) return obj
    return REGISTRY[opName](...args.map(fromJSON))
  } else {
    return obj
  }
}

export const applyEffects = (
  state: GameState,
  action,
  effects: any[],
  card?: Card | Corporation
): GameState => {
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

export const applyAfterTileTriggers = (state: GameState, tile: Tile): GameState => {
  state.players.forEach(player => {
    const cards = [
      ...state.playerState[player].played.map(getCardByName),
      getCorporationByName(state.playerState[player].corporation),
    ]
    cards.forEach(card => {
      if (card.afterTileTriggers) {
        const triggers = <any>card.afterTileTriggers
        triggers.forEach(trigger => {
          const [[type, ownTile], effects] = trigger
          if (type === tile.type && (!ownTile || tile.owner === player)) {
            state = applyEffects(state, {player, choices: []}, effects, card)
          }
        })
      }
    })
  })
  return state
}

const placeSpecialTile = (state: GameState, tile: Tile, name: string): GameState => {
  state.map[name] = tile
  state = applyAfterTileTriggers(state, tile)

  return state
}

const placeTile = (state: GameState, tile: Tile, position: Position): GameState => {
  const [x, y] = position

  const key = `${x},${y}`
  if (state.map[key]) throw Error('Tile location taken.')
  state.map[key] = tile
  // todo: check restrictions on tiles
  const bonuses = getTileBonus(position)
  bonuses.forEach(bonus => {
    if (bonus === ResourceBonus.Card) {
      state = Draw(1)(state, {}, {})
    } else if (bonus === ResourceBonus.Plant) {
      state = changeInventory(state, state.player, ResourceType.Plant, 1)
    } else if (bonus === ResourceBonus.Steel) {
      state = changeInventory(state, state.player, ResourceType.Steel, 1)
    } else if (bonus === ResourceBonus.Titanium) {
      state = changeInventory(state, state.player, ResourceType.Titanium, 1)
    }
  })

  state = applyAfterTileTriggers(state, tile)

  return state
}
