import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'

const Milestones = () => (
  <Box style={{fontSize: 14}} mb={3}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Milestones
    </Box>
    {['Oceans', 'Temp', 'Oxygen'].map(param => (
      <Flex key={param}>
        <Box w={80} flex="1 1 auto" style={{color: '#aaa'}}>
          Not chosen
        </Box>
        <Box>m</Box>
      </Flex>
    ))}
  </Box>
)

export default Milestones
