import {Component} from 'react'
import styled from 'styled-components'
import {withProps} from 'recompose'
import {Flex, Box} from 'grid-styled'
import {range, toPairs} from 'lodash/fp'

import pg, {CARDS, getInitialState} from '../../../../games/power-grid/src/index.ts'

const INITIAL_STATE = getInitialState(['monsk', 'viz', 'nhkl'])

console.log(INITIAL_STATE)

const PlayerInfo = props => (
  <Flex direction="column" mb="20px">
    <Flex align="center" mb="3px">
      <Box flex="1 1 auto">{props.player}</Box>
      <Box style={{fontFamily: 'SF Mono', fontSize: 13}}>10:00</Box>
    </Flex>
    <Flex mb="3px">
      <Box>Money: {props.game.playerState[props.player].money}</Box>
      <Box>Cities: {props.game.playerState[props.player].cities.length}</Box>
    </Flex>
    <Flex style={{minHeight: 45}}>
      {props.game.playerState[props.player].plants.map(plant => <Plant />)}
    </Flex>
  </Flex>
)

const Nav = styled(Flex)`
  height: 50px;
  background-color: #eee;
`

const PlantWrapper = styled(Box)`
  height: 45px;
  width: 45px;
  padding: 5px;
  margin-right: 5px;
  background: #eee;
  font-size: 14px;
`

const Plant = props => (
  <PlantWrapper>
    <div>{props.plant[0]}</div>
    <div>
      {props.plant[1]}/{props.plant[2]}
    </div>
  </PlantWrapper>
)

Plant.defaultProps = {
  plant: [20, '5C', 3],
}

const PlayerOrderCard = props => (
  <Flex direction="column" mx={1}>
    <Box style={{maxWidth: 65, textOverflow: 'ellipsis', overflow: 'hidden'}}>
      {props.player}
    </Box>3c, 20p
  </Flex>
)

const PlayerOrder = props => (
  <Flex style={{fontSize: 14}}>
    {props.game.players.map(player => <PlayerOrderCard key={player} player={player} />)}
  </Flex>
)

const RESOURCE_DISTROS = {
  coal: [4, 4, 4, 3, 3, 3, 2, 2, 2],
  gas: [3, 3, 3, 3, 3, 3, 3, 3, 0],
  oil: [2, 2, 2, 2, 2, 2, 2, 2, 3],
  uranium: [1, 1, 1, 1, 1, 1, 2, 2, 2],
}

class ValueTrack extends Component {
  state = {
    hovered: -1,
    chosen: -1,
  }

  setHovered = hovered => this.setState({hovered})

  render() {
    const {values, game, resource} = this.props
    const {hovered} = this.state
    let nums = []
    values.forEach((value, i) => {
      range(0, value).forEach(() => nums.push(i + 1))
    })
    const available = game.resourceAvailable[resource]
    const pool = game.resourcePool[resource]
    nums = nums.slice(nums.length - available)
    return (
      <Flex mb="4px" onMouseLeave={() => this.setHovered(-1)} style={{cursor: 'pointer'}}>
        <Box w={20}>{pool}</Box>
        {nums.map((val, i) => (
          <Box
            onMouseEnter={() => this.setHovered(i)}
            onClick={() => console.log(i + 1)}
            width={16}
            justify="center"
            style={{backgroundColor: i <= hovered ? '#dedede' : null}}
          >
            {val}
          </Box>
        ))}
      </Flex>
    )
  }
}

const ResourceTrack = props => (
  <div style={{fontSize: '13px'}}>
    {toPairs(RESOURCE_DISTROS).map(([resource, values]) => (
      <ValueTrack key={resource} game={props.game} resource={resource} values={values} />
    ))}
  </div>
)

const City = props => (
  <g>
    <rect
      width={32}
      height={20}
      x={props.x}
      y={props.y}
      fill={props.color || 'yellow'}
      stroke="#555"
    />
    <circle cx={props.x} cy={20 + props.y} r={6} stroke="#555" fill="white" />
    <circle cx={props.x + 16} cy={20 + props.y} r={6} stroke="#555" fill="white" />
    <circle cx={props.x + 32} cy={20 + props.y} r={6} stroke="#555" fill="white" />
  </g>
)

const CITIES = [
  [50, 25],
  [120, 25],
  [10, 75],
  [70, 75],
  [195, 25],
  [150, 75],
  [10, 125],
  [270, 25, 'yellow'],
  [10, 175, 'cyan'],
  [10, 225, 'cyan'],
  [10, 275, 'cyan'],
  [10, 325, 'cyan'],
  [85, 175, 'cyan'],
  [160, 200, 'cyan'],
  [100, 260, 'cyan'],
  [365, 25, 'brown'],
  [365, 75, 'brown'],
  [365, 125, 'brown'],
  [365, 200, 'brown'],
  [275, 200, 'brown'],
  [275, 150, 'brown'],
  [200, 150, 'brown'],

  [450, 25, 'red'],
  [525, 25, 'red'],
  [450, 100, 'red'],
  [450, 150, 'red'],
  [525, 100, 'red'],
  [545, 150, 'red'],
  [545, 200, 'red'],
  [630, 25, 'green'],
  [630, 100, 'green'],
  [630, 150, 'green'],
  [700, 25, 'green'],
  [700, 75, 'green'],
  [700, 125, 'green'],

  [200, 250, 'purple'],
  [200, 300, 'purple'],
  [200, 350, 'purple'],
  [250, 400, 'purple'],
  [300, 350, 'purple'],
  [350, 400, 'purple'],
  [370, 325, 'orange'],
  [320, 275, 'orange'],
  [450, 325, 'orange'],
  [520, 325, 'orange'],
  [560, 275, 'orange'],
  [600, 325, 'orange'],
  [650, 405, 'orange'],
]

const Map = props => (
  <svg height={450} width="100%">
    <line x1={82} y1={35} x2={120} y2={35} stroke="black" />
    <text x={100} y={32} textAnchor="middle" fontSize={12}>
      15
    </text>
    {CITIES.map(([x, y, color], i) => <City key={i} x={x} y={y} color={color} />)}
  </svg>
)

const PlayerSidebar = props => (
  <div>
    {props.game.players.map(player => (
      <PlayerInfo key={player} player={player} game={props.game} />
    ))}
  </div>
)

const PowerGrid = props => (
  <div>
    <Nav align="center" p={2}>
      <div style={{fontSize: '24px'}}>Power Grid</div>
    </Nav>
    <Flex>
      <Box flex="0 0 230px" p={2} style={{borderRight: '1px solid #f3f3f3'}}>
        <PlayerSidebar game={props.game} />
      </Box>
      <Flex flex="1 1 auto" direction="column">
        <Box p={1} m={1} style={{border: '1px solid #ccc'}}>
          Game Status: Waiting for monsk to
        </Box>
        <Flex px={2}>
          <Flex direction="column" mr={1}>
            Step 1
            <PlantWrapper>50</PlantWrapper>
          </Flex>
          <Flex direction="column">
            <Flex direction="row">
              {props.game.auctioningPlants
                .slice(0, 4)
                .map((plant, i) => <Plant key={i} plant={plant} />)}
            </Flex>
            <Flex direction="row" mt={1}>
              <Plant />
              <Plant />
              <Plant />
              <Plant />
            </Flex>
          </Flex>
          <Flex direction="column">
            <PlayerOrder game={props.game} />
            <Box px={2} my={1}>
              <ResourceTrack game={props.game} />
            </Box>
          </Flex>
        </Flex>

        <Box flex="1 1 auto">
          <Map />
        </Box>
        <Box p={1} m={1}>
          Player actions: Bid?
        </Box>
      </Flex>
      <Box flex="0 0 300px" p={2} style={{borderLeft: '1px solid #f3f3f3'}}>
        <Box mb={1} style={{fontSize: '0.8em', color: '#555'}}>
          Game Log
        </Box>
        <div>
          <span style={{color: 'red'}}>monsk</span> bid 23.
        </div>
        <div>
          <span style={{color: 'green'}}>viz</span> bid 24.
        </div>
      </Box>
    </Flex>
  </div>
)

export default withProps(() => ({game: INITIAL_STATE}))(PowerGrid)
