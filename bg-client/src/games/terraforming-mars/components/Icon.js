import React from 'react'

const Icon = props => (
  <i className={`icon icon-${props.g}`} style={{...(props.style || {}), fontSize: 18}} />
)

export default Icon
