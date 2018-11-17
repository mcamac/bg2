import React, {Fragment, Component} from 'react'
import styled from 'styled-components'
import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'

import {uiCardAction} from '../../reducer'

import {withSign} from './utils'
import {EFFECTS} from './CardEffects'

const ActionWrapper = styled(Flex)`
  padding: 2px 8px;
  transition: 0.2s background;

  &:hover {
    background: ${props => props.enabled && 'white'};
  }
`

let CardActions = props => (
  <Box>
    {props.actions.map((action, i) => (
      <ActionWrapper
        enabled={props.enabled}
        align="center"
        key={i}
        onClick={props.enabled && (() => props.onAction(i))}
      >
        <Box mr="4px" style={{color: '#555'}}>
          ACTION:
        </Box>
        {action.map(([effect, ...args], j) => (
          <Box key={j} align="center">
            {EFFECTS[effect] ? (
              EFFECTS[effect](...args, props.card)
            ) : (
              <pre>{JSON.stringify([effect, ...args], null, 2)}</pre>
            )}
          </Box>
        ))}
      </ActionWrapper>
    ))}
  </Box>
)

CardActions = connect(
  () => ({}),
  (dispatch, props) => ({
    onAction: i => dispatch(uiCardAction(props.card.name, i)),
  })
)(CardActions)

export default CardActions
