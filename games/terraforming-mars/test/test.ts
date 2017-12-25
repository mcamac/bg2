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
import {
  GameState,
  Card,
  Transform,
  ResourceType,
  Phase,
  UserAction,
  Awards,
  TurnAction,
  TileType,
  StandardProject,
} from '../src/types'
import {cloneState, checkCardRequirements, applyEffects} from '../src/utils'
import {getStateAfterActions} from '../src/fixtures'

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
  // Make sure returns "true" if there is no requirements
  let testCardNoRequirements = {
    cost: 0,
    name: 'test_card',
    type: 'Automated',
    deck: 'Basic',
  }

  let basicGameState = getInitialGameState(['a', 'b', 'c'], TEST_SEED)

  t.true(checkCardRequirements(testCardNoRequirements, basicGameState))

  // Make sure breaks when there is a bad requirement
  let testCardBadRequirement = {
    cost: 0,
    name: 'test_card',
    type: 'Automated',
    deck: 'Basic',
    requires: [['NotARealRequirement', 1]],
  }

  t.throws(() => checkCardRequirements(testCardBadRequirement, basicGameState), Error)

  // Check when there is one requirement; ensure runs correctly
  let testCard = {
    cost: 0,
    name: 'test_card',
    type: 'Automated',
    deck: 'Basic',
    requires: [['MaxOxygen', 5]],
  }

  let low_oxygen_state = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  low_oxygen_state.globalParameters.Oxygen = 0

  let high_oxygen_state = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  high_oxygen_state.globalParameters.Oxygen = 10

  t.true(checkCardRequirements(testCard, low_oxygen_state))
  t.false(checkCardRequirements(testCard, high_oxygen_state))

  // Check when there are multiple requirements; ensure runs correctly
  let testCard_02 = {
    cost: 0,
    name: 'test_card',
    type: 'Automated',
    deck: 'Basic',
    requires: [['MaxOxygen', 5], ['MaxOceans', 2]],
  }

  let works = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  works.globalParameters.Oxygen = 0
  works.globalParameters.Oceans = 0

  let broken_01 = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  broken_01.globalParameters.Oxygen = 0
  broken_01.globalParameters.Oceans = 10

  let broken_02 = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  broken_02.globalParameters.Oxygen = 10
  broken_02.globalParameters.Oceans = 0

  let broken_03 = getInitialGameState(['a', 'b', 'c'], TEST_SEED)
  broken_03.globalParameters.Oxygen = 10
  broken_03.globalParameters.Oceans = 10

  t.true(checkCardRequirements(testCard_02, works))
  t.false(checkCardRequirements(testCard_02, broken_01))
  t.false(checkCardRequirements(testCard_02, broken_02))
  t.false(checkCardRequirements(testCard_02, broken_03))
})

// Play Cards

test('Industrial Microbes', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Industrial Microbes',
  })

  t.is(state.playerState['a'].resources[ResourceType.Money].count, 18)
})

test('Algae (fail)', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30

  // Not enough oceans
  t.throws(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.PlayCard,
      card: 'Algae',
    })
  )
})

// Effects

test(t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30

  const newState = applyEffects(state, {choices: [null, null]}, [
    ['ChangeInventory', 1, ResourceType.Plant],
    ['ChangeProduction', 2, ResourceType.Plant],
  ])

  t.deepEqual(state.playerState['a'].resources[ResourceType.Plant], {production: 2, count: 1})
})

test(t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].resources[ResourceType.Energy].production = 2

  const newState = applyEffects(
    state,
    {choices: [{location: [-4, 4]}, null, null]},
    C('Underground City').effects || []
  )

  t.deepEqual(state.playerState['a'].resources[ResourceType.Energy].production, 0)
  t.is(state.map['-4,4'].owner, 'a')
})

// Tile Triggers
test('City Tiles', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].played = ['Immigrant City', 'Underground City'] // When city placed, increase by 1
  state.playerState['a'].resources[ResourceType.Energy].production = 2

  const newState = applyEffects(
    state,
    {choices: [{location: [-4, 4]}, null, null]},
    C('Underground City').effects || []
  )

  t.deepEqual(state.playerState['a'].resources[ResourceType.Steel].production, 2)
  t.deepEqual(state.playerState['a'].resources[ResourceType.Money].production, 1)
})

// Tile Triggers
test('Card triggers its own tile trigger', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].resources[ResourceType.Energy].production = 1

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Immigrant City',
    choices: [null, null, {location: [-4, 4]}],
  })

  // Triggers itself
  t.deepEqual(state.playerState['a'].resources[ResourceType.Money].production, -1)
})

// Oceans
test('Oceans card', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.globalParameters.Heat = 0
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].resources[ResourceType.Energy].production = 1

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Lake Marineris',
    choices: [{locations: [[0, 0], [-1, 0]]}],
  })

  t.is(state.map['0,0'].type, TileType.Ocean)
  t.deepEqual(state.playerState['a'].TR, 22)
})

test('Oceans card with invalid choice', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.globalParameters.Heat = 0
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].resources[ResourceType.Energy].production = 1
  t.throws(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.PlayCard,
      card: 'Lake Marineris',
      choices: [{locations: [[3, 3], [-1, 0]]}],
    })
  )
})

// Standard Projects

test('Project: Sell Patents', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].hand = ['r', 's', 't']

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    project: StandardProject.SellPatents,
    choices: [{sold: ['r', 's']}],
  })

  t.is(state.playerState['a'].resources[ResourceType.Money].count, 32)
  t.deepEqual(state.playerState['a'].hand, ['t'])
})

test('Project: Power Plant', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.globalParameters.Heat = 0
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    project: StandardProject.PowerPlant,
    choices: [],
  })
  t.is(state.playerState['a'].resources[ResourceType.Energy].production, 1)
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 19)
  t.is(state.actionsDone, 1)
})

test('Project: Asteroid', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.globalParameters.Heat = 0
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    project: StandardProject.Asteroid,
    choices: [],
  })
  t.is(state.playerState['a'].TR, 21)
  t.is(state.globalParameters.Heat, 1)
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 16)
  t.is(state.actionsDone, 1)
})

test('Project: Aquifer', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.globalParameters.Heat = 0
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    project: StandardProject.Aquifer,
    choices: [null, {locations: [[0, 0]]}],
  })
  t.is(state.playerState['a'].TR, 21)
  t.is(state.globalParameters.Oceans, 1)
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 12)
  t.is(state.actionsDone, 1)
})

test('Project: Greenery', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.globalParameters.Heat = 0
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    project: StandardProject.Greenery,
    choices: [null, {location: [0, 0]}],
  })
  t.is(state.playerState['a'].TR, 21)
  t.is(state.globalParameters.Oxygen, 1)
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 7)
  t.is(state.actionsDone, 1)
})

test('Project: City', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.globalParameters.Heat = 0
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    project: StandardProject.City,
    choices: [null, {location: [0, 1]}, null],
  })
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 5)
  t.is(state.playerState['a'].resources[ResourceType.Money].production, 1)
  t.is(state.actionsDone, 1)
})

// Corp choosing

test('Corporation and card choice', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.firstPlayer = 'a'

  handleAction(state, {
    type: UserAction.CorpAndCardsChoice,
    player: 'a',
    corporation: 'Ecoline',
    cards: [
      'Equatorial Magnetizer',
      'Interstellar Colony Ship',
      'Gene Repair',
      'Trans-Neptune Probe',
    ],
  })
  t.is(state.playerState['a'].corporation, 'Ecoline')
  // THESE CARDS AIN'T FREE
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 36 - 12)
  t.is(state.playerState['a'].resources[ResourceType.Plant].count, 3)
  t.is(state.playerState['a'].resources[ResourceType.Plant].production, 2)

  handleAction(state, {
    type: UserAction.CorpAndCardsChoice,
    player: 'b',
    corporation: 'Beginner Corporation',
    cards: state.choosingCards['b'], // ALL THE CARDS FOR FREE!!!
  })
  t.is(state.playerState['b'].resources[ResourceType.Money].count, 42)

  // Moved to action mode
  t.is(state.phase, Phase.Actions)
  t.is(state.player, 'a')
})

// Turn Passing
test('Turn Passing', t => {
  let state = getStateAfterActions()
  state.firstPlayer = 'a'
  handleAction(state, {
    type: UserAction.Pass,
    player: 'a',
  })

  t.is(state.player, 'b')
  handleAction(state, {
    type: UserAction.Pass,
    player: 'b',
  })

  // New generation
  t.is(state.generation, 1)
  t.is(state.firstPlayer, 'b')

  // Ecoline
  t.is(state.playerState['a'].resources[ResourceType.Plant].count, 5)
})

test('Turn Ceding', t => {
  let state = getStateAfterActions()
  state.firstPlayer = 'a'

  // No action yet
  t.throws(() =>
    handleAction(state, {
      type: UserAction.Cede,
      player: 'a',
    })
  )

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    player: 'a',
    project: StandardProject.PowerPlant,
  })

  handleAction(state, {
    type: UserAction.Cede,
    player: 'a',
  })

  t.is(state.player, 'b')

  handleAction(state, {
    type: UserAction.Pass,
    player: 'b',
  })

  t.is(state.player, 'a')

  handleAction(state, {
    type: UserAction.Pass,
    player: 'a',
  })

  // New generation
  t.is(state.generation, 1)
  t.is(state.firstPlayer, 'b')

  // Ecoline
  t.is(state.playerState['a'].resources[ResourceType.Plant].count, 5)
  t.is(state.playerState['a'].resources[ResourceType.Energy].count, 1)
})

test('Turn Ceding after 2 actions', t => {
  let state = getStateAfterActions()
  state.firstPlayer = 'a'

  // No action yet
  t.throws(() =>
    handleAction(state, {
      type: UserAction.Cede,
      player: 'a',
    })
  )

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    player: 'a',
    project: StandardProject.PowerPlant,
  })

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    player: 'a',
    project: StandardProject.PowerPlant,
  })

  t.is(state.player, 'b')

  handleAction(state, {
    type: UserAction.Pass,
    player: 'b',
  })

  t.is(state.player, 'a')

  handleAction(state, {
    type: UserAction.Pass,
    player: 'a',
  })

  // New generation
  t.is(state.generation, 1)
  t.is(state.firstPlayer, 'b')

  // Ecoline
  t.is(state.playerState['a'].resources[ResourceType.Plant].count, 5)
  t.is(state.playerState['a'].resources[ResourceType.Energy].count, 2)
})

// Drafting in new generation

test('New Generation: Drafting', t => {
  let state = getStateAfterActions()
  state.firstPlayer = 'a'
  handleAction(state, {
    type: UserAction.Pass,
    player: 'a',
  })

  t.is(state.player, 'b')
  handleAction(state, {
    type: UserAction.Pass,
    player: 'b',
  })

  // New generation
  t.is(state.generation, 1)
  t.is(state.firstPlayer, 'b')
  // Ecoline
  t.is(state.playerState['a'].resources[ResourceType.Plant].count, 5)
  t.is(state.phase, Phase.Draft)
})

// Card Actions

test('Card Actions: Space Mirrors', t => {
  let state = getStateAfterActions()
  state.playerState['a'].played = ['Space Mirrors']
  state.playerState['a'].resources[ResourceType.Money].count = 30

  state.firstPlayer = 'a'
  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.CardAction,
    card: 'Space Mirrors',
    index: 0,
    player: 'a',
  })

  t.is(state.playerState['a'].resources[ResourceType.Money].count, 23)
  t.is(state.playerState['a'].resources[ResourceType.Energy].production, 1)
  t.true(state.playerState['a'].cardActionsUsedThisGeneration['Space Mirrors'])
})

test('Card Actions: Physics Complex', t => {
  let state = getStateAfterActions()
  state.playerState['a'].played = ['Physics Complex']
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].resources[ResourceType.Energy].count = 6

  state.firstPlayer = 'a'
  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.CardAction,
    card: 'Physics Complex',
    index: 0,
    player: 'a',
  })

  t.is(state.playerState['a'].resources[ResourceType.Energy].count, 0)
  t.is(state.playerState['a'].cardResources['Physics Complex'], 1)
  t.true(state.playerState['a'].cardActionsUsedThisGeneration['Physics Complex'])

  // Can't play again
  t.throws(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.CardAction,
      card: 'Physics Complex',
      index: 0,
      player: 'a',
    })
  )
})

test.only('Card Actions: AI Central', t => {
  let state = getStateAfterActions()
  state.playerState['a'].played = ['AI Central']
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].resources[ResourceType.Energy].count = 6
  t.is(state.playerState['a'].hand.length, 4)

  state.firstPlayer = 'a'
  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.CardAction,
    card: 'AI Central',
    index: 0,
  })

  t.true(state.playerState['a'].cardActionsUsedThisGeneration['AI Central'])
  t.is(state.playerState['a'].hand.length, 6)
})

// Choosing other player as target of effect.

test('DecreaseAnyProduction: Hackers', t => {
  let state = getStateAfterActions()
  state.playerState['a'].played = ['Physics Complex']
  state.playerState['b'].resources[ResourceType.Money].production = 2
  state.playerState['a'].resources[ResourceType.Energy].production = 1
  state.player = 'a'

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Hackers',
    choices: [null, {player: 'b'}],
  })

  t.is(state.playerState['b'].resources[ResourceType.Money].production, 0)
  t.is(state.playerState['a'].resources[ResourceType.Money].production, 2)
})
