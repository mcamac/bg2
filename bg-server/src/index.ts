import * as express from 'express'
import {Server, createServer} from 'http'

import {decodeToken} from './auth'
import {SocketServer} from './socket'
import {RedisStorage} from './storage/redis'

const PORT = 3000
const JWT_SECRET = 'aEGkGc0lejJqrQMDSWHM-31YIS6GbNP4m3wUKT7YPpyPXB_XkFAoVR-0XMGMQG7V'

const app = express()
const server = new Server(app)
const socketServer = new SocketServer(server)
socketServer.start()

const gameStorage = new RedisStorage(
  {
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD || '',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    db: '1',
  },
  socketServer
)

server.listen(PORT, () => {
  console.log('Listening on', PORT)
})

const healthApp = express()
const healthServer = new Server(app)

healthApp.get('/', (req, res) => res.send('Hello World!'))
healthApp.get(
  '/.well-known/acme-challenge/1bT0BoqfQkvgMziCRNkxXrPHDVlDioTas4ijW667jhg',
  (req, res) =>
    res.send(
      '1bT0BoqfQkvgMziCRNkxXrPHDVlDioTas4ijW667jhg.3YYmf2dm6hNdyTzGpYLNEVkTtynr72JFE0eKuewhzQE'
    )
)

healthApp.listen(3002)
