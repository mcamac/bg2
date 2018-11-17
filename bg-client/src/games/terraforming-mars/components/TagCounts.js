import {Box, Flex} from 'grid-styled'
import {connect} from 'react-redux'

import Tag from './Tag'
import {getCardByName} from '../../../../../games/terraforming-mars/src/cards'

const TAGS = [
  'Event',
  'Building',
  'Space',
  'Plant',
  'Microbe',
  'Science',
  'Power',
  'Earth',
  'Jovian',
]

const TagCounts = props => (
  <Flex>
    {TAGS.map(tag => (
      <Flex mr={1}>
        <Tag name={tag} /> {props.counts[tag]}
      </Flex>
    ))}
  </Flex>
)

export default connect(state => {
  const tagCounts = {}
  TAGS.forEach(tag => (tagCounts[tag] = 0))
  const played = state.game.playerState[state.player].played.map(getCardByName)
  played.forEach(card => {
    if (card.tags) {
      card.tags.forEach(tag => {
        if (TAGS.indexOf(tag) !== -1) {
          tagCounts[tag] += 1
        }
      })
    }
  })
  return {
    counts: tagCounts,
  }
})(TagCounts)
