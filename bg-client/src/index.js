import React from 'react'
import ReactDOM from 'react-dom'
import {AppContainer} from 'react-hot-loader'

import './index.css'
import 'react-select/dist/react-select.min.css'
import App from './App'
import './network'

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./App', () => {
    const NewRoot = require('./App').default
    render(NewRoot)
  })
}
