import * as express from 'express'
import {Server} from 'http'

import {decodeToken} from './auth'
import {SocketServer} from './socket'
import {RDBStorage} from './storage'

const PORT = 3000
const JWT_SECRET = 'aEGkGc0lejJqrQMDSWHM-31YIS6GbNP4m3wUKT7YPpyPXB_XkFAoVR-0XMGMQG7V'

const app = express()
const server = new Server(app)
const socketServer = new SocketServer(server)
socketServer.start()
const gameStorage = new RDBStorage({host: 'localhost', port: 28015, db: 'bg'}, socketServer)

server.listen(PORT, () => {
  console.log('Listening on', PORT)
})
