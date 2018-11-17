import {SocketServer} from '../socket'
import {GameStorage, PlayerConnection, Room} from '../base'

// import {PowerGrid} from '../../../games/power-grid/src/index'
import {TerraformingMars} from '../../../games/terraforming-mars/src/index'
import {getSoloStateAfterActions} from '../../../games/terraforming-mars/src/fixtures'
import {cloneState} from '../../../games/terraforming-mars/src/utils'
import {createHandyClient} from 'handy-redis'
import {IHandyRedis} from 'handy-redis/dist/generated/interface'
import {ClientOpts} from 'redis'

const GAMES = {
  // PowerGrid,
  TerraformingMars,
}

export class RedisStorage implements GameStorage {
  sockets: SocketServer
  playerConnection: PlayerConnection
  client: IHandyRedis

  constructor(params: ClientOpts, playerConnection: PlayerConnection) {
    this.playerConnection = playerConnection
    this.playerConnection.setStorage(this)
    this.connect(params)
  }

  connect(params: ClientOpts) {
    this.client = createHandyClient(params)
    this.client.redis.on('error', err => {
      console.error(err)
    })
  }

  createUser(id: string) {
    // return r
    //   .table'users')
    //   .insert({id})
    //   .run(this.connection)
    return Promise.resolve(true)
  }

  async getRoom(id: string) {
    let roomStr = await this.client.get(id)
    if (!roomStr) {
      roomStr = JSON.stringify({id, g: 'TerraformingMars'})
      console.log('getRoom', id)
      await this.client.set(id, roomStr)
    }
    return JSON.parse(roomStr)
  }

  async updateRoom(id: string, update) {
    const room = await this.getRoom(id)
    console.log('room', id, room)
    const updated = {...room, ...update(room)}
    await this.client.set(id, JSON.stringify(updated))
    console.log('updated', id, updated)
    this.playerConnection.notifyRoom(updated, updated.g && GAMES[updated.g].getClientState)
  }

  async onRoomJoin(id: string, player: string) {
    console.log('room join', id, player)
    return this.updateRoom(id, room => ({
      users: Array.from(new Set([...(room.users || []), player])),
    }))
  }

  async onRoomLeave(id: string, player: string) {
    return this.updateRoom(id, room => ({
      users: (room.users || []).filter(user => user !== player),
    }))
  }

  async onRoomStart(id: string) {
    const room = (await this.getRoom(id)) as any
    console.log('start', room, GAMES[room.g])
    // const game = GAMES[room.g].get(room.users)
    const game = getSoloStateAfterActions()
    console.log('new s', id, game)
    return this.updateRoom(id, room => ({
      game,
    }))
  }

  async onRoomMove(id: string, player: string, move: any) {
    console.log('move', id, player, move)
    const room = (await this.getRoom(id)) as any
    const state = room.game
    let newState = cloneState(state)
    try {
      newState = GAMES[room.g].reducer(state, {...move, player})
    } catch (e) {
      console.log('error x', e)
      this.playerConnection.notifyPlayer(id, player, {type: 'MOVE_ERROR', error: e.message})
    }
    // console.log('new state', newState)
    return this.updateRoom(id, room => ({
      game: newState,
    }))
  }

  async onRoomReset(id: string) {
    this.onRoomStart(id)
  }
}
