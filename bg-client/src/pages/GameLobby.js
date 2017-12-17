import {Component} from 'react'
import {Flex, Box} from 'grid-styled'
import Select from 'react-select'
import {connect} from 'react-redux'
import {get} from 'lodash/fp'

import {Button} from '../components'
import {Link} from 'react-router-dom'

class GameLobby extends Component {
  componentWillMount() {
    this.props.onJoin(this.props.room)
  }

  // componentWillUnmount() {
  //   this.props.onLeave(this.props.match.params.uid)
  // }

  render() {
    const {users} = this.props
    return (
      <Flex direction="column" p={2}>
        <Box>
          <h4>New Game</h4>
        </Box>
        <Link to="/">Back</Link>
        <Box>
          <h4>Users in Lobby</h4>
          {users.map(user => <div key={user}>{user}</div>)}
        </Box>
        <Box style={{maxWidth: 300}}>
          Game Settings
          <h5>Number of Players</h5>
          <Select />
          <h5>Map</h5>
          <Select />
        </Box>
        <Box>
          <h4>Players</h4>
          {[0, 1, 2].map((player, i) => (
            <Box key={i}>
              Player {i + 1}
              <Button>Join</Button>
            </Box>
          ))}
        </Box>
        <Box>
          <Button onClick={this.props.onStart}>Start</Button>
        </Box>
      </Flex>
    )
  }
}

export default connect(
  (state, props) => ({
    users: get(['lobby', 'users'], state) || [],
  }),
  (dispatch, props) => ({
    onStart: () => {
      dispatch({
        type: 'LOBBY_START',
        room: props.room,
      })
    },
    onJoin: () => {
      dispatch({
        type: 'LOBBY_JOIN',
        room: props.room,
      })
    },
    onLeave: () => {
      dispatch({
        type: 'LOBBY_LEAVE',
        room: props.room,
      })
    },
  })
)(GameLobby)
