import React from 'react'
import {Flex, Box} from 'grid-styled'
import {compose, pure, withProps} from 'recompose'

import {getCorporationByName} from '../../../../../../games/terraforming-mars/src/corporations'
import Tag from '../Tag'

import CardEffects from './CardEffects'
import CardDiscounts from './CardDiscounts'
import CardWrapper from './CardWrapper'
import CardActions from './CardActions'
import {CardTriggers, CardTileTriggers} from './CardTriggers'

let Corporation = props => (
  <CardWrapper corporation>
    <Flex align="center" style={{padding: 5, borderBottom: '1px solid #aaa'}}>
      <div style={{fontWeight: 500, fontSize: 15, width: 18, color: '#333'}}>
        {props.corp.startingMoney}
      </div>
      <Box flex="1 1 auto" style={{textAlign: 'right'}}>
        {props.corp.name}
      </Box>
      <Flex ml={5}>{(props.corp.tags || []).map(tag => <Tag key={tag} name={tag} />)}</Flex>
    </Flex>
    {props.corp.actions && <CardActions actions={props.corp.actions} card={props.corp} />}
    <Flex px="5px" my="5px" direction="column">
      <Flex align="center">
        {!props.collapsed && props.corp.text && <Box py="4px">{props.corp.text}</Box>}
        {!props.collapsed &&
          props.corp.effects && <CardEffects effects={props.corp.effects} card={props.corp} />}
        {props.corp.discounts && (
          <CardDiscounts discounts={props.corp.discounts} card={props.corp} />
        )}
        {props.corp.afterCardTriggers && (
          <CardTriggers triggers={props.corp.afterCardTriggers} card={props.corp} />
        )}
        {props.corp.afterTileTriggers && (
          <CardTileTriggers triggers={props.corp.afterTileTriggers} card={props.corp} />
        )}
      </Flex>
    </Flex>
  </CardWrapper>
)

Corporation = withProps(props => ({corp: getCorporationByName(props.name)}))(Corporation)

export default Corporation
