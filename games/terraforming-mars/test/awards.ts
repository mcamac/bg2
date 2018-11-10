import test from 'ava'

import {getInitialGameState, handleAction, claimMilestone, fundAward} from '../src/index'
import {ResourceType, Milestones, TileType, Awards} from '../src/types'
import {AWARD_REGISTRY} from '../src/awards'

const TEST_SEED = 'martin'

// Fund award

test(t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30

  state = fundAward(state, Awards.Miner)
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 22)
  state = fundAward(state, Awards.Banker)
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 8)
})

test('Awards: Banker', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].production = 30

  t.is(AWARD_REGISTRY[Awards.Banker](state, 'a'), 30)
})

test('Awards: Scientist', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].corporation = 'Inventrix'
  state.playerState['a'].played = ['Insulation', 'Adaptation Technology']

  t.is(AWARD_REGISTRY[Awards.Scientist](state, 'a'), 2)
})
