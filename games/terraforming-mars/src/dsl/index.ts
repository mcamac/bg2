import {GameState, Transform, Tag, GlobalType, Player} from '../types'

export const DecreaseAnyProduction = (delta: number, type: string) => ({
  kind: 'DecreaseAnyProduction',
  delta,
  type,
})

export const DecreaseAnyInventory = (delta: number, type: string) => ({
  kind: 'DecreaseAnyInventory',
  delta,
  type,
})

export const ChangeAnyCardResource = (delta: number, type: string) => ({
  kind: 'ChangeAnyCardResource',
  delta,
  type,
})

export const ChangeCardResource = (delta: number, type: string) => ({
  kind: 'ChangeCardResource',
  delta,
  type,
})

export const ChangeInventory = (delta: number | object, type: string) => ({
  kind: 'ChangeInventory',
  delta,
  type,
})

export const ChangeProduction = (delta: number | object, type: string) => ({
  kind: 'ChangeProduction',
  delta,
  type,
})

export const Draw = (n: number) => ({
  kind: 'Draw',
  n,
})
