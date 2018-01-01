import {keyBy} from 'lodash'
import {ResourceType, Corporation, Tag, TileType, ResourceBonus, StandardProject} from './types'

export const CORPORATIONS: Corporation[] = [
  {
    name: 'Ecoline',
    startingMoney: 36, // Should this be subsumed in to effects?
    tags: ['Plant'],
    effects: [
      ['ChangeProduction', 2, ResourceType.Plant],
      ['ChangeInventory', 3, ResourceType.Plant],
    ],
  },
  {
    name: 'Credicor',
    startingMoney: 57,
    afterCardTriggers: [['PlayedMinCost', 20], [['ChangeInventory', 4, ResourceType.Money]]],
    afterStandardProjectTriggers: [
      ['StandardProjectMatches', [StandardProject.Greenery, StandardProject.City]],
      [['ChangeInventory', 4, ResourceType.Money]],
    ],
  },
  {
    name: 'Saturn Systems',
    startingMoney: 42,
    tags: ['Jovian'],
    effects: [['ChangeProduction', 1, ResourceType.Titanium]],
    afterCardTriggers: [
      ['PlayedTagMatchesAny', [[Tag.Jovian]]],
      [['ChangeProduction', 1, ResourceType.Money]],
    ],
  },
  {
    name: 'Tharsis Republic',
    startingMoney: 40,
    tags: ['Building'],
    afterTileTriggers: [
      [[TileType.City], [['ChangeProduction', 1, ResourceType.Money]]], // TODO: any player
      [[TileType.City, true], [['ChangeInventory', 3, ResourceType.Money]]], // TODO: just this player
    ],
    // TODO: implement function where first action must be to place a city
  },
  {
    name: 'Thorgate',
    startingMoney: 48,
    tags: ['Power'],
    effects: [['ChangeProduction', 1, ResourceType.Energy]],
    discounts: [[3, [Tag.Power]], [3, [StandardProject.PowerPlant]]],
  },
  {
    name: 'Inventrix',
    startingMoney: 45,
    tags: ['Science'],
    effects: [['Draw', 3], ['OffsetRequirements', 2]],
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
    text: 'Can use heat as money.',
    // TODO: implement additional power to use heat as money
  },
  {
    name: 'Phoblog',
    startingMoney: 23,
    tags: ['Space'],
    effects: [
      ['ChangeInventory', 10, ResourceType.Titanium],
      ['IncreaseResourceValue', 1, ResourceType.Titanium],
    ],
  },
  {
    name: 'Beginner Corporation',
    startingMoney: 42,
    text: 'Keep all 10 cards.',
  },
  {
    name: 'Interplanetary Cinematics',
    startingMoney: 30,
    tags: ['Building'],
    effects: [['ChangeInventory', 20, ResourceType.Steel]],
    afterCardTriggers: [
      ['PlayedTagMatches', [[Tag.Event]]],
      [['ChangeInventory', 2, ResourceType.Money]],
    ],
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
    actions: [[['UNTerraform']]],
  },
]

const CORPORATIONS_BY_NAME = keyBy(CORPORATIONS, 'name')
export const getCorporationByName = name => CORPORATIONS_BY_NAME[name]
