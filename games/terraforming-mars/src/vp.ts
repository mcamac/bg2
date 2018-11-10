import {toPairs, sortBy, uniq} from 'lodash/fp'

import {Player, GameState, TileType, Card, SpecialCity} from './types'
import {GetPlayerGreeneries, VP_REGISTRY} from './utils'
import {getCardByName} from './cards'
import {getAdjacentTiles, makePositionFromKey, makeKeyFromPosition} from './tiles'
import {AWARD_REGISTRY} from './awards'

const VP_PER_MILESTONE = 5
const VP_PER_AWARD_FIRST = 5
const VP_PER_AWARD_SECOND = 2

const calculateCardVP = (state: GameState, player: Player, card: Card) => {
  if (typeof card.vp === 'undefined') return 0
  if (typeof card.vp === 'number') return card.vp

  const [vpType, ...params] = card.vp
  return VP_REGISTRY[vpType](...params)({...state, player: player})
}

const vpFromMilestones = (state: GameState, player: Player) => {
  let vp = 0
  state.milestones.forEach(claim => {
    if (claim.player === player) vp += VP_PER_MILESTONE
  })
  return vp
}

export const vpFromAwards = (state: GameState, player: Player) => {
  let vp = 0
  state.awards.forEach(awardFund => {
    const awardFn = AWARD_REGISTRY[awardFund.award]
    const playerAwardScore = awardFn(state, player)
    const allAwardScores = uniq(sortBy(x => -x, state.players.map(p => awardFn(state, p))))

    if (allAwardScores[0] === playerAwardScore) {
      vp += VP_PER_AWARD_FIRST
    } else if (allAwardScores.length >= 2 && allAwardScores[1] === playerAwardScore) {
      vp += VP_PER_AWARD_SECOND
    }
  })
  return vp
}

// TODO: Break out VP per type.
export const calculatePlayerVP = (state: GameState, player: Player) => {
  let vp = 0
  const playerState = state.playerState[player]

  vp += playerState.TR

  // VP from greeneries.
  vp += GetPlayerGreeneries(player)(state)

  // VP from cities.
  toPairs(state.map).forEach((key, tile) => {
    if (key === SpecialCity.GanymedeColony || key === SpecialCity.PhobosSpaceHaven) return

    if (tile.player === player && tile.type === TileType.City) {
      // vp += player
      const adjacentPositions = getAdjacentTiles(makePositionFromKey(key))
      const adjacentTiles = adjacentPositions.map(pos => state.map[makeKeyFromPosition(pos)])
      vp += adjacentTiles.filter(tile => tile.type === TileType.Greenery).length
    }
  })

  // VP from cards.
  playerState.played.map(getCardByName).forEach(card => {
    vp += calculateCardVP(state, player, card)
  })

  vp += vpFromMilestones(state, player)
  vp += vpFromAwards(state, player)

  return vp
}
