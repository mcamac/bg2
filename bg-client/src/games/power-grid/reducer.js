import pg, {
  CARDS,
  getInitialState,
  handleAction,
  handlers,
} from '../../../../games/power-grid/src/index.ts'
import {cloneDeep, get, set, unset} from 'lodash/fp'
const INITIAL_STATE = getInitialState(['monsk', 'viz'])
import {socket} from '../../network'

export const gameReducer = (state = INITIAL_STATE, action, lobby) => {
  if (handlers[action.type]) {
    socket.send({action: 'ROOM_MOVE', move: action, room: lobby.id})
  }
  return [state, false, null]
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
  UI_SET_RESOURCE: (state, action) => {
    return set(['plantResources', action.i, action.resource], action.v, state)
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
  UI_POWER_SELECT_PLANT: (state, action, game) => {
    if (!state.toPower[action.i]) {
      const resources = {
        coal: 0,
        gas: 0,
        oil: 0,
        uranium: 0,
      }

      const plantResources = game.playerState[game.player].plants[action.i].plant[3].resources
      if (plantResources.length === 1) {
        resources[plantResources[0]] = +game.playerState[game.player].plants[action.i].plant[1][0]
      }
      return set(['toPower', action.i], resources, state)
    } else {
      return unset(['toPower', action.i], state)
    }
  },
  UI_DISCARD_SELECT_PLANT: (state, action, game) => {
    return set(['toDiscard'], action.i, state)
  },
  UI_POWER_SELECT_PLANT_RESOURCE: (state, action, game) => {
    return set(['toPower', action.i, action.resource], action.v, state)
  },
  UI_DISCARD_SELECT_PLANT_RESOURCE: (state, action, game) => {
    return set(['plantResourcesDiscard', action.i, action.resource], action.v, state)
  },
  MOVED_AUCTION_CHOOSE_DISCARDED_PLANT: (state, action, game) => {
    return {
      ...state,
      plantResourcesDiscard: game.playerState[game.player].plants.map(() => ({
        coal: 0,
        gas: 0,
        oil: 0,
        uranium: 0,
      })),
    }
  },
  MOVED_RESOURCES_BUY: (state, action, game) => {
    console.log('MOVED_BUY')
    return {
      ...state,
      plantResources: game.playerState[game.player].plants.map(() => ({
        coal: 0,
        gas: 0,
        oil: 0,
        uranium: 0,
      })),
    }
  },
  MOVED_POWER: (state, action, game) => {
    return {
      ...state,
      toPower: {},
    }
  },
  MOVED_AUCTION_CHOOSE: (state, action, game) => {
    return set(['state'], null, state)
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
  log: [],
}

export const uiReducer = (state = INITIAL_UI_STATE, action, game) => {
  // if (handlers[action.type]) game = handleAction(state, action)
  if (uiHandlers[action.type]) return uiHandlers[action.type](state, action, game)
  return state
}

export const logReducer = (state, log) => {
  return [...state, ...log]
}

const lobbyHandlers = {
  LOBBY_START: (state, action) => {
    socket.send({action: 'START_ROOM', room: action.room})
    return state
  },
  LOBBY_JOIN: (state, action) => {
    socket.send({action: 'JOIN_ROOM', room: action.room})
    return state
  },
  LOBBY_LEAVE: (state, action) => {
    socket.send({action: 'LEAVE_ROOM', room: action.room})
    return state
  },
  SERVER_MESSAGE: (state, action) => {
    console.log('server message', action)
    if (action.data.type === 'ROOM_UPDATE') {
      console.log('room update', action.data.room)
      return {
        ...state,
        ...action.data.room,
      }
    }
    return state
  },
  FIREBASE_UPDATE: (state, action) => {
    console.log('reducer firebase message', action)
    const data = action.data
    if (data.game) {
      data.game = JSON.parse(data.game)
    }

    return {
      ...state,
      ...data,
    }
    return state
  },
}

const lobbyReducer = (state, action) => {
  if (lobbyHandlers[action.type]) return lobbyHandlers[action.type](state, action)
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
    // delete localStorage.state
    // return {
    //   game: INITIAL_STATE,
    //   ui: INITIAL_UI_STATE,
    // }
  }
  if (action.type === 'UI_RESOURCES_BUY') {
    action.type = 'RESOURCES_BUY'
    action.resources = state.ui.plantResources //state.ui.resources
  }
  if (action.type === 'UI_CITIES') {
    action.type = 'CITIES'
    action.cities = state.ui.cities
  }
  if (action.type === 'UI_POWER') {
    action.type = 'POWER'
    action.toPower = state.ui.toPower
  }
  if (action.type === 'UI_DISCARD') {
    action.type = 'AUCTION_CHOOSE_DISCARDED_PLANT'
    action.plantResourcesDiscard = state.ui.plantResourcesDiscard
    action.toDiscard = state.ui.toDiscard
  }
  if (action.type === 'RESET_STATE') {
    socket.send({action: 'RESET_STATE', room: state.lobby.id})
  }
  let [game, moved, log] = gameReducer({}, action, state.lobby || {})
  console.log(game, moved)
  game = cloneDeep(game)
  let newLog = state.log || []
  let ui = uiReducer(state.ui, action, game)
  if (moved) {
    console.log('moved', moved)
    ui = uiReducer(ui, {type: `MOVED_${game.stage}`}, game)
    newLog = logReducer(state.log, log)
  }

  let lobby = lobbyReducer(state.lobby || {}, action)
  if (action.type === 'SERVER_MESSAGE' && action.data.type === 'ROOM_UPDATE' && lobby.game) {
    const g = lobby.game
    ui = uiReducer(ui, {type: `MOVED_${g.stage}`}, g)
  }
  if (get(['data', 'message'], action) === 'JOIN_ROOM') {
    const g = lobby.game
    ui = uiReducer(ui, {type: `MOVED_${g.stage}`}, g)
  }
  return {
    ui,
    log: newLog,
    lobby,
  }
}
