import {range} from 'lodash/fp'
import {withState} from 'recompose'
import {connect} from 'react-redux'

import {RESOURCE_BONUSES, OCEAN_POSITIONS} from '../../../../games/terraforming-mars/src/constants'
import {chooseTile} from './reducer'
import {isOcean} from '../../../../games/terraforming-mars/src/tiles'
import {PLAYER_COLORS} from './constants'
import Icon from './components/Icon'

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
const WIDTH = 400
const HEIGHT = 400
const RADIUS = 24

const COLORS = {
  ocean: 'blue',
  greenery: '#95F58D',
  city: '#ccc',
}

let Tile = props => {
  const xc = WIDTH / 2 + props.y * RADIUS * (Math.sqrt(3) / 2) + props.x * RADIUS * Math.sqrt(3)
  const yc = HEIGHT / 2 + 3 / 2 * RADIUS * -props.y
  const tile = props.map[`${props.x},${props.y}`]
  return (
    <g>
      <polygon
        stroke="black"
        fill={props.hovered ? '#eee' : isOcean([props.x, props.y]) ? '#daf1ff' : 'transparent'}
        onMouseEnter={() => props.setHovered(true)}
        onMouseLeave={() => props.setHovered(false)}
        onClick={() => props.onClick([props.x, props.y])}
        points={hexPoints(xc, yc, RADIUS)}
      />
      {tile && (
        <polygon
          stroke="black"
          fill={COLORS[tile.type] || 'transparent'}
          points={hexPoints(xc, yc, RADIUS - 4)}
        />
      )}
      {tile &&
        (!isOcean([props.x, props.y]) || tile.type === 'greenery') && (
          <rect
            x={xc - 5}
            y={yc - 5}
            width={10}
            height={10}
            fill={PLAYER_COLORS[props.players.indexOf(tile.owner)]}
          />
        )}
    </g>
  )
}

Tile = withState('hovered', 'setHovered', false)(Tile)

let Grid = props => (
  <svg width={WIDTH} height={HEIGHT}>
    <g>
      {range(-4, 5).map(row =>
        range(Math.max(-4, -4 - row), Math.min(4, 4 - row) + 1).map(col => (
          <Tile
            key={`${col}-${row}`}
            y={row}
            x={col}
            onClick={props.onClickTile}
            players={props.players}
            map={props.map}
          />
        ))
      )}
    </g>
  </svg>
)

Grid = connect(
  state => ({
    map: state.game.map,
    players: state.game.players,
  }),
  dispatch => ({
    onClickTile: position => dispatch(chooseTile(position)),
  })
)(Grid)

export {Grid}
