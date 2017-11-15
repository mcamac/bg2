import {lensPath, set} from 'ramda'

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
    this._state = state
  }
}

const RESOURCES = ['coal', 'gas', 'oil']

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
      state.stageState.playersGone = 0
      return
    }
  },
  CITIES: (state: GameState, action: any) => {
    // Check valid purchase.

    // Modify map
    action.purchases.forEach(([city, value]) => {})

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
