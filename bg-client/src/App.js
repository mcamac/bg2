import React, {Component} from 'react'
import {Router, Route, Switch} from 'react-router-dom'
import {Provider} from 'react-redux'
import store from './pages/store'
import history from './history'

import {Game, GameLobby, Login, Lobby} from './pages'
import {Callback} from './components'
import {Auth} from './pages/Login'

const auth = new Auth()

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication()
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <Provider store={store}>
          <Router history={history}>
            <Switch>
              <Route exact path="/" component={Lobby} />
              <Route exact path="/game/:uid" component={Game} />
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

export default App
