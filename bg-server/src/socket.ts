import {Server} from 'http'
import * as WebSocket from 'ws'

import {decodeToken} from './auth'
import {PlayerConnection, GameStorage} from './base'

interface AuthMessage {
  type: 'token'
  token: string
  email?: string
}

interface RoomMessage {
  type: 'room'
  room: string
  action: string
  move?: any
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
    this.wss.on('connection', this.onConnection.bind(this))
    console.log('Started WS server.')
  }

  onConnection(ws: WebSocket) {
    ws.on('error', () => console.log('errored'))

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message)
        this.onData(data, ws)
      } catch (e) {
        console.error(e)
        return
      }
    })
  }

  onData(data: ClientMessage, ws: WebSocket) {
    if (data.type === 'token') {
      if (data.token === 'DEV') {
        ws['token'] = {email: data.email}
      } else {
        const decoded = decodeToken(data.token)
        ws['token'] = decoded
      }
      ws.send(JSON.stringify({auth: true, email: ws['token'].email}))

      this.userConnections[ws['token'].email] = ws
      this.storage.createUser(ws['token'].email)
      console.log('Authenticated', ws['token'])
    } else if (ws['token']) {
      return this.onAction(data.action, data, ws)
    }
  }

  onAction(action: string, data: RoomMessage, ws: WebSocket) {
    const room = data.room
    const player = ws['token'].email
    if (action === 'ROOM_JOIN') {
      this.storage.onRoomJoin(room, player)
    } else if (action === 'ROOM_LEAVE') {
      this.storage.onRoomLeave(room, player)
    } else if (action === 'ROOM_START') {
      this.storage.onRoomStart(room)
    } else if (action === 'ROOM_MOVE') {
      this.storage.onRoomMove(room, player, data.move)
    }
  }

  notifyRoom(room, getPlayerState) {
    console.log('room change', room.id, room.users)
    if (room && room.users) {
      room.users
        .filter(u => this.userConnections[u])
        .forEach(u => {
          let playerRoom = {...room}
          console.log('here', room)
          if (room.game && getPlayerState) {
            playerRoom.game = getPlayerState(room.game, u)
          }
          if (this.userConnections[u].readyState === this.userConnections[u].OPEN)
            this.userConnections[u].send(
              JSON.stringify({
                type: 'ROOM_UPDATE',
                room: playerRoom,
              })
            )
        })
    }
  }

  notifyPlayer(room, user, message) {
    if (!this.userConnections[user]) return
    if (this.userConnections[user].readyState !== this.userConnections[user].OPEN) return
    this.userConnections[user].send(JSON.stringify({...message, room}))
  }
}
