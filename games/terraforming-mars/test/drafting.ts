import test from 'ava'

import {getInitialGameState, handleAction} from '../src/index'
import {setupDraft, handlePlayerChoice, isDraftDone} from '../src/deck'
import {Phase, UserAction} from '../src/types'
import {cloneState} from '../src/utils'

const TEST_SEED = 'martin'

test('Drafting: Even generation', t => {
  let state = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  state.generation = 0
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

  let state1 = handlePlayerChoice(cloneState(state), 'a', 'Space Station')
  t.true(isDraftDone(state1))

  // Use action handler to test transition.
  state = handleAction(state, {
    type: UserAction.DraftRoundChoice,
    player: 'a',
    choice: 'Space Station',
  })
  t.is(state.phase, Phase.CardBuying)
})

test('Drafting: Odd generation', t => {
  let state = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  state.generation = 1

  state = setupDraft(state)
  t.is(state.draft['a'].queued[0].length, 4)

  state = handlePlayerChoice(state, 'a', 'Asteroid')
  t.is(state.draft['b'].queued[1].length, 3)
  state = handlePlayerChoice(state, 'b', 'Moss')
  state = handlePlayerChoice(state, 'b', 'Birds')
  state = handlePlayerChoice(state, 'c', 'Martian Rail')
  state = handlePlayerChoice(state, 'c', 'Dust Seals')
  t.false(isDraftDone(state))
  state = handlePlayerChoice(state, 'c', 'Domed Crater')
  state = handlePlayerChoice(state, 'a', 'Small Asteroid')
  state = handlePlayerChoice(state, 'b', 'Energy Tapping')

  let state1 = handlePlayerChoice(cloneState(state), 'a', 'Space Station')
  t.true(isDraftDone(state1))

  // Use action handler to test transition.
  state = handleAction(state, {
    type: UserAction.DraftRoundChoice,
    player: 'a',
    choice: 'Space Station',
  })
  t.is(state.phase, Phase.CardBuying)
})
