import {ResourcesState} from './resource'

export type Player = string

export interface PlayerDraftState {
  taken: string[]
  queued: string[][]
}

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

export type UserChoice = KeepCardsChoice | PlaceOceanChoice | BuyOrDiscardChoice

export interface PlaceOceanChoice {
  type: 'PlaceOcean'
  effects: any[]
}
