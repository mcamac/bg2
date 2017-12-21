import React, {Component} from 'react'
import styled from 'styled-components'
import {Flex, Box} from 'grid-styled'
import {range} from 'lodash/fp'

import {reducer} from './reducer'

const Wrapper = styled.div`
  font-family: Rubik;
  padding: 20px;
`

const CARD_COLORS = {
  Active: '#dff3ff',
}

const CircleWrapper = styled.div`
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background: ${props => props.color};
  text-align: center;
  vertical-align: middle;
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
  <svg width={500} height={420}>
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
    <Box mb="3px" style={{borderBottom: '1px solid black'}}>
      Terraforming Rating
    </Box>
    {['abe', 'bas', 'cab'].map(player => (
      <Flex key={player}>
        <Box w={120}>{player}</Box>
        <Box>20</Box>
      </Flex>
    ))}
  </Box>
)

const TerraformingMars = () => (
  <Wrapper>
    <div style={{fontFamily: 'Rubik Mono One'}}>Terraforming Mars</div>
    <Box>Oceans: 0 (9 left), Temp: -20C (14 left) , Oxygen: 4 (13 left)</Box>
    <Flex>
      <Grid />
      <Leaderboard />
    </Flex>
    <Flex>
      Events
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
  </Wrapper>
)

export default TerraformingMars
