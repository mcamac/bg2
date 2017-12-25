import {StandardProject, ResourceType} from './types'

export const STANDARD_PROJECTS = {
  [StandardProject.SellPatents]: {
    name: 'Sell Patents',
    effects: [['SellCards']],
  },
  [StandardProject.PowerPlant]: {
    name: 'Power Plant',
    effects: [
      ['ChangeInventory', -11, ResourceType.Money],
      ['ChangeProduction', 1, ResourceType.Energy],
    ],
  },
  [StandardProject.Asteroid]: {
    name: 'Asteroid',
    effects: [['ChangeInventory', -14, ResourceType.Money], ['IncreaseTemperature', 1]],
  },
  [StandardProject.Aquifer]: {
    name: 'Aquifer',
    effects: [['ChangeInventory', -18, ResourceType.Money], ['PlaceOceans', 1]],
  },
  [StandardProject.Greenery]: {
    name: 'Greenery',
    effects: [['ChangeInventory', -23, ResourceType.Money], ['PlaceGreenery']],
  },
  [StandardProject.City]: {
    name: 'City',
    effects: [
      ['ChangeInventory', -25, ResourceType.Money],
      ['PlaceCity'],
      ['ChangeProduction', 1, ResourceType.Money],
    ],
  },
}
