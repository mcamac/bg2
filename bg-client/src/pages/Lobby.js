import {Flex, Box} from 'grid-styled'
import {Link} from 'react-router-dom'
import shortid from 'shortid'

const Lobby = props => (
  <Flex direction="column" style={{height: '100%'}}>
    <h4>Lobby</h4>
    <Link to="/game/4">Game</Link>
    <Link to={`/game/${shortid.generate()}`}>New Game</Link>
  </Flex>
)

export default Lobby
