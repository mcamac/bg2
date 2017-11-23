import {createStore, combineReducers} from 'redux'
import {reducer} from '../games/power-grid/reducer'

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

export default store
