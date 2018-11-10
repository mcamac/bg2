import test from 'ava'

import {getInitialGameState, handleAction, claimMilestone} from '../src/index'
import {ResourceType, Milestones, TileType, Awards} from '../src/types'
import {vpFromAwards} from '../src/vp'
import {AWARD_REGISTRY} from '../src/awards'

const TEST_SEED = 'martin'

test('VP: Awards: Banker', t => {
  let state = getInitialGameState(['a', 'b', 'c', 'd'], TEST_SEED)

  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].production = 30
  state.playerState['b'].resources[ResourceType.Money].production = 30
  state.playerState['c'].resources[ResourceType.Money].production = 20
  state.playerState['d'].resources[ResourceType.Money].production = 20

  state.awards = [{award: Awards.Banker, player: 'a'}]

  t.is(vpFromAwards(state, 'a'), 5)
  t.is(vpFromAwards(state, 'b'), 5)
  t.is(vpFromAwards(state, 'c'), 2)
  t.is(vpFromAwards(state, 'd'), 2)
})
