import * as r from 'rethinkdb'
import {SocketServer} from './socket'
import {GameStorage, PlayerConnection} from './base'

import {PowerGrid} from '../../games/power-grid/src/index'
import {TerraformingMars} from '../../games/terraforming-mars/src/index'

const GAMES = {
  PowerGrid,
  TerraformingMars,
}

export class RDBStorage extends GameStorage {
  userConnections: {[key: string]: any}
  connection: r.Connection
  sockets: SocketServer
  playerConnection: PlayerConnection

  constructor(params: r.ConnectionOptions, playerConnection: PlayerConnection) {
    super()
    this.playerConnection = playerConnection
    this.playerConnection.setStorage(this)
    this.connect(params)
  }

  connect(params: r.ConnectionOptions): Promise<any> {
    let resolve
    const promise = new Promise(r => (resolve = r))
    this.userConnections = {}
    r.connect(params, (err, conn) => {
      if (err) throw err
      this.connection = conn
      r
        .table('rooms')
        .changes()
        .run(this.connection, (err, cursor) => {
          if (err) {
            console.log(err)
            return
          }
          cursor.each((err, room) => {
            this.roomNotify(room)
          })
        })
      resolve()
    })
    return promise
  }

  roomNotify(room) {
    const {new_val: rm} = room
    console.log('room change', rm)
    if (rm && rm.users) {
      rm.users.filter(u => this.userConnections[u]).forEach(u => {
        console.log('sending room user', u, rm)
        this.userConnections[u].send(
          JSON.stringify({
            type: 'ROOM_UPDATE',
            room: rm,
          })
        )
      })
    }
  }

  createRoom(id: string): Promise<any> {
    return r
      .table('rooms')
      .insert({id})
      .run(this.connection)
  }

  async getRoom(id: string) {
    await this.createRoom(id)
    return await r.table('rooms').get(id)
  }

  async onRoomJoin(room: string, player: string) {
    return (await this.getRoom(room))
      .update({
        users: (r.row('users') as any).setUnion([player]).default([]),
        modified: new Date(),
      })
      .run(this.connection)
  }

  async onRoomLeave(room: string, player: string) {
    return (await this.getRoom(room))
      .update({
        users: (r.row('users') as any).setDifference([player]).default([]),
        modified: new Date(),
      })
      .run(this.connection)
  }

  async onStartRoom(id: string) {
    const room = (await this.getRoom(id)) as any
    const game = GAMES[room.g].getInitialState(room.users)
    await r
      .table('rooms')
      .get(id)
      .update({
        game,
      })
      .run(this.connection)
  }

  async onRoomMove(room: string, player: string, move: any) {}

  async onRoomReset(id: string) {
    this.onStartRoom(id)
  }
}

// const defaultStorage = new RDBStorage({host: 'localhost', port: 28015, db: 'bg'})
