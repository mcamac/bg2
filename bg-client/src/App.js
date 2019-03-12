import React, {Component} from 'react'
import {Router, Route, Switch} from 'react-router-dom'
import {Provider} from 'react-redux'
import {hot} from 'react-hot-loader'
import store from './pages/store'
import history from './history'

import {Game, GameLobby, Login, Lobby} from './pages'
import TerraformingMars from './games/terraforming-mars/index'
import CardBrowser from './games/terraforming-mars/cardBrowser'
import {Callback} from './components'
import {Auth} from './pages/Login'
import Game2 from './pages/Game2'

const auth = new Auth()

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication()
  }
}

class App extends Component {
  render() {
    return (
      <div className="App" style={{height: '100%'}}>
        <Provider store={store}>
          <Router history={history}>
            <Switch>
              <Route exact path="/" component={Lobby} />
              <Route exact path="/tf/:uid" component={TerraformingMars} />
              <Route exact path="/tf-cards" component={CardBrowser} />
              <Route exact path="/game/:uid" component={Game2} />
              <Route exact path="/login" render={props => <Login auth={auth} {...props} />} />
              <Route
                path="/callback"
                render={props => {
                  handleAuthentication(props)
                  return <Callback {...props} />
                }}
              />
            </Switch>
          </Router>
        </Provider>
      </div>
    )
  }
}

export default hot(module)(App)
