import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'

let GlobalParams = props => (
  <Box style={{fontSize: 14}} mb={3}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Globals
    </Box>
    {['Oceans', 'Heat', 'Oxygen'].map(param => (
      <Flex key={param}>
        <Box w={80} flex="1 1 auto">
          {param}
        </Box>
        <Box>{props.params[param]} (9 left)</Box>
      </Flex>
    ))}
  </Box>
)

GlobalParams = connect(state => ({
  params: state.game.globalParameters,
}))(GlobalParams)

export default GlobalParams
