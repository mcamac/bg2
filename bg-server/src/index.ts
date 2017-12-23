import * as express from 'express'
import * as bodyParser from 'body-parser'
import {Server} from 'http'
import {graphqlExpress, graphiqlExpress} from 'apollo-server-express'
import * as jwtDecode from 'jwt-decode'
import * as jwt from 'jsonwebtoken'
import * as jwksClient from 'jwks-rsa'

import {getInitialState, handleAction} from '../../games/power-grid/src/index'
import {TerraformingMars} from '../../games/terraforming-mars/src/index'

import {decodeToken} from './auth'
import {SocketServer} from './socket'
import {RDBStorage} from './storage'

import * as r from 'rethinkdb'

import * as WebSocket from 'ws'
import {PlayerConnection} from './base'

const PORT = 3000
const JWT_SECRET = 'aEGkGc0lejJqrQMDSWHM-31YIS6GbNP4m3wUKT7YPpyPXB_XkFAoVR-0XMGMQG7V'

const app = express()
const server = new Server(app)
const wss = new WebSocket.Server({server})
const socketServer = new SocketServer(server)
socketServer.start()
const gameStorage = new RDBStorage({host: 'localhost', port: 28015, db: 'bg'}, socketServer)

server.listen(PORT, () => {
  console.log('Listening on', PORT)
})
