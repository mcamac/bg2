import uuidv4 from 'uuid/v4'

class Socket {
  constructor(host = 'wss://ws.bgames.io') {
    const ws = new WebSocket(host)

    this.resolveConnecting = null
    this.connecting = new Promise((resolve, reject) => {
      this.resolveConnecting = resolve
    })

    this.resolveAuthenticated = null
    this.authenticated = new Promise((resolve, reject) => {
      this.resolveAuthenticated = resolve
    })

    ws.onopen = open => {
      this.resolveConnecting(true)
      this.onOpen()
    }

    ws.onmessage = data => {
      this.onMessage(data)
    }

    this.listeners = []
    this.ws = ws
  }

  onOpen() {
    // this.ws.send(JSON.stringify({type: 'token', token: localStorage.id_token}))
    this.ws.send(
      JSON.stringify({type: 'token', token: 'DEV', email: location.hash.slice(1) || 'a'})
    )
  }

  onMessage(message) {
    try {
      const obj = JSON.parse(message.data)
      if (obj.auth) {
        this.resolveAuthenticated(true)
        console.log('socket authenticated')
      }
      this.listeners.forEach(fn => fn(obj))
    } catch (e) {}
  }

  async send(obj) {
    await this.authenticated
    obj['_id'] = uuidv4()
    console.log('ws send', obj, new Date().toISOString())
    this.ws.send(JSON.stringify(obj))
  }

  addListener(fn) {
    this.listeners.push(fn)
  }
}

export const socket = new Socket()

window.socket = socket
