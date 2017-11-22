import {lensPath, set, toPairs, fromPairs} from 'ramda'

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

const RESOURCES = ['coal', 'gas', 'oil']

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

const MONEY_FOR_CITY_POWER = []

const RESOURCES_PER_PHASE = [
  {
    coal: 4,
    gas: 2,
    oil: 4,
  },
  {
    coal: 4,
    gas: 2,
    oil: 4,
  },
  {
    coal: 4,
    gas: 2,
    oil: 4,
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
  auctioningPlants: [Plant]
  playerState: {
    [key: string]: PlayerState
  }
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
    players,
    playerOrder: players,
    turn: 1,
    phase: 1,
    stage: 'AUCTION_CHOOSE',
    stageState: {},
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
    auctioningPlants: CARDS.slice(0, 8) as [Plant],
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
  plant?: number
  bid?: number
}

interface ResourceBuy {
  player: string
  resources: ResourceCount
}

const handlers = {
  AUCTION_CHOOSE: (state: GameState, action: AuctionChoice) => {
    if (action.pass) {
      // Remove player
    } else {
      // If last player, done.

      // Cycle to next player.
      state.stage = 'AUCTION_BID'
    }
  },
  AUCTION_BID: (state: GameState, action: any) => {
    // pass
  },
  RESOURCES_BUY: (state: GameState, action: ResourceBuy) => {
    const player = state.playerState[action.player]
    // Check valid purchase.
    // Update player resources and resource pool.
    // let newState = set(lensPath([]))
    const totalCost = 0

    check(totalCost <= player.money, 'Not enough money')
    RESOURCES.forEach(resource => {
      check(action.resources[resource] <= state.resourceAvailable[resource], 'Not enough resources')
    })

    RESOURCES.forEach(resource => {
      state.resourceAvailable[resource] -= action.resources[resource]
    })
    player.money -= totalCost

    state.stageState.playersGone++

    if (state.stageState.playersGone === state.numPlayers) {
      // Next stage.
      state.stage = 'CITIES'
      state.stageState = {
        playersGone: 0,
      }
      return
    }
  },
  CITIES: (state: GameState, action: any) => {
    // Check valid purchase - compute costs.

    // Modify map
    action.purchases.forEach(([city, index]) => {
      state.map[city].plants[index] = action.player
    })

    // Update stage
    state.stageState.playersGone++

    if (state.stageState.playersGone === state.numPlayers) {
      // Next stage.
      state.stage = 'POWER'
      state.stageState.playersGone = 0
      return
    }
  },
  POWER: (state: GameState, action: any) => {
    const player = action.player
    // Choose how many cities to power and which plants to use.
    state.stageState.playerChoice[action.player] = {
      citiesToPower: action.citiesToPower,
      resourcesToUse: action.resourcesToUse,
    }
    state.stageState.playersGone++
    state.playerState[player].money +=
      MONEY_FOR_CITY_POWER[state.stageState.playerChoice[player].citiesToPower]

    if (state.stageState.playersGone === state.numPlayers) {
      // Next stage.
    }
  },
  BUREAUCRACY: (state: GameState) => {
    const shouldReplenish = RESOURCES_PER_PHASE[state.phase]
    RESOURCES.forEach(resource => {
      const toReplenish = Math.min(state.resourcePool[resource], shouldReplenish[resource])
      state.resourceAvailable[resource] += toReplenish
      state.resourcePool[resource] -= toReplenish
    })

    // Turn end.

    state.turn++
  },
}

const handleAction = (state: GameState, action: any) => {
  const {stage, stageState} = state
  const player = state.playerState[action.player]
  if (stage === 'AUCTION_CHOOSE') {
    // passed players...
  } else if (stage === 'CITIES') {
  } else if (stage === 'POWER') {
  }
}

export default handlers
