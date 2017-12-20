interface ResourceState {
  count: number
  production: number
}

const enum Tag {
  Science = 'science',
  Building = 'building',
  Space = 'space',
  Animal = 'animal',
  Microbe = 'microbe',
  Plant = 'plant',
  City = 'city',
  Jovian = 'jovian',
  Earth = 'earth',
  Power = 'power',
  Event = 'event',
}

interface Card {
  cost: number
  requirements: any
  production: any
  inventory: any
  tags: string[]
  action: any
}

type Player = string
type Transform = (state: GameState, action?: any) => GameState

const enum ResourceType {
  Money = 'money',
  Steel = 'steel',
  Titanium = 'titanium',
  Plant = 'plant',
  Energy = 'energy',
  Heat = 'heat',
}

type ResourcesState = {[resource in ResourceType]: ResourceState}

interface PlayerState {
  resources: ResourcesState
  TR: number
  hand: Card[]
}

const enum TileType {
  Greenery = 'greenery',
  City = 'city',
}

interface Tile {
  type: TileType
  owner: Player
}

// (-2, 4)
interface MapState {
  [key: string]: Tile
}

enum GlobalType {
  Oxygen = 'oxygen',
  Heat = 'heat',
  Oceans = 'oceans',
}

type GlobalParameters = {[p in GlobalType]: number}

const enum State {
  Action = 'action',
  CardChoice = 'cardChoice',
  Draft = 'draft',
  FinalGreenery = 'finalGreenery',
}

interface GameState {
  generation: number
  players: Player[]
  firstPlayer: Player
  playerState: {
    [key: string]: PlayerState
  }
  player: Player
  map: MapState
  deck: Card[]
  milestones: any
  awards: any
  globalParameters: GlobalParameters

  log(): void
}

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
    state.globalParameters.oxygen += 1
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
