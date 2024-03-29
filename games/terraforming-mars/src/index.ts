import {omit, omitBy, pick, pull, mapValues, flatMap} from 'lodash'
import {shuffle} from './random'

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
  Phase,
  UserAction,
  PlayerState,
  ResourceState,
  ResourcesState,
  TurnAction,
  StandardProject,
  Corporation,
  NextCardEffect,
} from './types'
import {CARDS, getCardByName} from './cards'
import {setupInitialHands, handlePlayerChoice, isDraftDone, setupDraft} from './deck'
import {
  clone,
  HasTags,
  GetPlayerTags,
  isSubset,
  changeInventory,
  checkCardRequirements,
  applyEffects,
  applyAfterCardTriggers,
  cloneState,
  HasGreeneries,
  HasPlayerCities,
} from './utils'
import {CORPORATIONS, getCorporationByName} from './corporations'
import {STANDARD_PROJECTS} from './projects'
import {getVP} from './vp'

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

export const generationProduction: Transform = state => {
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
      playerState.resources[resource].count += production
    })
  })

  return state
}

const resetNewGeneration: Transform = state => {
  state.generation++
  state.passed = {}
  state.draft = {}
  state.firstPlayer =
    state.players[(state.players.indexOf(state.firstPlayer) + 1) % state.players.length]
  state.actionsDone = 0
  state.player = state.firstPlayer
  state.players.forEach(player => {
    const playerState = state.playerState[player]
    playerState.hasIncreasedTRThisGeneration = false
    playerState.cardActionsUsedThisGeneration = {}
  })

  state.log.push({
    type: 'NewGeneration',
    n: state.generation,
  })
  return state
}

const normalProduction = {
  GREENERY: c(costs(8, ResourceType.Plant), placeGreenery),
  RAISE_HEAT: c(costs(8, ResourceType.Heat), raiseHeat),
}

const SEED = 'martin'

const INITIAL_RESOURCES: ResourcesState = {
  [ResourceType.Money]: {production: 0, count: 0},
  [ResourceType.Titanium]: {production: 0, count: 0},
  [ResourceType.Steel]: {production: 0, count: 0},
  [ResourceType.Plant]: {production: 0, count: 0},
  [ResourceType.Energy]: {production: 0, count: 0},
  [ResourceType.Heat]: {production: 0, count: 0},
}

export const getInitialGameState = (players: Player[], seed: string = SEED): GameState => {
  let state = {
    phase: Phase.ChoosingCorporations,
    generation: 1,
    isLastGeneration: false,
    isOver: false,

    players,
    firstPlayer: players[0],
    playerState: <{[key: string]: PlayerState}>{},
    passed: {},
    player: players[0],
    actionsDone: 0,
    deck: shuffle(CARDS.map(card => card.name), seed),
    discard: [],
    globalParameters: {
      Oxygen: 0,
      Oceans: 0,
      Heat: -30,
    },
    map: {},
    milestones: [],
    awards: [],
    log: [],

    // Private
    draft: {},
    choosingCards: {},
    choosingCorporations: {},
    seed,
  }

  const shuffled = shuffle(CORPORATIONS, seed)

  state.players.forEach((player, i) => {
    state.choosingCorporations[player] = shuffled.splice(2 * i, 2).map(c => c.name)
    state.playerState[player] = {
      TR: 20,
      hand: [],
      played: [],
      corporation: '',
      cardResources: {},
      cardActionsUsedThisGeneration: {},
      hasIncreasedTRThisGeneration: false,
      globalRequirementsOffset: 0,
      resources: clone<ResourcesState>(INITIAL_RESOURCES),
      choices: [],
      statuses: {},
      nextCardEffect: null,
      conversions: {
        Titanium: 3,
        Steel: 2,
      },
    }
  })

  state = setupInitialHands(state)
  return state
}

export const getDiscount = (
  played: Card[],
  corporation: Corporation | null,
  nextCardEffect: any,
  card: Card
) => {
  let delta = 0

  // Examine played cards for discounts
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

  // Examine corporation for discount
  if (corporation && corporation.discounts) {
    corporation.discounts.forEach(([discountDelta, tags]) => {
      if (tags) {
        if (isSubset(tags, card.tags || [])) {
          delta += discountDelta
        }
      } else {
        delta += discountDelta
      }
    })
  }

  // Examine if there are any next card effects
  if (nextCardEffect) {
    let [effectName, ...args] = nextCardEffect
    if (effectName === NextCardEffect.Discount) delta += args[0]
  }

  return delta
}

export const buyCards = (
  state: GameState,
  player: Player,
  chosen: string[],
  free: boolean = false
): GameState => {
  state.log.push({
    type: 'BuyCards',
    player,
    n: chosen.length,
    free,
  })
  // todo: Check subset of player
  // state.choosingCards[player]
  if (!free) {
    state = changeInventory(state, player, ResourceType.Money, -chosen.length * 3)
  }
  state.playerState[player].hand = state.playerState[player].hand.concat(chosen)
  delete state.choosingCards[player]
  // todo: Add remaining to discard

  return state
}

const isDoneBuyingCards = (state: GameState): boolean => {
  return state.players.map(player => !state.choosingCards[player]).every(x => x)
}

const isDoneChoosingCorporations = (state: GameState): boolean => {
  return state.players.map(player => !state.choosingCorporations[player]).every(x => x)
}

const milestoneChecks: {[key: string]: (s: GameState) => boolean} = {
  [Milestones.Terraformer]: state => state.playerState[state.player].TR >= 35,
  [Milestones.Mayor]: HasPlayerCities(3),
  [Milestones.Gardener]: HasGreeneries(3),
  [Milestones.Builder]: HasTags(8, Tag.Building),
  [Milestones.Planner]: state => state.playerState[state.player].hand.length >= 16,
}

// TODO: Milestone costs
const MILESTONE_COSTS = [5, 10, 20]
export const claimMilestone = (state: GameState, milestone: Milestones): GameState => {
  const ok =
    state.milestones.length < 3 &&
    milestoneChecks[milestone](state) &&
    !state.milestones.find(claim => claim.milestone === milestone)

  if (!ok) {
    throw new Error('Cannot claim milestone')
  }
  state.milestones.push({player: state.player, milestone})

  state.log.push({
    type: 'ClaimMilestone',
    player: state.player,
    milestone,
  })
  return state
}

const AWARD_COSTS = [8, 14, 20]
export const fundAward = (state: GameState, award: Awards): GameState => {
  const cost = AWARD_COSTS[state.awards.length]
  state.playerState[state.player].resources[ResourceType.Money].count -= cost
  state.awards.push({
    player: state.player,
    award,
  })
  return state
}

const haveAllPassed = state => {
  return state.players.map(player => state.passed[player]).every(x => x)
}

const switchToNextPlayer = (state: GameState) => {
  if (haveAllPassed(state)) {
    if (state.phase === Phase.FinalGreenery) {
      state.isOver = true
      state.phase = Phase.Finished
      state.vp = getVP(state)
      return state
    }

    // Generation over
    state = generationProduction(state)
    state = resetNewGeneration(state)

    if (state.isLastGeneration) {
      state.phase = Phase.FinalGreenery
      return state
    }

    state = setupDraft(state)
    state.phase = Phase.Draft

    if (state.players.length === 1) {
      // Skip draft in solo mode.
      state.draft[state.player].taken = state.draft[state.player].queued[0]
      state.draft[state.player].queued = []
      state = startActions(state)
    }

    return state
  }
  const playerIndex = state.players.indexOf(state.player)
  let offset = 1
  let nextPlayer = state.player
  while (true) {
    nextPlayer = state.players[(playerIndex + offset) % state.players.length]
    if (!state.passed[nextPlayer]) break
    offset++
  }
  state.player = nextPlayer
  state.playerState[state.player].choices = []
  state.actionsDone = 0
  return state
}

export const turnActionHandlers = {
  [TurnAction.ClaimMilestone]: (state, action) => {
    return claimMilestone(state, action.milestone)
  },
  [TurnAction.FundAward]: (state, action) => {
    return fundAward(state, action.award)
  },
  [TurnAction.StandardProject]: (state, action) => {
    state.log.push({
      type: 'StandardProject',
      project: action.project,
      player: state.player,
    })

    state = applyEffects(state, action, STANDARD_PROJECTS[action.project].effects)
    // standard project triggers

    return state
  },
  [TurnAction.PlantGreenery]: (state, action) => {
    const greeneryCost = state.playerState[state.player].corporation === 'Ecoline' ? 7 : 8
    state = applyEffects(state, action, [
      ['PlaceGreenery'],
      ['ChangeInventory', -greeneryCost, ResourceType.Plant],
    ])
    return state
  },
  [TurnAction.RaiseHeat]: (state, action) => {
    state = applyEffects(state, action, [
      ['IncreaseTemperature', 1],
      ['ChangeInventory', -8, ResourceType.Heat],
    ])
    // standard project triggers

    return state
  },
  [TurnAction.PlayCard]: (state: GameState, action): GameState => {
    const playerState = state.playerState[state.player]
    const cardName = <string>action.card
    const card: Card = getCardByName(action.card)

    // Check requirements
    const meetsRequirements = checkCardRequirements(card, state)
    if (!meetsRequirements) throw new Error('Does not meet requirements')

    // Get discount
    const played: Card[] = playerState.played.map(getCardByName)
    const corporation: Corporation = getCorporationByName(playerState.corporation)
    const discount = getDiscount(played, corporation, playerState.nextCardEffect, card)
    const actualCost = Math.max(0, card.cost - discount)

    const resources = {
      Money: action.resources.Money || 0,
      Steel: action.resources.Steel || 0,
      Titanium: action.resources.Titanium || 0,
    }

    state.log.push({
      type: 'PlayCard',
      player: state.player,
      card: action.card,
      resources,
    })

    const paidFor =
      resources.Money +
      playerState.conversions.Steel * resources.Steel +
      playerState.conversions.Titanium * resources.Titanium

    if ((card.tags || []).indexOf(Tag.Building) === -1 && resources.Steel > 0)
      throw Error('Cannot use steel.')
    if ((card.tags || []).indexOf(Tag.Space) === -1 && resources.Titanium > 0)
      throw Error('Cannot use titanium.')
    if (paidFor < actualCost) throw Error('Did not pay enough.')

    changeInventory(state, state.player, ResourceType.Money, -resources.Money)
    changeInventory(state, state.player, ResourceType.Steel, -resources.Steel)
    changeInventory(state, state.player, ResourceType.Titanium, -resources.Titanium)

    // Play to board and remove from hand
    playerState.played.push(cardName)
    pull(playerState.hand, cardName)

    // Clear any "next card effects" from the player state
    if (playerState.nextCardEffect) playerState.nextCardEffect = []

    // Card effects (read choices)
    if (card.effects) {
      state = applyEffects(state, action, card.effects, card)
    }

    // After-card triggers
    state = applyAfterCardTriggers(state, card, state.player)

    return state
  },
  [TurnAction.CardAction]: (state: GameState, action): GameState => {
    const card = getCardByName(action.card)
    const cardActions = card.actions
    if (!cardActions || !cardActions[action.index]) throw Error('Invalid action.')
    if (state.playerState[state.player].cardActionsUsedThisGeneration[action.card])
      throw Error('Card action already used.')

    const effects = cardActions[action.index]

    state = applyEffects(state, action, effects, card)
    state.playerState[state.player].cardActionsUsedThisGeneration[action.card] = true

    return state
  },
}

// Enumerates all client messages.
export const handlers = {
  // During drafts.
  [UserAction.DraftRoundChoice]: (state, action) => {
    state = handlePlayerChoice(state, action.player, action.choice)
    if (isDraftDone(state)) {
      state = startActions(state)
    }
    return state
  },
  [UserAction.CorpAndCardsChoice]: (state, action) => {
    // Assign corp and initial bonuses
    state.playerState[action.player].corporation = action.corporation
    const corporation = getCorporationByName(action.corporation)
    state.playerState[action.player].resources[ResourceType.Money].count = corporation.startingMoney
    delete state.choosingCorporations[action.player]

    state.log.push({
      type: 'CorpChoice',
      player: action.player,
      corporation: corporation.name,
    })

    // Buy and possibly pay for cards
    const cardsAreFree = corporation.name === 'Beginner Corporation'
    state = buyCards(state, action.player, action.cards, cardsAreFree)

    // Possible corporation effects
    if (corporation.effects) {
      state = applyEffects(state, action, corporation.effects)
    }

    if (isDoneChoosingCorporations(state)) {
      state.phase = Phase.Actions
      state.player = state.firstPlayer
      state.passed = {}
    }
    return state
  },
  [UserAction.BuyCards]: (state: GameState, action) => {
    state = buyCards(state, action.player, action.chosen)
    if (isDoneBuyingCards(state)) {
      state.phase = Phase.Actions
      state.player = state.firstPlayer
      state.passed = {}
    }
    return state
  },
  // During generation
  [UserAction.Action]: (state: GameState, action) => {
    // console.log('action', state, action)
    if (action.player && action.player !== state.player) throw Error('Invalid player')
    state = turnActionHandlers[action.actionType](state, action)

    // Check if any remaining choices.
    if (state.playerState[state.player].choices.length > 0) {
      state.phase = Phase.Choices
      return state
    }

    // Check endgame conditions.
    if (
      state.globalParameters.Oceans === 9 &&
      state.globalParameters.Heat === 8 &&
      state.globalParameters.Oxygen === 14
    ) {
      state.isLastGeneration = true
    }

    state.actionsDone++
    if (state.actionsDone === 2) {
      // Get next player.
      state = switchToNextPlayer(state)
    }
    return state
  },

  [UserAction.Choices]: (state: GameState, action) => {
    if (action.player && action.player !== state.player) throw Error('Invalid player')
    const currentChoice = state.playerState[state.player].choices[0]
    state.playerState[state.player].choices.splice(0, 1)
    state = applyEffects(state, action, currentChoice.effects)

    if (state.playerState[state.player].choices.length > 0) {
      state.phase = Phase.Choices
      return state
    }

    state.actionsDone++
    state.phase = Phase.Actions
    if (state.actionsDone === 2) {
      // Get next player.
      state = switchToNextPlayer(state)
    }
    return state
  },

  [UserAction.Cede]: (state, action): GameState => {
    if (action.player && action.player !== state.player) throw Error('Invalid player')
    // Get next player.
    if (state.actionsDone === 0) throw Error('Cannot cede without acting.')
    state = switchToNextPlayer(state)

    state.log.push({
      type: 'Cede',
      player: action.player,
    })
    return state
  },

  [UserAction.Pass]: (state, action) => {
    if (!(state.phase === Phase.Actions || state.phase === Phase.FinalGreenery))
      throw Error('Invalid phase')
    if (action.player && action.player !== state.player) throw Error('Invalid player')

    state.log.push({
      type: 'Pass',
      player: action.player,
    })

    state.passed[state.player] = true
    state = switchToNextPlayer(state)
    return state
  },

  // From cards
  CHOOSE_BUY_OR_DISCARD: () => {},
  CHOOSE_DISCARD: () => {},
}

const startActions: Transform = state => {
  state.player = state.firstPlayer
  state.phase = Phase.CardBuying
  state.players.forEach(player => {
    state.choosingCards[player] = state.draft[player].taken
    delete state.draft[player]
  })
  return state
}

export const handleAction = (state: GameState, action): GameState => {
  const stateCopy = cloneState(state)
  if (handlers[action.type]) {
    // try {
    return handlers[action.type](state, action)
    // } catch (e) {
    //   console.error('Action failed', action, e)
    // } finally {
    //   return stateCopy
    // }
  }
  return stateCopy
}

export const getClientState = (state: GameState, player: Player) => {
  const publicState = omit(state, [
    'playerState',
    'deck',
    'seed',
    'draft',
    'choosingCards',
    'choosingCorporations',
  ]) as any

  publicState.playerState = mapValues(state.playerState, (pstate, p) =>
    p === player ? pstate : omit(pstate, ['hand'])
  )

  const keys = ['draft', 'choosingCards', 'choosingCorporations']
  keys.forEach(key => {
    publicState[key] = pick(state[key], player)
  })

  publicState['deckSize'] = state.deck.length

  return publicState
}

// Used by server.
export const TerraformingMars = {
  getInitialState: getInitialGameState,
  reducer: handleAction,
  getClientState,
}
