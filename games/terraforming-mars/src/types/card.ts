import {CardResource} from './enums'

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
