import {ResourceBonus} from './types'

export const OCEAN_POSITIONS = [
  [-3, 4],
  [-1, 4],
  [0, 4],
  [1, 3],
  [3, 1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [2, -1],
  [3, -1],
  [4, -1],
  [4, -4],
]

export const RESOURCE_BONUSES = {
  '-4,4': [ResourceBonus.Steel, ResourceBonus.Steel],
  '-3,4': [ResourceBonus.Steel, ResourceBonus.Steel],
  '-3,3': [ResourceBonus.Steel],
  '-1,4': [ResourceBonus.Card],
  '1,3': [ResourceBonus.Card],
  '2,2': [ResourceBonus.Steel],
}
