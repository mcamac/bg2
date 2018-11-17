import {CARDS, getCardByName} from '../../../../games/terraforming-mars/src/cards'
import {
  CORPORATIONS,
  getCorporationByName,
} from '../../../../games/terraforming-mars/src/corporations'
import {Card, Corporation} from './components/Card'

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
      </div>
    ))}
  </div>
)

export default CardBrowser
