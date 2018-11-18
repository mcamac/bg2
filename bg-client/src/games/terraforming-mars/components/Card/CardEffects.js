import React, {Fragment, Component} from 'react'
import styled from 'styled-components'
import {Flex, Box} from 'grid-styled'
import {connect} from 'react-redux'
import {compose, pure, withProps} from 'recompose'

import Icon from '../Icon'
import Tag from '../Tag'
import {uiCardAction} from '../../reducer'
import {withSign} from './utils'
import {requiresByType} from './CardRequirements'

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
    {resource === null ? ' resource on ' : null} <Box> any card</Box>
  </Flex>
)

const DecreaseAnyProduction = (value, resource) => (
  <Flex mr="4px" style={{background: '#8a5d5d', color: '#eee', padding: 3}}>
    - any {value}
    <Icon g={resource} />
  </Flex>
)

const DecreaseAnyInventory = (value, resource) => (
  <Flex>
    - any
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
  <Flex align="center" mr={1}>
    <Box mr="4px">One of:</Box>
    (
    {choices.map((effects, j) => (
      <Flex align="center">
        {effects.map(
          ([effect, ...args], i) =>
            EFFECTS[effect] && <Box key={i}> {EFFECTS[effect](...args, card)}</Box>
        )}
        {j !== choices.length - 1 ? ' OR ' : ''}
      </Flex>
    ))}
    )
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
  <Flex align="center">
    {typeof value === 'number' ? withSign(value) : Effect(...value)} <TR />
  </Flex>
)

const PlayedMinCost = value => (
  <Flex align="center">
    <Icon g="Card" />, SP ≥ {value}
  </Flex>
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
  <Flex align="center" mr="4px">
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

const PlaceMiningRights = () => (
  <Flex align="center">
    Place on tile w/ <Icon g="Steel" /> or <Icon g="Titanium" />. +1 prod of that
  </Flex>
)
const PlaceNaturalPreserve = () => <Flex align="center">Place Natural Preserve.</Flex>
const PlaceIndustrialCenter = () => <Flex align="center">Place tile adjacent to city.</Flex>
const PlaceNuclearZone = () => <Flex align="center">Place Nuclear Zone.</Flex>
const PlaceMohole = () => <Flex align="center">Place Mohole on Ocean.</Flex>
const PlaceLavaFlows = () => <Flex align="center">Place Lava Flows on Volcano.</Flex>
const PlaceRestrictedArea = () => <Flex align="center">Place Restricted Area.</Flex>
const PlaceResearchOutpost = () => <Flex align="center">Place Research Outpost.</Flex>
const PlaceCommercialDistrict = () => <Flex align="center">Place special tile.</Flex>
const PlaceUrbanizedArea = () => (
  <Flex align="center">
    Place <Icon g="City" /> adj. to 2 <Icon g="City" />
  </Flex>
)

const CommercialDistrict = () => '1VP/adj. city'

const VPForCardResources = (resource, count = 1) =>
  count > 1 ? (
    <Flex>
      1 VP / {count} <Icon g={resource} />
    </Flex>
  ) : (
    <Flex>
      {Math.floor(1 / count)} VP / <Icon g={resource} />
    </Flex>
  )

const VPForCitiesOnMars = count => (
  <Flex>
    1 VP / {count} <Icon g="City" /> on Mars
  </Flex>
)

const VPForTags = tag => (
  <Flex>
    1 VP / <Tag name={tag} />
  </Flex>
)

const GetAllTags = (tag, ratio) => (
  <Flex ailgn="center">
    1 / all {ratio && ratio} <Tag name={tag} />
  </Flex>
)

const GetTags = (tag, ratio) => (
  <Flex ailgn="center">
    1 / {ratio && ratio} <Tag name={tag} />
  </Flex>
)

const GetOpponentTags = (tag, ratio) => (
  <Flex ailgn="center">
    1 / {ratio && ratio} opp. <Tag name={tag} />
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
    {vp} VP if ≥ {count} <Icon g={resource} />
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

const SearchForLife = () => (
  <Flex align="center">
    1 <Icon g="Money" />: Reveal <Icon g="Card" />. If <Icon g="Microbe" />, +1 <Icon g="Science" />
  </Flex>
)

const AddNextCardEffect = effect => (
  <Flex align="center">
    next <Icon g="Card" />: <pre>{JSON.stringify(effect, null, 2)}</pre>
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
const LandClaim = () => 'Land Claim'

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
export const EFFECTS = {
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
  PlaceMiningRights,
  PlaceNaturalPreserve,
  PlaceIndustrialCenter,
  PlaceCommercialDistrict,
  PlaceUrbanizedArea,
  CommercialDistrict,
  LandClaim,
  PlayedMinCost,
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
  VPForCitiesOnMars,
  CapitalCity,
  GetAllTags,
  GetTags,
  GetOpponentTags,
  GetCities,
  GetCitiesOnMars,
  UNTerraform,
  Branch,
  ChooseX,
  GetX,
  Neg,
  PlayedTagMatches,
  PlayedTagMatchesAny,
  SearchForLife,
  AddNextCardEffect,
}

export const Effect = (effect, ...args) =>
  EFFECTS[effect] ? (
    <Box>{EFFECTS[effect](...args)} </Box>
  ) : (
    <pre>{JSON.stringify([effect, ...args])}</pre>
  )

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

export default CardEffects
