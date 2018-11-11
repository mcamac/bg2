import styled from 'styled-components'
import {connect} from 'react-redux'
import {toPairs} from 'lodash/fp'
import {Flex, Box} from 'grid-styled'

import {startStandardProject} from '../reducer'
import {STANDARD_PROJECTS} from '../../../../../games/terraforming-mars/src/projects'

const StandardProjectWrapper = styled(Flex)`
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`

let StandardProjects = props => (
  <Box style={{fontSize: 14}}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Standard Projects
    </Box>
    {toPairs(STANDARD_PROJECTS).map(([key, project]) => (
      <StandardProjectWrapper key={key} onClick={() => props.onClickProject(key)}>
        <Box w={80} flex="1 1 auto">
          {project.name}
        </Box>
        <Box>{project.cost > 0 && project.cost}</Box>
      </StandardProjectWrapper>
    ))}
  </Box>
)

StandardProjects = connect(
  () => ({}),
  dispatch => ({
    onClickProject: project => dispatch(startStandardProject(project)),
  })
)(StandardProjects)

export default StandardProjects
