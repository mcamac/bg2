import styled from 'styled-components'
import {Box} from 'grid-styled'

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

export default CardWrapper
