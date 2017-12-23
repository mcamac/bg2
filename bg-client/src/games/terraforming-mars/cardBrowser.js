import {Card} from './index'
import {CARDS, getCardByName} from '../../../../games/terraforming-mars/src/cards'

const CardBrowser = props => (
  <div style={{fontFamily: 'Rubik', width: 270}}>
    {CARDS.map(card => (
      <div key={card.name}>
        <Card name={card.name} />
        {card.todo && <div>TODO</div>}
      </div>
    ))}
  </div>
)

export default CardBrowser
