import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'

import {MILESTONES} from '../../../../../games/terraforming-mars/src/types'

const Milestones = () => (
  <Box style={{fontSize: 14}} mb={2}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Milestones
    </Box>
    {MILESTONES.map(milestone => (
      <Flex key={milestone}>
        <Box w={80} flex="1 1 auto" style={{color: '#aaa'}}>
          {milestone}
        </Box>
        <Box>5</Box>
      </Flex>
    ))}
  </Box>
)

export default Milestones
