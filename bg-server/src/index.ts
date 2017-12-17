import * as express from 'express'
import * as bodyParser from 'body-parser'
import {Server} from 'http'
import {graphqlExpress, graphiqlExpress} from 'apollo-server-express'
import * as jwtDecode from 'jwt-decode'
import * as jwt from 'jsonwebtoken'
import * as jwksClient from 'jwks-rsa'

import {getInitialState, handleAction} from '../../games/power-grid/src/index'

import * as r from 'rethinkdb'

import * as WebSocket from 'ws'

const PORT = 3000
const JWT_SECRET = 'aEGkGc0lejJqrQMDSWHM-31YIS6GbNP4m3wUKT7YPpyPXB_XkFAoVR-0XMGMQG7V'

const app = express()
const server = new Server(app)
const wss = new WebSocket.Server({server})

const jwks = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: 'https://bgz.auth0.com/.well-known/jwks.json',
})

let userConnections = {}

let connection = null
r.connect({host: 'localhost', port: 28015, db: 'bg'}, (err, conn) => {
  if (err) throw err
  connection = conn
  r
    .table('rooms')
    .changes()
    .run(connection, (err, cursor) => {
      if (err) {
        console.log(err)
        return
      }
      cursor.each((err, room) => {
        const {new_val: rm} = room
        console.log('room change', rm)
        if (rm && rm.users) {
          rm.users.filter(u => userConnections[u]).forEach(u => {
            console.log('sending room user', u, rm)
            userConnections[u].send(
              JSON.stringify({
                type: 'ROOM_UPDATE',
                room: rm,
              })
            )
          })
        }
      })
    })
})

let publicKey = null

// jwks.getSigningKey('MTEwNDc2NDY0Q0NCMzgxQkYzQTE5QkI3MTFDMzA3MTE2RDM3MDQzQQ', (err, key) => {
//   console.log('key', key)
//   publicKey = key.publicKey
// })
publicKey =
  '-----BEGIN CERTIFICATE-----\nMIIC9TCCAd2gAwIBAgIJIUIi8lAitvB7MA0GCSqGSIb3DQEBCwUAMBgxFjAUBgNV\nBAMTDWJnei5hdXRoMC5jb20wHhcNMTcxMTI0MTk0ODA4WhcNMzEwODAzMTk0ODA4\nWjAYMRYwFAYDVQQDEw1iZ3ouYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEA0t//04WrcR7wygvpS5CjGwZxTIaNlblkUO+/frEmjPFexdZE\nNPhMO22WMBl3lbHHnjiRflxbQ8dkSGs9Z65qGMwnqmG2LuJ2tWkQpib/HC49EHNx\nFl1ssdHIlzfcvlV5c6ANb4V3X2Yk7kWPfnr2BrRrrvaFLWXEJfiV8HbIIv9PW54k\nQ1ISCXcGLoHC/AUvw29tqysxjuWARN5k89OEcC5jsAQHYPg+dN7TuuhVhvESkhAT\n+pc6r8iDz6YNEnJ2fw/xDmW60fHKbtTtIoxiTTrWOz+alvzxufGw3lYUFBdFgzxH\nfVT6g8UNSkv3cQThWcWu7tIAlkO7tAWsgWSj8QIDAQABo0IwQDAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBRP5q2+QevyDdP78Ya6d1Qr2l+TczAOBgNVHQ8BAf8E\nBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAA0QIjqGbLk3QN1RB3Ii/Rib+BaKnCLK\nR143Rc6F16hfNqtNSix1iBM8p1NcYmrb/ts9YtAzGw/QVZOhkz0kK1Y3MiLDMJeL\nFt3sigkpviKw6vcNtde2WMxLIrf6pHqVvwa/9mOZQjEt4hP2jglBsZmYJG8rRskd\nHUfeLsQtPl6egnj7nqU/QbgOuoT32YSE0g0NWKr/G78I9JI8meFWldPKBi9pU64/\np63DBEHqRH5QMdyJ72qc3aHGAQIkhARYd0cYaamtouokQcrlDK96A6+S2MeDGE+L\nlJeneacHKUDeCzSuVOs5YDuqb2SMwsGJRct1C4M5SvUaUGNUylveMQE=\n-----END CERTIFICATE-----\n'

const createRoom = id => {
  return r
    .table('rooms')
    .insert({
      id,
    })
    .run(connection)
}

wss.on('connection', (ws: WebSocket) => {
  //connection is up, let's add a simple simple event
  ws.on('message', async (message: string) => {
    //log the received message and send it back to the client
    const data = JSON.parse(message)
    console.log('received:', data)
    if (ws['token']) {
      console.log('got auth message', ws['token'], data)
      if (data.action === 'JOIN_ROOM') {
        console.log(
          'room',
          await r
            .table('rooms')
            .get(data.room)
            .run(connection)
        )
        await createRoom(data.room)
        await r
          .table('rooms')
          .get(data.room)
          .update({
            users: (r.row('users') as any).setUnion([ws['token'].email]).default([]),
            modified: new Date(),
          })
          .run(connection)
      }
      if (data.action === 'LEAVE_ROOM') {
        await createRoom(data.room)
        await r
          .table('rooms')
          .get(data.room)
          .update({
            users: (r.row('users') as any).setDifference([ws['token'].email]).default([]),
            modified: new Date(),
          })
          .run(connection)
      }
      if (data.action === 'START_ROOM') {
        await createRoom(data.room)
        console.log('action', data)
        const room = (await r
          .table('rooms')
          .get(data.room)
          .run(connection)) as any
        const game = getInitialState(room.users)
        await r
          .table('rooms')
          .get(data.room)
          .update({
            game,
          })
          .run(connection)
      }
      if (data.action === 'ROOM_MOVE') {
        await createRoom(data.room)
        console.log('ROOM_MOVE action', data)
        const room = (await r
          .table('rooms')
          .get(data.room)
          .run(connection)) as any
        console.log(room.game, data.move)
        if (ws['token']['email'] !== room.game.player) {
          return
        }
        const [newState, error, log] = handleAction(room.game, data.move)
        // const game = getInitialState(room.users)
        if (!error) {
          await r
            .table('rooms')
            .get(data.room)
            .update({
              game: newState,
            })
            .run(connection)
        }
      }
      if (data.action === 'RESET_STATE') {
        await createRoom(data.room)
        const room = (await r
          .table('rooms')
          .get(data.room)
          .run(connection)) as any
        const game = getInitialState(room.users)
        await r
          .table('rooms')
          .get(data.room)
          .update({
            game,
          })
          .run(connection)
      }
    }

    if (data.type === 'token') {
      console.log(data)
      const decoded = jwt.verify(data.token, publicKey, {algorithms: ['RS256']})
      console.log(decoded)
      ws['token'] = decoded
      ws.send(JSON.stringify({auth: true}))
      userConnections[ws['token'].email] = ws
      r
        .table('users')
        .insert({id: ws['token'].email})
        .run(connection)
    }
  })
})

server.listen(PORT, () => {
  console.log('Listening on', PORT)
})
