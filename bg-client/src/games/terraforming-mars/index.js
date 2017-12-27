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
import {toPairs, get} from 'lodash/fp'

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
} from './reducer'
import {Grid} from './Grid'
import {Icon, Tag} from './components'

import {CARDS, getCardByName} from '../../../../games/terraforming-mars/src/cards'
import {getCorporationByName} from '../../../../games/terraforming-mars/src/corporations'
import {StandardProject} from '../../../../games/terraforming-mars/src/types'
import {STANDARD_PROJECTS} from '../../../../games/terraforming-mars/src/projects'
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

const CardRequirements = ({requires: [[type, ...args]]}) => (
  <Flex px="4px" ml="4px" style={{background: 'rgba(255, 255, 255, 0.5)'}}>
    {requiresByType(type, ...args)}
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
  <Flex>
    {withSign(value)} {typeof resource === 'string' ? <Icon g={resource} /> : resource}
  </Flex>
)

const ChangeCardResource = (value, resource) => (
  <Flex align="center">
    <Box>{withSign(value)}</Box>
    <Box px="4px">{typeof resource === 'string' ? <Icon g={resource} /> : resource}</Box>{' '}
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
  <Flex style={{background: '#b5b5fd'}}>
    {withSign(value)} <Icon g="Ocean" />
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

const IncreaseTR = value => (
  <div>
    {withSign(value)}{' '}
    <span style={{background: '#e82f2f', color: 'white', fontWeight: 500, padding: '2px 4px'}}>
      TR
    </span>
  </div>
)
const PlaceCity = () => (
  <div>
    <Tag name="City" />
  </div>
)

const PlaceGreenery = () => (
  <div>
    <Tag name="Greenery" />
  </div>
)

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
  <Flex>
    1 / {ratio && ratio} <Tag name={tag} />
  </Flex>
)

const VPIfCardHasResources = (resource, count, vp) => (
  <Flex>
    {vp} VP if at least {count} <Icon g={resource} />
  </Flex>
)

const EFFECTS = {
  ChangeProduction,
  ChangeInventory,
  ChangeCardResource,
  ChangeAnyCardResource,
  PlaceOceans,
  PlaceCity,
  PlaceGreenery,
  RaiseOxygen,
  DecreaseAnyProduction,
  DecreaseAnyInventory,
  IncreaseTemperature,
  RoboticWorkforce,
  IncreaseTR,
  Choice,
  Draw,
  VPForTags,
  VPForCardResources,
  VPIfCardHasResources,
  GetTags,
}

const CardEffects = props => (
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
    {!props.collapsed &&
      (props.card.effects || props.card.vp || props.card.discounts) && (
        <Flex style={{padding: 5}} direction="column">
          <Flex align="center">
            {props.card.effects && <CardEffects effects={props.card.effects} card={props.card} />}
            {props.card.discounts && (
              <CardDiscounts discounts={props.card.discounts} card={props.card} />
            )}
            {props.card.vp && <CardVP card={props.card} />}
          </Flex>
        </Flex>
      )}
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
    {!props.collapsed &&
      (props.corp.effects || props.corp.discounts) && (
        <Flex style={{padding: 5}} direction="column">
          <Flex align="center">
            {props.corp.effects && <CardEffects effects={props.corp.effects} card={props.corp} />}
            {props.corp.discounts && (
              <CardDiscounts discounts={props.corp.discounts} card={props.corp} />
            )}
          </Flex>
        </Flex>
      )}
  </CardWrapper>
)

Corporation = withProps(props => ({corp: getCorporationByName(props.name)}))(Corporation)
export {Corporation}

const GlobalParams = () => (
  <Box style={{fontSize: 14}} mb={3}>
    <Box mb="3px" style={{borderBottom: '1px solid #555'}}>
      Globals
    </Box>
    {['Oceans', 'Temp', 'Oxygen'].map(param => (
      <Flex key={param}>
        <Box w={80} flex="1 1 auto">
          {param}
        </Box>
        <Box>0 (9 left)</Box>
      </Flex>
    ))}
  </Box>
)

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

let PlayerCard = props => (
  <Box p={2} style={{borderBottom: '1px solid #eee'}}>
    <Flex mb={1} onClick={props.onClickPlayer}>
      <Box flex="1 1 auto">{props.player}</Box>
      <Box>30</Box>
    </Flex>
    <Flex mb="4px">
      <Flex mr={1}>
        <Tag name="Money" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Money.count} (+{props.state.resources.Money.production})
        </Box>
      </Flex>
      <Flex mr={1}>
        <Tag name="Steel" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Steel.count} (+{props.state.resources.Steel.production})
        </Box>
      </Flex>
      <Flex>
        <Tag name="Titanium" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Titanium.count} (+{props.state.resources.Titanium.production})
        </Box>
      </Flex>
    </Flex>
    <Flex>
      <Flex mr={1} onClick={props.onClickPlant}>
        <Tag name="Plant" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Plant.count} (+{props.state.resources.Plant.production})
        </Box>
      </Flex>
      <Flex mr={1}>
        <Tag name="Energy" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Energy.count} (+{props.state.resources.Energy.production})
        </Box>
      </Flex>
      <Flex onClick={props.onClickHeat}>
        <Tag name="Heat" />
        <Box ml="3px" style={{fontSize: 13}}>
          {props.state.resources.Heat.count} (+{props.state.resources.Heat.production})
        </Box>
      </Flex>
    </Flex>
  </Box>
)

PlayerCard = connect(
  state => ({}),
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
    2 actions left. Choose an action or
    <Button onClick={props.onPass}>pass</Button>
  </React.Fragment>
)

ActionsStatus = connect(
  state => ({}),
  dispatch => ({
    onPass: () => dispatch(uiPass()),
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

let ChoicesBar = props => (
  <React.Fragment>
    {props.card}:
    <pre style={{maxWidth: 400, overflowX: 'scroll'}}>{JSON.stringify(props.choice)}</pre>
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

const ResourceInput = styled.input`
  width: 30px;
  font-size: 1em;
  text-align: right;
  margin: 0 4px;
`

let ChooseResources = props => (
  <React.Fragment>
    Cost: 8 (total {props.total})
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
      resources: state.game.playerState[state.game.player].resources,
    }),
    (dispatch, props) => ({
      onSubmit: () => dispatch(uiSetCardCost(props.count)),
    })
  )
)(ChooseResources)

let ActionBar = props => (
  <Flex py={1} px={2} mx={2} style={{background: '#eee'}} align="center" justify="center">
    <Flex mr="3px" style={{fontSize: '0.8em'}}>
      {props.ui.phase}
    </Flex>
    {props.game.phase === 'Actions' && props.ui.phase === 'Game' && <ActionsStatus />}
    {props.ui.phase === 'CardCost' && <ChooseResources />}
    {props.ui.phase === 'Choices' && <ChoicesBar />}
    {props.game.phase === 'ChoosingCorporations' && <ChoosingCorporationsStatus />}
    {props.game.phase === 'Draft' && <DraftStatus />}
    {props.ui.phase !== 'Game' && <Button onClick={props.onCancel}>Cancel</Button>}
  </Flex>
)

ActionBar = connect(
  state => ({ui: state.ui}),
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
      {props.game.playerState[props.game.player].hand.map(name => (
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
  state => ({game: state.game, selected: get(['ui', 'choice', 'chosen'], state) || {}}),
  dispatch => ({
    onClickCard: card => dispatch(uiClickCard(card)),
  })
)(Hand)

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
    const allPlayed = state.game.playerState[state.game.player].played.map(getCardByName)
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
    <Flex>
      <Box w={270} style={{minWidth: 270, borderRight: '1px solid #ddd', background: '#fafafa'}}>
        {props.game.players.map(player => (
          <PlayerCard key={player} player={player} state={props.game.playerState[player]} />
        ))}
      </Box>
      <Box flex="1 1 auto" p={2}>
        <Flex>
          <Box>
            <GlobalParams />
            <Milestones />
            <Awards />
            <StandardProjects />
          </Box>
          <Box flex="1 1 auto" style={{textAlign: 'center'}}>
            <ActionBar game={props.game} />
            <Grid />
          </Box>
        </Flex>
        <Flex>
          <Box mr={1}>
            {props.game.playerState[props.player].corporation && (
              <Corporation name={props.game.playerState[props.player].corporation} collapsed />
            )}
            {props.game.playerState[props.player].played.map(name => (
              <Card played key={name} name={name} collapsed />
            ))}
          </Box>
          <Box mr={1}>
            <Card cost={23} name="Development Center" collapsed />
            <Card cost={23} name="Development Center" collapsed />
          </Box>
          <Box>
            <Card cost={23} name="Development Center" type="Active" />
            <Card cost={23} name="Development Center" type="Active" />
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
          <React.Fragment>
            <Box p={1} style={{fontSize: 12, color: '#555'}}>
              BUYING
            </Box>
            <Box px={2}>
              {props.game.choosingCards[props.player].map(name => <Card key={name} name={name} />)}
            </Box>
          </React.Fragment>
        )}
        <Hand />
      </Box>
    </Flex>
  </Wrapper>
)

export default compose(
  connect(state => ({game: state.game, ui: state.ui, player: state.game.player})),
  branch(props => !props.game, renderNothing)
)(TerraformingMars)
