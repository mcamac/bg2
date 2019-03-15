import React from 'react'
import {Flex, Box} from 'grid-styled'

import Icon from '../Icon'
import Tag from '../Tag'
import {withSign} from './utils'

const CardDiscounts = props => (
  <Flex flex="1 1 auto" align="center">
    {props.discounts.map(([discount, tags], i) => (
      <Flex align="center">
        <Flex>{withSign(-discount)} </Flex>
        <Icon g="Money" />
        <Flex>on</Flex>
        <Flex align="center" ml="4px">
          {tags ? tags.map(tag => <Tag name={tag} key={tag} />) : 'All'}
        </Flex>
      </Flex>
    ))}
  </Flex>
)

export default CardDiscounts
