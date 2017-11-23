import {lensPath, set, toPairs, fromPairs, remove} from 'ramda'
import {id, key, getl, setl} from 'lens.ts'
import shuffleSeed from 'shuffle-seed'
import {cloneDeep} from 'lodash'

const STAGES = ['AUCTION', 'RESOURCES', 'CITIES', 'POWER', 'REPLENISH']

const STATES = [
  'AUCTION_CHOOSE',
  'AUCTION_BID',
  'RESOURCES_CHOOSE',
  'CITIES_CHOOSE',
  'POWER_CHOOSE', // No turn order.
  'REPLENISH', // Computer only
]

class PowerGrid {
  constructor(state) {
    // this._state = state
  }
}

const log = obj => console.log(obj)

const RESOURCES = ['coal', 'gas', 'oil', 'uranium']

export const CARDS = [
  [3, '2C', 1],
  [4, '2C', 1],
  [5, '2G', 1],
  [6, '1O', 1],
  [7, '1C', 1],
  [8, '3GO', 2],
  [9, '3C', 2],
  [10, '2O', 2],
  [11, '0W', 1],
  [12, '2C', 2],
  [13, '1U', 2],
  [14, '1G', 2],
  [15, '1C', 2],
  [16, '2G', 3],
  [17, '0W', 2],
  [18, '2O', 3],
  [19, 'G', 3],
  [20, '3C', 4],
  [21, '1U', 3],
  [22, '3GO', 5],
  [23, '2O', 4],
  [24, '0W', 3],
  [25, '2C', 5],
  [26, '1G', 4],
  [27, '1C', 4],
  [28, '0W', 3],
  [29, '2C', 5],
  [30, '2O', 5],
  [31, '0W', 4],
  [32, '2U', 5],
  [33, '3C', 6],
  [34, '3G', 6],
  [35, '2GO', 6],
  [36, '0W', 5],
  [37, '2U', 6],
  [38, '3O', 6],
  [39, '2G', 6],
  [40, '2C', 6],
  [42, '2O', 6],
  [44, '0W', 6],
  [46, '2G', 7],
  [50, '2U', 7],
]

const MONEY_FOR_CITY_POWER = [11]

const RESOURCES_PER_PHASE = [
  {
    coal: 4,
    gas: 2,
    oil: 4,
    uranium: 1,
  },
  {
    coal: 4,
    gas: 2,
    oil: 4,
    uranium: 1,
  },
  {
    coal: 4,
    gas: 2,
    oil: 4,
    uranium: 1,
  },
]

interface ResourceCount {
  coal: number
  gas: number
  oil: number
  uranium: number
}

interface Plant {
  value: number
  resourcesNeeded: [[string]] // Allow for half/half resources
  cities: number
  heldResources: [string]
}

interface PlayerState {
  plants: [Plant]
  money: number
  cities: [string]
}

interface GameState {
  numPlayers: number
  player: string
  players: [string]
  playerOrder: [string]
  turn: number
  phase: number // 1, 2, 3
  stage: string
  stageState: {
    [key: string]: any
  }
  map: {
    [index: string]: any
  }
  resourceAvailable: ResourceCount
  resourcePool: ResourceCount
  auctioningPlants: any
  deck: any
  playerState: {
    [key: string]: PlayerState
  }
}

const getInitialDeck = (): [Object] => {
  let darkCards = CARDS.slice(0, 13)
  const setAsideIndex = Math.floor(Math.random() * 13)
  const setAside = darkCards[setAsideIndex]
  darkCards.splice(setAsideIndex, 1)
  const deck = shuffleSeed(darkCards, 'k').concat(
    shuffleSeed(CARDS.slice(13), 'k')
  )
  return deck
}

export const getInitialState = (players: [string]): GameState => {
  const playerState = {}
  players.forEach(player => {
    playerState[player] = {
      money: 50,
      plants: [],
      cities: [],
    }
  })

  return {
    numPlayers: players.length,
    player: players[0],
    players,
    playerOrder: cloneDeep(players),
    turn: 1,
    phase: 1,
    stage: 'AUCTION_CHOOSE',
    stageState: {
      eligiblePlayers: cloneDeep(players),
    },
    map: {},
    resourceAvailable: {
      coal: 23,
      gas: 18,
      oil: 14,
      uranium: 2,
    },
    resourcePool: {
      coal: 4,
      gas: 6,
      oil: 6,
      uranium: 10,
    },
    auctioningPlants: CARDS.slice(0, 8),
    deck: CARDS.slice(8),
    playerState,
  }
}

const check = (predicate: any, message: string) => {
  if (!predicate) {
    throw new Error(message)
  }
}

interface AuctionChoice {
  player: string
  pass: boolean
  i?: number
  price?: number
}

interface ResourceBuy {
  player: string
  resources: ResourceCount
}

const getNextPlayerInAuction = state => {
  const {auctioningPlayers} = state.stageState
  return auctioningPlayers[
    (auctioningPlayers.indexOf(state.player) + 1) % auctioningPlayers.length
  ]
}

const finishAuction = state => {
  // End auction.
  const {stageState} = state
  const winner = stageState.auctioningPlayers[0]
  log(winner)

  state.playerState[winner].money -= stageState.price
  stageState.eligiblePlayers.splice(
    stageState.eligiblePlayers.indexOf(winner),
    1
  )
  state.stage = 'AUCTION_CHOOSE'
  // Cycle to next player to auction
  state.player = stageState.eligiblePlayers[0]

  // Assign plants
  const plant = state.auctioningPlants[stageState.i]
  state.auctioningPlants.splice(stageState.i, 1)
  state.playerState[winner].plants.push(plant)
  state.auctioningPlants.push(state.deck[0])
  state.auctioningPlants.sort((a, b) => a[0] - b[0])
  state.deck.splice(0, 1)

  return state
}

export const handlers = {
  AUCTION_CHOOSE: (state: GameState, action: AuctionChoice): GameState => {
    let next = state
    if (action.pass) {
      const nextPlayer =
        state.stageState.eligiblePlayers[
          state.stageState.eligiblePlayers.indexOf(next.player) + 1
        ]
      // Remove player
      if (!nextPlayer) {
        state.stage = 'RESOURCES_BUY'
        state.player = next.playerOrder[next.players.length - 1]
        return state
      }

      state.stageState.eligiblePlayers.splice(
        state.stageState.eligiblePlayers.indexOf(state.player),
        1
      )

      state.player = nextPlayer
      return state
    }

    // Player chose a plant to bid on.
    state.stageState = {
      ...state.stageState,
      auctioningPlayer: state.player,
      auctioningPlayers: state.stageState.eligiblePlayers,
      price: action.price,
      i: action.i,
    }

    const nextPlayer = getNextPlayerInAuction(state)

    if (state.stageState.auctioningPlayers.length === 1) {
      state = finishAuction(state)
      state.stage = 'RESOURCES_BUY'
      state.player = next.playerOrder[next.players.length - 1]
      state.stageState = {}
      return state
    }

    return {
      ...next,
      player: nextPlayer,
      stage: 'AUCTION_BID',
    }
  },
  AUCTION_BID: (state: GameState, action: any) => {
    const nextPlayer = getNextPlayerInAuction(state)
    state.stageState.price = action.price
    state.player = nextPlayer
    return state
  },
  AUCTION_BID_PASS: (state: GameState, action: any) => {
    // pass
    log({...action, player: state.player})

    const {stageState} = state
    const nextPlayer = getNextPlayerInAuction(state)
    state.stageState = {
      ...stageState,
      auctioningPlayers: remove(
        stageState.auctioningPlayers.indexOf(state.player),
        1,
        stageState.auctioningPlayers
      ),
    }

    if (state.stageState.auctioningPlayers.length === 1) {
      return finishAuction(state)
    }

    return {
      ...state,
      player: nextPlayer,
    }
  },
  RESOURCES_BUY: (state: GameState, action: ResourceBuy) => {
    const player = state.playerState[state.player]
    // Check valid purchase.
    // Update player resources and resource pool.
    // let newState = set(lensPath([]))
    const totalCost = 0

    check(totalCost <= player.money, 'Not enough money')
    RESOURCES.forEach(resource => {
      check(
        action.resources[resource] <= state.resourceAvailable[resource],
        'Not enough resources'
      )
    })

    RESOURCES.forEach(resource => {
      state.resourceAvailable[resource] -= action.resources[resource]
    })

    console.log('here', totalCost)
    player.money -= totalCost

    // state.stageState.playersGone++
    state.player =
      state.playerOrder[state.playerOrder.indexOf(state.player) - 1]

    if (!state.player) {
      // Next stage.
      state.stage = 'CITIES'
      state.stageState = {}
      state.player = state.playerOrder[state.playerOrder.length - 1]
      return state
    }

    return state
  },
  CITIES: (state: GameState, action: any) => {
    // Check valid purchase - compute costs.

    // Modify map
    action.cities.forEach(([city, index]) => {
      state.map[city].plants[index] = action.player
    })

    state.player =
      state.playerOrder[state.playerOrder.indexOf(state.player) - 1]

    if (!state.player) {
      // Next stage.
      state.stage = 'POWER'
      state.stageState = {}
      state.player = state.playerOrder[state.playerOrder.length - 1]
      return state
    }
    return state
  },
  POWER: (state: GameState, action: any) => {
    // Choose how many cities to power and which plants to use.
    // state.stageState.playerChoice[action.player] = {
    //   // citiesToPower: action.citiesToPower,
    //   plantsToUse: action.resourcesToUse,
    // }
    state.playerState[state.player].money += MONEY_FOR_CITY_POWER[0]

    state.player =
      state.playerOrder[state.playerOrder.indexOf(state.player) - 1]

    if (!state.player) {
      // Next stage
      return handlers.BUREAUCRACY(state)
    }

    return state
  },
  BUREAUCRACY: (state: GameState) => {
    const shouldReplenish = RESOURCES_PER_PHASE[state.phase]
    RESOURCES.forEach(resource => {
      const toReplenish = Math.min(
        state.resourcePool[resource],
        shouldReplenish[resource]
      )
      state.resourceAvailable[resource] += toReplenish
      state.resourcePool[resource] -= toReplenish
    })

    // Turn end.

    state.turn++
    state.stage = 'AUCTION_CHOOSE'
    state.player = state.playerOrder[0]
    state.stageState = {
      eligiblePlayers: cloneDeep(state.players),
    }
    return state
  },
}

export const handleAction = (state: GameState, action: any) => {
  const stateCopy = cloneDeep(state)
  try {
    return handlers[action.type](state, action)
  } catch (e) {
    console.error(e.message)
    return stateCopy
  }
}

export default handlers
