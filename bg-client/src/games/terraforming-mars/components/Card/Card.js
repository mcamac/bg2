import React from 'react'
import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'
import {compose, pure, withProps} from 'recompose'

import {getCardByName} from '../../../../../../games/terraforming-mars/src/cards'
import Icon from '../Icon'
import Tag from '../Tag'

import CardEffects from './CardEffects'
import CardDiscounts from './CardDiscounts'
import CardRequirements from './CardRequirements'
import CardWrapper from './CardWrapper'
import CardActions from './CardActions'
import CardVP from './CardVP'
import {CardTriggers, CardTileTriggers} from './CardTriggers'

let Card = props => (
  <CardWrapper type={props.card.type} selected={props.selected} onClick={props.onClick}>
    <Flex align="center" style={{padding: 5, borderBottom: '1px solid #aaa'}}>
      <div style={{fontWeight: 500, fontSize: 15, width: 18, color: '#333'}}>{props.card.cost}</div>
      {props.card.requires && <CardRequirements requires={props.card.requires} />}
      <Box flex="1 1 auto" style={{textAlign: 'right'}}>
        {props.name}
      </Box>
      <Flex ml={5}>
        {(props.card.tags || []).map(tag => (
          <Tag key={tag} name={tag} />
        ))}
      </Flex>
    </Flex>
    {props.card.actions && (
      <CardActions
        isUsed={props.isUsed}
        enabled={props.played}
        actions={props.card.actions}
        card={props.card}
      />
    )}
    <Flex px="5px" mt="5px" direction="column">
      <Flex align="center" wrap="wrap">
        {props.card.effects && !props.collapsed && (
          <Flex mr={1} align="center">
            <CardEffects effects={props.card.effects} card={props.card} />
          </Flex>
        )}
        {props.card.discounts && (
          <CardDiscounts discounts={props.card.discounts} card={props.card} />
        )}
        {props.card.afterCardTriggers && (
          <CardTriggers triggers={props.card.afterCardTriggers} card={props.card} />
        )}
        {props.card.afterTileTriggers && (
          <CardTileTriggers triggers={props.card.afterTileTriggers} card={props.card} />
        )}
        {props.resources && (
          <Box>
            {props.resources && typeof props.resources === 'number' && props.resources}{' '}
            <Icon g={props.card.resourceHeld} />
          </Box>
        )}
        {props.card.vp && <CardVP card={props.card} />}
      </Flex>
    </Flex>
  </CardWrapper>
)

Card = compose(
  pure,
  withProps(props => ({card: getCardByName(props.name)}))
)(Card)

export default Card
