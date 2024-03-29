import {getInitialGameState} from '../index'
import {UserAction, ResourceType, TileType} from '../types'
import {handleAction} from '../index'

const TEST_SEED = 'martin'

export const getStateAfterActions = () => {
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
  handleAction(state, {
    type: UserAction.CorpAndCardsChoice,
    player: 'b',
    corporation: 'Beginner Corporation',
    cards: state.choosingCards['b'], // ALL THE CARDS FOR FREE!!!
  })

  return state
}

export const getSoloStateAfterActions = (seed: string) => {
  let state = getInitialGameState(['a'], seed || TEST_SEED)
  state.firstPlayer = 'a'

  // todo: place two cities and greeneries randomly
  state.map['-2,2'] = {type: TileType.City, owner: '__NEUTRAL'}

  handleAction(state, {
    type: UserAction.CorpAndCardsChoice,
    player: 'a',
    corporation: 'Beginner Corporation',
    cards: state.choosingCards['a'], // ALL THE CARDS FOR FREE!!!
  })

  return state
}

export const getStateBeforeDraft = () => {
  const state = getStateAfterActions()

  handleAction(state, {
    type: UserAction.Pass,
    player: 'a',
  })

  handleAction(state, {
    type: UserAction.Pass,
    player: 'b',
  })

  return state
}
