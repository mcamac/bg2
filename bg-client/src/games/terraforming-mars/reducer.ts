import {combineReducers} from 'redux'

import {TerraformingMars} from '../../../../games/terraforming-mars/src/index'
import {UserAction, TurnAction, TileType} from '../../../../games/terraforming-mars/src/types'
import {
  getStateAfterActions,
  getStateBeforeDraft,
} from '../../../../games/terraforming-mars/src/fixtures'
import {STANDARD_PROJECTS} from '../../../../games/terraforming-mars/src/projects'
import {getCardByName, CARDS} from '../../../../games/terraforming-mars/src/cards'

export const draftChoice = card => ({
  type: UserAction.DraftRoundChoice,
  choice: card,
})

export const CardAction = (card, i) => ({
  type: UserAction.Action,
  actionType: TurnAction.CardAction,
  card: card,
  index: i,
})

export const ClaimMilestone = milestone => ({
  type: UserAction.Action,
  actionType: TurnAction.ClaimMilestone,
  milestone,
})

export const FundAward = award => ({
  type: UserAction.Action,
  actionType: TurnAction.FundAward,
  award,
})

export const PlayCard = (card, choices) => ({
  type: UserAction.Action,
  actionType: TurnAction.PlayCard,
  card,
  choices,
})

const StandardProject = (project, choices) => ({
  type: UserAction.Action,
  actionType: TurnAction.StandardProject,
  project,
  choices,
})

export const startStandardProject = project => ({
  type: 'UI_STANDARD_PROJECT',
  project,
})

export const uiClickCard = card => ({
  type: 'UI_CLICK_CARD',
  card,
})

export const uiCardAction = (card, index) => ({
  type: 'UI_CARD_ACTION',
  card,
  index,
})

export const chooseTile = tile => ({
  type: 'UI_CHOOSE_TILE',
  tile,
})

export const uiCancel = () => ({
  type: 'UI_CANCEL',
})

export const uiSetCardCost = resources => ({
  type: 'UI_SET_CARD_COST',
  resources,
})

export const uiChoosePlayer = player => ({
  type: 'UI_CHOOSE_PLAYER',
  player,
})

export const uiSubmitChoice = () => ({
  type: 'UI_SUBMIT_CHOICE',
})

export const uiPlantGreenery = () => ({
  type: 'UI_PLANT_GREENERY',
})

export const uiHeatTemperature = () => ({
  type: 'UI_HEAT_TEMPERATURE',
})

// const STATE = TerraformingMars.getInitialState(['a', 'b', 'c'])
const STATE = getStateAfterActions()
STATE.playerState.a.hand = CARDS.slice(0, 50).map(x => x.name)
STATE.playerState.a.played = ['Tardigrades', 'Symbiotic Fungus']
// const STATE = getStateBeforeDraft()

const game = (state = TerraformingMars.getClientState(STATE, 'a'), action) => {
  return state
}

const NEEDS_CHOICE = {
  PlaceOceans: () => ({type: 'tile', tileType: TileType.Ocean}),
  PlaceGreenery: () => ({type: 'tile', tileType: TileType.Greenery}),
  PlaceCity: () => ({type: 'tile', tileType: TileType.City}),
  SellCards: () => ({type: 'cards', text: 'Choose cards to sell.', chosen: {}, confirm: true}),
  DecreaseAnyProduction: () => ({type: 'player', text: 'Choose player to remove ...'}),
  DecreaseAnyInventory: () => ({type: 'player', text: 'Choose player to remove ...'}),
  ChangeAnyCardResource: (count, resource) => ({
    type: 'playedCard',
    resource,
    text: 'Choose a card to remove ...',
  }),
}

interface UIState {
  phase: string
  action?: any
  choiceSource?: string
  choice?: any
  choices?: any
  effects?: any[]
  card?: string
}

const UI_STATE: UIState = {
  phase: 'Game',
  action: {},
}

const getNextChoice = (effects, choices) => {
  for (var i = choices.length; i < effects.length; i++) {
    if (NEEDS_CHOICE[effects[i][0]]) {
      console.log(effects[i])
      return [[...choices], NEEDS_CHOICE[effects[i][0]](...effects[i].slice(1))]
    }
    choices.push(null)
  }
  return [[...choices], null]
}

const ui = (state = UI_STATE, action) => {
  if (action.type === 'UI_CANCEL') {
    return UI_STATE
  }

  if (state.phase === 'Game') {
    if (action.type === 'UI_STANDARD_PROJECT') {
      const project = STANDARD_PROJECTS[action.project]
      const [choices, nextChoice] = getNextChoice(project.effects, [])
      if (!nextChoice) {
        // Action is done -- send.
        return state
      }
      return {
        ...state,
        phase: 'Choices',
        choiceSource: 'Project',
        choice: nextChoice,
        choices,
        effects: project.effects,
        action: {
          actionType: TurnAction.StandardProject,
          project: action.project,
        },
      }
    }

    if (action.type === 'UI_CARD_ACTION') {
      const card = getCardByName(action.card)
      const effects = card.actions[action.index]
      const newAction = {
        actionType: TurnAction.CardAction,
        card: action.card,
        index: action.index,
      }

      const [choices, nextChoice] = getNextChoice(effects, [])
      if (!nextChoice) {
        // Action is done -- send.
        console.log('Card Action', {...newAction, choices: []})
        return state
      }
      return {
        ...state,
        phase: 'Choices',
        choice: nextChoice,
        choices,
        effects: effects,
        action: newAction,
      }
    }

    if (action.type === 'UI_CLICK_CARD') {
      // Play card -- go into resource choosing mode...
      return {
        ...state,
        phase: 'CardCost',
        action: {
          actionType: TurnAction.PlayCard,
          card: action.card,
        },
      }
    }

    if (action.type === 'UI_PLANT_GREENERY') {
      const [choices, nextChoice] = getNextChoice([['PlaceGreenery']], [])
      return {
        ...state,
        phase: 'Choices',
        choiceSource: 'Greenery',
        choice: nextChoice,
        choices,
        effects: [['PlaceGreenery']],
        action: {
          actionType: TurnAction.PlayCard,
        },
      }
    }

    if (action.type === 'UI_HEAT_TEMPERATURE') {
      /// Raise heat
      return UI_STATE
    }
  }
  if (state.phase === 'CardCost') {
    if (action.type === 'UI_SET_CARD_COST') {
      const card = getCardByName(state.action.card)
      console.log('play', card)
      const newAction = {...state.action, resources: action.resources}

      if (!card.effects) {
        // Just play it.
        console.log('Play Card', newAction)
        return UI_STATE
      }

      const [choices, nextChoice] = getNextChoice(card.effects, [])
      if (!nextChoice) {
        console.log('Play Card', newAction)
        // Action is done -- send.
        return UI_STATE
      }
      return {
        ...state,
        action: newAction,
        phase: 'Choices',
        choiceSource: state.card,
        choice: nextChoice,
        choices,
        effects: card.effects,
      }
    }
  }

  if (state.phase === 'Choices') {
    let newChoices
    if (state.choice.type === 'tile' && action.type === 'UI_CHOOSE_TILE') {
      newChoices = [...state.choices, {location: action.tile}]
    }
    if (state.choice.type === 'player' && action.type === 'UI_CHOOSE_PLAYER') {
      newChoices = [...state.choices, {player: action.player}]
    }
    if (state.choice.type === 'cards' && action.type === 'UI_CLICK_CARD') {
      let chosenCards = state.choice.chosen
      chosenCards = {...chosenCards, [action.card]: !chosenCards[action.card]}

      return {
        ...state,
        choice: {
          ...state.choice,
          chosen: chosenCards,
        },
      }
    }
    if (state.choice.type === 'playedCard' && action.type === 'UI_CLICK_CARD') {
      newChoices = [...state.choices, {card: action.card}]
    }
    if (state.choice.type === 'cards' && action.type === 'UI_SUBMIT_CHOICE') {
      newChoices = [
        ...state.choices,
        {
          cards: Object.keys(state.choice.chosen).filter(key => state.choice.chosen[key]),
        },
      ]
    }

    if (newChoices) {
      const [choices, nextChoice] = getNextChoice(state.effects, newChoices)
      if (!nextChoice) {
        // Action is done -- send.
        console.log('Finish Action', {...state.action, choices: newChoices})
        return UI_STATE
      }
      return {
        ...state,
        choice: nextChoice,
        choices,
      }
    }
    return state
  }
  return state
}

export const reducer = combineReducers({game, ui})
