import test from 'ava'

import {getInitialGameState, handleAction, claimMilestone} from '../src/index'
import {ResourceType, Milestones, TileType} from '../src/types'

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

test('Milestone: Gardener', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].corporation = 'Ecoline'
  state.map['0,2'] = {owner: 'a', type: TileType.Greenery}
  state.map['0,3'] = {owner: 'a', type: TileType.Greenery}
  state.map['0,4'] = {owner: 'a', type: TileType.Greenery}

  state = claimMilestone(state, Milestones.Gardener)
  t.is(state.milestones[0].milestone, Milestones.Gardener)
})

test('Milestone: Gardener (Invalid)', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].corporation = 'Ecoline'
  state.map['0,2'] = {owner: 'a', type: TileType.Greenery}
  state.map['0,3'] = {owner: 'a', type: TileType.Greenery}

  t.throws(() => (state = claimMilestone(state, Milestones.Gardener)))
})

test('Milestone: Mayor', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].corporation = 'Ecoline'
  state.map['0,2'] = {owner: 'a', type: TileType.City}
  state.map['0,3'] = {owner: 'a', type: TileType.City}
  state.map['0,4'] = {owner: 'a', type: TileType.City}

  state.milestones = [{player: 'a', milestone: Milestones.Terraformer}]

  state = claimMilestone(state, Milestones.Mayor)
  t.is(state.milestones[1].milestone, Milestones.Mayor)
})

test('Milestone: Mayor (Invalid)', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].corporation = 'Ecoline'
  state.map['0,2'] = {owner: 'a', type: TileType.City}
  state.map['0,3'] = {owner: 'a', type: TileType.City}

  t.throws(() => (state = claimMilestone(state, Milestones.Mayor)))
})

test('Milestone: Already 3 (Invalid)', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].corporation = 'Ecoline'
  state.map['0,2'] = {owner: 'a', type: TileType.City}
  state.map['0,3'] = {owner: 'a', type: TileType.City}
  state.map['0,4'] = {owner: 'a', type: TileType.City}

  state.milestones = [
    {player: 'a', milestone: Milestones.Builder},
    {player: 'a', milestone: Milestones.Gardener},
    {player: 'a', milestone: Milestones.Terraformer},
  ]

  t.throws(() => (state = claimMilestone(state, Milestones.Mayor)))
})

test('Milestone: Duplicate (Invalid)', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].corporation = 'Ecoline'
  state.map['0,2'] = {owner: 'a', type: TileType.City}
  state.map['0,3'] = {owner: 'a', type: TileType.City}
  state.map['0,4'] = {owner: 'a', type: TileType.City}

  state.milestones = [{player: 'a', milestone: Milestones.Mayor}]

  t.throws(() => (state = claimMilestone(state, Milestones.Mayor)))
})
