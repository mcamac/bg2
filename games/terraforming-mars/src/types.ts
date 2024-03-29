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

// TODO: Tighten up the types
export interface Corporation {
  name: string
  startingMoney: number
  tags?: string[]
  effects?: any[]
  actions?: any[]
  afterCardTriggers?: any[]
  afterTileTriggers?: any[]
  afterStandardProjectTriggers?: any[]
  discounts?: any
  text?: string
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
  afterCardTriggers?: [any[], any[]]
  afterTileTriggers?: [any[], any[]][]
  afterStandardProjectTriggers?: any[]
  todo?: boolean
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

export interface KeepCardsChoice {
  type: 'KeepCards'
  cards: string[]
  nKeep: number
  effects: any[]
}

export interface BuyOrDiscardChoice {
  type: 'BuyOrDiscard'
  cards: string[]
  effects: any[]
}

export interface PlaceOceanChoice {
  type: 'PlaceOcean'
  effects: any[]
}

export type UserChoice = KeepCardsChoice | PlaceOceanChoice | BuyOrDiscardChoice

export interface PlayerState {
  resources: ResourcesState
  TR: number
  hand: string[]
  played: string[]
  corporation: string
  cardResources: {[key: string]: number}
  cardActionsUsedThisGeneration: {[key: string]: true}
  hasIncreasedTRThisGeneration: boolean // For UN.
  choices: UserChoice[]
  statuses: {[key: string]: true} // Protected habitat, etc...
  nextCardEffect?: any // Discount or requirements
  globalRequirementsOffset: number
  conversions: {
    Titanium: number
    Steel: number
  }
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
  LandClaim = 'landClaim',
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

export enum SpecialCity {
  GanymedeColony = 'Ganymede Colony',
  PhobosSpaceHaven = 'Phobos Space Haven',
}

export enum GlobalType {
  Oxygen = 'Oxygen',
  Heat = 'Heat',
  Oceans = 'Oceans',
}

export type GlobalParameters = {[p in GlobalType]: number}

export const enum Phase {
  Actions = 'Actions',
  CardBuying = 'CardBuying',
  ChoosingCorporations = 'ChoosingCorporations',
  Draft = 'Draft',
  FinalGreenery = 'FinalGreenery',

  Finished = 'Finished',

  // User choices to be made.
  Choices = 'Choices',
}

export const enum UserAction {
  CorpAndCardsChoice = 'CorpAndCardsChoice',
  DraftRoundChoice = 'DraftRoundChoice',
  BuyCards = 'BuyCards',
  Action = 'Action',
  Cede = 'Cede',
  Pass = 'Pass',
  StandardProject = 'StandardProject',
  ChooseDiscards = 'ChooseDiscards',
  Choices = 'Choices',
}

export const enum TurnAction {
  ClaimMilestone = 'ClaimMilestone',
  FundAward = 'FundAward',
  StandardProject = 'StandardProject',
  PlayCard = 'PlayCard',
  CardAction = 'CardAction',
  PlantGreenery = 'PlantGreenery',
  RaiseHeat = 'RaiseHeat',
}

export interface PlayerDraftState {
  taken: string[]
  queued: string[][]
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
  phase: string
  generation: number
  isLastGeneration: boolean
  isOver: boolean
  players: Player[]
  firstPlayer: Player
  playerState: {
    [key: string]: PlayerState
  }
  passed: {
    [key: string]: boolean
  }
  player: Player
  actionsDone: number
  map: MapState
  deck: string[]
  discard: string[]
  milestones: MilestoneClaim[]
  awards: AwardFunding[]
  globalParameters: GlobalParameters

  draft: {
    [key: string]: PlayerDraftState
  }

  choosingCards: {
    [key: string]: string[]
  }

  choosingCorporations: {
    [key: string]: string[]
  }

  log: any[]

  vp?: any
}

export const enum CardResource {
  Microbes = 'Microbe',
  Fighters = 'Fighters',
  Animals = 'Animal',
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

export const MILESTONES = [
  Milestones.Terraformer,
  Milestones.Mayor,
  Milestones.Gardener,
  Milestones.Builder,
  Milestones.Planner,
]

export const enum Awards {
  Landlord = 'Landlord',
  Banker = 'Banker',
  Scientist = 'Scientist',
  Thermalist = 'Thermalist',
  Miner = 'Miner',
}

export const AWARDS = [
  Awards.Landlord,
  Awards.Banker,
  Awards.Scientist,
  Awards.Thermalist,
  Awards.Miner,
]

export const enum StandardProject {
  SellPatents = 'SellPatents',
  PowerPlant = 'PowerPlant',
  Asteroid = 'Asteroid',
  Aquifer = 'Aquifer',
  Greenery = 'Greenery',
  City = 'City',
}

export const enum NextCardEffect {
  Discount = 'Discount',
  OffsetRequirements = 'OffsetRequirements',
}
