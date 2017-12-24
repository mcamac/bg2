import {TerraformingMars} from '../../../../games/terraforming-mars/src/index'
import {
  getStateAfterActions,
  getStateBeforeDraft,
} from '../../../../games/terraforming-mars/src/fixtures'

// const STATE = TerraformingMars.getInitialState(['a', 'b', 'c'])
// const STATE = getStateAfterActions()
const STATE = getStateBeforeDraft()

export const reducer = (state = TerraformingMars.getClientState(STATE, 'a'), action) => {
  return state
}
