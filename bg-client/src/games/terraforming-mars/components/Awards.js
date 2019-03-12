import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'

import {AWARDS} from '../../../../../games/terraforming-mars/src/types'

const Awards = () => (
  <Box style={{fontSize: 14}} mb={2}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Awards
    </Box>
    {AWARDS.map(award => (
      <Flex key={award}>
        <Box w={80} flex="1 1 auto" style={{color: '#aaa'}}>
          {award}
        </Box>
        <Box>8</Box>
      </Flex>
    ))}
  </Box>
)

export default Awards
