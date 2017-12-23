import test from 'ava'
import * as util from 'util'

import {
  getDiscount,
  getInitialGameState,
  handleAction,
  buyCards,
  fundAward,
  getClientState,
} from '../src/index'
import {getCardByName as C} from '../src/cards'
import {setupDraft, handlePlayerChoice, isDraftDone} from '../src/deck'
import {GameState, Card, Transform, ResourceType, Phase, UserAction, Awards} from '../src/types'
import {cloneState, checkCardRequirements} from '../src/utils'

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

// Card buying

test(t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['b'].resources[ResourceType.Money].count = 30

  const chosen = ['Gene Repair', 'Urbanized Area']
  const chosenB = ['Open City', 'Trees', 'Bushes']
  state = buyCards(state, 'a', chosen)
  t.deepEqual(chosen, state.playerState['a'].hand)
  t.deepEqual(24, state.playerState['a'].resources[ResourceType.Money].count)

  state = handleAction(state, {type: UserAction.BuyCards, player: 'b', chosen: chosenB})
  t.deepEqual(chosenB, state.playerState['b'].hand)
  t.deepEqual(21, state.playerState['b'].resources[ResourceType.Money].count)
  t.is(state.phase, Phase.Actions)
})

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

// Player state

test(t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  const client = getClientState(state, 'a')

  t.falsy(client.playerState['b'].hand)
  t.falsy(client.choosingCards['b'])
  t.falsy(client.deck)
  t.falsy(client.seed)
})

// Playing cards: checking card requirements

test(t => {
  // Make sure returns True if card has no requirements
  let testCard = {
    cost: 0,
    name: 'test_card',
    type: 'Automated',
    deck: 'Basic',
    requires: [['MaxOxygen', 5]]
  }

  let low_oxygen_state = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  low_oxygen_state.globalParameters.Oxygen = 0

  let high_oxygen_state = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  high_oxygen_state.globalParameters.Oxygen = 10

  t.is(checkCardRequirements(testCard, low_oxygen_state), true)
  t.is(checkCardRequirements(testCard, high_oxygen_state), false)
})
