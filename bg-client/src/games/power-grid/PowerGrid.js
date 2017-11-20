import {Component} from 'react'
import styled from 'styled-components'
import {Flex, Box} from 'grid-styled'
import {range, toPairs} from 'lodash/fp'

const PlayerInfo = props => (
  <Flex direction="column" mb={2}>
    <Box>monsk</Box>
    <Flex>
      <Box>Money: 1</Box>
      <Box>Cities: 1</Box>
    </Flex>
    <Flex>
      <Plant />
      <Plant />
      <Plant />
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
    <div>20</div>
    <div>5C/3</div>
  </PlantWrapper>
)

const PlayerOrderCard = props => (
  <Flex direction="column" mx={1}>
    <Box style={{maxWidth: 65, textOverflow: 'ellipsis', overflow: 'hidden'}}>monskkkkkk </Box>3c,
    20p
  </Flex>
)

const PlayerOrder = props => (
  <Flex style={{fontSize: 14}}>
    <Flex direction="column" mx={1}>
      <Box>monsk </Box>3c, 20p
    </Flex>
    <Flex direction="column" mx={1}>
      <Box>monsk </Box>3c, 20p
    </Flex>
    <PlayerOrderCard />
    <PlayerOrderCard />
    <PlayerOrderCard />
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
    const {values} = this.props
    const {hovered} = this.state
    const nums = []
    values.forEach((value, i) => {
      range(0, value).forEach(() => nums.push(i + 1))
    })
    return (
      <Flex mb="4px" onMouseLeave={() => this.setHovered(-1)} style={{cursor: 'pointer'}}>
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
      <ValueTrack key={resource} resource={resource} values={values} />
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

const PowerGrid = props => (
  <div>
    <Nav align="center" p={2}>
      <div style={{fontSize: '24px'}}>Power Grid</div>
    </Nav>
    <Flex>
      <Box flex="0 0 230px" p={2} style={{borderRight: '1px solid #f3f3f3'}}>
        <PlayerInfo />
        <PlayerInfo />
        <PlayerInfo />
        <PlayerInfo />
        <PlayerInfo />
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
              <Plant />
              <Plant />
              <Plant />
              <Plant />
            </Flex>
            <Flex direction="row" mt={1}>
              <Plant />
              <Plant />
              <Plant />
              <Plant />
            </Flex>
          </Flex>
          <Flex direction="column">
            <PlayerOrder />
            <Box px={2} my={1}>
              <ResourceTrack />
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

export default PowerGrid
