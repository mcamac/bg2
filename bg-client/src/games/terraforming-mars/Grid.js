import {range} from 'lodash/fp'
import {withState} from 'recompose'

import {RESOURCE_BONUSES, OCEAN_POSITIONS} from '../../../../games/terraforming-mars/src/constants'

const hexPoints = (x, y, radius) => {
  var points = []
  for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / 3) {
    var pointX, pointY
    pointX = x + radius * Math.sin(theta)
    pointY = y + radius * Math.cos(theta)
    points.push(pointX + ',' + pointY)
  }
  return points.join(' ')
}
const RADIUS = 28

let Tile = props => {
  const xc = 220 + props.y * RADIUS * (Math.sqrt(3) / 2) + props.x * RADIUS * Math.sqrt(3)
  const yc = 210 + 3 / 2 * RADIUS * -props.y
  return (
    <g>
      <polygon
        stroke="black"
        fill={props.hovered ? '#eee' : props.x === 3 ? '#95F58D' : 'transparent'}
        onMouseEnter={() => props.setHovered(true)}
        onMouseLeave={() => props.setHovered(false)}
        points={hexPoints(xc, yc, RADIUS)}
      />
      {props.x === 3 && <rect x={xc - 5} y={yc - 5} width={10} height={10} fill="blue" />}
    </g>
  )
}

Tile = withState('hovered', 'setHovered', false)(Tile)

export const Grid = () => (
  <svg width={440} height={420}>
    <g>
      {range(-4, 5).map(row =>
        range(Math.max(-4, -4 - row), Math.min(4, 4 - row) + 1).map(col => (
          <Tile key={`${col}-${row}`} y={row} x={col} />
        ))
      )}
    </g>
  </svg>
)
