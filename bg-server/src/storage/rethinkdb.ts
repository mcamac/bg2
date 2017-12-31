import * as r from 'rethinkdb'
import {SocketServer} from '../socket'
import {GameStorage, PlayerConnection, Room} from '../base'

import {PowerGrid} from '../../../games/power-grid/src/index'
import {TerraformingMars} from '../../../games/terraforming-mars/src/index'
import {getStateAfterActions} from '../../../games/terraforming-mars/src/fixtures'
import {cloneState} from '../../../games/terraforming-mars/src/utils'

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
            this.playerConnection.notifyRoom(newRoom, newRoom.g && GAMES[newRoom.g].getClientState)
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
      .insert({id, g: 'TerraformingMars'}, {conflict: 'error'})
      .run(this.connection)
  }

  async getRoom(id: string) {
    await this.createRoom(id)
    return await r
      .table('rooms')
      .get(id)
      .run(this.connection)
  }

  async updateRoom(id: string, update: object) {
    return await r
      .table('rooms')
      .get(id)
      .update({...update, modified: new Date()})
      .run(this.connection)
  }

  async onRoomJoin(room: string, player: string) {
    await this.createRoom(room)
    return this.updateRoom(room, {
      users: (r.row('users') as any).setUnion([player]).default([player]),
    })
  }

  async onRoomLeave(room: string, player: string) {
    return this.updateRoom(room, {
      users: (r.row('users') as any).setDifference([player]).default([]),
    })
  }

  async onRoomStart(id: string) {
    const room = (await this.getRoom(id)) as any
    console.log('start', room, GAMES[room.g])
    // const game = GAMES[room.g].get(room.users)
    const game = getStateAfterActions()
    console.log('new', game)
    return this.updateRoom(id, {
      game: (<any>r).literal(game),
    })
  }

  async onRoomMove(id: string, player: string, move: any) {
    console.log('move', id, player, move)
    const room = (await this.getRoom(id)) as any
    const state = room.game
    let newState = cloneState(state)
    try {
      newState = GAMES[room.g].reducer(state, {...move, player})
    } catch (e) {
      console.log(e)
    }
    this.updateRoom(id, {
      game: (<any>r).literal(newState),
    })
  }

  async onRoomReset(id: string) {
    this.onRoomStart(id)
  }
}
