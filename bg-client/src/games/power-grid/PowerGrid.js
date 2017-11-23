import {Component} from 'react'
import {connect} from 'react-redux'
import styled from 'styled-components'
import {withProps, withState} from 'recompose'
import {Flex, Box} from 'grid-styled'
import {get, range, toPairs} from 'lodash/fp'

import pg, {
  CARDS,
  getInitialState,
} from '../../../../games/power-grid/src/index.ts'

const INITIAL_STATE = getInitialState(['monsk', 'viz', 'nhkl'])

console.log(INITIAL_STATE)

const Icon = props => <i className={`icon icon-${props.g}`} />

const PlayerInfo = props => (
  <Flex direction="column" mb="20px">
    <Flex align="center" mb="3px">
      <Box flex="1 1 auto">{props.player}</Box>
      <Box style={{fontFamily: 'SF Mono', fontSize: 13}}>10:00</Box>
    </Flex>
    <Flex mb="3px">
      <Box mr={1}>
        <Icon g="money" /> {props.game.playerState[props.player].money}
      </Box>
      <Box>
        <Icon g="city" />
        {props.game.playerState[props.player].cities.length}
      </Box>
    </Flex>
    <Flex style={{minHeight: 45}}>
      {props.game.playerState[props.player].plants.map((plant, i) => (
        <Plant plant={plant} key={i} />
      ))}
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
  <PlantWrapper onClick={props.onClick}>
    <div>{props.plant[0]}</div>
    <div>
      {props.plant[1]}/{props.plant[2]}
    </div>
  </PlantWrapper>
)

Plant.defaultProps = {
  plant: [20, '5C', 3],
}

let PlayerOrderCard = props => (
  <Flex
    direction="column"
    mx={1}
    style={{color: props.active ? 'black' : '#aaa'}}
  >
    <Box style={{maxWidth: 65, textOverflow: 'ellipsis', overflow: 'hidden'}}>
      {props.player}
    </Box>3c, 20p
  </Flex>
)

PlayerOrderCard = connect(
  (state, props) => ({
    active:
      !state.game.stageState.eligiblePlayers ||
      state.game.stageState.eligiblePlayers.indexOf(props.player) >= 0,
  }),
  () => ({})
)(PlayerOrderCard)

const PlayerOrder = props => (
  <Flex style={{fontSize: 14}}>
    {props.game.players.map(player => (
      <PlayerOrderCard key={player} player={player} />
    ))}
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
  }

  setHovered = hovered => this.setState({hovered})

  render() {
    const {values, game, chosen, resource} = this.props
    const {hovered} = this.state
    let nums = []
    values.forEach((value, i) => {
      range(0, value).forEach(() => nums.push(i + 1))
    })
    const available = game.resourceAvailable[resource]
    const pool = game.resourcePool[resource]
    nums = nums.slice(nums.length - available)
    return (
      <Flex
        mb="4px"
        onMouseLeave={() => this.setHovered(-1)}
        style={{cursor: 'pointer'}}
      >
        <Box w={20}>{pool}</Box>
        <Box w={20} onClick={() => this.props.onClick(0)}>
          <Icon g={resource} />
        </Box>
        {nums.map((val, i) => (
          <Box
            key={`${val}${i}`}
            onMouseEnter={() => this.setHovered(i)}
            onClick={() => this.props.onClick(i + 1)}
            width={16}
            justify="center"
            style={{
              backgroundColor:
                i <= hovered ? '#dedede' : i < chosen ? 'yellow' : null,
            }}
          >
            {val}
          </Box>
        ))}
      </Flex>
    )
  }
}

ValueTrack = connect(
  (state, props) => ({
    chosen: state.ui.resources ? state.ui.resources[props.resource] : 0,
  }),
  (dispatch, props) => ({
    onClick: n => {
      dispatch({
        type: 'UI_SET_RESOURCE_BUY',
        resource: props.resource,
        n,
      })
    },
  })
)(ValueTrack)

const ResourceTrack = props => (
  <div style={{fontSize: '13px'}}>
    {toPairs(RESOURCE_DISTROS).map(([resource, values]) => (
      <ValueTrack
        key={resource}
        game={props.game}
        resource={resource}
        values={values}
      />
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
    <circle
      cx={props.x + 16}
      cy={20 + props.y}
      r={6}
      stroke="#555"
      fill="white"
    />
    <circle
      cx={props.x + 32}
      cy={20 + props.y}
      r={6}
      stroke="#555"
      fill="white"
    />
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
  [630, 25, 'green'], // ottawa
  [630, 100, 'green'], // new york
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

const CONNECTIONS = [
  // green
  [716, 45, 716, 75, 5],
  [716, 95, 716, 125, 9],
  [716, 95, 716, 125],
  [646, 120, 646, 150],
  [646, 100, 646, 45],
  [662, 45, 700, 75],
  [662, 110, 700, 95],
  [662, 110, 700, 125],
]

const Map = props => (
  <svg height={450} width="100%">
    <line x1={82} y1={35} x2={120} y2={35} stroke="black" />
    <line x1={50} y1={45} x2={26} y2={75} stroke="black" />
    <line x1={26} y1={125} x2={26} y2={100} stroke="black" />
    {CONNECTIONS.map(([x1, y1, x2, y2, v], i) => [
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" key={i} />,
      <text
        x={(x1 + x2) / 2}
        y={(y1 + y2) / 2 + 6}
        textAnchor="middle"
        fontSize={12}
      >
        {v}
      </text>,
    ])}
    <text x={100} y={32} textAnchor="middle" fontSize={12}>
      15
    </text>
    {CITIES.map(([x, y, color], i) => (
      <City key={i} x={x} y={y} color={color} />
    ))}
  </svg>
)

const PlayerSidebar = props => (
  <div>
    {props.game.players.map(player => (
      <PlayerInfo key={player} player={player} game={props.game} />
    ))}
  </div>
)

let AuctionBlock = props => (
  <Flex direction="column">
    <Flex direction="row">
      {props.game.auctioningPlants
        .slice(0, 4)
        .map((plant, i) => (
          <Plant
            key={i}
            plant={plant}
            onClick={() => props.onClickPlant(i, plant)}
          />
        ))}
    </Flex>
    <Flex direction="row" mt={1}>
      {props.game.auctioningPlants
        .slice(4)
        .map((plant, i) => <Plant key={i} plant={plant} />)}
    </Flex>
  </Flex>
)

AuctionBlock = connect(
  () => ({}),
  (dispatch, props) => ({
    onClickPlant: (i, plant) => {
      console.log(i, plant)
      dispatch({
        type: 'AUCTION_CHOOSE_PLANT',
        i,
        plant,
      })
    },
  })
)(AuctionBlock)

const Input = styled.input`
  padding: 5px;
  font-size: 1em;
`

const Button = styled.button`
  background: white;
  border: 1px solid #ccc;
  padding: 4px 8px;
  font-size: 1em;
  min-width: 50px;
  transition: 0.2s background;
  cursor: pointer;

  &:hover {
    background: #eee;
  }
`

class BidInput extends Component {
  state = {
    bid: this.props.minBid,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.minBid !== this.props.minBid) {
      this.setState({bid: nextProps.minBid})
    }
  }

  onChangeBid = e => this.setState({bid: e.target.value})

  onClickBid = () => {
    this.props.onBid(this.state.bid)
  }

  render() {
    const {bid} = this.state
    return (
      <div>
        <Input
          style={{maxWidth: 75}}
          type="text"
          value={bid}
          onChange={this.onChangeBid}
        />
        <Button onClick={this.onClickBid}>Bid</Button>
      </div>
    )
  }
}

const BuyResourcesActions = connect(
  (state, props) => {
    let cost = 0
    toPairs(state.ui.resources).forEach(([resource, value]) => {
      cost += value
    })

    return {
      cost,
      game: state.game,
    }
  },
  (dispatch, props) => ({
    onBuy: () => {
      dispatch({
        type: 'UI_RESOURCES_BUY',
      })
    },
  })
)(props => (
  <Flex align="center">
    <Box>
      <Button onClick={props.onBuy}>Buy ({props.cost})</Button>
    </Box>
    {props.game.playerState[props.game.player].plants.map((plant, i) => (
      <Flex key={i} mx={1}>
        <Plant plant={plant} />
        <Flex align="center" style={{fontSize: '13px'}}>
          <Icon g="gas" />
          <Box>
            <Button style={{minWidth: 15}}>{'<'}</Button>
          </Box>
          <Box px="3px">0</Box>
          <Box>
            <Button style={{minWidth: 15}}>{'>'}</Button>
          </Box>
        </Flex>
      </Flex>
    ))}
  </Flex>
))

const CitiesActions = connect(
  (state, props) => {
    return {
      cost: 0,
    }
  },
  (dispatch, props) => ({
    onSubmit: () => {
      dispatch({
        type: 'UI_CITIES',
      })
    },
  })
)(props => (
  <div>
    Cities:{' '}
    <Button onClick={props.onSubmit}>Place Selected ({props.cost})</Button>
  </div>
))

const PowerActions = connect(
  (state, props) => {
    return {
      cities: 0,
    }
  },
  (dispatch, props) => ({
    onSubmit: () => {
      dispatch({
        type: 'UI_POWER',
      })
    },
  })
)(props => (
  <div>
    Click on power plants to use.{' '}
    <Button onClick={props.onSubmit}>Submit ({props.cities} cities)</Button>
  </div>
))

let PlayerActions = props => (
  <Box p={1} m={1}>
    {props.ui.state === 'UI_AUCTION_CHOOSE' && (
      <button onClick={props.onAuctionChoicePass}>Pass</button>
    )}
    {props.game.stage === 'AUCTION_CHOOSE' &&
      props.ui.state === 'AUCTION_CHOOSE_INITIAL_BID' && (
        <BidInput
          minBid={props.ui.plant[0]}
          onBid={b => props.onSetAuctionStartPrice(b, props.ui.i)}
        />
      )}
    {props.game.stage === 'AUCTION_BID' && (
      <Flex>
        <BidInput minBid={props.ui.plant[0]} onBid={props.onAuctionBid} />
        <Button onClick={props.onAuctionBidPass}>Pass</Button>
      </Flex>
    )}
    {props.game.stage === 'RESOURCES_BUY' && <BuyResourcesActions />}
    {props.game.stage === 'CITIES' && <CitiesActions />}
    {props.game.stage === 'POWER' && <PowerActions />}
  </Box>
)

PlayerActions = connect(
  (state, props) => ({game: state.game, ui: state.ui}),
  (dispatch, props) => ({
    onSetAuctionStartPrice: (price, i) => {
      dispatch({
        type: 'AUCTION_CHOOSE',
        price,
        i,
      })
    },
    onAuctionChoicePass: () => {
      dispatch({
        type: 'AUCTION_CHOOSE',
        pass: true,
      })
    },
    onAuctionBid: price => {
      dispatch({
        type: 'AUCTION_BID',
        price,
      })
    },
    onAuctionBidPass: () => {
      dispatch({
        type: 'AUCTION_BID_PASS',
      })
    },
  })
)(PlayerActions)

const PowerGrid = props => (
  <div>
    <Nav align="center" p={2}>
      <div style={{fontSize: '24px'}}>Power Grid</div>
      <Button onClick={props.onSaveState}>Save</Button>
      <Button onClick={props.onLoadState}>Load</Button>
    </Nav>
    <Flex>
      <Box flex="0 0 230px" p={2} style={{borderRight: '1px solid #f3f3f3'}}>
        <PlayerSidebar game={props.game} />
      </Box>
      <Flex flex="1 1 auto" direction="column">
        <Box p={1} m={1} style={{border: '1px solid #ccc'}}>
          Game Status: {props.game.stage}, {props.game.player}
          <PlayerActions />
        </Box>
        <Flex px={2}>
          <Flex direction="column" mr={1}>
            <div>Step {props.game.phase}</div>
            <div>Turn {props.game.turn}</div>
            <PlantWrapper>50</PlantWrapper>
          </Flex>
          <AuctionBlock game={props.game} />
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

export default connect(
  (state, props) => ({game: state.game}),
  (dispatch, props) => ({
    onSaveState: () => {
      dispatch({type: 'SAVE_STATE'})
    },
    onLoadState: () => {
      dispatch({type: 'LOAD_STATE'})
    },
  })
)(PowerGrid)
