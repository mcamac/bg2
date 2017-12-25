import {TerraformingMars} from '../../../../games/terraforming-mars/src/index'
import {UserAction} from '../../../../games/terraforming-mars/src/types'
import {
  getStateAfterActions,
  getStateBeforeDraft,
} from '../../../../games/terraforming-mars/src/fixtures'

export const draftChoice = card => ({
  type: UserAction.DraftRoundChoice,
  choice: card,
})

// const STATE = TerraformingMars.getInitialState(['a', 'b', 'c'])
// const STATE = getStateAfterActions()
const STATE = getStateBeforeDraft()

export const reducer = (state = TerraformingMars.getClientState(STATE, 'a'), action) => {
  return state
}
