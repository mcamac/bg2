import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'
import {Count} from '../animator'

let GlobalParams = props => (
  <Box style={{fontSize: 14}} mb={3}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Globals
    </Box>
    <Flex>
      <Box w={80} flex="1 1 auto">
        Oceans
      </Box>
      <Box>
        <Count value={props.params.Oceans} /> ({9 - props.params.Oceans} left)
      </Box>
    </Flex>
    <Flex>
      <Box w={80} flex="1 1 auto">
        Heat
      </Box>
      <Box>
        <Count value={props.params.Heat} /> ({(8 - props.params.Heat) / 2} left)
      </Box>
    </Flex>
    <Flex>
      <Box w={80} flex="1 1 auto">
        Oxygen
      </Box>
      <Box>
        <Count value={props.params.Oxygen} /> ({14 - props.params.Oxygen} left)
      </Box>
    </Flex>
  </Box>
)

GlobalParams = connect(state => ({
  params: state.game.globalParameters,
}))(GlobalParams)

export default GlobalParams
