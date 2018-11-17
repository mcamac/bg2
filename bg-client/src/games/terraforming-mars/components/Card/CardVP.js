import React from 'react'
import {Flex, Box} from 'grid-styled'

import {Effect} from './CardEffects'

const CardVP = props => (
  <Flex ml={1} flex="1 1 auto" justify="flex-end">
    <Flex style={{padding: '2px 4px', background: 'green', color: 'white'}}>
      {typeof props.card.vp === 'number' ? `${props.card.vp} VP` : Effect(...props.card.vp)}
    </Flex>
  </Flex>
)

export default CardVP
