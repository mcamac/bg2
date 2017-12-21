import {Transform, ResourceType, TileType, GameState, Card} from './types'

const c = (...args: Transform[]): Transform => (state, action) => {
  let newState = state
  args.forEach(fn => (newState = fn(newState, action)))
  return newState
}

const changeProduction = (delta: number, resource: string): Transform => state => {
  const playerState = state.playerState[state.player]
  playerState.resources[resource].production += delta
  return state
}

const changeResources = (delta: number, resource: ResourceType): Transform => state => {
  const playerState = state.playerState[state.player]
  playerState.resources[resource].count += delta
  return state
}

const costs = (cost: number, resource: ResourceType): Transform => changeProduction(-cost, resource)

const ocean = state => state
const raiseHeat = state => state

const raiseOxygen: Transform = state => {
  // state.
  if (true) {
    state.globalParameters.Oxygen += 1
    state.playerState[state.player].TR += 1
  }
  return state
}

const placeGreenery = (state, action) => {
  state.map[action.position] = {
    type: TileType.Greenery,
    owner: state.player,
  }
  return raiseOxygen(state)
}

const placeCity = (state, action) => {
  state.map[action.position] = {
    type: TileType.City,
    owner: state.player,
  }
  return state
}

const standardProjects = {
  SELL_CARDS: (state: GameState, cards: Card[]) => {},
  POWER_PLANT: c(costs(11, ResourceType.Money), changeProduction(1, ResourceType.Money)),
  ASTEROID: (state: GameState) => c(costs(14, ResourceType.Money), raiseHeat),
  AQUIFER: (state: GameState) => c(costs(18, ResourceType.Money), ocean),
  GREENERY: c(costs(23, ResourceType.Money), placeGreenery),
  CITY: c(costs(25, ResourceType.Money), changeProduction(1, ResourceType.Money), placeCity),
}

const normalProduction = {
  GREENERY: c(costs(8, ResourceType.Plant), placeGreenery),
  RAISE_HEAT: c(costs(8, ResourceType.Heat), raiseHeat),
}

const handlers = {
  STANDARD_PROJECT: () => {},
  PLAY_CARD: () => {},
}

export const handleAction = {}
