import React from 'react'
import styled from 'styled-components'
import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {compose, pure, branch, renderNothing} from 'recompose'
import {toPairs, get, reverse} from 'lodash/fp'

import {
  reducer,
  draftChoice,
  uiClickCard,
  uiCancel,
  uiChoosePlayer,
  uiSubmitChoice,
  uiPlantGreenery,
  uiHeatTemperature,
  uiPass,
  uiSubmitBuyChoice,
  uiCede,
} from './reducer'
import {Grid} from './Grid'
import GameLog from './GameLog'
import {Tag} from './components'

import {getCardByName} from '../../../../games/terraforming-mars/src/cards'
import {Phase} from '../../../../games/terraforming-mars/src/types'
import {Count} from './animator'

import ChooseResources from './components/ChooseResources'
import StandardProjects from './components/StandardProjects'
import GlobalParams from './components/GlobalParams'
import Awards from './components/Awards'
import Milestones from './components/Milestones'

import cs from './index.css'
import {PLAYER_COLORS} from './constants'
import TagCounts from './components/TagCounts'
import Card from './components/Card/Card'
import {Corporation} from './components/Card'

const Wrapper = styled(Flex)`
  font-family: Rubik;
  height: 100%;
`

const signed = n => (n > 0 ? `+${n}` : `${n}`)

let PlayerCard = props => (
  <Box
    p={2}
    style={{borderBottom: '1px solid #eee', background: props.isActive && 'rgba(0, 0, 255, 0.1)'}}
  >
    <Flex mb={1} onClick={props.onClickPlayer} align="center">
      <Box style={{background: props.color, width: 12, height: 12}} mr={1} />
      <Box flex="1 1 auto">{props.player}</Box>
      <Flex align="center">
        <Flex
          ml={1}
          align="center"
          style={{
            fontSize: 14,
            background: '#e82f2f',
            color: 'white',
            fontWeight: 500,
            padding: '2px 4px',
          }}
        >
          {props.state.TR}
        </Flex>
      </Flex>
    </Flex>
    <Flex mb="4px">
      <Flex mr={1}>
        <Tag name="Money" />
        <Box ml="3px" style={{fontSize: 13}}>
          <Count value={props.state.resources.Money.count} /> ({signed(props.state.resources.Money.production)})
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
    <Flex mt={1} style={{fontSize: 13}}>
      {props.state.corporation}
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

const Button = styled.button`
  font-size: 1em;
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
    {props.choice.type === 'cost' && <ChooseResources cost={props.choice.cost} />}
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

let ActionBar = props => (
  <Flex py={1} style={{background: '#eee', fontSize: 13}} align="center" justify="center">
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
    {props.ui.choice &&
      props.ui.choice.type === 'player' && (
        <Button onClick={props.onChooseNoPlayer}>No Player</Button>
      )}
    {props.ui.phase !== 'Game' && <Button onClick={props.onCancel}>Cancel</Button>}
  </Flex>
)

ActionBar = connect(
  state => ({ui: state.ui, game: state.game}),
  dispatch => ({
    onCancel: () => dispatch(uiCancel()),
    onChooseNoPlayer: () => dispatch(uiChoosePlayer(null)),
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
      HAND ({props.game.playerState[props.player].hand.length})
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

const TerraformingMars = props => {
  console.log('props', props)
  return (
    <Wrapper direction="column">
      <Flex
        align="center"
        style={{
          background: '#fafafa',
          borderBottom: '1px solid #ddd',
          minHeight: 36,
        }}
      >
        <Box
          align="center"
          py={1}
          px={2}
          style={{
            fontFamily: 'Rubik Mono One',
          }}
        >
          Terraforming Mars
        </Box>

        <Flex align="center" style={{fontSize: 14, flex: '1 1 auto'}}>
          Generation {props.game.generation}
        </Flex>
        <Flex px={2} align="center">
          Debug
          <Button
            onClick={() =>
              window.socket.send({
                room: window.location.pathname.split('/')[2],
                action: 'ROOM_START',
              })}
          >
            Reset
          </Button>
        </Flex>
      </Flex>
      <Flex flex="1 1 auto">
        <Flex
          direction="column"
          w={270}
          style={{minWidth: 270, borderRight: '1px solid #ddd', background: '#fafafa'}}
        >
          {props.game.players.map((player, i) => (
            <PlayerCard
              key={player}
              color={PLAYER_COLORS[i]}
              player={player}
              state={props.game.playerState[player]}
            />
          ))}

          <Box px={2} py={1} style={{fontSize: 12, color: '#555'}}>
            GAME LOG
          </Box>
          <GameLog log={props.game.log} />
        </Flex>
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
        <Box flex="1 1 auto" p={2}>
          <ActionBar />
          <Flex>
            <Box>
              <GlobalParams />
              <Milestones />
              <Awards />
              <StandardProjects />
            </Box>
            <Box flex="1 1 auto" style={{textAlign: 'center'}}>
              <Grid />
            </Box>
          </Flex>

          <Box>
            <TagCounts />
          </Box>
        </Box>

        <Box px={2} style={{background: '#fafafa', overflowY: 'scroll'}}>
          <Box py={1} style={{fontSize: 12, color: '#555'}}>
            PLAYED
          </Box>
          <Flex>
            <Box>
              {props.game.playerState[props.player].corporation && (
                <Corporation name={props.game.playerState[props.player].corporation} collapsed />
              )}
              {props.game.playerState[props.player].played.map(name => (
                <Card
                  played
                  key={name}
                  name={name}
                  collapsed
                  isUsed={props.game.playerState[props.player].cardActionsUsedThisGeneration[name]}
                  resources={props.game.playerState[props.player].cardResources[name]}
                />
              ))}
            </Box>
          </Flex>
        </Box>

        {/* <Flex
          direction="column"
          w={270}
          style={{minWidth: 270, borderLeft: '1px solid #ddd', background: '#fafafa'}}
        >
          <Box px={2} py={1} style={{fontSize: 12, color: '#555'}}>
            GAME LOG
          </Box>
          <GameLog log={props.game.log} />
        </Flex> */}
      </Flex>
    </Wrapper>
  )
}

export default compose(
  connect(state => ({game: state.game, ui: state.ui, player: state.player})),
  branch(props => !props.game, renderNothing)
)(TerraformingMars)
