import {range} from 'lodash/fp'
import {withState} from 'recompose'
import {connect} from 'react-redux'

import {ResourceBonus} from '../../../../games/terraforming-mars/src/types'
import {RESOURCE_BONUSES} from '../../../../games/terraforming-mars/src/constants'
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
const HEIGHT_MAIN = 400
const HEIGHT = 600
const RADIUS = 24

const COLORS = {
  ocean: 'blue',
  greenery: '#95F58D',
  city: '#ccc',
}

const BONUS_TO_ICON = {
  [ResourceBonus.Steel]: '&#xe901',
  [ResourceBonus.Titanium]: '&#xe905',
  [ResourceBonus.Plant]: '&#xe906',
  [ResourceBonus.Card]: '&#xe913',
}

let Tile = props => {
  const xc = WIDTH / 2 + props.y * RADIUS * (Math.sqrt(3) / 2) + props.x * RADIUS * Math.sqrt(3)
  const yc = HEIGHT_MAIN / 2 + 3 / 2 * RADIUS * -props.y
  const tileKey = props.name || `${props.x},${props.y}`
  const tile = props.map[tileKey]
  const bonuses = RESOURCE_BONUSES[tileKey]
  return (
    <g onClick={() => props.onClick([props.x, props.y])}>
      <polygon
        stroke="black"
        fill={props.hovered ? '#eee' : isOcean([props.x, props.y]) ? '#daf1ff' : 'transparent'}
        onMouseEnter={() => props.setHovered(true)}
        onMouseLeave={() => props.setHovered(false)}
        points={hexPoints(xc, yc, RADIUS)}
      />
      {!tile && bonuses && bonuses.map((bonus, i) => <text fill='#999' x={xc + i * 12 - 12} y={yc} style={{fontFamily: 'icomoon'}} dangerouslySetInnerHTML={{__html: BONUS_TO_ICON[bonus]}}>
        </text>)
      }
      {tile && (
        <polygon
          stroke="black"
          fill={COLORS[tile.type] || 'transparent'}
          points={hexPoints(xc, yc, RADIUS - 4)}
        />
      )}
      {tile &&
        tile.type !== 'ocean' && (
          <rect
            x={xc - 5}
            y={yc - 5}
            width={10}
            height={10}
            fill={
              tile.owner !== '__NEUTRAL'
                ? PLAYER_COLORS[props.players.indexOf(tile.owner)]
                : 'black'
            }
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
    <g>
    <Tile
      y={-6}
      x={0}
      name='Phobos Space Haven'
      onClick={props.onClickTile}
      players={props.players}
      map={props.map}
    />
    <text x={75} y={450} fontSize={10} textAnchor='middle'>Phobos S.H.</text>
    <Tile
      y={-6}
      x={6}
      name='Ganymede Colony'
      onClick={props.onClickTile}
      players={props.players}
      map={props.map}
    />
    <text x={325} y={450} fontSize={10} textAnchor='middle'>Ganymede C.</text>
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
