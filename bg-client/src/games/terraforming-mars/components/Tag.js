import React from 'react'
import styled from 'styled-components'

import Icon from './Icon'

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
  Steel: 'brown',
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

const NAME_ALIAS = {
  Power: 'Energy'
}

const Tag = props => (
  <Circle color={TAG_COLORS[props.name] || 'blue'}>
    <Icon g={NAME_ALIAS[props.name] || props.name} style={{marginTop: 2}} />
  </Circle>
)

export default Tag
