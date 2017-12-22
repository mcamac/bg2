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
import {HasTags, GetPlayerTags} from './utils'

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

const handlers = {
  STANDARD_PROJECT: () => {},
  PLAY_CARD: () => {},
}

const draw = (n: number, state: GameState): [Card[], GameState] => {
  return [[], state]
}

const setupDraft: Transform = state => {
  const draft = state.draft
  const drawResult = draw(16, state)
  const cards = drawResult[0]
  state = drawResult[1]

  state.players.forEach((player, i) => {
    draft[player] = {
      taken: [],
      queued: [cards.slice(4 * i, 4 * (i + 1))],
    }
  })

  return state
}

const handlePlayerChoice = (state: GameState, player: Player, choice: Card): GameState => {
  const playerIndex = state.players.indexOf(player)
  const currentChoices = state.draft[player].queued[0]
  const chosenIndex = currentChoices.findIndex(c => c.name === choice.name)
  state.draft[player].taken.push(choice)
  state.draft[player].queued.splice(0, 1)

  // Pass rest of cards to next player.
  const choicesLeft = currentChoices.splice(chosenIndex, 1)
  const nextPlayer =
    state.players[
      (playerIndex + (state.generation % 0 === 1 ? 1 : -1) + state.players.length) %
        state.players.length
    ]
  state.draft[nextPlayer].queued.push(choicesLeft)

  return state
}

const checkDraftFinished = (state: GameState): boolean => {
  return state.players.map(player => state.draft[player].taken.length === 4).every(x => x)
}

const getInitialGameState = (players: Player[]): GameState => {
  const playerState = {}

  return {
    generation: 0,
    players,
    firstPlayer: players[0],
    playerState,
    passed: {},
    player: players[0],
    map: null,
    deck: CARDS as Card[], // TODO: Nope
    discards: [],
    milestones: null,
    awards: null,
    globalParameters: {
      Oxygen: 0,
      Oceans: 0,
      Heat: -30,
    },

    draft: {},
  }
}

function isSubset<T>(l1: T[], l2: T[]): boolean {
  const s1 = new Set(l1)
  const s2 = new Set(l2)
  for (var elem of Array.from(s1.values())) {
    if (!s2.has(elem)) {
      return false
    }
  }
  return true
}

export const getDiscount = (played: Card[], card: Card) => {
  let delta = 0
  played.forEach(playedCard => {
    if (playedCard.discounts) {
      playedCard.discounts.forEach(discount => {
        if (discount.tags) {
          if (isSubset(discount.tags, card.tags)) {
            delta += discount.delta
          }
        } else {
          delta += discount.delta
        }
      })
    }
  })
  return delta
}

const milestoneChecks: {[key: string]: ((s: GameState) => boolean)} = {
  [Milestones.Terraformer]: state => state.playerState[state.player].TR >= 35,
  [Milestones.Mayor]: null,
  [Milestones.Gardener]: null,
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

export const handleAction = {}
