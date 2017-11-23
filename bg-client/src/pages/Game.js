import PowerGrid from '../games/power-grid'
import {Provider} from 'react-redux'
import store from './store'

const Game = props => (
  <Provider store={store}>
    <PowerGrid />
  </Provider>
)

export default Game
