import {Transform, GameState, Player, Card} from './types'

const N_INITIAL_CARDS = 10
const N_DRAFT_CARDS = 4

export const draw = (n: number, state: GameState): [string[], GameState] => {
  let drawn: string[] = []
  for (let i = 0; i < n; i++) {
    drawn.push(state.deck.splice(0, 1)[0])
    // todo: handle reshuffling of discards
  }
  return [drawn, state]
}

export const setupDraft: Transform = state => {
  const draft = state.draft
  const drawResult = draw(N_DRAFT_CARDS * state.players.length, state)
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

export const handlePlayerChoice = (state: GameState, player: Player, choice: string): GameState => {
  const playerIndex = state.players.indexOf(player)
  const currentChoices = state.draft[player].queued[0]
  const chosenIndex = currentChoices.findIndex(c => c === choice)
  state.draft[player].taken.push(choice)
  state.draft[player].queued.splice(0, 1)

  // Pass rest of cards to next player.
  currentChoices.splice(chosenIndex, 1)
  const nextPlayer =
    state.players[
      (playerIndex + (state.generation % 2 === 0 ? -1 : 1) + state.players.length) %
        state.players.length
    ]
  if (currentChoices.length >= 2) state.draft[nextPlayer].queued.push([...currentChoices])
  else if (currentChoices.length === 1) state.draft[nextPlayer].taken.push(currentChoices[0])

  return state
}

export const isDraftDone = (state: GameState): boolean => {
  return state.players
    .map(player => state.draft[player].taken.length === N_DRAFT_CARDS)
    .every(x => x)
}

export const setupInitialHands = state => {
  const choosingCards = state.choosingCards
  const drawResult = draw(state.players.length * N_INITIAL_CARDS, state)
  const cards = drawResult[0]
  state = drawResult[1]

  state.players.forEach((player, i) => {
    choosingCards[player] = cards.slice(N_INITIAL_CARDS * i, N_INITIAL_CARDS * (i + 1))
  })

  return state
}
