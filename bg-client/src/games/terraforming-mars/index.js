import React, {Component} from 'react'
import styled from 'styled-components'
import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'
import {compose, branch, renderNothing, withProps} from 'recompose'

import {reducer} from './reducer'
import {Grid} from './Grid'

import {CARDS, getCardByName} from '../../../../games/terraforming-mars/src/cards'
import {getCorporationByName} from '../../../../games/terraforming-mars/src/corporations'
console.log(CARDS)

const Wrapper = styled(Flex)`
  font-family: Rubik;
  height: 100%;
`

const CARD_COLORS = {
  Active: '#c1e4f9',
  Event: '#ffc0c0',
  Automated: '#95F58D',
  Corporation: '#e3e3e3',
}

const CircleWrapper = styled.div`
  border-radius: 50%;
  width: 18px;
  height: 18px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`

const Circle = props => (
  <CircleWrapper {...props}>
    <div style={{marginTop: 3, color: 'white', mixBlendMode: 'difference'}}>{props.children}</div>
  </CircleWrapper>
)

const TAG_COLORS = {
  Space: 'black',
  Titanium: 'black',
  Building: 'brown',
  Science: 'white',
  Power: 'purple',
  Energy: 'purple',
  Event: 'red',
  Earth: 'blue',
  City: '#ddd',
  Microbe: '#bfbf2d',
  Jovian: 'orange',
  Greenery: 'green',
  Plant: 'green',
  Heat: 'red',
  Money: 'yellow',
}

const Tag = props => (
  <Circle color={TAG_COLORS[props.name] || 'blue'}>
    <Icon g={props.name} style={{marginTop: 2}} />
  </Circle>
)

const CardWrapper = styled(Box)`
  background: ${props => CARD_COLORS[props.type || (props.corporation && 'Corporation')]};
  min-width: 250px;
  font-size: 13px;
  margin-bottom: 5px;
  box-shadow: 0px 1px 1px 1px #eee;
  box-sizing: border-box;
  cursor: pointer;

  transition: 0.2s all;

  &:hover {
    box-shadow: 0px 1px 4px 5px ${props => CARD_COLORS[props.type] || '#aaa'};
  }
`

const requiresByType = (type, count, tag) => {
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
  return type
}

const CardRequirements = ({requires: [[type, ...args]]}) => (
  <Flex px="4px" ml="4px" style={{background: 'rgba(255, 255, 255, 0.5)'}}>
    {requiresByType(type, ...args)}
  </Flex>
)

const withSign = value => (value >= 0 ? `+${value}` : `${value}`)

const ChangeProduction = (value, resource) => (
  <Flex mr="4px" style={{background: '#8a5d5d', color: '#eee', padding: '3px'}}>
    {typeof value === 'number' ? withSign(value) : Effect(...value)}
    <Icon g={resource} />
  </Flex>
)

const ChangeInventory = (value, resource) => (
  <Flex>
    {withSign(value)} {typeof resource === 'string' ? <Icon g={resource} /> : resource}
  </Flex>
)

const ChangeCardResource = (value, resource) => (
  <Flex align="center">
    <Box>{withSign(value)}</Box>
    <Box px="4px">{typeof resource === 'string' ? <Icon g={resource} /> : resource}</Box>{' '}
    <Box> on card</Box>
  </Flex>
)

const ChangeAnyCardResource = (value, resource) => (
  <Flex align="center">
    <Box>{withSign(value)}</Box>
    {typeof resource === 'string' ? <Icon g={resource} /> : resource}
    <Box> any card</Box>
  </Flex>
)

const DecreaseAnyProduction = (value, resource) => (
  <Flex mr="4px" style={{background: '#8a5d5d', color: '#eee', padding: 3}}>
    Remove any {value}
    <Icon g={resource} />
  </Flex>
)

const DecreaseAnyInventory = (value, resource) => (
  <Flex>
    Remove any
    {value}
    <Icon g={resource} />
  </Flex>
)

const PlaceOceans = (value, card) => (
  <Flex style={{background: '#b5b5fd'}}>
    {withSign(value)} <Icon g="Ocean" />
  </Flex>
)
const IncreaseTemperature = (value, card) => (
  <Flex>
    {withSign(value)} <Icon g="Temp" />
  </Flex>
)

const RaiseOxygen = (value, card) => (
  <Flex>
    {withSign(value)} <Icon g="Oxygen" />
  </Flex>
)
const Draw = (value, card) => (
  <Flex>
    {withSign(value)} <Icon g="Card" />
  </Flex>
)
const RoboticWorkforce = () => (
  <Flex>
    Copy the production box of any <Tag name="Building" />
  </Flex>
)

const Choice = (choices, card) => (
  <Flex align="center">
    <Box mr="4px">One of:</Box>
    {choices.map(
      ([effect, ...args], i) =>
        EFFECTS[effect] && <Box key={i}> {EFFECTS[effect](...args, card)}</Box>
    )}
  </Flex>
)

const IncreaseTR = value => (
  <div>
    {withSign(value)}{' '}
    <span style={{background: '#e82f2f', color: 'white', fontWeight: 500, padding: '2px 4px'}}>
      TR
    </span>
  </div>
)
const PlaceCity = () => (
  <div>
    <Tag name="City" />
  </div>
)

const PlaceGreenery = () => (
  <div>
    <Tag name="Greenery" />
  </div>
)

const VPForCardResources = (resource, count) => (
  <Flex>
    1 VP / {count} <Icon g={resource} />
  </Flex>
)

const VPForTags = tag => (
  <Flex>
    1 VP / <Tag name={tag} />
  </Flex>
)

const GetTags = tag => (
  <Flex>
    1 / <Tag name={tag} />
  </Flex>
)

const VPIfCardHasResources = (resource, count, vp) => (
  <Flex>
    {vp} VP if at least {count} <Icon g={resource} />
  </Flex>
)

const EFFECTS = {
  ChangeProduction,
  ChangeInventory,
  ChangeCardResource,
  ChangeAnyCardResource,
  PlaceOceans,
  PlaceCity,
  PlaceGreenery,
  RaiseOxygen,
  DecreaseAnyProduction,
  DecreaseAnyInventory,
  IncreaseTemperature,
  RoboticWorkforce,
  IncreaseTR,
  Choice,
  Draw,
  VPForTags,
  VPForCardResources,
  VPIfCardHasResources,
  GetTags,
}

const CardEffects = props => (
  <Flex align="center">
    {props.effects.map(([effect, ...args], i) => (
      <Box key={i}>
        {EFFECTS[effect] ? (
          EFFECTS[effect](...args, props.card)
        ) : (
          <pre>{JSON.stringify([effect, ...args], null, 2)}</pre>
        )}
      </Box>
    ))}
  </Flex>
)

const ActionWrapper = styled(Flex)`
  padding: 2px 8px;
  transition: 0.2s background;

  &:hover {
    background: white;
  }
`

const CardActions = props => (
  <Box>
    {props.actions.map((action, i) => (
      <ActionWrapper align="center" key={i}>
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

const Effect = (effect, ...args) =>
  EFFECTS[effect] ? (
    <Box>{EFFECTS[effect](...args)} </Box>
  ) : (
    <pre>{JSON.stringify([effect, ...args])}</pre>
  )

// const CARD_VP_TYPES = {
//   VPForCardResources,
// }

const CardVP = props => (
  <Flex ml={1} flex="1 1 auto" justify="flex-end">
    <Flex style={{padding: '2px 4px', background: 'green', color: 'white'}}>
      {typeof props.card.vp === 'number' ? `${props.card.vp} VP` : Effect(...props.card.vp)}
    </Flex>
  </Flex>
)

const Icon = props => (
  <i className={`icon icon-${props.g}`} style={{...(props.style || {}), fontSize: 18}} />
)

let Card = props => (
  <CardWrapper type={props.card.type}>
    <Flex align="center" style={{padding: 5, borderBottom: '1px solid #aaa'}}>
      <div style={{fontWeight: 500, fontSize: 15, width: 18, color: '#333'}}>{props.card.cost}</div>
      {props.card.requires && <CardRequirements requires={props.card.requires} />}
      <Box flex="1 1 auto" style={{textAlign: 'right'}}>
        {props.name}
      </Box>
      <Flex ml={5}>{(props.card.tags || []).map(tag => <Tag key={tag} name={tag} />)}</Flex>
    </Flex>
    {props.card.actions && <CardActions actions={props.card.actions} card={props.card} />}
    {!props.collapsed &&
      (props.card.effects || props.card.vp) && (
        <Flex style={{padding: 5}} direction="column">
          <Flex align="center">
            {props.card.effects && <CardEffects effects={props.card.effects} card={props.card} />}
            {props.card.vp && <CardVP card={props.card} />}
          </Flex>
        </Flex>
      )}
  </CardWrapper>
)

Card = withProps(props => ({card: getCardByName(props.name)}))(Card)
export {Card}

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
    {!props.collapsed &&
      props.corp.effects && (
        <Flex style={{padding: 5}} direction="column">
          <Flex align="center">
            {props.corp.effects && <CardEffects effects={props.corp.effects} card={props.corp} />}
          </Flex>
        </Flex>
      )}
  </CardWrapper>
)

Corporation = withProps(props => ({corp: getCorporationByName(props.name)}))(Corporation)
export {Corporation}

const Leaderboard = () => (
  <Box style={{fontSize: 14}} mb={3}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Terraforming Ratings
    </Box>
    {['abe', 'bas', 'cab'].map(player => (
      <Flex key={player}>
        <Box w={120}>{player}</Box>
        <Box>20</Box>
      </Flex>
    ))}
  </Box>
)

const GlobalParams = () => (
  <Box style={{fontSize: 14}} mb={3}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Globals
    </Box>
    {['Oceans', 'Temp', 'Oxygen'].map(param => (
      <Flex key={param}>
        <Box w={120} flex="1 1 auto">
          {param}
        </Box>
        <Box>0 (9 left)</Box>
      </Flex>
    ))}
  </Box>
)

const Milestones = () => (
  <Box style={{fontSize: 14}} mb={3}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Milestones
    </Box>
    {['Oceans', 'Temp', 'Oxygen'].map(param => (
      <Flex key={param}>
        <Box w={120} flex="1 1 auto" style={{color: '#aaa'}}>
          Not chosen
        </Box>
        <Box>a</Box>
      </Flex>
    ))}
  </Box>
)

const Awards = () => (
  <Box style={{fontSize: 14}}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Awards
    </Box>
    {['Oceans', 'Temp', 'Oxygen'].map(param => (
      <Flex key={param}>
        <Box w={120} flex="1 1 auto" style={{color: '#aaa'}}>
          Not chosen
        </Box>
        <Box>a</Box>
      </Flex>
    ))}
  </Box>
)

const PlayerCard = props => (
  <Box p={2} style={{borderBottom: '1px solid #eee'}}>
    <Flex mb={1}>
      <Box flex="1 1 auto">{props.player}</Box>
      <Box>30</Box>
    </Flex>
    <Flex mb="4px">
      <Flex mr={1}>
        <Tag name="Money" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Money.count} (+{props.state.resources.Money.production})
        </Box>
      </Flex>
      <Flex mr={1}>
        <Tag name="Steel" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Steel.count} (+{props.state.resources.Steel.production})
        </Box>
      </Flex>
      <Flex>
        <Tag name="Titanium" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Titanium.count} (+{props.state.resources.Titanium.production})
        </Box>
      </Flex>
    </Flex>
    <Flex>
      <Flex mr={1}>
        <Tag name="Plant" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Plant.count} (+{props.state.resources.Plant.production})
        </Box>
      </Flex>
      <Flex mr={1}>
        <Tag name="Energy" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Energy.count} (+{props.state.resources.Energy.production})
        </Box>
      </Flex>
      <Flex>
        <Tag name="Heat" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Heat.count} (+{props.state.resources.Heat.production})
        </Box>
      </Flex>
    </Flex>
  </Box>
)

const ActionBar = props => (
  <Flex py={1} px={2} mx={2} style={{background: '#eee'}} align="center" justify="center">
    Card buying. 2 actions left. Choose an action or
    <Box px={1} py="3px" ml={1} style={{cursor: 'pointer', background: '#ddd'}}>
      pass
    </Box>
  </Flex>
)

const TerraformingMars = props => (
  <Wrapper direction="column">
    <Box
      py={1}
      px={2}
      slign="center"
      style={{fontFamily: 'Rubik Mono One', borderBottom: '1px solid #ddd', background: '#fafafa'}}
    >
      Terraforming Mars
    </Box>
    <Flex>
      <Box w={270} style={{minWidth: 270, borderRight: '1px solid #ddd', background: '#fafafa'}}>
        {props.game.players.map(player => (
          <PlayerCard key={player} player={player} state={props.game.playerState[player]} />
        ))}
      </Box>
      <Box flex="1 1 auto" p={2}>
        <Flex>
          <Box>
            <GlobalParams />
            <Leaderboard />
            <Milestones />
            <Awards />
          </Box>
          <Box flex="1 1 auto" style={{textAlign: 'center'}}>
            <ActionBar />
            <Grid />
          </Box>
        </Flex>
        <Flex>
          <Box mr={1}>
            <Card cost={23} name="Development Center" collapsed />
            <Card cost={23} name="Development Center" collapsed />
            <Card cost={23} name="Development Center" collapsed />
            <Card cost={23} name="Development Center" collapsed />
            <Card cost={23} name="Development Center" collapsed />
          </Box>
          <Box mr={1}>
            <Card cost={23} name="Development Center" collapsed />
            <Card cost={23} name="Development Center" collapsed />
            <Card cost={23} name="Development Center" collapsed />
            <Card cost={23} name="Development Center" collapsed />
            <Card cost={23} name="Development Center" collapsed />
          </Box>
          <Box>
            <Card cost={23} name="Development Center" type="Active" />
            <Card cost={23} name="Development Center" type="Active" />
          </Box>
        </Flex>
      </Box>
      <Box style={{borderLeft: '1px solid #ddd', overflowY: 'scroll', background: '#fafafa'}}>
        <Box p={1} style={{fontSize: 12, color: '#555'}}>
          CORPORATIONS
        </Box>
        <Box px={2}>
          {props.game.choosingCorporations.a.map(name => <Corporation key={name} name={name} />)}
        </Box>
        <Box p={1} style={{fontSize: 12, color: '#555'}}>
          BUYING
        </Box>
        <Box px={2}>{props.game.choosingCards.a.map(name => <Card key={name} name={name} />)}</Box>
        <Box p={1} style={{fontSize: 12, color: '#555'}}>
          HAND
        </Box>
        <Box px={2}>
          <Card cost={23} name="Development Center" />
          <Card cost={23} name="Development Center" />
          <Card cost={23} name="Development Center" />
          <Card cost={23} name="Development Center" />
          <Card cost={23} name="Development Center" />
        </Box>
      </Box>
    </Flex>
  </Wrapper>
)

export default compose(
  connect(state => ({game: state})),
  branch(props => !props.game, renderNothing)
)(TerraformingMars)
