import {combineReducers} from 'redux'
import {get} from 'lodash'

import {TerraformingMars, handleAction} from '../../../../games/terraforming-mars/src/index'
import {UserAction, TurnAction, TileType} from '../../../../games/terraforming-mars/src/types'
import {
  getStateAfterActions,
  getStateBeforeDraft,
} from '../../../../games/terraforming-mars/src/fixtures'
import {STANDARD_PROJECTS} from '../../../../games/terraforming-mars/src/projects'
import {getCardByName, CARDS} from '../../../../games/terraforming-mars/src/cards'
import {cloneState} from '../../../../games/terraforming-mars/src/utils'

export const draftChoice = (card, player) => ({
  type: UserAction.DraftRoundChoice,
  choice: card,
  player: player,
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

export const uiPass = () => ({
  type: 'UI_PASS',
})

export const uiCede = () => ({
  type: 'UI_CEDE',
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

export const uiSubmitBuyChoice = () => ({
  type: 'UI_SUBMIT_BUY_CHOICE',
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

const ACTIONS = {
  Pass: 1,
  Action: 1,
  DraftRoundChoice: 1,
}

const game = (state = STATE, action) => {
  if (ACTIONS[action.type]) {
    return handleAction(cloneState(state), action)
  }
  return state
}

const NEEDS_CHOICE = {
  PlaceOceans: () => ({type: 'tile', tileType: TileType.Ocean}),
  PlaceGreenery: () => ({type: 'tile', tileType: TileType.Greenery}),
  PlaceGreeneryOnOcean: () => ({type: 'tile', tileType: TileType.Greenery}),
  PlaceNaturalPreserve: () => ({type: 'tile', tileType: TileType.NaturalPreserve}),
  PlaceCity: () => ({type: 'tile', tileType: TileType.City}),
  PlaceIndustrialCenter: () => ({type: 'tile', tileType: TileType.IndustrialCenter}),
  PlaceResearchOutpost: () => ({type: 'tile', tileType: TileType.City}),
  PlaceRestrictedArea: () => ({type: 'tile', tileType: TileType.RestrictedArea}),
  PlaceMiningRights: () => ({type: 'tile', tileType: TileType.MiningRights}),
  SellCards: () => ({type: 'cards', text: 'Choose cards to sell.', chosen: {}, confirm: true}),
  DecreaseAnyProduction: () => ({type: 'player', text: 'Choose player to remove ...'}),
  DecreaseAnyInventory: () => ({type: 'player', text: 'Choose player to remove ...'}),
  ChooseX: () => ({type: 'number'}),
  MultiCost: () => ({type: 'cost'}),
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
  chosen?: any
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

const ui = (state = UI_STATE, action, game = <any>{}, player) => {
  if (action.type === 'UI_CANCEL') {
    return UI_STATE
  }
  if (game.phase === 'CardBuying') {
    if (!state.chosen) state.chosen = <any>{}

    if (action.type === 'UI_CLICK_CARD') {
      let chosenCards = state.chosen
      chosenCards = {...chosenCards, [action.card]: !chosenCards[action.card]}

      return {
        ...state,
        chosen: chosenCards,
      }
    }

    if (action.type === 'UI_SUBMIT_BUY_CHOICE') {
      const chosen = Object.keys(state.chosen).filter(key => state.chosen[key])
      action.asyncDispatch({type: UserAction.BuyCards, chosen})
      return UI_STATE
    }
  }

  // TODO: Combine with above.
  if (
    game.phase === 'Choices' &&
    get(game.playerState, [player, 'choices', 0, 'type']) === 'KeepCards'
  ) {
    if (!state.chosen) state.chosen = <any>{}

    if (action.type === 'UI_CLICK_CARD') {
      let chosenCards = state.chosen
      chosenCards = {...chosenCards, [action.card]: !chosenCards[action.card]}

      return {
        ...state,
        chosen: chosenCards,
      }
    }

    if (action.type === 'UI_SUBMIT_CHOICE') {
      const chosen = Object.keys(state.chosen).filter(key => state.chosen[key])
      action.asyncDispatch({type: UserAction.Choices, choices: [{cards: chosen}]})
      return UI_STATE
    }
  }

  if (
    game.phase === 'Choices' &&
    get(game.playerState, [player, 'choices', 0, 'type']) === 'PlaceOcean'
  ) {
    if (action.type === 'UI_CHOOSE_TILE') {
      action.asyncDispatch({type: UserAction.Choices, choices: [{location: action.tile}]})
    }
  }

  if (game.phase === 'Actions' && game.player !== player) {
    return state
  }

  if (game.phase === 'Actions' && state.phase === 'Game') {
    if (action.type === 'UI_STANDARD_PROJECT') {
      const project = STANDARD_PROJECTS[action.project]
      const [choices, nextChoice] = getNextChoice(project.effects, [])
      const newAction = {
        type: UserAction.Action,
        actionType: TurnAction.StandardProject,
        project: action.project,
      }
      if (!nextChoice) {
        // Action is done -- send.
        action.asyncDispatch(newAction)
        return state
      }
      return {
        ...state,
        phase: 'Choices',
        choiceSource: 'Project',
        choice: nextChoice,
        choices,
        effects: project.effects,
        action: newAction,
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
        action.asyncDispatch({...newAction, choices: [], type: UserAction.Action})
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

    if (action.type === 'UI_PASS') {
      action.asyncDispatch({type: UserAction.Pass})
      return state
    }

    if (action.type === 'UI_CEDE') {
      action.asyncDispatch({type: UserAction.Cede})
      return state
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
          type: UserAction.Action,
          actionType: TurnAction.PlantGreenery,
        },
      }
    }

    if (action.type === 'UI_HEAT_TEMPERATURE') {
      /// Raise heat
      action.asyncDispatch({type: UserAction.Action, actionType: TurnAction.RaiseHeat})
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
        action.asyncDispatch({...newAction, type: UserAction.Action})
        return UI_STATE
      }

      const [choices, nextChoice] = getNextChoice(card.effects, [])
      if (!nextChoice) {
        console.log('Play Card', newAction)
        action.asyncDispatch({...newAction, type: UserAction.Action})
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
        const newAction = {...state.action, choices: newChoices}
        console.log('Finish Action', newAction)
        action.asyncDispatch({...newAction, type: UserAction.Action})
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

export const reducer = (state = <any>{}, action) => {
  if (action.type === 'SERVER_MESSAGE' && action.data.type === 'MOVE_ERROR') {
    console.warn('MOVE_ERROR', action.data.error)
  } else if (action.type === 'SERVER_MESSAGE' && action.data.room) {
    return {
      game: action.data.room.game,
      player: location.hash.slice(1),
      ui: state.ui,
    }
  }

  if (ACTIONS[action.type]) {
    action.asyncDispatch(action)
  }
  // const gameState = game(state.server, action)
  // console.log('dfdafd', gameState)
  const newState = {
    ...state,
    ui: ui(state.ui, action, state.game, state.player),
  }
  return newState
}
