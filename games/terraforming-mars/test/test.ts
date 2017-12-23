import test from 'ava'
import * as util from 'util'

import {getDiscount, getInitialGameState} from '../src/index'
import {getCardByName as C} from '../src/cards'
import {setupDraft, handlePlayerChoice, isDraftDone} from '../src/deck'
import {Card} from '../src/types'

const TEST_SEED = 'martin'

// Discounts
test(t => {
  const played = ['Research Outpost'].map(C)
  const card = C('Black Polar Dust')
  t.is(getDiscount(played, card), 1)
})

test(t => {
  const played = ['Quantum Extractor', 'Research Outpost'].map(C)
  const card = C('Optimal Aerobraking')
  t.is(getDiscount(played, card), 3)
})

// Initial state
test(t => {
  const state = getInitialGameState(['a', 'b', 'c', 'd'], TEST_SEED)
  t.is(state.choosingCards['a'].length, 10)
  t.is(state.choosingCards['c'][0], "CEO's Favourite Project")
})

// Drafting

test(t => {
  let state = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  state = setupDraft(state)
  t.is(state.draft['a'].queued[0].length, 4)

  state = handlePlayerChoice(state, 'a', 'Asteroid')
  t.is(state.draft['c'].queued[1].length, 3)
  state = handlePlayerChoice(state, 'c', 'Moss')
  state = handlePlayerChoice(state, 'c', 'Birds')
  state = handlePlayerChoice(state, 'b', 'Martian Rail')
  state = handlePlayerChoice(state, 'b', 'Dust Seals')
  t.false(isDraftDone(state))
  state = handlePlayerChoice(state, 'b', 'Domed Crater')
  state = handlePlayerChoice(state, 'a', 'Small Asteroid')
  state = handlePlayerChoice(state, 'c', 'Energy Tapping')
  state = handlePlayerChoice(state, 'a', 'Space Station')
  t.true(isDraftDone(state))
})
