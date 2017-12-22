import {Transform, GameState, Player, Card} from './types'

export const draw = (n: number, state: GameState): [Card[], GameState] => {
  return [[], state]
}

const setupDraft: Transform = state => {
  const draft = state.draft
  const drawResult = draw(16, state)
  const cards = drawResult[0]
  state = drawResult[1]

  state.players.forEach((player, i) => {
    draft[player] = {
      taken: [],
      queued: [cards.slice(4 * i, 4 * (i + 1))],
    }
  })

  return state
}

const handlePlayerChoice = (state: GameState, player: Player, choice: Card): GameState => {
  const playerIndex = state.players.indexOf(player)
  const currentChoices = state.draft[player].queued[0]
  const chosenIndex = currentChoices.findIndex(c => c.name === choice.name)
  state.draft[player].taken.push(choice)
  state.draft[player].queued.splice(0, 1)

  // Pass rest of cards to next player.
  const choicesLeft = currentChoices.splice(chosenIndex, 1)
  const nextPlayer =
    state.players[
      (playerIndex + (state.generation % 0 === 1 ? 1 : -1) + state.players.length) %
        state.players.length
    ]
  state.draft[nextPlayer].queued.push(choicesLeft)

  return state
}

const checkDraftFinished = (state: GameState): boolean => {
  return state.players.map(player => state.draft[player].taken.length === 4).every(x => x)
}
