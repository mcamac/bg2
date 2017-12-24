import {StandardProject, ResourceType} from './types'

export const STANDARD_PROJECTS = {
  [StandardProject.SellPatents]: [['SellCards']],
  [StandardProject.PowerPlant]: [
    ['ChangeInventory', -11, ResourceType.Money],
    ['ChangeProduction', 1, ResourceType.Energy],
  ],
  [StandardProject.Asteroid]: [
    ['ChangeInventory', -14, ResourceType.Money],
    ['IncreaseTemperature', 1],
  ],
  [StandardProject.Aquifer]: [['ChangeInventory', -18, ResourceType.Money], ['PlaceOceans', 1]],
  [StandardProject.Greenery]: [['ChangeInventory', -23, ResourceType.Money], ['PlaceGreenery']],
  [StandardProject.City]: [
    ['ChangeInventory', -25, ResourceType.Money],
    ['PlaceCity'],
    ['ChangeProduction', 1, ResourceType.Money],
  ],
}
