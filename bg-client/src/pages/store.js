import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'
import {reducer} from '../games/power-grid/reducer'
import {reducer as tmReducer} from '../games/terraforming-mars/reducer'
import {socket} from '../network'

const loggerMiddleware = createLogger() // initialize logger

const asyncDispatchMiddleware = store => next => action => {
  let syncActivityFinished = false
  let actionQueue = []

  function flushQueue() {
    actionQueue.forEach(a => store.dispatch(a)) // flush queue
    actionQueue = []
  }

  function asyncDispatch(asyncAction) {
    actionQueue = actionQueue.concat([asyncAction])
    socket.send({room: 'a', action: 'ROOM_MOVE', move: asyncAction})

    if (syncActivityFinished) {
      flushQueue()
    }
  }

  const actionWithAsyncDispatch = Object.assign({}, action, {asyncDispatch})

  next(actionWithAsyncDispatch)
  syncActivityFinished = true
  flushQueue()
}

const createStoreWithMiddleware = applyMiddleware(loggerMiddleware, asyncDispatchMiddleware)(
  createStore
)
const store = createStoreWithMiddleware(
  tmReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

socket.addListener(data => {
  console.log('socket rcv', data)
  store.dispatch({
    type: 'SERVER_MESSAGE',
    data,
  })
})

export default store
