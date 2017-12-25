import {combineReducers} from 'redux'

import {TerraformingMars} from '../../../../games/terraforming-mars/src/index'
import {UserAction, TurnAction, TileType} from '../../../../games/terraforming-mars/src/types'
import {
  getStateAfterActions,
  getStateBeforeDraft,
} from '../../../../games/terraforming-mars/src/fixtures'
import {STANDARD_PROJECTS} from '../../../../games/terraforming-mars/src/projects'

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

export const fFundAward = award => ({
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
  type: 'START_STANDARD_PROJECT',
  project,
})

export const chooseTile = tile => ({
  type: 'CHOOSE_TILE',
  tile,
})

// const STATE = TerraformingMars.getInitialState(['a', 'b', 'c'])
const STATE = getStateAfterActions()
// const STATE = getStateBeforeDraft()

const game = (state = TerraformingMars.getClientState(STATE, 'a'), action) => {
  return state
}

const NEEDS_CHOICE = {
  PlaceOceans: () => ({type: 'tile', tileType: TileType.Ocean}),
  PlaceGreenery: () => ({type: 'tile', tileType: TileType.Greenery}),
  PlaceCity: () => ({type: 'tile', tileType: TileType.City}),
  SellCards: () => ({type: 'cards', text: 'Choose cards to sell.'}),
}

interface UIState {
  phase: string
  action?: any
  choice?: any
  choices?: any
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
  if (state.phase === 'Game') {
    if (action.type === 'START_STANDARD_PROJECT') {
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
        action: {
          actionType: TurnAction.StandardProject,
          project: action.project,
        },
      }
    }
  }
  if (state.phase === 'Choices') {
    if (state.choice.type === 'tile' && action.type === 'CHOOSE_TILE') {
      // TODO: projects only.
      const project = STANDARD_PROJECTS[state.action.project]
      const newChoices = [...state.choices, {location: action.tile}]
      const [choices, nextChoice] = getNextChoice(project.effects, newChoices)
      if (!nextChoice) {
        // Action is done -- send.
        return UI_STATE
      }
      return {
        ...state,
        choice: nextChoice,
        choices,
      }
    }
  }
  return state
}

export const reducer = combineReducers({game, ui})
