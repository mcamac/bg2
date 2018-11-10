import {Awards, GameState, Player, ResourceType, Tag} from './types'
import {GetPlayerTags} from './utils'

export const AWARD_REGISTRY: {[key: string]: ((s: GameState, player: Player) => number)} = {
  [Awards.Landlord]: (state, player) =>
    Object.keys(state.map)
      .map(key => state.map[key].owner)
      .filter(owner => owner === player).length,
  [Awards.Banker]: (state, player) =>
    state.playerState[player].resources[ResourceType.Money].production,
  [Awards.Scientist]: (state, player) => GetPlayerTags(Tag.Science, player)(state),
  [Awards.Thermalist]: (state, player) =>
    state.playerState[player].resources[ResourceType.Heat].count,
  [Awards.Miner]: (state, player) =>
    state.playerState[player].resources[ResourceType.Steel].count +
    state.playerState[player].resources[ResourceType.Titanium].count,
}
