import styled from 'styled-components'

const Button = styled.button`
  background: white;
  border: 1px solid #ccc;
  padding: 4px 8px;
  font-size: 1em;
  min-width: 50px;
  transition: 0.2s background;
  cursor: pointer;

  &:hover {
    background: #eee;
  }
`
export default Button
