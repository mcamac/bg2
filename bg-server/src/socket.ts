import {Server} from 'http'
import * as WebSocket from 'ws'

import {decodeToken} from './auth'
import {PlayerConnection, GameStorage} from './base'

export class SocketServer implements PlayerConnection {
  userConnections: {[key: string]: any}
  wss: WebSocket.Server

  private server: Server
  private storage: GameStorage

  constructor(server: Server, storage?: any) {
    this.userConnections = {}
    this.server = server
  }

  setStorage(storage: GameStorage) {
    this.storage = storage
  }

  start() {
    this.wss = new WebSocket.Server({server: this.server})
    this.wss.on('connection', this.onConnection)
  }

  onConnection(ws: WebSocket) {
    ws.on('message', async (message: string) => {
      const data = JSON.parse(message)
      this.onData(data, ws)
    })
  }

  onData(data: any, ws: WebSocket) {
    if (data.type === 'token') {
      console.log(data)
      const decoded = decodeToken(data.token)
      ws['token'] = decoded
      ws.send(JSON.stringify({auth: true}))

      this.userConnections[ws['token'].email] = ws
      // r
      //   .table('users')
      //   .insert({id: ws['token'].email})
      //   .run(connection)
    } else {
      if (ws['token']) {
        return this.onAction(data.action, data, ws)
      }
    }
  }

  onAction(action: string, data, ws: WebSocket) {
    if (action === 'JOIN_ROOM') {
    }
  }
}
