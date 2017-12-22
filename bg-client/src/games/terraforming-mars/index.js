import React, {Component} from 'react'
import styled from 'styled-components'
import {Flex, Box} from 'grid-styled'
import {range} from 'lodash/fp'

import {reducer} from './reducer'

const Wrapper = styled.div`font-family: Rubik;`

const CARD_COLORS = {
  Active: '#dff3ff',
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

const CardWrapper = styled(Box)`
  background: ${props => CARD_COLORS[props.type] || '#ffc0c0'};
  min-width: 250px;
  font-size: 13px;
  margin-bottom: 5px;
  box-shadow: 0px 1px 1px 1px #eee;
`

const Card = props => (
  <CardWrapper type={props.type}>
    <Flex align="center" style={{padding: 5, borderBottom: '1px solid #d87777'}}>
      <div style={{fontWeight: 500, fontSize: 15}}>{props.cost}</div>
      <Box flex="1 1 auto" style={{textAlign: 'right'}}>
        {props.name}
      </Box>
      <Flex ml={5}>
        <Circle color="blue">C</Circle>
        <Circle color="green">P</Circle>
        <Circle color="black">S</Circle>
      </Flex>
    </Flex>
    {!props.collapsed && <Flex style={{padding: 5}}>1 → Card</Flex>}
  </CardWrapper>
)

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
  <Box style={{fontSize: 14}}>
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

const PlayerCard = () => (
  <Box mb={2}>
    <Flex>
      <Box flex="1 1 auto">viz</Box>
      <Box>30</Box>
    </Flex>
    <Flex>
      <Flex>
        <Circle color="yellow">C</Circle>
        2
      </Flex>
      <Flex>
        <Circle color="brown">S</Circle>
        2
      </Flex>
      <Circle color="black">T</Circle>
    </Flex>
    <Flex>
      <Circle color="green">P</Circle>
      <Circle color="purple">E</Circle>
      <Circle color="red">H</Circle>
    </Flex>
  </Box>
)

const TerraformingMars = () => (
  <Wrapper>
    <Box
      py={1}
      px={2}
      slign="center"
      style={{fontFamily: 'Rubik Mono One', borderBottom: '1px solid #aaa'}}
    >
      Terraforming Mars
    </Box>
    <Flex>
      <Box p={2} w={200} style={{minWidth: 200, borderRight: '1px solid #ddd'}}>
        <PlayerCard />
        <PlayerCard />
        <PlayerCard />
      </Box>
      <Box flex="1 1 auto" p={2}>
        <Flex>
          <Box>
            <GlobalParams />
            <Leaderboard />
          </Box>
          <Box flex="1 1 auto" style={{textAlign: 'center'}}>
            <Flex py={1} px={2} mx={2} style={{background: '#eee'}} align="center" justify="center">
              2 actions left. Choose an action or
              <Box px={1} py="3px" ml={1} style={{cursor: 'pointer', background: '#ddd'}}>
                pass
              </Box>
            </Flex>
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
      <Box style={{borderLeft: '1px solid #ddd'}}>
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

export default TerraformingMars
