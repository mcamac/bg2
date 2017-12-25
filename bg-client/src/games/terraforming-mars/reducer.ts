import {TerraformingMars} from '../../../../games/terraforming-mars/src/index'
import {UserAction, TurnAction} from '../../../../games/terraforming-mars/src/types'
import {
  getStateAfterActions,
  getStateBeforeDraft,
} from '../../../../games/terraforming-mars/src/fixtures'

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

export const StandardProject = (project, choices) => ({
  type: UserAction.Action,
  actionType: TurnAction.StandardProject,
  project,
  choices,
})

// const STATE = TerraformingMars.getInitialState(['a', 'b', 'c'])
const STATE = getStateAfterActions()
// const STATE = getStateBeforeDraft()

export const reducer = (state = TerraformingMars.getClientState(STATE, 'a'), action) => {
  return state
}
