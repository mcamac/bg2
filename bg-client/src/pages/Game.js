import {Component} from 'react'
import {get} from 'lodash/fp'
import {connect} from 'react-redux'
import {compose, branch, renderNothing} from 'recompose'

import GameLobby from './GameLobby'
import PowerGrid from '../games/power-grid'
import TerraformingMars from '../games/terraforming-mars/index'

class Game extends Component {
  componentWillMount() {}

  render() {
    return this.props.game ? <PowerGrid /> : <GameLobby room={this.props.match.params.uid} />
  }
}

export default compose(
  connect((state, props) => ({
    lobby: state.lobby,
    game: get(['lobby', 'game'], state),
  })),
  branch(props => !props.lobby, renderNothing)
)(Game)
