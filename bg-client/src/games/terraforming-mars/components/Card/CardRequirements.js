import React, {Fragment, Component} from 'react'
import {Flex, Box} from 'grid-styled'

import Icon from '../Icon'
import Tag from '../Tag'

export const requiresByType = (type, count, tag) => {
  if (type === 'MinHeat')
    return (
      <Flex align="center">
        <Icon g="Temp" /> <Box>≥ {count}</Box>
      </Flex>
    )
  else if (type === 'MaxHeat')
    return (
      <Flex align="center">
        <Icon g="Temp" /> ≤ {count}
      </Flex>
    )
  else if (type === 'MinOceans')
    return (
      <Flex align="center">
        <Icon g="Ocean" /> <Box>≥ {count}</Box>
      </Flex>
    )
  else if (type === 'MaxOceans')
    return (
      <Flex align="center">
        <Icon g="Ocean" /> ≤ {count}
      </Flex>
    )
  else if (type === 'MinOxygen')
    return (
      <Flex align="center">
        <Icon g="Oxygen" /> <Box>≥ {count}</Box>
      </Flex>
    )
  else if (type === 'MaxOxygen')
    return (
      <Flex align="center">
        <Icon g="Oxygen" /> ≤ {count}
      </Flex>
    )
  else if (type === 'HasTags')
    return (
      <Flex align="center">
        {count >= 2 && count} <Tag name={tag} />
      </Flex>
    )
  else if (type === 'MinProduction')
    return (
      <Flex align="center">
        {count >= 2 && count}{' '}
        <Flex px="2px" style={{background: '#8a5d5d', color: '#eee'}} align="center">
          <Icon g={tag} />
        </Flex>
      </Flex>
    )
  return type
}

const CardRequirements = ({requires}) => (
  <Flex px="4px" ml="4px" style={{background: 'rgba(255, 255, 255, 0.5)'}}>
    {requires.map(([type, ...args], i) => <Box key={i}>{requiresByType(type, ...args)}</Box>)}
  </Flex>
)

export default CardRequirements
