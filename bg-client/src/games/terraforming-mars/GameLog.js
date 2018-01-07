import React, {Component} from 'react'
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

const ChangeInventory = props => (
  <Flex align="center">
    {props.player}'s <Icon g={props.resource} />
    went from {props.from} to {props.to}.
  </Flex>
)

const Cede = props => <Flex>{props.player} ceded.</Flex>

const Pass = props => <Flex>{props.player} passed.</Flex>

const BuyCards = props => (
  <Flex>
    {props.player} bought {props.n} {props.n > 1 ? 'cards' : 'card'}.
  </Flex>
)

const LOG_REGISTRY = {
  ProductionChange,
  ChangeInventory,
  PlayCard,
  StandardProject,
  IncreaseTemperature,
  Cede,
  Pass,
  BuyCards,
}

const LogLine = props => {
  const Component = LOG_REGISTRY[props.line.type] || Pre
  return <Component {...props.line} />
}

export default class GameLog extends Component {
  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({behavior: 'smooth'})
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  render() {
    return (
      <Box px={2} style={{overflowY: 'scroll'}}>
        <Box style={{fontSize: 14}}>
          {this.props.log.map((l, i) => <LogLine key={i} line={l} />)}
        </Box>
        <div
          style={{float: 'left', clear: 'both'}}
          ref={el => {
            this.messagesEnd = el
          }}
        />
      </Box>
    )
  }
}
