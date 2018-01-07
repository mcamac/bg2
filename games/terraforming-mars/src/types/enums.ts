export const enum Awards {
  Landlord = 'Landlord',
  Banker = 'Banker',
  Scientist = 'Scientist',
  Thermalist = 'Thermalist',
  Miner = 'Miner',
}

export const enum CardResource {
  Microbes = 'Microbe',
  Fighters = 'Fighters',
  Animals = 'Animal',
  Science = 'Science',
}

export enum GlobalType {
  Oxygen = 'Oxygen',
  Heat = 'Heat',
  Oceans = 'Oceans',
}

export const enum Milestones {
  Terraformer = 'Terraformer',
  Mayor = 'Mayor',
  Gardener = 'Gardener',
  Builder = 'Builder',
  Planner = 'Planner',
}

export const enum Phase {
  Actions = 'Actions',
  CardBuying = 'CardBuying',
  ChoosingCorporations = 'ChoosingCorporations',
  Draft = 'Draft',
  FinalGreenery = 'FinalGreenery',

  // User choices to be made.
  Choices = 'Choices',
}

export const enum ResourceBonus {
  Card = 'Card',
  Plant = 'Plant',
  Titanium = 'Titanium',
  Steel = 'Steel',
}

export const enum ResourceType {
  Money = 'Money',
  Steel = 'Steel',
  Titanium = 'Titanium',
  Plant = 'Plant',
  Energy = 'Energy',
  Heat = 'Heat',
}

export const enum StandardProject {
  SellPatents = 'SellPatents',
  PowerPlant = 'PowerPlant',
  Asteroid = 'Asteroid',
  Aquifer = 'Aquifer',
  Greenery = 'Greenery',
  City = 'City',
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

export const enum TurnAction {
  ClaimMilestone = 'ClaimMilestone',
  FundAward = 'FundAward',
  StandardProject = 'StandardProject',
  PlayCard = 'PlayCard',
  CardAction = 'CardAction',
  PlantGreenery = 'PlantGreenery',
  RaiseHeat = 'RaiseHeat',
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

export const enum NextCardEffect {
  Discount = 'Discount',
  OffsetRequirements = 'OffsetRequirements'
}
