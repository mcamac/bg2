import pg, {
  CARDS,
  getInitialState,
  handleAction,
  handlers,
} from '../../../../games/power-grid/src/index.ts'
import {cloneDeep, set} from 'lodash/fp'
const INITIAL_STATE = getInitialState(['monsk', 'viz', 'nhkl'])

export const gameReducer = (state = INITIAL_STATE, action) => {
  if (handlers[action.type]) return handleAction(state, action)
  return state
}

const uiHandlers = {
  AUCTION_CHOOSE_PLANT: (state, action) => {
    return {
      ...state,
      state: 'AUCTION_CHOOSE_INITIAL_BID',
      plant: action.plant,
      i: action.i,
    }
  },
  AUCTION_CHOOSE: (state, action, game) => {
    if (game.stage === 'AUCTION_BID') {
      return {
        ...state,
        state: 'UI_AUCTION_BID',
      }
    }
    return state
  },
  UI_SET_RESOURCE_BUY: (state, action) => {
    return set(['resources', action.resource], action.n, state)
  },
  UI_CLICK_CITY: (state, action) => {
    const cities = state.cities || []
    if (cities.length && cities[cities.length - 1] === action.city) {
      return {
        ...state,
        cities: cities.slice(0, cities.length - 1),
      }
    }

    if (cities.indexOf(action.city) >= 0) return state

    return {
      ...state,
      cities: [...(state.cities || []), action.city],
    }
  },
  RESOURCES_BUY: (state, action) => {
    return {
      ...state,
      resources: {
        coal: 0,
        gas: 0,
        oil: 0,
        uranium: 0,
      },
    }
  },
  CITIES: (state, action) => {
    return {
      ...state,
      cities: [],
    }
  },
}

const INITIAL_UI_STATE = {
  state: 'UI_AUCTION_CHOOSE',
  resources: {
    coal: 0,
    gas: 0,
    oil: 0,
    uranium: 0,
  },
  cities: [],
}

export const uiReducer = (state = INITIAL_UI_STATE, action, game) => {
  // if (handlers[action.type]) game = handleAction(state, action)
  if (uiHandlers[action.type])
    return uiHandlers[action.type](state, action, game)
  return state
}

const INITIAL = localStorage.state
  ? JSON.parse(localStorage.state)
  : {
      game: INITIAL_STATE,
      ui: INITIAL_UI_STATE,
    }

export const reducer = (state = INITIAL, action) => {
  if (action.type === 'SAVE_STATE') {
    localStorage.state = JSON.stringify(state)
    return state
  }
  if (action.type === 'LOAD_STATE') {
    return JSON.parse(localStorage.state)
  }
  if (action.type === 'RESET_STATE') {
    delete localStorage.state
    return INITIAL
  }
  if (action.type === 'UI_RESOURCES_BUY') {
    action.type = 'RESOURCES_BUY'
    action.resources = [] //state.ui.resources
  }
  if (action.type === 'UI_CITIES') {
    action.type = 'CITIES'
    action.cities = state.ui.cities
  }
  if (action.type === 'UI_POWER') {
    action.type = 'POWER'
    action.plantsUsed = []
  }
  const game = cloneDeep(gameReducer(state.game, action))
  const ui = uiReducer(state.ui, action, game)
  return {
    game,
    ui,
  }
}
