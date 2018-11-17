import test from 'ava'
import * as util from 'util'

import {
  getDiscount,
  getInitialGameState,
  handleAction,
  buyCards,
  fundAward,
  getClientState,
  generationProduction,
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
  Tag,
  KeepCardsChoice,
} from '../src/types'
import {
  cloneState,
  checkCardRequirements,
  applyEffects,
  IsSubset,
  PlayedTagMatches,
  AnyPlayedTagMatches,
  PlayedMinCost,
  StandardProjectMatches,
} from '../src/utils'
import {getStateAfterActions} from '../src/fixtures'

const TEST_SEED = 'martin'

// Discounts
test(t => {
  const played = ['Research Outpost'].map(C)
  const card = C('Black Polar Dust')
  t.is(getDiscount(played, null, null, card), 1)
})

test(t => {
  const played = ['Quantum Extractor', 'Research Outpost'].map(C)
  const card = C('Optimal Aerobraking')
  t.is(getDiscount(played, null, null, card), 3)
})

test('Production', t => {
  let state = getInitialGameState(['a', 'b'], TEST_SEED)
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].played = ['Immigrant City', 'Underground City'] // When city placed, increase by 1
  state.playerState['a'].resources[ResourceType.Energy].production = 2
  state.playerState['a'].resources[ResourceType.Energy].count = 5
  state.playerState['a'].TR = 25

  state = generationProduction(state)

  t.deepEqual(state.playerState['a'].resources[ResourceType.Money].count, 55)
  t.deepEqual(state.playerState['a'].resources[ResourceType.Heat].count, 5)
  t.deepEqual(state.playerState['a'].resources[ResourceType.Energy].count, 2)
})

// Initial state
test(t => {
  const state = getInitialGameState(['a', 'b', 'c', 'd'], TEST_SEED)
  t.is(state.choosingCards['a'].length, 10)
  t.is(state.choosingCards['c'][0], 'Nitrophilic Moss')
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

// After card triggers

test('After card trigger: Test match finder util', t => {
  let empty = []
  let required1 = [Tag.Earth]
  let required2 = [Tag.Space, Tag.Event]

  let options1 = [Tag.Space, Tag.Earth]
  let options2 = [Tag.Space, Tag.Event]

  // Make sure that empty list always returns true, but false other way around
  t.true(IsSubset(empty, empty))
  t.true(IsSubset(empty, options1))
  t.false(IsSubset(options1, empty))

  // Make sure functionality works right for one match
  t.true(IsSubset(required1, options1))
  t.false(IsSubset(required1, options2))

  // Make sure works right for multiple matches
  t.false(IsSubset(required2, options1))
  t.true(IsSubset(required2, options2))
})

test('After card trigger: Look for matching tags', t => {
  let player01 = 'Player 01'
  let player02 = 'Player 02'

  let card01 = {
    // e.g., the one that will match
    cost: 0,
    name: 'test_card',
    type: 'Automated',
    deck: 'Basic',
    tags: [Tag.Space, Tag.Event],
  }

  let card02 = {
    // e.g., one that will not match
    cost: 0,
    name: 'test_card',
    type: 'Automated',
    deck: 'Basic',
    tags: [Tag.Animal],
  }

  let card03 = {
    // e.g., one that will not match
    cost: 0,
    name: 'test_card',
    type: 'Automated',
    deck: 'Basic',
    tags: [],
  }

  let spaceEvent = [[Tag.Space, Tag.Event]]
  let anyLife = [[Tag.Plant], [Tag.Animal], [Tag.Microbe]]

  // Check that works correctly when player & owner are same (and doesn't o.w.)
  t.true(PlayedTagMatches(spaceEvent)(card01, player01, player01))
  t.false(PlayedTagMatches(spaceEvent)(card01, player02, player01))

  // Always works for "any match"
  t.true(AnyPlayedTagMatches(spaceEvent)(card01, player01, player01))
  t.true(AnyPlayedTagMatches(spaceEvent)(card01, player02, player01))

  // Failure with card02
  t.false(PlayedTagMatches(spaceEvent)(card03, player01, player01))
  t.false(PlayedTagMatches(spaceEvent)(card03, player02, player01))
  t.false(AnyPlayedTagMatches(spaceEvent)(card03, player01, player01))
  t.false(AnyPlayedTagMatches(spaceEvent)(card03, player02, player01))

  // Check works as expected when multiple possible matches
  t.true(PlayedTagMatches(anyLife)(card02, player01, player01))
  t.false(PlayedTagMatches(anyLife)(card01, player01, player01))
  t.false(PlayedTagMatches(anyLife)(card03, player01, player01))
})

test('After card trigger: min cost', t => {
  let player01 = 'Player 01'
  let player02 = 'Player 02'

  let card01 = {
    // e.g., the one that will match
    cost: 20,
    name: 'test_card',
    type: 'Automated',
    deck: 'Basic',
    tags: [Tag.Space, Tag.Event],
  }

  let card02 = {
    // e.g., one that will not match
    cost: 0,
    name: 'test_card',
    type: 'Automated',
    deck: 'Basic',
    tags: [Tag.Animal],
  }

  t.true(PlayedMinCost(20)(card01, player01, player01))
  t.false(PlayedMinCost(20)(card02, player01, player01))
  t.false(PlayedMinCost(20)(card01, player02, player01))
  t.false(PlayedMinCost(20)(card02, player02, player01))
})

test('After standard project trigger: make sure it works...', t => {
  let required = [StandardProject.Greenery]

  t.true(StandardProjectMatches(required)(StandardProject.Greenery))
  t.false(StandardProjectMatches(required)(StandardProject.PowerPlant))
  t.false(StandardProjectMatches([])(StandardProject.Greenery))
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
    resources: {Money: 12},
  })

  t.is(state.playerState['a'].resources[ResourceType.Money].count, 18)
})

test('Branch: Nitrogen-Rich Asteroid', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 31

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Nitrogen-Rich Asteroid',
    resources: {Money: 31},
  })

  t.is(state.playerState['a'].resources[ResourceType.Plant].production, 3)
})

test('Branch: Nitrogen-Rich Asteroid (true)', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 31
  state.playerState['a'].played = ['Algae', 'Adapted Lichen']

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Nitrogen-Rich Asteroid',
    resources: {Money: 31},
  })

  // ecoline
  t.is(state.playerState['a'].resources[ResourceType.Plant].production, 6)
})

test('Media Archives', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 8
  state.playerState['a'].played = ['Business Contacts']
  state.playerState['b'].played = ['Bribed Committee']

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Media Archives',
    resources: {Money: 8},
  })

  t.is(state.playerState['a'].resources[ResourceType.Money].count, 2)
})

test('Media Group', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 13
  state.playerState['a'].hand = ['Bribed Committee', 'Media Group']

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Media Group',
    resources: {Money: 6},
  })

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Bribed Committee',
    resources: {Money: 7},
  })

  t.is(state.playerState['a'].resources[ResourceType.Money].count, 3)
})

test('Cartel', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 8
  state.playerState['a'].played = ['Investment Loan', 'Pets']
  state.playerState['b'].played = ['Olympus Conference']

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Cartel',
    resources: {Money: 8},
  })

  t.is(state.playerState['a'].resources[ResourceType.Money].production, 2)
})

test('Mining Area', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 8
  state.map['-4,3'] = {owner: 'a', type: TileType.City}

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Mining Area',
    resources: {Money: 4},
    choices: [{location: [-4, 4], resource: 'Steel'}],
  })

  t.is(state.playerState['a'].resources[ResourceType.Steel].production, 1)
  t.is(state.playerState['a'].resources[ResourceType.Steel].count, 2)
})

test('Mining Area (fail bonus)', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 8
  state.map['-4,2'] = {owner: 'a', type: TileType.City}

  t.throws(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.PlayCard,
      card: 'Mining Area',
      resources: {Money: 4},
      choices: [{location: [-4, 3], resource: 'Steel'}],
    })
  )
})

test('Mining Area (fail adjacent)', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 8

  t.throws(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.PlayCard,
      card: 'Mining Area',
      resources: {Money: 4},
      choices: [{location: [-4, 4], resource: 'Steel'}],
    })
  )
})

test('Mining Rights', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 9

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Mining Rights',
    resources: {Money: 9},
    choices: [{location: [-4, 4], resource: 'Steel'}],
  })

  t.is(state.playerState['a'].resources[ResourceType.Steel].production, 1)
  t.is(state.playerState['a'].resources[ResourceType.Steel].count, 2)
})

test('Mangrove', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 12
  state.globalParameters.Heat = 4

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Mangrove',
    resources: {Money: 12},
    choices: [{location: [-1, 0]}],
  })

  t.is(state.map['-1,0'].owner, 'a')
})

test('Ganymede Colony', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 20

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Ganymede Colony',
    resources: {Money: 20},
  })

  t.is(state.map['Ganymede Colony'].owner, 'a')
})

test('Asteroid', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 14

  state.playerState['b'].resources[ResourceType.Plant].count = 2

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Asteroid',
    resources: {Money: 14},
    choices: [null, null, {player: 'b'}],
  })

  t.is(state.playerState['b'].resources[ResourceType.Plant].count, 0)
})

test('Natural Preserve', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 12
  state.globalParameters.Heat = 4

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Natural Preserve',
    resources: {Money: 9},
    choices: [{location: [-1, 1]}],
  })

  t.is(state.map['-1,1'].owner, 'a')
})

test('Arctic Algae', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 15
  state.playerState['b'].played = ['Arctic Algae']

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Convoy From Europa',
    resources: {Money: 15},
    choices: [{location: [0, 0]}],
  })

  t.is(state.playerState['b'].resources[ResourceType.Plant].count, 2)
})

test('Search For Life', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 1
  state.playerState['a'].played = ['Search For Life']

  state.deck[0] = 'Regolith Eaters'

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.CardAction,
    card: 'Search For Life',
    index: 0,
    player: 'a',
  })

  t.is(state.playerState['a'].cardResources['Search For Life'], 1)
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 0)
})

test('Pets Trigger', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 25
  state.playerState['b'].played = ['Pets']

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    project: StandardProject.City,
    choices: [null, {location: [0, 1]}],
  })

  t.is(state.playerState['b'].cardResources['Pets'], 1)
})

test('Urbanized Area', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 10
  state.playerState['a'].resources[ResourceType.Energy].production = 1
  state.map['0,2'] = {owner: 'a', type: TileType.City}
  state.map['2,2'] = {owner: 'a', type: TileType.City}

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Urbanized Area',
    resources: {Money: 10},
    choices: [null, null, {location: [1, 2]}],
  })

  t.is(state.map['1,2'].owner, 'a')
})

test('Urbanized Area (Fail)', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 10
  state.map['0,2'] = {owner: 'a', type: TileType.City}

  t.throws(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.PlayCard,
      card: 'Urbanized Area',
      resources: {Money: 10},
      choices: [null, null, {location: [1, 2]}],
    })
  )
})

test('Large Convoy', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 36
  state.playerState['a'].played = ['Pets']

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Large Convoy',
    resources: {Money: 36},
    choices: [{location: [0, 0]}, null, {index: 1, card: 'Pets'}],
  })

  t.is(state.playerState['a'].cardResources['Pets'], 4)
})

test('CEOs Favorite (Fail)', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 1
  state.playerState['a'].played = ['Security Fleet']

  t.throws(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.PlayCard,
      card: "CEO's Favourite Project",
      resources: {Money: 36},
      choices: [{card: 'Security Fleet'}],
    })
  )
})

test('CEOs Favorite', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 1
  state.playerState['a'].played = ['Security Fleet']
  state.playerState['a'].cardResources['Security Fleet'] = 1

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: "CEO's Favourite Project",
    resources: {Money: 1},
    choices: [{card: 'Security Fleet'}],
  })

  t.is(state.playerState['a'].cardResources['Security Fleet'], 2)
})

test('Research Outpost', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 18
  state.globalParameters.Heat = 4

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Research Outpost',
    resources: {Money: 18},
    choices: [{location: [-1, 1]}],
  })

  t.is(state.map['-1,1'].owner, 'a')
})

test('Restricted Area: Place', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 11
  state.globalParameters.Heat = 4

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Restricted Area',
    resources: {Money: 11},
    choices: [{location: [-1, 1]}],
  })

  t.is(state.map['-1,1'].owner, 'a')
})

test('Insulation', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 2
  state.playerState['a'].resources[ResourceType.Heat].production = 3

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Insulation',
    resources: {Money: 2},
    choices: [{x: 3}],
  })

  t.is(state.playerState['a'].resources[ResourceType.Heat].production, 0)
  t.is(state.playerState['a'].resources[ResourceType.Money].production, 3)
})

test('Robotic Workforce', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 9
  state.playerState['a'].resources[ResourceType.Money].production = 0

  state.playerState['a'].played = [
    'Rad-Chem Factory',
    'Rad-Chem Factory',
    'Rad-Chem Factory',
    'Rad-Chem Factory',
    'Rad-Chem Factory',
    'Medical Lab',
  ]

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Robotic Workforce',
    resources: {Money: 9},
    choices: [{card: 'Medical Lab', cardAction: {}}],
  })

  t.is(state.playerState['a'].resources[ResourceType.Money].production, 3)
})

test('Adaptation Technology: Heat', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 20
  state.globalParameters.Heat = -28

  t.throws(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.PlayCard,
      card: 'Lichen',
      resources: {Money: 7},
    })
  )

  state = handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Adaptation Technology',
    resources: {Money: 12},
  })

  t.notThrows(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.PlayCard,
      card: 'Lichen',
      resources: {Money: 7},
    })
  )
})

test('Natural Preserve (fail)', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 12
  state.globalParameters.Heat = 4
  state.map['0,0'] = {owner: 'a', type: TileType.Ocean}

  t.throws(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.PlayCard,
      card: 'Natural Preserve',
      resources: {Money: 9},
      choices: [{location: [-1, 0]}],
    })
  )
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
      resources: {Money: 10},
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

test('Underground City', t => {
  let state = getStateAfterActions()
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
test('City Tiles: Other player', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 18
  state.playerState['a'].resources[ResourceType.Energy].production = 2
  state.playerState['b'].corporation = 'Tharsis Republic' // When city placed, increase by 1

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Underground City',
    resources: {Money: 18},
    choices: [{location: [-4, 4]}, null, null],
  })

  t.is(state.playerState['b'].resources[ResourceType.Money].production, 1)
  t.is(state.playerState['b'].resources[ResourceType.Money].count, 42)
})

test('City Tiles', t => {
  let state = getStateAfterActions()
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
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].resources[ResourceType.Energy].production = 1

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Immigrant City',
    resources: {Money: 13},
    choices: [null, null, {location: [-4, 4]}],
  })

  // Triggers itself
  t.deepEqual(state.playerState['a'].resources[ResourceType.Money].production, -1)
})

// Oceans
test('Oceans card', t => {
  let state = getStateAfterActions()
  state.globalParameters.Heat = 0
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].resources[ResourceType.Energy].production = 1

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Lake Marineris',
    resources: {Money: 18},
    choices: [{location: [0, 0]}, {location: [-1, 0]}],
  })

  t.is(state.map['0,0'].type, TileType.Ocean)
  t.deepEqual(state.playerState['a'].TR, 22)
})

test('Oceans card with invalid choice', t => {
  let state = getStateAfterActions()
  state.globalParameters.Heat = 0
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].resources[ResourceType.Energy].production = 1
  t.throws(() =>
    handleAction(state, {
      type: UserAction.Action,
      actionType: TurnAction.PlayCard,
      card: 'Lake Marineris',
      resources: {Money: 18},
      choices: [{locations: [[3, 3], [-1, 0]]}],
    })
  )
})

// Standard Projects

test('Project: Sell Patents', t => {
  let state = getStateAfterActions()
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.playerState['a'].hand = ['r', 's', 't']

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    project: StandardProject.SellPatents,
    choices: [{cards: ['r', 's']}],
  })

  t.is(state.playerState['a'].resources[ResourceType.Money].count, 32)
  t.deepEqual(state.playerState['a'].hand, ['t'])
})

test('Project: Power Plant', t => {
  let state = getStateAfterActions()
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
  let state = getStateAfterActions()
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
  t.is(state.globalParameters.Heat, 2)
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 16)
  t.is(state.actionsDone, 1)
})

test('Project: Aquifer', t => {
  let state = getStateAfterActions()
  state.globalParameters.Heat = 0
  state.player = 'a'
  state.playerState['a'].resources[ResourceType.Money].count = 30

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.StandardProject,
    project: StandardProject.Aquifer,
    choices: [null, {location: [0, 0]}],
  })
  t.is(state.playerState['a'].TR, 21)
  t.is(state.globalParameters.Oceans, 1)
  t.is(state.playerState['a'].resources[ResourceType.Money].count, 12)
  t.is(state.actionsDone, 1)
})

test('Project: Greenery', t => {
  let state = getStateAfterActions()
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
  let state = getStateAfterActions()
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
  t.is(state.generation, 2)
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
  t.is(state.generation, 2)
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
  t.is(state.generation, 2)
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
  t.is(state.generation, 2)
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

test('Card Actions: AI Central', t => {
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
    resources: {Money: 3},
    choices: [null, {player: 'b'}],
  })

  t.is(state.playerState['b'].resources[ResourceType.Money].production, 0)
  t.is(state.playerState['a'].resources[ResourceType.Money].production, 2)
})

// After-action choices

test('Choices: DrawAndChoose', t => {
  let state = getStateAfterActions()
  state.playerState['a'].hand = ['Business Contacts']
  state.playerState['a'].resources[ResourceType.Money].count = 30
  state.player = 'a'

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.PlayCard,
    card: 'Business Contacts',
    resources: {Money: 7},
    choices: [],
  })

  t.is(state.phase, Phase.Choices)
  t.is((<KeepCardsChoice>state.playerState['a'].choices[0]).nKeep, 2)
  t.is(state.actionsDone, 0)

  handleAction(state, {
    type: UserAction.Choices,
    choices: [
      {
        cards: ['Acquired Company', 'Underground Detonations'],
      },
    ],
  })

  t.is(state.playerState['a'].hand.length, 2)
  t.is(state.actionsDone, 1)
})

test('Choices: Ocean after Heat', t => {
  let state = getStateAfterActions()
  state.playerState['a'].hand = ['Business Contacts']
  state.playerState['a'].resources[ResourceType.Heat].count = 8
  state.globalParameters.Heat = -2
  state.player = 'a'

  handleAction(state, {
    type: UserAction.Action,
    actionType: TurnAction.RaiseHeat,
  })

  t.is(state.phase, Phase.Choices)
  t.is(state.playerState['a'].choices[0].type, 'PlaceOcean')
  t.is(state.actionsDone, 0)

  handleAction(state, {
    type: UserAction.Choices,
    choices: [
      {
        location: [0, 0],
      },
    ],
  })

  t.is(state.map['0,0'].type, TileType.Ocean)
  t.is(state.actionsDone, 1)
})
