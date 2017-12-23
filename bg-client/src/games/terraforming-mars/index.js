import React, {Component} from 'react'
import styled from 'styled-components'
import {Flex, Box} from 'grid-styled'
import {range} from 'lodash/fp'
import {connect} from 'react-redux'
import {compose, branch, renderNothing, withProps} from 'recompose'

import {reducer} from './reducer'

import {CARDS, getCardByName} from '../../../../games/terraforming-mars/src/cards'
console.log(CARDS)

const Wrapper = styled(Flex)`
  font-family: Rubik;
  height: 100%;
`

const CARD_COLORS = {
  Active: '#c1e4f9',
  Event: '#ffc0c0',
  Automated: '#95F58D',
}

const CircleWrapper = styled.div`
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`

const Circle = props => (
  <CircleWrapper {...props}>
    <span style={{color: 'white', mixBlendMode: 'difference'}}>{props.children}</span>
  </CircleWrapper>
)

const TAG_COLORS = {
  Space: 'black',
  Building: 'brown',
  Science: 'white',
  Power: 'purple',
  Event: 'red',
  Earth: 'blue',
}

const Tag = props => <Circle color={TAG_COLORS[props.name] || 'blue'}>{props.name[0]}</Circle>

const CardWrapper = styled(Box)`
  background: ${props => CARD_COLORS[props.type]};
  min-width: 250px;
  font-size: 13px;
  margin-bottom: 5px;
  box-shadow: 0px 1px 1px 1px #eee;
  box-sizing: border-box;
`

const CardRequirements = props => (
  <Flex px="4px" ml="4px" style={{background: 'rgba(255, 255, 255, 0.5)'}}>
    O ≥ {props.requires[0][1]}
  </Flex>
)

const withSign = value => (value >= 0 ? `+${value}` : `${value}`)

const ChangeProduction = (value, resource) => (
  <div style={{background: '#a56c6c'}}>
    {withSign(value)}
    {resource}
  </div>
)

const ChangeInventory = (value, resource) => (
  <div>
    {withSign(value)} {resource}
  </div>
)

const DecreaseAnyProduction = (value, resource) => (
  <div style={{background: '#a56c6c'}}>
    Remove any
    {value}
    {resource}
  </div>
)

const DecreaseAnyInventory = (value, resource) => (
  <div>
    Remove any
    {value}
    {resource}
  </div>
)

const PlaceOceans = (value, card) => <div>{withSign(value)} Oceans</div>
const IncreaseTemperature = (value, card) => <div>{withSign(value)} Temp</div>
const RaiseOxygen = (value, card) => <div>{withSign(value)} Oxy</div>
const Draw = (value, card) => <div>Draw {value}</div>

const Choice = (choices, card) => (
  <Flex>
    One of:
    {choices.map(
      ([effect, ...args], i) =>
        EFFECTS[effect] && <Box key={i}> {EFFECTS[effect](...args, card)}</Box>
    )}
  </Flex>
)

const IncreaseTR = value => <div>{withSign(value)} TR</div>

const EFFECTS = {
  ChangeProduction,
  ChangeInventory,
  PlaceOceans,
  RaiseOxygen,
  DecreaseAnyProduction,
  DecreaseAnyInventory,
  IncreaseTemperature,
  IncreaseTR,
  Choice,
  Draw,
}

const CardEffects = props =>
  props.effects.map(([effect, ...args], i) => (
    <Box key={i}>
      {EFFECTS[effect] ? (
        EFFECTS[effect](...args, props.card)
      ) : (
        <pre>{JSON.stringify([effect, ...args], null, 2)}</pre>
      )}
    </Box>
  ))

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
    {!props.collapsed && (
      <Flex style={{padding: 5}}>
        {props.card.effects && <CardEffects effects={props.card.effects} card={props.card} />}
        {props.card.vp && `${props.card.vp} VP`}
      </Flex>
    )}
  </CardWrapper>
)

Card = withProps(props => ({card: getCardByName(props.name)}))(Card)
export {Card}

const hexPoints = (x, y, radius) => {
  var points = []
  for (var theta = 0; theta < Math.PI * 2; theta += Math.PI / 3) {
    var pointX, pointY
    pointX = x + radius * Math.sin(theta)
    pointY = y + radius * Math.cos(theta)
    points.push(pointX + ',' + pointY)
  }
  return points.join(' ')
}
const RADIUS = 28

const Grid = () => (
  <svg width={470} height={420}>
    <g>
      {range(0, 9).map(row =>
        range(
          4 - (4 - Math.ceil(Math.abs(4 - row) / 2)),
          5 + 4 - Math.floor(Math.abs(4 - row) / 2)
        ).map(col => (
          <polygon
            key={`${col}-${row}`}
            stroke="black"
            fill="transparent"
            points={hexPoints(
              40 - RADIUS * (row % 2) + Math.sqrt(3) * RADIUS / 2 * col * 2,
              40 + Math.sqrt(3) * RADIUS / 2 * row * Math.sqrt(3),
              RADIUS
            )}
          />
        ))
      )}
    </g>
  </svg>
)

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
        <Box w={120} flex="1 1 auto">
          Mayor
        </Box>
        <Box>a</Box>
      </Flex>
    ))}
  </Box>
)

const PlayerCard = props => (
  <Box p={2} style={{borderBottom: '1px solid #eee'}}>
    <Flex mb="4px">
      <Box flex="1 1 auto">{props.player}</Box>
      <Box>30</Box>
    </Flex>
    <Flex>
      <Flex mr={1}>
        <Circle color="yellow">C</Circle>
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Money.count} (+{props.state.resources.Money.production})
        </Box>
      </Flex>
      <Flex mr={1}>
        <Circle color="brown">S</Circle>
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Steel.count} (+{props.state.resources.Steel.production})
        </Box>
      </Flex>
      <Flex>
        <Circle color="black">T</Circle>
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Titanium.count} (+{props.state.resources.Titanium.production})
        </Box>
      </Flex>
    </Flex>
    <Flex>
      <Circle color="green">P</Circle>
      <Circle color="purple">E</Circle>
      <Circle color="red">H</Circle>
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
      style={{fontFamily: 'Rubik Mono One', borderBottom: '1px solid #ddd'}}
    >
      Terraforming Mars
    </Box>
    <Flex>
      <Box w={270} style={{minWidth: 270, borderRight: '1px solid #ddd'}}>
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
            <Card cost={23} name="Development Center" />
            <Card cost={23} name="Development Center" />
            <Card cost={23} name="Development Center" />
            <Card cost={23} name="Development Center" />
            <Card cost={23} name="Development Center" />
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
      <Box style={{borderLeft: '1px solid #ddd', overflowY: 'scroll'}}>
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
