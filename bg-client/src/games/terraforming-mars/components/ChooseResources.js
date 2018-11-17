import React from 'react'
import {connect} from 'react-redux'
import styled from 'styled-components'
import {compose, withProps, withStateHandlers} from 'recompose'
import {Flex, Box} from 'grid-styled'

import Tag from './Tag'
import {getCardByName} from '../../../../../games/terraforming-mars/src/cards'

import {uiSetCardCost} from '../reducer'

const Button = styled(Box)`
  padding: 3px 8px;
  margin-left: 8px;
  cursor: pointer;
  background: #ddd;
`

const ResourceInput = styled.input`
  width: 30px;
  font-size: 1em;
  text-align: right;
  margin: 0 4px;
`

let ChooseResources = props => (
  <React.Fragment>
    Cost: {props.card.cost} (total {props.total})
    <Flex mr={1} align="center">
      <Tag name="Money" />
      <ResourceInput value={props.count.money} onChange={e => props.setMoney(e.target.value)} />
      <Box>({props.resources.Money.count})</Box>
    </Flex>
    <Flex mr={1} align="center">
      <Tag name="Steel" />
      <ResourceInput value={props.count.steel} onChange={e => props.setSteel(e.target.value)} />
      ({props.resources.Steel.count})
    </Flex>
    <Flex mr={1} align="center">
      <Tag name="Titanium" />
      <ResourceInput
        value={props.count.titanium}
        onChange={e => props.setTitanium(e.target.value)}
      />
      ({props.resources.Titanium.count})
    </Flex>
    <Button onClick={props.onSubmit}>Play</Button>
  </React.Fragment>
)

ChooseResources = compose(
  connect(state => ({
    card: getCardByName(state.ui.action.card),
    resourceValues: state.game.playerState[state.player].conversions,
  })),
  withStateHandlers(props => ({count: {money: props.card.cost, titanium: 0, steel: 0}}), {
    setMoney: state => money => ({...state, count: {...state.count, money}}),
    setSteel: state => steel => ({...state, count: {...state.count, steel}}),
    setTitanium: state => titanium => ({...state, count: {...state.count, titanium}}),
  }),
  withProps(props => ({
    total:
      1 * props.count.money +
      props.resourceValues['Steel'] * props.count.steel +
      props.resourceValues['Titanium'] * props.count.titanium,
  })),
  connect(
    state => ({
      resources: state.game.playerState[state.player].resources,
    }),
    (dispatch, props) => ({
      onSubmit: () =>
        dispatch(
          uiSetCardCost({
            Money: parseInt(props.count.money) || 0,
            Titanium: parseInt(props.count.titanium) || 0,
            Steel: parseInt(props.count.steel) || 0,
          })
        ),
    })
  )
)(ChooseResources)

export default ChooseResources
