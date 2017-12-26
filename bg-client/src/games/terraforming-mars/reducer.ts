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

export const uiPlayCard = card => ({
  type: 'UI_PLAY_CARD',
  card,
})

export const chooseTile = tile => ({
  type: 'CHOOSE_TILE',
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

// const STATE = TerraformingMars.getInitialState(['a', 'b', 'c'])
const STATE = getStateAfterActions()
STATE.playerState.a.hand = CARDS.slice(0, 50).map(x => x.name)
// const STATE = getStateBeforeDraft()

const game = (state = TerraformingMars.getClientState(STATE, 'a'), action) => {
  return state
}

const NEEDS_CHOICE = {
  PlaceOceans: () => ({type: 'tile', tileType: TileType.Ocean}),
  PlaceGreenery: () => ({type: 'tile', tileType: TileType.Greenery}),
  PlaceCity: () => ({type: 'tile', tileType: TileType.City}),
  SellCards: () => ({type: 'cards', text: 'Choose cards to sell.'}),
  DecreaseAnyProduction: () => ({type: 'player', text: 'Choose player to remove ...'}),
  DecreaseAnyInventory: () => ({type: 'player', text: 'Choose player to remove ...'}),
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
      return [[...choices], NEEDS_CHOICE[effects[i][0]]()]
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

    if (action.type === 'UI_PLAY_CARD') {
      // Go into resource choosing mode...
      return {
        ...state,
        phase: 'CardCost',
        action: {
          actionType: TurnAction.PlayCard,
          card: action.card,
        },
      }
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
    if (state.choice.type === 'tile' && action.type === 'CHOOSE_TILE') {
      newChoices = [...state.choices, {location: action.tile}]
    }
    if (state.choice.type === 'player' && action.type === 'UI_CHOOSE_PLAYER') {
      newChoices = [...state.choices, {player: action.player}]
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
