import {StandardProject, ResourceType} from './types'

export const STANDARD_PROJECTS = {
  [StandardProject.SellPatents]: {
    name: 'Sell Patents',
    cost: 0,
    effects: [['SellCards']],
  },
  [StandardProject.PowerPlant]: {
    name: 'Power Plant',
    cost: 11,
    effects: [
      ['ChangeInventory', -11, ResourceType.Money],
      ['ChangeProduction', 1, ResourceType.Energy],
    ],
  },
  [StandardProject.Asteroid]: {
    name: 'Asteroid',
    cost: 14,
    effects: [['ChangeInventory', -14, ResourceType.Money], ['IncreaseTemperature', 1]],
  },
  [StandardProject.Aquifer]: {
    name: 'Aquifer',
    cost: 18,
    effects: [['ChangeInventory', -18, ResourceType.Money], ['PlaceOceans', 1]],
  },
  [StandardProject.Greenery]: {
    name: 'Greenery',
    cost: 23,
    effects: [['ChangeInventory', -23, ResourceType.Money], ['PlaceGreenery']],
  },
  [StandardProject.City]: {
    name: 'City',
    cost: 25,
    effects: [
      ['ChangeInventory', -25, ResourceType.Money],
      ['PlaceCity'],
      ['ChangeProduction', 1, ResourceType.Money],
    ],
  },
}
