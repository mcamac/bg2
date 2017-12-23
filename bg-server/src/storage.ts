import * as r from 'rethinkdb'
import {SocketServer} from './socket'
import {GameStorage, PlayerConnection, Room} from './base'

import {PowerGrid} from '../../games/power-grid/src/index'
import {TerraformingMars} from '../../games/terraforming-mars/src/index'

const GAMES = {
  PowerGrid,
  TerraformingMars,
}

export class RDBStorage implements GameStorage {
  userConnections: {[key: string]: any}
  connection: r.Connection
  sockets: SocketServer
  playerConnection: PlayerConnection

  constructor(params: r.ConnectionOptions, playerConnection: PlayerConnection) {
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
            const {new_val: newRoom} = room
            this.playerConnection.notifyRoom(newRoom)
          })
        })
      resolve()
    })
    return promise
  }

  createUser(id: string) {
    return r
      .table('users')
      .insert({id})
      .run(this.connection)
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

  async updateRoom(id: string, update: object) {
    await this.createRoom(id)
    return await r
      .table('rooms')
      .get(id)
      .update(update)
  }

  async onRoomJoin(room: string, player: string) {
    return this.updateRoom(room, {
      users: (r.row('users') as any).setUnion([player]).default([]),
      modified: new Date(),
    })
  }

  async onRoomLeave(room: string, player: string) {
    return this.updateRoom(room, {
      users: (r.row('users') as any).setDifference([player]).default([]),
      modified: new Date(),
    })
  }

  async onRoomStart(id: string) {
    const room = (await this.getRoom(id)) as any
    const game = GAMES[room.g].getInitialState(room.users)
    return this.updateRoom(id, {
      game,
    })
  }

  async onRoomMove(room: string, player: string, move: any) {}

  async onRoomReset(id: string) {
    this.onRoomStart(id)
  }
}
