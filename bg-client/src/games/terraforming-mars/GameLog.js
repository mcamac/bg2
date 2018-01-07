import React from 'react'
import {Flex, Box} from 'grid-styled'

import {Icon, Tag} from './components'

const Pre = props => <pre style={{fontSize: '0.8em'}}>{JSON.stringify(props, null, 2)}</pre>

const PlayCard = props => (
  <Box>
    {props.player} played {props.card}.
  </Box>
)

const StandardProject = props => <Box>Standard project {props.project}.</Box>
const IncreaseTemperature = props => (
  <Box>
    Temp increased from {props.from} to {props.to}.
  </Box>
)

const ProductionChange = props => (
  <Flex align="center">
    {props.player}'s{' '}
    <Flex mx="4px" align="center" style={{background: '#8a5d5d', color: '#eee', padding: '0 3px'}}>
      <Icon g={props.resource} />
    </Flex>{' '}
    went from {props.from} to {props.to}.
  </Flex>
)

const Cede = props => <Flex>{props.player} ceded.</Flex>

const Pass = props => <Flex>{props.player} passed.</Flex>

const LOG_REGISTRY = {
  ProductionChange,
  PlayCard,
  StandardProject,
  IncreaseTemperature,
  Cede,
  Pass,
}

const LogLine = props => {
  const Component = LOG_REGISTRY[props.line.type] || Pre
  return <Component {...props.line} />
}

const GameLog = props => (
  <Box style={{fontSize: 14}}>
    <Box py={1} style={{fontSize: 12, color: '#555'}}>
      GAME LOG
    </Box>
    {props.log.map((l, i) => <LogLine key={i} line={l} />)}
  </Box>
)

export default GameLog
