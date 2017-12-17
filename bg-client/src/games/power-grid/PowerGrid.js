import {Component} from 'react'
import {connect} from 'react-redux'
import styled from 'styled-components'
import {withProps, withState, branch, renderNothing, compose} from 'recompose'
import {Flex, Box} from 'grid-styled'
import {get, range, toPairs, sortBy, sum} from 'lodash/fp'

import pg, {
  CARDS,
  getInitialState,
  computeCitiesCost,
  getCitiesToPower,
  CITIES,
  CITIES_BY_NAME,
  EDGES,
} from '../../../../games/power-grid/src/index.ts'

const Icon = props => <i className={`icon icon-${props.g}`} />

const PlantResources = ({plant}) => (
  <Flex>
    {plant.plant[3].resources.map(resource => (
      <Box align="center" key={resource}>
        <Icon g={resource} />
        {plant.resources[resource]}
      </Box>
    ))}
  </Flex>
)

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
        <Flex key={i} direction="column">
          <Plant plant={plant.plant} />
          <PlantResources plant={plant} />
        </Flex>
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
  <PlantWrapper onClick={props.onClick} style={props.style}>
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
  <Flex direction="column" mx={1} style={{color: props.active ? 'black' : '#aaa'}}>
    <Box style={{maxWidth: 65, textOverflow: 'ellipsis', overflow: 'hidden'}}>
      {props.player}
    </Box>3c, 20p
  </Flex>
)

PlayerOrderCard = connect(
  (state, props) => ({
    active:
      !state.lobby.game.stageState.eligiblePlayers ||
      state.lobby.game.stageState.eligiblePlayers.indexOf(props.player) >= 0,
  }),
  () => ({})
)(PlayerOrderCard)

const PlayerOrder = props => (
  <Flex style={{fontSize: 14}}>
    {props.game.playerOrder.map(player => <PlayerOrderCard key={player} player={player} />)}
  </Flex>
)

const RESOURCE_DISTROS = {
  coal: [4, 4, 4, 3, 3, 3, 2, 2, 2],
  gas: [3, 3, 3, 3, 3, 3, 3, 3, 0],
  oil: [2, 2, 2, 2, 2, 2, 2, 2, 3],
  uranium: [1, 1, 1, 1, 1, 1, 2, 2, 2],
}

class ValueTrack extends Component {
  render() {
    const {values, game, chosen, resource} = this.props
    let nums = []
    values.forEach((value, i) => {
      range(0, value).forEach(() => nums.push(i + 1))
    })
    const available = game.resourceAvailable[resource]
    const pool = game.resourcePool[resource]
    nums = nums.slice(nums.length - available)
    return (
      <Flex mb="4px">
        <Box w={20}>{pool}</Box>
        <Box w={20} onClick={() => this.props.onClick(0)}>
          <Icon g={resource} />
        </Box>
        {nums.map((val, i) => (
          <Box
            key={`${val}${i}`}
            onClick={() => this.props.onClick(i + 1)}
            width={16}
            justify="center"
            style={{
              backgroundColor: i < chosen ? 'yellow' : null,
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
    chosen: state.ui.plantResources ? sum(state.ui.plantResources.map(r => r[props.resource])) : 0,
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
      <ValueTrack key={resource} game={props.game} resource={resource} values={values} />
    ))}
  </div>
)

const City = props => (
  <g onClick={() => props.onClick(props.name)}>
    <rect width={32} height={20} x={props.x} y={props.y} fill={props.color} stroke="#555" />
    {/* <circle cx={props.x} cy={20 + props.y} r={6} stroke="#555" fill="white" />
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
    /> */}
  </g>
)

const dist = ([x1, y1], [x2, y2]) => Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)

const getCorners = ([x1, y1]) => {
  return [
    [x1, y1],
    [x1 + 16, y1],
    [x1 + 32, y1],
    [x1 + 32, y1 + 10],
    [x1 + 32, y1 + 20],
    [x1 + 16, y1 + 20],
    [x1, y1 + 20],
    [x1, y1 + 10],
  ]
}

let Map = props => (
  <svg height={450} width="100%">
    {EDGES.map(([c1, c2, v], i) => {
      if (!CITIES_BY_NAME[c1] || !CITIES_BY_NAME[c2]) {
        console.log(c1, c2)
      }
      const [x1, y1] = CITIES_BY_NAME[c1]
      const [x2, y2] = CITIES_BY_NAME[c2]

      let bdist = 1000000
      let bc1 = null
      let bc2 = null

      const c1corners = getCorners([x1, y1])
      const c2corners = getCorners([x2, y2])
      c1corners.forEach(ic1 => {
        c2corners.forEach(ic2 => {
          const score =
            dist(ic1, ic2) + dist([x1 + 16, y1 + 10], ic1) + dist([x2 + 16, y2 + 10], ic2)
          if (score < bdist) {
            bdist = score
            bc1 = ic1
            bc2 = ic2
          }
        })
      })

      const [cx1, cy1] = bc1
      const [cx2, cy2] = bc2

      return [
        <line x1={cx1} y1={cy1} x2={cx2} y2={cy2} stroke="#777" key={i} />,
        <text
          key={`${i}text`}
          x={(cx1 + cx2) / 2 - (v >= 10 ? 5 : 3)}
          y={(cy1 + cy2) / 2 + 6}
          fontSize={12}
        >
          {v}
        </text>,
      ]
    })}
    {CITIES.map(([x, y, color, name], i) => (
      <City key={i} x={x} y={y} color={color} name={name} onClick={props.onClickCity} />
    ))}
    <g>
      {props.selectedCities.map((name, i) => {
        const city = CITIES_BY_NAME[name]
        return (
          <g>
            <rect
              key={name}
              width={32}
              height={20}
              x={city[0]}
              y={city[1]}
              fill={props.color}
              stroke="#555"
              style={{pointerEvents: 'none'}}
            />
            <text x={city[0] + 3} y={city[0] + 3} style={{fill: 'white'}}>
              {i + 1}
            </text>
          </g>
        )
      })}
    </g>
    <g>
      {props.cityPlants.map(([city, owners], i) => {
        const [x, y] = CITIES_BY_NAME[city]
        return (
          <g key={city}>
            {owners.map((owner, i) => (
              <circle key={i} cx={x + 16 * i} cy={20 + y} r={6} stroke="#555" fill="white" />
            ))}
          </g>
        )
      })}
    </g>
  </svg>
)

Map = connect(
  (state, props) => ({
    selectedCities: state.ui.cities || [],
    cityPlants: toPairs(state.lobby.game.cityPlants),
  }),
  (dispatch, props) => ({
    onClickCity: city => {
      dispatch({
        type: 'UI_CLICK_CITY',
        city,
      })
    },
  })
)(Map)

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
          <Plant key={i} plant={plant} onClick={() => props.onClickPlant(i, plant)} />
        ))}
    </Flex>
    <Flex direction="row" mt={1}>
      {props.game.auctioningPlants.slice(4).map((plant, i) => <Plant key={i} plant={plant} />)}
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
        <Input style={{maxWidth: 75}} type="text" value={bid} onChange={this.onChangeBid} />
        <Button onClick={this.onClickBid}>Bid</Button>
      </div>
    )
  }
}

class Counter extends Component {
  onDecrement = () => {
    this.props.onChange(this.props.value - 1)
  }

  onIncrement = () => {
    this.props.onChange(this.props.value + 1)
  }

  render() {
    return (
      <Flex align="center" style={{fontSize: '13px'}}>
        <Box>
          <Button style={{minWidth: 15}} onClick={this.onDecrement}>
            {'<'}
          </Button>
        </Box>
        <Box px="3px">{this.props.value}</Box>
        <Box>
          <Button style={{minWidth: 15}} onClick={this.onIncrement}>
            {'>'}
          </Button>
        </Box>
      </Flex>
    )
  }
}

const ResourceCounter = props => (
  <Flex align="center" style={{fontSize: '13px'}}>
    <Icon g={props.resource} />
    <Counter value={props.value} onChange={props.onChange} />
  </Flex>
)

const BuyResourcesActions = connect(
  (state, props) => {
    let cost = 0
    toPairs(state.ui.resources).forEach(([resource, value]) => {
      cost += value
    })

    return {
      cost,
      plantResources: state.ui.plantResources,
      game: state.lobby.game,
    }
  },
  (dispatch, props) => ({
    onBuy: () => {
      dispatch({
        type: 'UI_RESOURCES_BUY',
      })
    },
    onSetResource: (i, resource, v) => {
      dispatch({
        type: 'UI_SET_RESOURCE',
        i,
        resource,
        v,
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
        <Flex direction="column">
          <Plant plant={plant.plant} />
          <PlantResources plant={plant} />
        </Flex>
        <Flex direction="column">
          {plant.plant[3].resources.map(resource => (
            <ResourceCounter
              resource={resource}
              value={props.plantResources[i][resource]}
              key={resource}
              onChange={v => props.onSetResource(i, resource, v)}
            />
          ))}
        </Flex>
      </Flex>
    ))}
  </Flex>
))

const CitiesActions = connect(
  (state, props) => {
    return {
      cost: computeCitiesCost(state.lobby.game, state.ui.cities || []),
      cities: (state.ui.cities || []).join(', '),
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
    Click on cities to connect to, in order.
    <Button onClick={props.onSubmit}>Place Selected (cost {props.cost})</Button>
    <div>{props.cities || 'No cities selected.'}</div>
  </div>
))

const PowerActions = connect(
  (state, props) => {
    return {
      cities: getCitiesToPower(state.lobby.game, state.ui.toPower),
      game: state.lobby.game,
      toPower: state.ui.toPower,
    }
  },
  (dispatch, props) => ({
    onSubmit: () => {
      dispatch({
        type: 'UI_POWER',
      })
    },
    onClickPlant: i => {
      dispatch({
        type: 'UI_POWER_SELECT_PLANT',
        i,
      })
    },
    onSetResource: (i, resource, v) => {
      dispatch({
        type: 'UI_POWER_SELECT_PLANT_RESOURCE',
        i,
        resource,
        v,
      })
    },
  })
)(props => (
  <div>
    Click on power plants to use.{' '}
    <Button onClick={props.onSubmit}>Submit ({props.cities} cities)</Button>
    {props.game.playerState[props.game.player].plants.map((plant, i) => (
      <Flex key={i}>
        <Flex direction="column">
          <Plant
            plant={plant.plant}
            onClick={() => props.onClickPlant(i)}
            style={{background: props.toPower[i] ? 'yellow' : null}}
          />
          <PlantResources plant={plant} />
        </Flex>
        {props.toPower[i] &&
          plant.plant[3].resources.length > 1 && (
            <Flex direction="column">
              {plant.plant[3].resources.map(resource => (
                <ResourceCounter
                  resource={resource}
                  value={props.toPower[i][resource]}
                  key={resource}
                  onChange={v => props.onSetResource(i, resource, v)}
                />
              ))}
            </Flex>
          )}
      </Flex>
    ))}
  </div>
))

const DiscardPlantActions = connect(
  (state, props) => {
    return {
      game: state.lobby.game,
      plantResourcesDiscard: state.ui.plantResourcesDiscard,
      toDiscard: state.ui.toDiscard,
      plants: state.lobby.game.playerState[state.lobby.game.player].plants,
    }
  },
  (dispatch, props) => ({
    onSubmit: () => {
      dispatch({
        type: 'UI_DISCARD',
      })
    },
    onClickPlant: i => {
      dispatch({
        type: 'UI_DISCARD_SELECT_PLANT',
        i,
      })
    },
    onSetResource: (i, resource, v) => {
      dispatch({
        type: 'UI_DISCARD_SELECT_PLANT_RESOURCE',
        i,
        resource,
        v,
      })
    },
  })
)(props => (
  <div>
    <Button onClick={props.onSubmit}>Submit</Button>
    Click on power plant to discard and select assign its resources to other plants.
    <Flex>
      {props.plants.map((plant, i) => (
        <Flex key={i}>
          <Flex direction="column">
            <Plant
              plant={plant.plant}
              onClick={() => i < props.plants.length - 1 && props.onClickPlant(i)}
              style={{background: i === props.toDiscard ? 'yellow' : null}}
            />
            <PlantResources plant={plant} />
          </Flex>
          <Flex direction="column">
            {plant.plant[3].resources.map(resource => (
              <ResourceCounter
                resource={resource}
                value={props.plantResourcesDiscard[i][resource]}
                key={resource}
                onChange={v => props.onSetResource(i, resource, v)}
              />
            ))}
          </Flex>
        </Flex>
      ))}
    </Flex>
  </div>
))

let PlayerActions = props => (
  <Box p={1} m={1}>
    {props.game.stage === 'AUCTION_CHOOSE' &&
      props.game.turn !== 1 && (
        <Box>
          <Button onClick={props.onAuctionChoicePass}>Skip Buying</Button>
          or click on a plant below.
        </Box>
      )}
    {props.game.stage === 'AUCTION_CHOOSE' &&
      props.ui.state === 'AUCTION_CHOOSE_INITIAL_BID' && (
        <BidInput
          minBid={props.ui.plant && props.ui.plant[0]}
          onBid={b => props.onSetAuctionStartPrice(b, props.ui.i)}
        />
      )}
    {props.game.stage === 'AUCTION_BID' && (
      <Flex>
        <BidInput minBid={props.game.stageState.price + 1} onBid={props.onAuctionBid} />
        <Button onClick={props.onAuctionBidPass}>Pass</Button>
      </Flex>
    )}
    {props.game.stage === 'AUCTION_CHOOSE_DISCARDED_PLANT' && <DiscardPlantActions />}
    {props.game.stage === 'RESOURCES_BUY' && <BuyResourcesActions />}
    {props.game.stage === 'CITIES' && <CitiesActions />}
    {props.game.stage === 'POWER' && <PowerActions />}
  </Box>
)

PlayerActions = connect(
  (state, props) => ({game: state.lobby.game, ui: state.ui}),
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
      <Button onClick={props.onResetState}>Reset</Button>
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
            <div>Step {props.game.step}</div>
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
        {props.log && props.log.map(log => <div>{JSON.stringify(log)}</div>)}
      </Box>
    </Flex>
  </div>
)

export default compose(
  connect(
    (state, props) => ({game: state.lobby.game, log: state.log}),
    (dispatch, props) => ({
      onSaveState: () => {
        dispatch({type: 'SAVE_STATE'})
      },
      onLoadState: () => {
        dispatch({type: 'LOAD_STATE'})
      },
      onResetState: () => {
        dispatch({type: 'RESET_STATE'})
      },
    })
  ),
  branch(props => !props.game, renderNothing)
)(PowerGrid)
