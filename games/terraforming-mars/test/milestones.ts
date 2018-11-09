import test from 'ava'

import {getInitialGameState, handleAction, claimMilestone} from '../src/index'
import {ResourceType, Milestones} from '../src/types'

const TEST_SEED = 'martin'

test('Milestone: Terraformer', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].TR = 35

  state = claimMilestone(state, Milestones.Terraformer)
  t.is(state.milestones[0].milestone, Milestones.Terraformer)
})

test('Milestone: Terraformer (Invalid)', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].TR = 34

  t.throws(() => {
    state = claimMilestone(state, Milestones.Terraformer)
  })
})

test('Milestone: Planner', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].hand = [
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
  ]

  state = claimMilestone(state, Milestones.Planner)
  t.is(state.milestones[0].milestone, Milestones.Planner)
})

test('Milestone: Planner (Invalid)', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].hand = [
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
    'Bribed Committee',
    'Media Group',
  ]

  t.throws(() => {
    state = claimMilestone(state, Milestones.Planner)
  })
})

test('Milestone: Builder', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].corporation = 'Ecoline'
  state.playerState['a'].played = [
    'Colonizer Training Camp',
    'Colonizer Training Camp',
    'Colonizer Training Camp',
    'Colonizer Training Camp',
    'Colonizer Training Camp',
    'Colonizer Training Camp',
    'Colonizer Training Camp',
    'Colonizer Training Camp',
  ]

  state = claimMilestone(state, Milestones.Builder)
  t.is(state.milestones[0].milestone, Milestones.Builder)
})
