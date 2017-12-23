import {createStore, combineReducers} from 'redux'
import {reducer} from '../games/power-grid/reducer'
import {reducer as tmReducer} from '../games/terraforming-mars/reducer'
import {socket} from '../network'

const store = createStore(
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
