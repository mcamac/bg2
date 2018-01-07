import React, {Fragment, Component} from 'react'
import styled from 'styled-components'
import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {
  compose,
  pure,
  branch,
  renderNothing,
  withProps,
  withState,
  withStateHandlers,
} from 'recompose'
import {toPairs, get, reverse} from 'lodash/fp'

import {
  reducer,
  draftChoice,
  startStandardProject,
  uiClickCard,
  uiCancel,
  uiSetCardCost,
  uiChoosePlayer,
  uiSubmitChoice,
  uiPlantGreenery,
  uiHeatTemperature,
  uiCardAction,
  uiPass,
  uiSubmitBuyChoice,
  uiCede,
} from './reducer'
import {Grid} from './Grid'
import GameLog from './GameLog'
import {Icon, Tag} from './components'

import {CARDS, getCardByName} from '../../../../games/terraforming-mars/src/cards'
import {getCorporationByName} from '../../../../games/terraforming-mars/src/corporations'
import {StandardProject, Phase} from '../../../../games/terraforming-mars/src/types'
import {STANDARD_PROJECTS} from '../../../../games/terraforming-mars/src/projects'
import AnimateOnChange from './animator'

import cs from './index.css'

console.log(CARDS)

const Wrapper = styled(Flex)`
  font-family: Rubik;
  height: 100%;
`

const CARD_COLORS = {
  Active: '#c1e4f9',
  Event: '#ffc0c0',
  Automated: '#95F58D',
  Corporation: '#e3e3e3',
}

const CardWrapper = styled(Box)`
  background: ${props => CARD_COLORS[props.type || (props.corporation && 'Corporation')]};
  border: ${props => props.selected && '1px solid black'};
  min-width: 250px;
  font-size: 13px;
  margin-bottom: 5px;
  box-shadow: 0px 1px 1px 1px #eee;
  box-sizing: border-box;
  cursor: pointer;

  transition: 0.2s all;

  &:hover {
    box-shadow: 0px 1px 4px 5px ${props => CARD_COLORS[props.type] || '#aaa'};
  }
`

const requiresByType = (type, count, tag) => {
  if (type === 'MinHeat')
    return (
      <Flex align="center">
        <Icon g="Temp" /> <Box>≥ {count}</Box>
      </Flex>
    )
  else if (type === 'MaxHeat')
    return (
      <Flex align="center">
        <Icon g="Temp" /> ≤ {count}
      </Flex>
    )
  else if (type === 'MinOceans')
    return (
      <Flex align="center">
        <Icon g="Ocean" /> <Box>≥ {count}</Box>
      </Flex>
    )
  else if (type === 'MaxOceans')
    return (
      <Flex align="center">
        <Icon g="Ocean" /> ≤ {count}
      </Flex>
    )
  else if (type === 'MinOxygen')
    return (
      <Flex align="center">
        <Icon g="Oxygen" /> <Box>≥ {count}</Box>
      </Flex>
    )
  else if (type === 'MaxOxygen')
    return (
      <Flex align="center">
        <Icon g="Oxygen" /> ≤ {count}
      </Flex>
    )
  else if (type === 'HasTags')
    return (
      <Flex align="center">
        {count >= 2 && count} <Tag name={tag} />
      </Flex>
    )
  return type
}

const CardRequirements = ({requires}) => (
  <Flex px="4px" ml="4px" style={{background: 'rgba(255, 255, 255, 0.5)'}}>
    {requires.map(([type, ...args], i) => <Box key={i}>{requiresByType(type, ...args)}</Box>)}
  </Flex>
)

const withSign = value => (value >= 0 ? `+${value}` : `${value}`)

const ChangeProduction = (value, resource) => (
  <Flex mr="4px" style={{background: '#8a5d5d', color: '#eee', padding: '3px'}}>
    {typeof value === 'number' ? withSign(value) : Effect(...value)}
    <Icon g={resource} />
  </Flex>
)

const ChangeInventory = (value, resource) => (
  <Flex align="center">
    {typeof value === 'number' ? withSign(value) : Effect(...value)}
    {typeof resource === 'string' ? <Icon g={resource} /> : resource}
  </Flex>
)

const ChangeCardResource = (value, card) => (
  <Flex align="center">
    <Box>{withSign(value)}</Box>
    <Box px="4px">
      <Icon g={card.resourceHeld} />
    </Box>
    <Box> on card</Box>
  </Flex>
)

const ChangeAnyCardResource = (value, resource) => (
  <Flex align="center">
    <Box>{withSign(value)}</Box>
    {typeof resource === 'string' ? <Icon g={resource} /> : resource}
    <Box> any card</Box>
  </Flex>
)

const DecreaseAnyProduction = (value, resource) => (
  <Flex mr="4px" style={{background: '#8a5d5d', color: '#eee', padding: 3}}>
    Remove any {value}
    <Icon g={resource} />
  </Flex>
)

const DecreaseAnyInventory = (value, resource) => (
  <Flex>
    Remove any
    {value}
    <Icon g={resource} />
  </Flex>
)

const PlaceOceans = (value, card) => (
  <Flex mr="4px" p="3px" style={{background: '#b5b5fd'}}>
    <Icon g="Ocean" />
  </Flex>
)

const IncreaseTemperature = (value, card) => (
  <Flex>
    {withSign(value)} <Icon g="Temp" />
  </Flex>
)

const RaiseOxygen = (value, card) => (
  <Flex>
    {withSign(value)} <Icon g="Oxygen" />
  </Flex>
)
const Draw = (value, card) => (
  <Flex>
    {withSign(value)} <Icon g="Card" />
  </Flex>
)

const DrawAndChoose = (value, nKeep, card) => (
  <Flex>
    {withSign(value)} <Icon g="Card" /> keep {nKeep}
  </Flex>
)

const BuyOrDiscard = () => (
  <Flex align="center">
    <Icon g="Card" /> buy or discard
  </Flex>
)

const RoboticWorkforce = () => (
  <Flex>
    Copy the production box of any <Tag name="Building" />
  </Flex>
)

const Choice = (choices, card) => (
  <Flex align="center">
    <Box mr="4px">One of:</Box>
    {choices.map(
      ([effect, ...args], i) =>
        EFFECTS[effect] && <Box key={i}> {EFFECTS[effect](...args, card)}</Box>
    )}
  </Flex>
)

const TR = () => (
  <span
    style={{
      margin: '0 4px',
      background: '#e82f2f',
      color: 'white',
      fontWeight: 500,
      padding: '2px 4px',
    }}
  >
    TR
  </span>
)

const IncreaseTR = value => (
  <div>
    {withSign(value)} <TR />
  </div>
)
const PlaceCity = () => (
  <div>
    <Tag name="City" />
  </div>
)

const PlaceCapitalCity = () => (
  <Flex align="center">
    Capital <Tag name="City" />
  </Flex>
)

const MultiCost = (value, resources) => (
  <Flex align="center">
    Pay {value} (can use <Icon g={resources[0]} />)
  </Flex>
)

const IncreaseResourceValue = (value, resource) => (
  <Flex align="center">
    {withSign(value)} to <Icon g={resource} /> value
  </Flex>
)

const PlaceNoctis = () => (
  <Flex align="center">
    Place Noctis <Tag name="City" />
  </Flex>
)

const PlaceGreenery = () => (
  <div>
    <Tag name="Greenery" />
  </div>
)

const PlaceGreeneryOnOcean = () => (
  <Flex align="center">
    <Tag name="Greenery" /> on ocean
  </Flex>
)

const PlaceNaturalPreserve = () => <Flex align="center">Place Natural Preserve.</Flex>
const PlaceNuclearZone = () => <Flex align="center">Place Nuclear Zone.</Flex>
const PlaceMohole = () => <Flex align="center">Place Mohole on Ocean.</Flex>
const PlaceLavaFlows = () => <Flex align="center">Place Lava Flows on Volcano.</Flex>
const PlaceRestrictedArea = () => <Flex align="center">Place Restricted Area.</Flex>
const PlaceResearchOutpost = () => <Flex align="center">Place Research Outpost.</Flex>

const VPForCardResources = (resource, count) => (
  <Flex>
    1 VP / {count} <Icon g={resource} />
  </Flex>
)

const VPForTags = tag => (
  <Flex>
    1 VP / <Tag name={tag} />
  </Flex>
)

const GetTags = (tag, ratio) => (
  <Flex ailgn="center">
    1 / {ratio && ratio} <Tag name={tag} />
  </Flex>
)

const GetCities = (tag, ratio) => (
  <Flex ailgn="center">
    1 / {ratio && ratio} <Tag name="City" />
  </Flex>
)

const OffsetRequirements = value => (
  <Flex ailgn="center">
    -{value}/+{value} to global reqs.
  </Flex>
)

const GetCitiesOnMars = (tag, ratio) => (
  <Flex ailgn="center">
    1 / {ratio && ratio} <Tag name="City" /> on mars
  </Flex>
)

const VPIfCardHasResources = (resource, count, vp) => (
  <Flex>
    {vp} VP if at least {count} <Icon g={resource} />
  </Flex>
)

const CapitalCity = (resource, count, vp) => (
  <Flex>
    1 VP for adj. <Icon g="Ocean" />
  </Flex>
)

const UNTerraform = () => (
  <Flex align="center">
    If <TR /> this gen, -3 <Icon g="Money" /> +1 <TR />
  </Flex>
)

const Branch = (cond, effectsTrue, effectsFalse) => (
  <Flex align="center">
    If {requiresByType(...cond)} <CardEffects effects={effectsTrue} /> else{' '}
    <CardEffects effects={effectsFalse} />
  </Flex>
)

const ChooseX = effects => (
  <Flex align="center">
    <CardEffects effects={effects} />
  </Flex>
)

const GetX = () => 'X'

const Neg = effect => (
  <Flex align="center">
    -<CardEffects effects={[effect]} />
  </Flex>
)

const PlayedTagMatches = tags => (
  <Flex align="center">
    when{' '}
    {tags.map((tagAnd, i) => (
      <React.Fragment key={i}>
        {tagAnd.map(tag => (
          <React.Fragment key={tag}>
            <Tag name={tag} />
          </React.Fragment>
        ))}{' '}
        /
      </React.Fragment>
    ))}
  </Flex>
)

const PlayedTagMatchesAny = tags => (
  <Flex align="center">
    when any{' '}
    {tags.map((tagAnd, i) => (
      <React.Fragment key={i}>
        {tagAnd.map(tag => (
          <React.Fragment key={tag}>
            <Tag name={tag} />
          </React.Fragment>
        ))}{' '}
        /
      </React.Fragment>
    ))}
  </Flex>
)
const EFFECTS = {
  ChangeProduction,
  ChangeInventory,
  ChangeCardResource,
  ChangeAnyCardResource,
  OffsetRequirements,
  PlaceOceans,
  PlaceCity,
  PlaceNoctis,
  PlaceNuclearZone,
  PlaceMohole,
  PlaceLavaFlows,
  PlaceCapitalCity,
  PlaceGreenery,
  PlaceGreeneryOnOcean,
  PlaceRestrictedArea,
  PlaceResearchOutpost,
  PlaceNaturalPreserve,
  MultiCost,
  RaiseOxygen,
  DecreaseAnyProduction,
  DecreaseAnyInventory,
  IncreaseTemperature,
  RoboticWorkforce,
  IncreaseTR,
  IncreaseResourceValue,
  Choice,
  BuyOrDiscard,
  Draw,
  DrawAndChoose,
  VPForTags,
  VPForCardResources,
  VPIfCardHasResources,
  CapitalCity,
  GetTags,
  GetCities,
  GetCitiesOnMars,
  UNTerraform,
  Branch,
  ChooseX,
  GetX,
  Neg,
  PlayedTagMatches,
  PlayedTagMatchesAny,
}

const CardEffects = props => {
  return (
    <Flex align="center">
      {props.effects.map(([effect, ...args], i) => (
        <Box key={i}>
          {EFFECTS[effect] ? (
            EFFECTS[effect](...args, props.card)
          ) : (
            <pre>{JSON.stringify([effect, ...args], null, 2)}</pre>
          )}
        </Box>
      ))}
    </Flex>
  )
}

const ActionWrapper = styled(Flex)`
  padding: 2px 8px;
  transition: 0.2s background;

  &:hover {
    background: ${props => props.enabled && 'white'};
  }
`

let CardActions = props => (
  <Box>
    {props.actions.map((action, i) => (
      <ActionWrapper
        enabled={props.enabled}
        align="center"
        key={i}
        onClick={props.enabled && (() => props.onAction(i))}
      >
        <Box mr="4px" style={{color: '#555'}}>
          ACTION:
        </Box>
        {action.map(([effect, ...args], j) => (
          <Box key={j} align="center">
            {EFFECTS[effect] ? (
              EFFECTS[effect](...args, props.card)
            ) : (
              <pre>{JSON.stringify([effect, ...args], null, 2)}</pre>
            )}
          </Box>
        ))}
      </ActionWrapper>
    ))}
  </Box>
)

CardActions = connect(
  () => ({}),
  (dispatch, props) => ({
    onAction: i => dispatch(uiCardAction(props.card.name, i)),
  })
)(CardActions)

const Effect = (effect, ...args) =>
  EFFECTS[effect] ? (
    <Box>{EFFECTS[effect](...args)} </Box>
  ) : (
    <pre>{JSON.stringify([effect, ...args])}</pre>
  )

// const CARD_VP_TYPES = {
//   VPForCardResources,
// }

const CardVP = props => (
  <Flex ml={1} flex="1 1 auto" justify="flex-end">
    <Flex style={{padding: '2px 4px', background: 'green', color: 'white'}}>
      {typeof props.card.vp === 'number' ? `${props.card.vp} VP` : Effect(...props.card.vp)}
    </Flex>
  </Flex>
)

const CardTriggers = props => (
  <Flex ml={1} flex="1 1 auto" align="center">
    {[props.triggers].map(([cond, effects], i) => (
      <Flex key={i} align="center">
        <CardEffects effects={[cond]} card={props.card} />:
        <CardEffects effects={effects} card={props.card} />
      </Flex>
    ))}
  </Flex>
)

const CardTileTriggers = props => {
  return (
    <Flex ml={1} flex="1 1 auto" align="center">
      {props.triggers.map(([[type, yours], effects], i) => (
        <Flex key={i} align="center">
          when {yours ? 'your' : 'any'} {type}:
          <CardEffects effects={effects} card={props.card} />
        </Flex>
      ))}
    </Flex>
  )
}

const CardDiscounts = props => (
  <Flex ml={1} flex="1 1 auto" align="center">
    {props.discounts.map(([discount, tags], i) => (
      <Flex align="center">
        <Flex>{withSign(-discount)} </Flex>
        <Icon g="Money" />
        <Flex>on</Flex>
        <Flex align="center" ml="4px">
          {tags ? tags.map(tag => <Tag name={tag} key={tag} />) : 'All'}
        </Flex>
      </Flex>
    ))}
  </Flex>
)

let Card = props => (
  <CardWrapper type={props.card.type} selected={props.selected} onClick={props.onClick}>
    <Flex align="center" style={{padding: 5, borderBottom: '1px solid #aaa'}}>
      <div style={{fontWeight: 500, fontSize: 15, width: 18, color: '#333'}}>{props.card.cost}</div>
      {props.card.requires && <CardRequirements requires={props.card.requires} />}
      <Box flex="1 1 auto" style={{textAlign: 'right'}}>
        {props.name}
      </Box>
      <Flex ml={5}>{(props.card.tags || []).map(tag => <Tag key={tag} name={tag} />)}</Flex>
    </Flex>
    {props.card.actions && (
      <CardActions enabled={props.played} actions={props.card.actions} card={props.card} />
    )}
    <Flex px="5px" mt="5px" direction="column">
      <Flex align="center">
        {props.card.effects &&
          !props.collapsed && <CardEffects effects={props.card.effects} card={props.card} />}
        {props.card.discounts && (
          <CardDiscounts discounts={props.card.discounts} card={props.card} />
        )}
        {props.card.afterCardTriggers && (
          <CardTriggers triggers={props.card.afterCardTriggers} card={props.card} />
        )}
        {props.card.afterTileTriggers && (
          <CardTileTriggers triggers={props.card.afterTileTriggers} card={props.card} />
        )}
        {props.card.vp && <CardVP card={props.card} />}
      </Flex>
    </Flex>
  </CardWrapper>
)

Card = compose(pure, withProps(props => ({card: getCardByName(props.name)})))(Card)
export {Card}

let Corporation = props => (
  <CardWrapper corporation>
    <Flex align="center" style={{padding: 5, borderBottom: '1px solid #aaa'}}>
      <div style={{fontWeight: 500, fontSize: 15, width: 18, color: '#333'}}>
        {props.corp.startingMoney}
      </div>
      <Box flex="1 1 auto" style={{textAlign: 'right'}}>
        {props.corp.name}
      </Box>
      <Flex ml={5}>{(props.corp.tags || []).map(tag => <Tag key={tag} name={tag} />)}</Flex>
    </Flex>
    {props.corp.actions && <CardActions actions={props.corp.actions} card={props.corp} />}
    <Flex px="5px" my="5px" direction="column">
      <Flex align="center">
        {!props.collapsed && props.corp.text && <Box py="4px">{props.corp.text}</Box>}
        {!props.collapsed &&
          props.corp.effects && <CardEffects effects={props.corp.effects} card={props.corp} />}
        {props.corp.discounts && (
          <CardDiscounts discounts={props.corp.discounts} card={props.corp} />
        )}
        {props.corp.afterCardTriggers && (
          <CardTriggers triggers={props.corp.afterCardTriggers} card={props.corp} />
        )}
        {props.corp.afterTileTriggers && (
          <CardTileTriggers triggers={props.corp.afterTileTriggers} card={props.corp} />
        )}
      </Flex>
    </Flex>
  </CardWrapper>
)

Corporation = withProps(props => ({corp: getCorporationByName(props.name)}))(Corporation)
export {Corporation}

let GlobalParams = props => (
  <Box style={{fontSize: 14}} mb={3}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Globals
    </Box>
    {['Oceans', 'Heat', 'Oxygen'].map(param => (
      <Flex key={param}>
        <Box w={80} flex="1 1 auto">
          {param}
        </Box>
        <Box>{props.params[param]} (9 left)</Box>
      </Flex>
    ))}
  </Box>
)

GlobalParams = connect(state => ({
  params: state.game.globalParameters,
}))(GlobalParams)

const Milestones = () => (
  <Box style={{fontSize: 14}} mb={3}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Milestones
    </Box>
    {['Oceans', 'Temp', 'Oxygen'].map(param => (
      <Flex key={param}>
        <Box w={80} flex="1 1 auto" style={{color: '#aaa'}}>
          Not chosen
        </Box>
        <Box>a</Box>
      </Flex>
    ))}
  </Box>
)

const Awards = () => (
  <Box style={{fontSize: 14}} mb={3}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Awards
    </Box>
    {['Oceans', 'Temp', 'Oxygen'].map(param => (
      <Flex key={param}>
        <Box w={80} flex="1 1 auto" style={{color: '#aaa'}}>
          Not chosen
        </Box>
        <Box>a</Box>
      </Flex>
    ))}
  </Box>
)

let StandardProjects = props => (
  <Box style={{fontSize: 14}}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Standard Projects
    </Box>
    {toPairs(STANDARD_PROJECTS).map(([key, project]) => (
      <Flex key={key} onClick={() => props.onClickProject(key)}>
        <Box w={80} flex="1 1 auto">
          {project.name}
        </Box>
        <Box>{project.cost > 0 && project.cost}</Box>
      </Flex>
    ))}
  </Box>
)

StandardProjects = connect(
  () => ({}),
  dispatch => ({
    onClickProject: project => dispatch(startStandardProject(project)),
  })
)(StandardProjects)

let Count = props => (
  <AnimateOnChange baseClassName="Score" animationClassName="test--bounce" animate={() => true}>
    {props.value}
  </AnimateOnChange>
)

Count = pure(Count)

let PlayerCard = props => (
  <Box
    p={2}
    style={{borderBottom: '1px solid #eee', background: props.isActive && 'rgba(0, 0, 255, 0.1)'}}
  >
    <Flex mb={1} onClick={props.onClickPlayer}>
      <Box flex="1 1 auto">{props.player}</Box>
      <Flex align="center">
        <Flex
          ml={1}
          align="center"
          style={{background: '#e82f2f', color: 'white', fontWeight: 500, padding: '2px 4px'}}
        >
          {props.state.TR}
        </Flex>
      </Flex>
    </Flex>
    <Flex mb="4px">
      <Flex mr={1}>
        <Tag name="Money" />
        <Box ml="3px" style={{fontSize: 13}}>
          <Count value={props.state.resources.Money.count} /> (+{props.state.resources.Money.production})
        </Box>
      </Flex>
      <Flex mr={1}>
        <Tag name="Steel" />
        <Box ml="3px" style={{fontSize: 13}}>
          <Count value={props.state.resources.Steel.count} /> (+{props.state.resources.Steel.production})
        </Box>
      </Flex>
      <Flex>
        <Tag name="Titanium" />
        <Box ml="3px" style={{fontSize: 13}}>
          <Count value={props.state.resources.Titanium.count} /> (+{props.state.resources.Titanium.production})
        </Box>
      </Flex>
    </Flex>
    <Flex>
      <Flex mr={1} onClick={props.onClickPlant}>
        <Tag name="Plant" />
        <Box ml="3px" style={{fontSize: 13}}>
          <Count value={props.state.resources.Plant.count} /> (+{props.state.resources.Plant.production})
        </Box>
      </Flex>
      <Flex mr={1}>
        <Tag name="Energy" />
        <Box ml="3px" style={{fontSize: 13}}>
          <Count value={props.state.resources.Energy.count} /> (+{props.state.resources.Energy.production})
        </Box>
      </Flex>
      <Flex onClick={props.onClickHeat}>
        <Tag name="Heat" />
        <Box ml="3px" style={{fontSize: 13}}>
          <Count value={props.state.resources.Heat.count} /> (+{props.state.resources.Heat.production})
        </Box>
      </Flex>
    </Flex>
  </Box>
)

PlayerCard = connect(
  (state, props) => ({
    isActive:
      (state.game.phase === Phase.Actions && props.player === state.game.player) ||
      (state.game.phase === Phase.CardBuying && state.game.choosingCards[props.player]),
  }),
  (dispatch, props) => ({
    onClickPlayer: () => dispatch(uiChoosePlayer(props.player)),
    onClickPlant: () => dispatch(uiPlantGreenery()),
    onClickHeat: () => dispatch(uiHeatTemperature()),
  })
)(PlayerCard)

const Button = styled(Box)`
  padding: 3px 8px;
  margin-left: 8px;
  cursor: pointer;
  background: #ddd;
`

const ChoosingCorporationsStatus = props => (
  <React.Fragment>
    Choose a corporation and cards to keep.
    <Button>Submit</Button>
  </React.Fragment>
)

let ActionsStatus = props => (
  <React.Fragment>
    {2 - props.game.actionsDone} actions left. Choose an action or
    {props.game.actionsDone > 0 && <Button onClick={props.onCede}>cede</Button>}
    <Button onClick={props.onPass}>pass</Button>
  </React.Fragment>
)

ActionsStatus = connect(
  state => ({
    game: state.game,
  }),
  dispatch => ({
    onPass: () => dispatch(uiPass()),
    onCede: () => dispatch(uiCede()),
  })
)(ActionsStatus)

let DraftStatus = props => (
  <React.Fragment>
    Drafting. Choose a card ({4 - props.game.draft[props.player].taken.length} left).
  </React.Fragment>
)

DraftStatus = connect(state => ({
  game: state.game,
  player: state.player,
}))(DraftStatus)

let CardBuyingStatus = props => (
  <React.Fragment>
    Choose cards to buy (cost {props.chosen.length * 3}){' '}
    <Button onClick={props.onSubmit}>Submit</Button>
  </React.Fragment>
)

CardBuyingStatus = connect(
  state => ({
    game: state.game,
    player: state.player,
    chosen: Object.keys(state.ui.chosen || {}).filter(key => state.ui.chosen[key]),
  }),
  dispatch => ({
    onSubmit: () => dispatch(uiSubmitBuyChoice()),
  })
)(CardBuyingStatus)

const Input = styled.input`
  width: 30px;
  font-size: 1em;
  text-align: right;
  margin: 0 4px;
`

let ChoicesBar = props => (
  <React.Fragment>
    {props.card}:
    <pre style={{maxWidth: 400, overflowX: 'scroll'}}>{JSON.stringify(props.choice)}</pre>
    {props.choice.type === 'number' && <Input />}
    {props.choice.confirm && <Button onClick={props.onDone}>Done</Button>}
  </React.Fragment>
)

ChoicesBar = connect(
  state => ({
    choice: get(['ui', 'choice'], state),
    card: get(['ui', 'action', 'card'], state),
  }),
  dispatch => bindActionCreators({onDone: uiSubmitChoice}, dispatch)
)(ChoicesBar)

let GameChoicesBar = props => (
  <React.Fragment>
    {props.card}:
    <pre style={{maxWidth: 400, overflowX: 'scroll'}}>{JSON.stringify(props.choice)}</pre>
    <Button onClick={props.onDone}>Done</Button>
  </React.Fragment>
)

GameChoicesBar = connect(
  state => ({
    choice: get(['game', 'playerState', state.player, 'choices'], state),
    card: get(['ui', 'action', 'card'], state),
  }),
  dispatch => bindActionCreators({onDone: uiSubmitChoice}, dispatch)
)(GameChoicesBar)

const ResourceInput = styled.input`
  width: 30px;
  font-size: 1em;
  text-align: right;
  margin: 0 4px;
`

let ChooseResources = props => (
  <React.Fragment>
    Cost: {props.card.cost} (total {props.total})
    <Flex mr={1} align="center">
      <Tag name="Money" />
      <ResourceInput value={props.count.money} onChange={e => props.setMoney(e.target.value)} />
      <Box>({props.resources.Money.count})</Box>
    </Flex>
    <Flex mr={1} align="center">
      <Tag name="Steel" />
      <ResourceInput value={props.count.steel} onChange={e => props.setSteel(e.target.value)} />
      ({props.resources.Steel.count})
    </Flex>
    <Flex mr={1} align="center">
      <Tag name="Titanium" />
      <ResourceInput
        value={props.count.titanium}
        onChange={e => props.setTitanium(e.target.value)}
      />
      ({props.resources.Titanium.count})
    </Flex>
    <Button onClick={props.onSubmit}>Play</Button>
  </React.Fragment>
)

ChooseResources = compose(
  withStateHandlers(() => ({count: {money: 0, titanium: 0, steel: 0}}), {
    setMoney: state => money => ({...state, count: {...state.count, money}}),
    setSteel: state => steel => ({...state, count: {...state.count, steel}}),
    setTitanium: state => titanium => ({...state, count: {...state.count, titanium}}),
  }),
  withProps(props => ({
    total: 1 * props.count.money + 2 * props.count.steel + 3 * props.count.titanium,
  })),
  connect(
    state => ({
      card: getCardByName(state.ui.action.card),
      resources: state.game.playerState[state.player].resources,
    }),
    (dispatch, props) => ({
      onSubmit: () =>
        dispatch(
          uiSetCardCost({
            Money: parseInt(props.count.money) || 0,
            Titanium: parseInt(props.count.titanium) || 0,
            Steel: parseInt(props.count.steel) || 0,
          })
        ),
    })
  )
)(ChooseResources)

let ActionBar = props => (
  <Flex py={1} px={2} mx={2} style={{background: '#eee'}} align="center" justify="center">
    <Flex mr="3px" style={{fontSize: '0.8em'}}>
      {props.ui.phase}
    </Flex>
    <Flex mr="3px" style={{fontSize: '0.8em'}}>
      {props.game.player}
    </Flex>
    {props.game.phase === 'Choices' && <GameChoicesBar />}
    {props.game.phase === 'Actions' && props.ui.phase === 'Game' && <ActionsStatus />}
    {props.game.phase === 'CardBuying' && <CardBuyingStatus />}
    {props.ui.phase === 'CardCost' && <ChooseResources />}
    {props.ui.phase === 'Choices' && <ChoicesBar />}
    {props.game.phase === 'ChoosingCorporations' && <ChoosingCorporationsStatus />}
    {props.game.phase === 'Draft' && <DraftStatus />}
    {props.ui.phase !== 'Game' && <Button onClick={props.onCancel}>Cancel</Button>}
  </Flex>
)

ActionBar = connect(
  state => ({ui: state.ui, game: state.game}),
  dispatch => ({
    onCancel: () => dispatch(uiCancel()),
  })
)(ActionBar)

let Draft = props => (
  <React.Fragment>
    <Box p={1} style={{fontSize: 12, color: '#555'}}>
      DRAFT
    </Box>
    {!props.cards.queued.length && <Box px={2}>Waiting...</Box>}
    <Box px={2}>
      {props.cards.queued[0] &&
        props.cards.queued[0].map(name => (
          <Card key={name} name={name} onClick={() => props.onClickCard(name)} />
        ))}
    </Box>
  </React.Fragment>
)

Draft = connect(
  () => ({}),
  (dispatch, props) => ({
    onClickCard: card => dispatch(draftChoice(card, props.player)),
  })
)(Draft)

let Hand = props => (
  <React.Fragment>
    <Box p={1} style={{fontSize: 12, color: '#555'}}>
      HAND
    </Box>
    <Box px={2}>
      {props.game.playerState[props.player].hand.map(name => (
        <Card
          selected={props.selected[name]}
          key={name}
          name={name}
          onClick={() => props.onClickCard(name)}
        />
      ))}
    </Box>
  </React.Fragment>
)

Hand = connect(
  state => ({
    game: state.game,
    player: state.player,
    selected: get(['ui', 'choice', 'chosen'], state) || {},
  }),
  dispatch => ({
    onClickCard: card => dispatch(uiClickCard(card)),
  })
)(Hand)

let CardBuy = props => (
  <React.Fragment>
    <Box p={1} style={{fontSize: 12, color: '#555'}}>
      BUYING
    </Box>
    <Box px={2}>
      {props.cards.map(name => (
        <Card
          selected={props.selected[name]}
          key={name}
          name={name}
          onClick={() => props.onClickCard(name)}
        />
      ))}
    </Box>
  </React.Fragment>
)

CardBuy = connect(
  state => ({
    game: state.game,
    player: state.player,
    selected: get(['ui', 'chosen'], state) || {},
  }),
  dispatch => ({
    onClickCard: card => dispatch(uiClickCard(card)),
  })
)(CardBuy)

let PlayedCardMatches = props => (
  <React.Fragment>
    <Box p={1} style={{fontSize: 12, color: '#555'}}>
      Matching Cards
    </Box>
    <Box px={2}>
      {props.cards.map(name => (
        <Card
          selected={props.selected[name]}
          key={name}
          name={name}
          onClick={() => props.onClickCard(name)}
        />
      ))}
    </Box>
  </React.Fragment>
)

PlayedCardMatches = connect(
  state => {
    const allPlayed = state.game.playerState[state.player].played.map(getCardByName)
    const cards = allPlayed
      .filter(card => card.resourceHeld === state.ui.choice.resource)
      .map(card => card.name)
    return {
      cards,
      selected: {},
    }
  },
  dispatch => ({
    onClickCard: card => dispatch(uiClickCard(card)),
  })
)(PlayedCardMatches)

const TerraformingMars = props => (
  <Wrapper direction="column">
    <Box
      align="center"
      py={1}
      px={2}
      style={{fontFamily: 'Rubik Mono One', borderBottom: '1px solid #ddd', background: '#fafafa'}}
    >
      Terraforming Mars
    </Box>
    <Flex flex="1 1 auto">
      <Flex
        direction="column"
        w={270}
        style={{minWidth: 270, borderRight: '1px solid #ddd', background: '#fafafa'}}
      >
        {props.game.players.map(player => (
          <PlayerCard key={player} player={player} state={props.game.playerState[player]} />
        ))}

        <Box px={2} py={1} style={{fontSize: 12, color: '#555'}}>
          GAME LOG
        </Box>
        <GameLog log={props.game.log} />
      </Flex>
      <Box flex="1 1 auto" p={2}>
        <Flex>
          <Box>
            <Box style={{fontSize: 14}} mb={1}>
              Generation {props.game.generation}
            </Box>
            <GlobalParams />
            <Milestones />
            <Awards />
            <StandardProjects />
          </Box>
          <Box flex="1 1 auto" style={{textAlign: 'center'}}>
            <ActionBar />
            <Grid />
          </Box>
        </Flex>
        <Flex>
          <Box mr={1}>
            {props.game.playerState[props.player].corporation && (
              <Corporation name={props.game.playerState[props.player].corporation} collapsed />
            )}
            {props.game.playerState[props.player].played
              .slice(0, 10)
              .map(name => (
                <Card
                  played
                  key={name}
                  name={name}
                  collapsed
                  resources={props.game.playerState[props.player].cardResources[name]}
                />
              ))}
          </Box>
          <Box mr={1}>
            {props.game.playerState[props.player].played
              .slice(10, 20)
              .map(name => (
                <Card
                  played
                  key={name}
                  name={name}
                  collapsed
                  resources={props.game.playerState[props.player].cardResources[name]}
                />
              ))}
          </Box>
          <Box>
            {props.game.playerState[props.player].played
              .slice(20)
              .map(name => (
                <Card
                  played
                  key={name}
                  name={name}
                  collapsed
                  resources={props.game.playerState[props.player].cardResources[name]}
                />
              ))}
          </Box>
        </Flex>
      </Box>
      <Box style={{borderLeft: '1px solid #ddd', overflowY: 'scroll', background: '#fafafa'}}>
        {props.game.draft[props.player] && (
          <Draft cards={props.game.draft[props.player]} player={props.player} />
        )}
        {props.game.choosingCorporations[props.player] && (
          <React.Fragment>
            <Box p={1} style={{fontSize: 12, color: '#555'}}>
              CORPORATIONS
            </Box>
            <Box px={2}>
              {props.game.choosingCorporations[props.player].map(name => (
                <Corporation key={name} name={name} />
              ))}
            </Box>
          </React.Fragment>
        )}
        {get(['choice', 'type'], props.ui) === 'playedCard' && <PlayedCardMatches />}
        {props.game.choosingCards[props.player] && (
          <CardBuy cards={props.game.choosingCards[props.player]} />
        )}
        {props.game.phase === 'Choices' &&
          get(['playerState', props.player, 'choices', 0, 'type'], props.game) == 'KeepCards' && (
            <CardBuy cards={props.game.playerState[props.player].choices[0].cards} />
          )}
        <Hand />
      </Box>
    </Flex>
  </Wrapper>
)

export default compose(
  connect(state => ({game: state.game, ui: state.ui, player: state.player})),
  branch(props => !props.game, renderNothing)
)(TerraformingMars)
