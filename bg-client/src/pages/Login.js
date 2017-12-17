import React, {Component} from 'react'

import history from '../history'
import auth0 from 'auth0-js'

export const AUTH_CONFIG = {
  domain: 'bgz.auth0.com',
  clientId: 'xZrXpldgud0R8QTqrr0V4sHoXhutxcL6',
  callbackUrl: 'http://localhost:8084/callback',
}

export class Auth {
  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    redirectUri: AUTH_CONFIG.callbackUrl,
    audience: `https://${AUTH_CONFIG.domain}/userinfo`,
    responseType: 'token id_token',
    scope: 'openid email',
  })

  constructor() {
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.handleAuthentication = this.handleAuthentication.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
  }

  login() {
    this.auth0.authorize()
  }

  getProfile(token) {
    this.auth0.client.userInfo((err, profile) => {
      console.log(profile)
    })
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
        this.getProfile(authResult.accessToken)
        history.replace('/')
      } else if (err) {
        history.replace('/login')
        console.log(err)
        alert(`Error: ${err.error}. Check the console for further details.`)
      }
    })
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime())
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)
    // navigate to the home route
    history.replace('/')
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    // navigate to the home route
    history.replace('/')
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }
}

export default class Home extends Component {
  login() {
    this.props.auth.login()
  }
  render() {
    const {isAuthenticated} = this.props.auth
    return (
      <div className="container">
        {isAuthenticated() && <h4>You are logged in!</h4>}
        {!isAuthenticated() && (
          <h4>
            You are not logged in! Please
            <a style={{cursor: 'pointer'}} onClick={this.login.bind(this)}>
              Log In
            </a>
            to continue.
          </h4>
        )}
      </div>
    )
  }
}
