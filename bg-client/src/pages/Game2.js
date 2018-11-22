import {Component} from 'react'
import {get} from 'lodash/fp'
import {connect} from 'react-redux'
import {compose, branch, renderNothing} from 'recompose'

import GameLobby from './GameLobby'
// import PowerGrid from '../games/power-grid'
import TerraformingMars from '../games/terraforming-mars/index'
import {socket} from '../network'

class Game extends Component {
  componentWillMount() {
    socket.send({action: 'ROOM_JOIN', room: this.props.match.params.uid})
  }

  render() {
    return this.props.game ? <TerraformingMars /> : null
  }
}

export default compose(
  connect((state, props) => ({
    // lobby: state.lobby,
    game: get(['game'], state),
  }))
  // branch(props => !props.game, renderNothing)
)(Game)
