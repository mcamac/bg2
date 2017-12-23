import {
  Transform,
  ResourceType,
  TileType,
  GameState,
  Card,
  RESOURCE_TYPES,
  Player,
  Milestones,
  Tag,
  Awards,
} from './types'
import {CARDS} from './cards'
import {setupInitialHands} from './deck'
import {HasTags, GetPlayerTags, isSubset, changeInventory} from './utils'
import {shuffle} from 'shuffle-seed'

const c = (...args: Transform[]): Transform => (state, action) => {
  let newState = state
  args.forEach(fn => (newState = fn(newState, action)))
  return newState
}

const changeProduction = (delta: number, resource: string): Transform => state => {
  const playerState = state.playerState[state.player]
  playerState.resources[resource].production += delta
  return state
}

const changeResources = (delta: number, resource: ResourceType): Transform => state => {
  const playerState = state.playerState[state.player]
  playerState.resources[resource].count += delta
  return state
}

const costs = (cost: number, resource: ResourceType): Transform => changeProduction(-cost, resource)

const ocean = state => state
const raiseHeat = state => state

const MAX_OXYGEN = 14

const raiseOxygen: Transform = state => {
  if (state.globalParameters.Oxygen < MAX_OXYGEN) {
    state.globalParameters.Oxygen += 1
    state.playerState[state.player].TR += 1
  }
  return state
}

const placeGreenery = (state, action) => {
  state.map[action.position] = {
    type: TileType.Greenery,
    owner: state.player,
  }
  return raiseOxygen(state)
}

const placeCity = (state, action) => {
  // TODO: Check validity.

  state.map[action.position] = {
    type: TileType.City,
    owner: state.player,
  }
  return state
}

const generationProduction: Transform = state => {
  state.players.forEach(player => {
    const playerState = state.playerState[player]

    // Convert energy into heat.
    playerState.resources[ResourceType.Heat].count +=
      playerState.resources[ResourceType.Energy].count

    playerState.resources[ResourceType.Energy].count = 0

    // Produce each resource.
    RESOURCE_TYPES.forEach(resource => {
      let production = playerState.resources[resource].production
      if (resource === ResourceType.Money) {
        production += playerState.TR
      }
      playerState.resources[resource].count += playerState.resources[resource].production
    })
  })

  return state
}

const resetBeforeGeneration: Transform = state => {
  state.passed = {}
  state.draft = {}
  state.players.forEach(player => {
    const playerState = state.playerState[player]
    playerState.hasIncreasedTRThisGeneration = false
  })
  return state
}

const standardProjects = {
  SELL_CARDS: (state: GameState, cards: Card[]) => {},
  POWER_PLANT: c(costs(11, ResourceType.Money), changeProduction(1, ResourceType.Money)),
  ASTEROID: (state: GameState) => c(costs(14, ResourceType.Money), raiseHeat),
  AQUIFER: (state: GameState) => c(costs(18, ResourceType.Money), ocean),
  GREENERY: c(costs(23, ResourceType.Money), placeGreenery),
  CITY: c(costs(25, ResourceType.Money), changeProduction(1, ResourceType.Money), placeCity),
}

const normalProduction = {
  GREENERY: c(costs(8, ResourceType.Plant), placeGreenery),
  RAISE_HEAT: c(costs(8, ResourceType.Heat), raiseHeat),
}

const SEED = 'martin'

export const getInitialGameState = (players: Player[], seed: string = SEED): GameState => {
  const playerState = {}

  let state = {
    generation: 0,
    players,
    firstPlayer: players[0],
    playerState,
    passed: {},
    player: players[0],
    deck: shuffle(CARDS.map(card => card.name), SEED),
    discards: [],
    globalParameters: {
      Oxygen: 0,
      Oceans: 0,
      Heat: -30,
    },
    map: {},
    milestones: [],
    awards: [],

    // Private
    draft: {},
    choosingCards: {},
    seed: SEED,
  }

  state = setupInitialHands(state)
  return state
}

export const getDiscount = (played: Card[], card: Card) => {
  let delta = 0
  played.forEach(playedCard => {
    if (playedCard.discounts) {
      playedCard.discounts.forEach(([discountDelta, tags]) => {
        if (tags) {
          if (isSubset(tags, card.tags || [])) {
            delta += discountDelta
          }
        } else {
          delta += discountDelta
        }
      })
    }
  })
  return delta
}

export const chooseCards = (state: GameState, chosen: Card[], player: Player): GameState => {
  // todo: Check subset of player
  // state.choosingCards[player]
  state = changeInventory(state, player, ResourceType.Money, -chosen.length * 3)
  state.playerState[player].hand = state.playerState[player].hand.concat(chosen)
  delete state.choosingCards[player]
  return state
}

const milestoneChecks: {[key: string]: ((s: GameState) => boolean)} = {
  [Milestones.Terraformer]: state => state.playerState[state.player].TR >= 35,
  // [Milestones.Mayor]: null,
  // [Milestones.Gardener]: null,
  [Milestones.Builder]: HasTags(8, Tag.Building),
  [Milestones.Planner]: state => state.playerState[state.player].hand.length >= 16,
}

const awardFns: {[key: string]: ((s: GameState, player: Player) => number)} = {
  [Awards.Landlord]: (state, player) =>
    Object.keys(state.map)
      .map(key => state.map[key].owner)
      .filter(owner => owner === player).length,
  [Awards.Banker]: (state, player) =>
    state.playerState[player].resources[ResourceType.Money].production,
  [Awards.Scientist]: (state, player) => GetPlayerTags(Tag.Science, player)(state),
  [Awards.Thermalist]: (state, player) =>
    state.playerState[player].resources[ResourceType.Heat].count,
  [Awards.Miner]: (state, player) =>
    state.playerState[player].resources[ResourceType.Steel].count +
    state.playerState[player].resources[ResourceType.Titanium].count,
}

const claimMilestone = (state: GameState, milestone: Milestones): GameState => {
  const ok = state.milestones.length < 3 && milestoneChecks[milestone](state)
  state.milestones.push({player: state.player, milestone})
  return state
}

const AWARD_COSTS = [8, 14, 20]
const fundAward = (state: GameState, award: Awards): GameState => {
  const cost = AWARD_COSTS[state.awards.length]
  state.playerState[state.player].resources[ResourceType.Money].count -= cost
  state.awards.push({
    player: state.player,
    award,
  })
  return state
}

// Enumerates all client messages.
export const handlers = {
  DRAFT_ROUND_CHOICE: null,
  CARD_BUY_CHOICE: null,
  // During generation
  CARD_ACTION: null,
  STANDARD_PROJECT: () => {},
  PLAY_CARD: () => {},
  CHOOSE_BUY_OR_DISCARD: () => {},
  CHOOSE_DISCARD: () => {},
}

export const handleAction = (state: GameState, action): GameState => {
  return state
}
