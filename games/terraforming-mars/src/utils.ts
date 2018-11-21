import {cloneDeep, pull, flatMap, sum, values, zip} from 'lodash'
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
  NextCardEffect,
  RESOURCE_TYPES,
} from './types'
import {
  isOcean,
  isVolcano,
  getTileBonus,
  isAdjacentToOwn,
  getAdjacentTiles,
  makeKeyFromPosition,
  isAdjacentToType,
} from './tiles'
import {getCardByName} from './cards'
import {draw} from './deck'
import {getCorporationByName} from './corporations'

// export const MultiCost = (cost: number, otherResources: ResourceType[]) => (
//   state: GameState,
//   action,
//   choice: {resources: any}
// ): GameState => {
//   let resources = {
//     Money: choice.resources.Money || 0,
//   }
//   otherResources.forEach(resource => {
//     resources[resource] = choice.resources[resource]
//   })

//   return state
// }

export const DecreaseAnyProduction = (delta: number, type: string) => (
  state: GameState,
  action,
  choice: {player: string},
  card: Card
): GameState => {
  if (!choice.player) {
    return state
  }

  state.log.push({
    type: 'ProductionChange',
    player: choice.player,
    resource: type,
    from: state.playerState[choice.player].resources[type].production,
    to: state.playerState[choice.player].resources[type].production - delta,
  })

  state.playerState[choice.player].resources[type].production -= delta

  return state
}

export const DecreaseAnyInventory = (delta: number, type: string) => (
  state: GameState,
  action,
  choice: {player: string},
  card: Card
): GameState => {
  if (!choice.player) {
    return state
  }

  const oldCount = state.playerState[choice.player].resources[type].count
  state.playerState[choice.player].resources[type].count -= delta

  if (state.playerState[choice.player].resources[type].count < 0) {
    state.playerState[choice.player].resources[type].count = 0
  }

  state.log.push({
    type: 'InventoryChange',
    player: choice.player,
    resource: type,
    from: oldCount,
    to: state.playerState[choice.player].resources[type].count,
  })
  return state
}

export const RoboticWorkforce = () => (
  state: GameState,
  action,
  choice: {card: string; cardAction: any}
): GameState => {
  const cardOwner = state.players.find(
    player => state.playerState[player].played.indexOf(choice.card) >= 0
  )
  if (!cardOwner) throw Error('Invalid card. Not owner.')

  const card = getCardByName(choice.card)
  if (!card.tags || card.tags.indexOf(Tag.Building) === -1) {
    throw Error('Card is not a building.')
  }

  let clonedState = cloneState(state)

  if (card.effects) {
    clonedState = applyEffects(clonedState, choice.cardAction, card.effects, card)
  }

  // Update all players' resource production.
  state.players.forEach(player => {
    RESOURCE_TYPES.forEach(resource => {
      state.playerState[player].resources[resource].production =
        clonedState.playerState[player].resources[resource].production
    })
  })

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
  const player = (action && action.player) || state.player
  const playerState = state.playerState[player]
  playerState.resources[resource].production += n

  if (resource !== ResourceType.Money && playerState.resources[resource].production < 0) {
    throw Error(`Not enough ${resource} production`)
  }

  state.log.push({
    type: 'ProductionChange',
    player: player,
    resource,
    from: playerState.resources[resource].production - n,
    to: playerState.resources[resource].production,
  })

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

  state.log.push({
    type: 'Draw',
    player: state.player,
    n,
  })

  return newState
}

export const IncreaseTR = (n: number | any[]) => (state: GameState): GameState => {
  if (typeof n !== 'number') {
    const [effect, ...args] = n
    n = <number>REGISTRY[effect](...args)
  }
  state.playerState[state.player].TR += n
  state.playerState[state.player].hasIncreasedTRThisGeneration = true

  state.log.push({
    type: 'IncreaseTR',
    player: state.player,
    from: state.playerState[state.player].TR - n,
    n,
  })

  return state
}

export const IncreaseResourceValue = (n: number, resource: ResourceType) => (
  state: GameState
): GameState => {
  state.log.push({
    type: 'IncreaseResourceValue',
    player: state.player,
    from: state.playerState[state.player].conversions[resource],
    n,
  })

  state.playerState[state.player].conversions[resource] += n
  return state
}

export const IncreaseTemperature = (n: number) => (state: GameState, action, choice): GameState => {
  if (state.globalParameters.Heat < 0 && state.globalParameters.Heat + 2 * n >= 0) {
    // todo: should be part of state machine
    // Player gets to place an ocean
    state.playerState[state.player].choices.push({
      type: 'PlaceOcean',
      effects: [['PlaceOceans']],
    })
  }

  const from = state.globalParameters.Heat
  const to = state.globalParameters.Heat + 2 * n

  state.log.push({
    type: 'IncreaseTemperature',
    player: state.player,
    from,
    to,
  })

  state.log.push({
    type: 'IncreaseTR',
    player: state.player,
    from: state.playerState[state.player].TR,
    to: state.playerState[state.player].TR + n,
  })

  state.playerState[state.player].TR += n
  state.playerState[state.player].hasIncreasedTRThisGeneration = true

  let newState = state
  if (from < -24 && -24 <= to) {
    newState = ChangeProduction(1, ResourceType.Heat)(state)
  }

  if (from < -20 && -20 <= to) {
    newState = ChangeProduction(1, ResourceType.Heat)(state)
  }

  newState.globalParameters.Heat = to

  return newState
}

export const RaiseOxygen = (delta: number) => (state: GameState, action, choice): GameState => {
  state.log.push({
    type: 'RaiseOxygen',
    player: state.player,
    from: state.globalParameters.Oxygen,
    to: state.globalParameters.Oxygen + delta,
  })

  state.globalParameters.Oxygen += 1
  state.playerState[state.player].TR += 1
  state.playerState[state.player].hasIncreasedTRThisGeneration = true
  return state
}

export const PlaceOceans = () => (state: GameState, action, choice): GameState => {
  state.log.push({
    type: 'PlaceOceans',
    player: state.player,
  })

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
  if (bonus.indexOf(ResourceBonus.Steel) === -1 && bonus.indexOf(ResourceBonus.Titanium) === -1)
    throw Error('Invalid tile for mining area')
  if (!isAdjacentToOwn(state, choice.location)) throw Error('Not adjacent to own tile.')

  state = placeTile(state, {owner: state.player, type: TileType.MiningArea}, choice.location)

  const resource =
    bonus.indexOf(ResourceBonus.Titanium) !== -1 ? ResourceType.Titanium : ResourceType.Steel

  state = ChangeProduction(1, resource)(state)
  return state
}

export const PlaceMiningRights = () => (state: GameState, action, choice): GameState => {
  const bonus = getTileBonus(choice.location)
  if (bonus.indexOf(ResourceBonus.Steel) < 0 && bonus.indexOf(ResourceBonus.Titanium) < 0)
    throw Error('Invalid tile for mining area')

  state = placeTile(state, {owner: state.player, type: TileType.MiningArea}, choice.location)

  const resource =
    bonus.indexOf(ResourceBonus.Titanium) !== -1 ? ResourceType.Titanium : ResourceType.Steel

  state = ChangeProduction(1, resource)(state)
  return state
}

export const PlaceIndustrialCenter = () => (state: GameState, action, choice): GameState => {
  if (!isAdjacentToType(state, choice.location, TileType.City)) {
    throw Error('Not adjacent to city.')
  }
  return placeTile(state, {owner: state.player, type: TileType.IndustrialCenter}, choice.location)
}

export const PlaceGreenery = () => (state: GameState, action, choice): GameState => {
  // todo: check adjacency (if possible)
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
    if (state.map[makeKeyFromPosition([x, y])]) throw Error('Cannot be next to another tile.')
  })

  state = placeTile(state, {owner: state.player, type: TileType.City}, choice.location)
  return state
}

export const PlaceRestrictedArea = () => (state: GameState, action, choice): GameState => {
  state = placeTile(state, {owner: state.player, type: TileType.RestrictedArea}, choice.location)
  return state
}

export const LandClaim = () => (state: GameState, action, choice): GameState => {
  state = placeTile(state, {owner: state.player, type: TileType.LandClaim}, choice.location)
  return state
}
export const ArtificialLake = {}

export const PlaceNuclearZone = () => (state: GameState, action, choice): GameState => {
  state = placeTile(state, {owner: state.player, type: TileType.NuclearZone}, choice.location)
  return state
}

export const PlaceUrbanizedArea = () => (state: GameState, action, choice): GameState => {
  const nAdjacentCities = getAdjacentTiles(choice.location).filter(
    ([x, y]) =>
      state.map[makeKeyFromPosition([x, y])] &&
      state.map[makeKeyFromPosition([x, y])].type === TileType.City
  ).length

  if (nAdjacentCities < 2) throw Error('Not next to 2 cities.')

  state = placeTile(state, {owner: state.player, type: TileType.City}, choice.location)
  return state
}

export const PlaceNaturalPreserve = () => (state: GameState, action, choice): GameState => {
  getAdjacentTiles(choice.location).forEach(([x, y]) => {
    if (state.map[makeKeyFromPosition([x, y])]) throw Error('Cannot be next to another tile.')
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

export const SearchForLife = () => (state: GameState, action, choice, card): GameState => {
  changeInventory(state, state.player, ResourceType.Money, -1)

  const playerState = state.playerState[state.player]
  let [[drawn], newState] = draw(1, state)

  const drawnCard = getCardByName(drawn)
  if (drawnCard.tags && drawnCard.tags.indexOf(Tag.Microbe) !== -1) {
    if (!playerState.cardResources[card.name]) playerState.cardResources[card.name] = 0
    playerState.cardResources[card.name] += 1
  }

  newState.discard.push(drawn)
  return newState
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
  let playerState = state.playerState[state.player]
  let offset = playerState.globalRequirementsOffset || 0

  // Check nextCardEffect; add if necessary -- maybe refactor this and do a type check on the arg types?
  if (playerState.nextCardEffect) {
    let [effectName, ...args] = playerState.nextCardEffect
    if (effectName === NextCardEffect.OffsetRequirements) offset = offset + args[0]
  }

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

export const MinProduction = (thresh: number, resource: ResourceType) => (
  state: GameState
): boolean => {
  const playerState = state.playerState[state.player]
  return playerState.resources[resource].production >= thresh
}

/* Card Tag Requirement Check */

export const HasTags = (minimum: number, tag: Tag): ((state: GameState) => boolean) => {
  return state => GetTags(tag)(state) >= minimum
}

export const HasCities = (minimum: number): ((state: GameState) => boolean) => {
  return state => GetCities()(state) >= minimum
}

export const HasCitiesOnMars = (minimum: number): ((state: GameState) => boolean) => {
  return state => true
}

export const HasPlayerCities = (minimum: number): ((state: GameState) => boolean) => {
  return state => GetPlayerCities(state.player)(state) >= minimum
}

export const HasGreeneries = (minimum: number): ((state: GameState) => boolean) => {
  return state => GetPlayerGreeneries(state.player)(state) >= minimum
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

export const VP_REGISTRY = {
  VPIfCardHasResources,
  VPForTags,
  VPForCardResources,
  VPForCitiesOnMars,
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

export const GetPlayerGreeneries = (player: Player) => (state: GameState): number => {
  return values(state.map).filter(tile => tile.owner === player && tile.type === TileType.Greenery)
    .length
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

export const GetPlayerCities = (player: Player) => (state: GameState): number => {
  return values(state.map).filter(tile => tile.owner === player && tile.type === TileType.City)
    .length
}

export const GetCities = () => (state: GameState): number => {
  return values(state.map).filter(tile => tile.type === TileType.City).length
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

const AddNextCardEffect = (
  nextCardEffect: NextCardEffect,
  ...args: any[]
): ((state: GameState, action, choice, card: Card) => GameState) => {
  return (state: GameState, action, choice, card: Card): GameState => {
    const playerState = state.playerState[state.player]
    playerState.nextCardEffect = [nextCardEffect, ...args]

    return state
  }
}

const REGISTRY = {
  AddNextCardEffect,
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
  GetCities,
  GetX,
  GetTags,
  IncreaseTR,
  IncreaseTemperature,
  IncreaseResourceValue,
  RaiseOxygen,
  RoboticWorkforce,
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
  PlaceNuclearZone,
  PlaceResearchOutpost,
  PlaceRestrictedArea,
  PlaceIndustrialCenter,
  PlaceNoctis,
  LandClaim,
  SearchForLife,
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
  if (delta != 0) {
    state.log.push({
      type: 'ChangeInventory',
      player: player,
      resource,
      from: state.playerState[player].resources[resource].count,
      to: state.playerState[player].resources[resource].count + delta,
    })
  }

  state.playerState[player].resources[resource].count += delta
  if (state.playerState[player].resources[resource].count < 0) {
    // state.playerState[player].resources[resource].count = 0
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
  HasCities,
  HasCitiesOnMars,
  MinProduction,
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

export const getOceanRefund = (state: GameState, position: Position): number => {
  const numAdjacentOceans = getAdjacentTiles(position)
    .map(makeKeyFromPosition) // Make string key from the position
    .map(key => (state.map[key] ? state.map[key].type === TileType.Ocean : false)) // Check if ocean
    .map((foundOcean: boolean): number => (foundOcean ? 1 : 0))
    .reduce((x, y) => x + y) // Sum together number of oceans found
  let oceanMultiplier = 2
  return numAdjacentOceans * oceanMultiplier
}

const placeSpecialTile = (state: GameState, tile: Tile, name: string): GameState => {
  state.map[name] = tile
  state = applyAfterTileTriggers(state, tile)

  return state
}

const placeTile = (state: GameState, tile: Tile, position: Position): GameState => {
  const [x, y] = position

  const key = makeKeyFromPosition(position)
  if (state.map[key]) {
    // Check for land claim belonging to current player.
    if (!(state.map[key].owner === state.player && state.map[key].type === TileType.LandClaim)) {
      throw Error('Tile location taken.')
    }
  }
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

  const oceanRefund = getOceanRefund(state, position)
  state = changeInventory(state, state.player, ResourceType.Money, oceanRefund)

  state = applyAfterTileTriggers(state, tile)

  return state
}
