import {keyBy} from 'lodash'
import {ResourceType, Corporation, Tag, TileType, ResourceBonus} from './types'

export const CORPORATIONS: Corporation[] = [
  {
    name: 'Ecoline',
    startingMoney: 36, // Should this be subsumed in to effects?
    tags: ['Plant'],
    effects: [
      ['ChangeProduction', 2, ResourceType.Plant],
      ['ChangeInventory', 3, ResourceType.Plant],
    ],
    // Need to implement "Always pay 7 plants instead of 8 to place greenery"
  },
  {
    name: 'Credicor',
    startingMoney: 57,
    afterCardTriggers: [['MinCostCard', 20], [['ChangeInventory', 4, ResourceType.Money]]],
    // TODO: MinCostCard not currently implemented / i think after card triggers only take tags rn
    // e.g., get 4 money back whenever player plays card with minimum base cost of 20
  },
  {
    name: 'Saturn Systems',
    startingMoney: 42,
    tags: ['Jovian'],
    effects: [['ChangeProduction', 1, ResourceType.Titanium]],
    afterCardTriggers: [[Tag.Jovian], [['ChangeProduction', 1, ResourceType.Money]]],
    // TODO: Must activate when ANY player plays a Jovian (i think rn, this is just for player played)
  },
  {
    name: 'Tharsis Republic',
    startingMoney: 40,
    tags: ['Building'],
    afterTileTriggers: [
      [[TileType.City], [['ChangeProduction', 1, ResourceType.Money]]], // TODO: any player
      [[TileType.City], [['ChangeInventory', 3, ResourceType.Money]]], // TODO: just this player
    ],
    // TODO: implement function where first action must be to place a city
  },
  {
    name: 'Thorgate',
    startingMoney: 48,
    tags: ['Power'],
    effects: [['ChangeProduction', 1, ResourceType.Energy]],
    discounts: [[3, [Tag.Power]], [3, ['PlaceholderForStandardProjectPowerPlant']]],
    // TODO: implement discount for standard project power plants
  },
  {
    name: 'Inventrix',
    startingMoney: 45,
    tags: ['Science'],
    effects: [['Draw', 3]], // Todo: match the effects of Adaptation Technology
  },
  {
    name: 'Mining Guild',
    startingMoney: 30,
    tags: ['Building', 'Building'],
    effects: [
      ['ChangeProduction', 1, ResourceType.Steel],
      ['ChangeInventory', 5, ResourceType.Steel],
    ],
    afterTileTriggers: [
      [[ResourceBonus.Steel], [['ChangeProduction', 1, ResourceType.Steel]]],
      [[ResourceBonus.Titanium], [['ChangeProduction', 1, ResourceType.Steel]]],
    ],
  },
  {
    name: 'Helion',
    startingMoney: 42,
    tags: ['Space'],
    effects: [['ChangeProduction', 3, ResourceType.Heat]],
    // TODO: implement additional power to use heat as money
  },
  {
    name: 'Phoblog',
    startingMoney: 23,
    tags: ['Space'],
    effects: [['ChangeInventory', 10, ResourceType.Titanium]],
    // TODO: implement AdvancedAlloys-like effect to rasie value of titanium
  },
  {
    name: 'Beginner Corporation',
    startingMoney: 42,
  },
  {
    name: 'Interplanetary Cinematics',
    startingMoney: 30,
    tags: ['Building'],
    effects: [['ChangeInventory', 20, ResourceType.Steel]],
    afterCardTriggers: [[Tag.Event], [['ChangeInventory', 2, ResourceType.Money]]],
  },
  {
    name: 'Teractor',
    startingMoney: 60,
    tags: ['Earth'],
    discounts: [[3, [Tag.Earth]]],
  },
  {
    name: 'United Nations Mars Initiative (UNMI)',
    startingMoney: 40,
    tags: ['Earth'],
    // TODO: Implement ability after every generation to pay 3 Money increase Terraforming Rating by 1
  },
]

const CORPORATIONS_BY_NAME = keyBy(CORPORATIONS, 'name')
export const getCorporationByName = name => CORPORATIONS_BY_NAME[name]
