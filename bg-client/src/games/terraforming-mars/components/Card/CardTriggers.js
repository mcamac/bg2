import React from 'react'
import {Flex, Box} from 'grid-styled'

import CardEffects from './CardEffects'

export const CardTriggers = props => (
  <Flex flex="1 1 auto" align="center">
    {[props.triggers].map(([cond, effects], i) => (
      <Flex key={i} align="center">
        <CardEffects effects={[cond]} card={props.card} />:
        <CardEffects effects={effects} card={props.card} />
      </Flex>
    ))}
  </Flex>
)

export const CardTileTriggers = props => {
  return (
    <Flex flex="1 1 auto" align="center">
      {props.triggers.map(([[type, yours], effects], i) => (
        <Flex key={i} align="center">
          when {yours ? 'your' : 'any'} {type}:
          <CardEffects effects={effects} card={props.card} />
        </Flex>
      ))}
    </Flex>
  )
}
