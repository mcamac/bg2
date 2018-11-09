import {lensPath, set, toPairs, fromPairs, remove} from 'ramda'
import {id, key, getl, setl} from 'lens.ts'
import {shuffle} from 'shuffle-seed'
import {create as createRand} from 'random-seed'
import {cloneDeep, sum} from 'lodash'

import {CITIES, EDGES, CITIES_BY_NAME} from './constants'
export {CITIES, EDGES, CITIES_BY_NAME}

const STAGES = ['AUCTION', 'RESOURCES', 'CITIES', 'POWER', 'REPLENISH']

const getDistances = () => {
  // Floyd-warshall
  const CITY_NAMES = CITIES.map(c => c[3])
  const d = {}
  CITY_NAMES.forEach(city => {
    d[city] = {}
    CITY_NAMES.forEach(city2 => (d[city][city2] = 10000000))
    d[city][city] = 0
  })
  EDGES.forEach(([c1, c2, v]) => {
    d[c1][c2] = v
    d[c2][c1] = v
  })

  CITY_NAMES.forEach(k => {
    CITY_NAMES.forEach(i => {
      CITY_NAMES.forEach(j => {
        if (d[i][j] > d[i][k] + d[k][j]) {
          d[i][j] = d[i][k] + d[k][j]
        }
      })
    })
  })
  // localStorage.distances = JSON.stringify(d)

  return d
}

// localStorage.distances = JSON.stringify(getDistances())

const DISTANCES = getDistances()

const STATES = [
  'AUCTION_CHOOSE',
  'AUCTION_BID',
  'RESOURCES_CHOOSE',
  'CITIES_CHOOSE',
  'POWER_CHOOSE', // No turn order.
  'REPLENISH', // Computer only
]

// class PowerGrid {
//   constructor(state) {
//     // this._state = state
//   }
// }

let LOG = []

const log = obj => {
  console.log(obj)
  LOG.push(obj)
}

const RESOURCES = ['coal', 'gas', 'oil', 'uranium']

const ABBREV = {
  C: 'coal',
  G: 'gas',
  O: 'oil',
  U: 'uranium',
}

export const CARDS: any[][] = [
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
].map(card => {
  let abbrevs = (card[1] as string).slice(1)
  let resources = abbrevs === 'W' ? [] : abbrevs.split('').map(c => ABBREV[c])
  return [...card, {resources}]
})

const MONEY_FOR_CITY_POWER = [
  10,
  22,
  33,
  44,
  54,
  64,
  73,
  82,
  90,
  98,
  105,
  112,
  118,
  124,
  129,
  134,
  138,
  142,
  145,
  148,
  150,
]

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
  resourcesNeeded: [number, [string]] // Allow for half/half resources
  cities: number
}

interface PlayerState {
  plants: {
    plant: Plant
    resources: ResourceCount
  }[]
  money: number
  cities: any[]
}

interface GameState {
  numPlayers: number
  player: string
  players: [string]
  playerOrder: [string]
  turn: number
  step: number // 1, 2, 3
  stage: string
  stageState: {
    [key: string]: any
  }
  map: {
    [index: string]: any
  }
  cityPlants: {
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

const SEED = 'griddle'

const getInitialDeck = (): [Object, Object] => {
  let darkCards = CARDS.slice(0, 13)
  const rand = createRand(SEED)
  const setAsideIndex = rand(darkCards.length)
  const setAside = darkCards[setAsideIndex]
  darkCards.splice(setAsideIndex, 1)
  const auctioning = darkCards.slice(0, 8).sort((a, b) => a[0] - b[0])
  const remainingDark = darkCards.slice(8)

  const deck = shuffle(remainingDark, SEED).concat(shuffle(CARDS.slice(13), SEED))
  deck.push(['STEP3'])
  return [auctioning, deck]
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

  const [auctioning, deck] = getInitialDeck()
  console.log(deck)

  return {
    numPlayers: players.length,
    player: players[0],
    players,
    playerOrder: cloneDeep(players),
    turn: 1,
    step: 1,
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
    cityPlants: {},
    resourcePool: {
      coal: 4,
      gas: 6,
      oil: 6,
      uranium: 10,
    },
    auctioningPlants: auctioning,
    deck: deck,
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
  resources: [ResourceCount] // per plant
}

const getNextPlayerInAuction = state => {
  const {auctioningPlayers} = state.stageState
  return auctioningPlayers[(auctioningPlayers.indexOf(state.player) + 1) % auctioningPlayers.length]
}

const computeAddCityCost = (current, city) => {
  console.log('compute add', current, city)
  if (!current.length) return 0
  const distances = current.map(c => DISTANCES[c][city]).sort()
  return distances[0]
}

export const computeCitiesCost = (state, cities) => {
  let totalCost = 0
  let currentCities = [...state.playerState[state.player].cities]
  cities.forEach(city => {
    totalCost +=
      computeAddCityCost(currentCities, city) + 10 + (state.cityPlants[city] || []).length * 5
    currentCities.push(city)
  })
  return totalCost
}

export const getCitiesToPower = (state, toPower) => {
  return Math.min(
    sum(
      state.playerState[state.player].plants
        .filter((plant, i) => toPower[i])
        .map(plant => plant.plant[2])
    ),
    state.playerState[state.player].cities.length
  )
}

const finishAuction = state => {
  // End auction.
  const {stageState} = state
  const winner = stageState.auctioningPlayers[0]
  log(winner)

  state.playerState[winner].money -= stageState.price
  stageState.eligiblePlayers.splice(stageState.eligiblePlayers.indexOf(winner), 1)
  state.stage = 'AUCTION_CHOOSE'
  // Cycle to next player to auction
  const currentPlayer = state.player
  state.player = stageState.eligiblePlayers[0]

  // Assign plants
  const plant = state.auctioningPlants[stageState.i]
  state.auctioningPlants.splice(stageState.i, 1)

  state.auctioningPlants.push(state.deck[0])
  state.auctioningPlants.sort((a, b) => a[0] - b[0])
  state.deck.splice(0, 1)

  state.playerState[winner].plants.push({
    plant: plant,
    resources: {
      coal: 0,
      gas: 0,
      oil: 0,
      uranium: 0,
    },
  })

  if (state.playerState[winner].plants.length >= 4) {
    console.log('discard')
    state.stage = 'AUCTION_CHOOSE_DISCARDED_PLANT'
    state.player = winner
  }

  return state
}

export const handlers = {
  AUCTION_CHOOSE: (state: GameState, action: AuctionChoice): GameState => {
    let next = state
    if (action.pass) {
      const nextPlayer =
        state.stageState.eligiblePlayers[state.stageState.eligiblePlayers.indexOf(next.player) + 1]
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
      if (state.stage === 'AUCTION_CHOOSE_DISCARDED_PLANT') return state
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
  AUCTION_CHOOSE_DISCARDED_PLANT: (state: GameState, action: any) => {
    log({player: state.player, action})
    state.playerState[state.player].plants.splice(action.i, 1)
    state.player = state.stageState.eligiblePlayers[0]
    if (!state.player) {
      state.stage = 'RESOURCES_BUY'
      state.player = state.playerOrder[state.players.length - 1]
      state.stageState = {}
      return state
    }
    state.stage = 'AUCTION_CHOOSE'
    return state
  },
  RESOURCES_BUY: (state: GameState, action: ResourceBuy) => {
    const player = state.playerState[state.player]
    // Check valid purchase.
    // Update player resources and resource pool.
    const totalCost = 0
    const totalResources = {}
    RESOURCES.forEach(resource => {
      totalResources[resource] = 0
      action.resources.forEach(plant => {
        totalResources[resource] += plant[resource]
      })
    })

    check(totalCost <= player.money, 'Not enough money')
    console.log(totalResources, state.resourceAvailable)
    RESOURCES.forEach(resource => {
      check(
        totalResources[resource] <= state.resourceAvailable[resource],
        'Not enough resources' + resource
      )
    })

    RESOURCES.forEach(resource => {
      state.resourceAvailable[resource] -= totalResources[resource]
    })

    state.playerState[state.player].plants.forEach((plant, i) => {
      RESOURCES.forEach(resource => {
        plant.resources[resource] += action.resources[i][resource]
      })
    })

    console.log('here', totalCost)
    player.money -= totalCost

    // state.stageState.playersGone++
    state.player = state.playerOrder[state.playerOrder.indexOf(state.player) - 1]

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

    const cost = computeCitiesCost(state, action.cities)
    console.log(cost, 'cost')

    check(cost <= state.playerState[state.player].money, 'Not enough money')
    state.playerState[state.player].money -= cost

    // Modify map
    action.cities.forEach(city => {
      if (!state.cityPlants[city]) state.cityPlants[city] = []
      state.cityPlants[city].push(state.player)
    })

    // Modify player state
    state.playerState[state.player].cities = state.playerState[state.player].cities.concat(
      action.cities
    )

    state.player = state.playerOrder[state.playerOrder.indexOf(state.player) - 1]

    if (!state.player) {
      // Next stage.
      state.stage = 'POWER'
      state.stageState = {}
      state.player = state.playerOrder[state.playerOrder.length - 1]
      state = handlers.BEFORE_POWER(state)
      return state
    }
    return state
  },
  BEFORE_POWER: (state: GameState) => {
    if (state.step === 1) {
      for (let i in state.players) {
        if (state.playerState[state.players[i]].plants.length >= 6) {
          state.step = 2
          log({step: 2})
          return state
        }
      }
    }
    return state
  },
  POWER: (state: GameState, action: any) => {
    // Choose how many cities to power and which plants to use.
    // state.stageState.playerChoice[action.player] = {
    //   // citiesToPower: action.citiesToPower,
    //   plantsToUse: action.resourcesToUse,
    // }
    let citiesPowerPlants = 0
    state.playerState[state.player].plants.forEach((plant, i) => {
      if (action.toPower[i]) {
        RESOURCES.forEach(resource => {
          plant.resources[resource] -= action.toPower[i][resource]
          state.resourcePool[resource] += action.toPower[i][resource]
        })
        citiesPowerPlants += plant.plant[2]
      }
    })

    const citiesPowered = Math.min(state.playerState[state.player].cities.length, citiesPowerPlants)
    log({player: state.player, citiesPowered})

    state.playerState[state.player].money += MONEY_FOR_CITY_POWER[Math.min(citiesPowered, 20)]

    state.player = state.playerOrder[state.playerOrder.indexOf(state.player) - 1]

    if (!state.player) {
      // Next stage
      return handlers.BUREAUCRACY(state)
    }

    return state
  },
  BUREAUCRACY: (state: GameState) => {
    const shouldReplenish = RESOURCES_PER_PHASE[state.step]
    RESOURCES.forEach(resource => {
      const toReplenish = Math.min(state.resourcePool[resource], shouldReplenish[resource])
      state.resourceAvailable[resource] += toReplenish
      state.resourcePool[resource] -= toReplenish
    })
    // Turn end.

    if (state.step === 1 || state.step === 2) {
      // remove highest plant
      const highestPlant = state.auctioningPlants[state.auctioningPlants.length - 1]
      state.auctioningPlants.splice(state.auctioningPlants.length - 1, 1)
      const newPlant = state.deck[0]
      state.auctioningPlants.push(state.deck[0])
      state.auctioningPlants = state.auctioningPlants.sort((a, b) => a[0] - b[0])
      state.deck.splice(0, 1)
      state.deck.push(highestPlant)
      log({discard: highestPlant, new: newPlant})
    }

    state.playerOrder = state.playerOrder.sort((a, b) => {
      const as = state.playerState[a]
      const bs = state.playerState[b]
      if (as.plants.length !== bs.plants.length) {
        return bs.plants.length - as.plants.length
      }
      const ap = as.plants[as.plants.length - 1].plant[0]
      const bp = bs.plants[bs.plants.length - 1].plant[0]
      return bp - ap
    })
    console.log('new player', state.playerOrder)

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
  LOG = []
  const stateCopy = cloneDeep(state)
  try {
    return [handlers[action.type](state, action), null, LOG]
  } catch (e) {
    console.error('Handler error', e.stack)
    return [stateCopy, e.message, LOG || []]
  }
}

export default handlers

export const PowerGrid = {
  getInitialState,
  reducer: handleAction,
}
