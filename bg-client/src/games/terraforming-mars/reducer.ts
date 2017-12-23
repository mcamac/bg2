import {TerraformingMars} from '../../../../games/terraforming-mars/src/index'

const STATE = TerraformingMars.getInitialState(['a', 'b', 'c'])

export const reducer = (state = TerraformingMars.getClientState(STATE, 'a'), action) => {
  return state
}
