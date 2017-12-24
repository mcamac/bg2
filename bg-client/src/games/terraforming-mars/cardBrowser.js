import {Card, Corporation} from './index'
import {CARDS, getCardByName} from '../../../../games/terraforming-mars/src/cards'
import {
  CORPORATIONS,
  getCorporationByName,
} from '../../../../games/terraforming-mars/src/corporations'

const CardBrowser = props => (
  <div style={{fontFamily: 'Rubik', width: 270}}>
    {CORPORATIONS.map(corp => (
      <div key={corp.name}>
        <Corporation name={corp.name} />
      </div>
    ))}
    {CARDS.map(card => (
      <div key={card.name}>
        <Card name={card.name} />
        {card.todo && <div>TODO</div>}
      </div>
    ))}
  </div>
)

export default CardBrowser
