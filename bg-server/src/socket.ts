import {Server} from 'http'
import * as WebSocket from 'ws'

import {decodeToken} from './auth'
import {PlayerConnection, GameStorage} from './base'

interface AuthMessage {
  type: 'token'
  token: string
}

interface RoomMessage {
  type: 'room'
  room: string
  action: string
}

type ClientMessage = RoomMessage | AuthMessage

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

  onData(data: ClientMessage, ws: WebSocket) {
    if (data.type === 'token') {
      const decoded = decodeToken(data.token)
      ws['token'] = decoded
      ws.send(JSON.stringify({auth: true}))

      this.userConnections[ws['token'].email] = ws
      this.storage.createUser(ws['token'].email)
    } else {
      if (ws['token']) {
        return this.onAction(data.action, data, ws)
      }
    }
  }

  onAction(action: string, data: RoomMessage, ws: WebSocket) {
    const room = data.room
    const player = ws['token'].email
    if (action === 'JOIN_ROOM') {
      this.storage.onRoomJoin(room, player)
    } else if (action === 'LEAVE_ROOM') {
      this.storage.onRoomLeave(room, player)
    }
  }

  notifyRoom(room) {
    console.log('room change', room)
    if (room && room.users) {
      room.users.filter(u => this.userConnections[u]).forEach(u => {
        console.log('sending room user', u, room)
        this.userConnections[u].send(
          JSON.stringify({
            type: 'ROOM_UPDATE',
            room,
          })
        )
      })
    }
  }
}
