export interface ResourceState {
  count: number
  production: number
}

export const enum Tag {
  Science = 'Science',
  Building = 'Building',
  Space = 'Space',
  Animal = 'Animal',
  Microbe = 'Microbe',
  Plant = 'Plant',
  City = 'City',
  Jovian = 'Jovian',
  Earth = 'Earth',
  Power = 'Power',
  Event = 'Event',
}

export interface Card {
  cost: number
  name: string
  type: string
  deck: string
  tags?: string[]
  vp?: number | any[]
  actionText?: string
  effectText?: string
  placeTiles?: boolean
  requires?: any[][]
  discounts?: any
  resourceHeld?: CardResource
  effects?: any[]
  actions?: any[][]
  afterCardTrigger?: [any[], any[]]
}

export type Player = string
export type Transform = (state: GameState, action?: any) => GameState

export const enum ResourceType {
  Money = 'Money',
  Steel = 'Steel',
  Titanium = 'Titanium',
  Plant = 'Plant',
  Energy = 'Energy',
  Heat = 'Heat',
}

export const RESOURCE_TYPES = [
  ResourceType.Money,
  ResourceType.Steel,
  ResourceType.Titanium,
  ResourceType.Plant,
  ResourceType.Energy,
  ResourceType.Heat,
]

export type ResourcesState = {[resource in ResourceType]: ResourceState}

export interface PlayerState {
  resources: ResourcesState
  TR: number
  hand: Card[]
  played: Card[]
  hasIncreasedTRThisGeneration: boolean // For UN.
}

export const enum TileType {
  Greenery = 'greenery',
  City = 'city',
  Ocean = 'ocean',
  NuclearZone = 'nuclearZone',
  IndustrialCenter = 'industrialCenter',
  LavaFlows = 'lavaFlows',
  EcologicalZone = 'ecologicalZone',
  MiningArea = 'miningArea',
  MiningRights = 'miningRights',
  Capital = 'capital',
  MoholeArea = 'moholeArea',
  RestrictedArea = 'restrictedArea',
  CommercialDistrict = 'commercialDistrict',
  NaturalPreserve = 'naturalPreserve',
}

export interface Tile {
  type: TileType
  owner: Player
}

export type Position = [number, number]

// (-2, 4)
export interface MapState {
  [key: string]: Tile
}

export enum GlobalType {
  Oxygen = 'Oxygen',
  Heat = 'Heat',
  Oceans = 'Oceans',
}

export type GlobalParameters = {[p in GlobalType]: number}

export const enum State {
  Action = 'action',
  CardChoice = 'cardChoice',
  Draft = 'draft',
  FinalGreenery = 'finalGreenery',
}

export interface PlayerDraftState {
  taken: Card[]
  queued: Card[][]
}

export interface MilestoneClaim {
  player: Player
  milestone: Milestones
}

export interface AwardFunding {
  player: Player
  award: Awards
}

export interface GameState {
  generation: number
  players: Player[]
  firstPlayer: Player
  playerState: {
    [key: string]: PlayerState
  }
  passed: {
    [key: string]: boolean
  }
  player: Player
  map: MapState
  deck: Card[]
  discards: Card[]
  milestones: MilestoneClaim[]
  awards: AwardFunding[]
  globalParameters: GlobalParameters

  draft: {
    [key: string]: PlayerDraftState
  }

  // log(): void
}

export const enum CardResource {
  Microbes = 'Microbes',
  Fighters = 'Fighters',
  Animals = 'Animals',
  Science = 'Science',
}

export const enum ResourceBonus {
  Card = 'Card',
  Plant = 'Plant',
  Titanium = 'Titanium',
  Steel = 'Steel',
}

export const enum Milestones {
  Terraformer = 'Terraformer',
  Mayor = 'Mayor',
  Gardener = 'Gardener',
  Builder = 'Builder',
  Planner = 'Planner',
}

export const enum Awards {
  Landlord = 'Landlord',
  Banker = 'Banker',
  Scientist = 'Scientist',
  Thermalist = 'Thermalist',
  Miner = 'Miner',
}
