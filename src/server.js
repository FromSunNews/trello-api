import express from 'express'
import cors from 'cors'
import { corsOptions } from '*/config/cors'
import { connectDB } from '*/config/mongodb'
import { env } from '*/config/environtment'
import { apiV1 } from '*/routes/v1'
import cookieParser from 'cookie-parser'

import socketIo from 'socket.io'
import http from 'http'

import { 
  inviteUserToBoardSocket,
  userAcceptedInvitationToBoardSocket
} from '*/sockets/inviteUserToBoardSocket'

import { 
  createNewColumnSocket,
  updateColumnSocket
} from '*/sockets/userInteractColumnSocket'

import { 
  updateCardSocket
} from '*/sockets/userInteractCardSocket'

connectDB()
  .then(() => console.log('Connected successfully to database server!'))
  .then(() => bootServer())
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

const bootServer = () => {
  const app = express()

  // Fix cái vụ Cache from disk của ExpressJS
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())

  app.use(cors(corsOptions))

  // Enable req.body data
  app.use(express.json())

  // Use APIs v1
  app.use('/v1', apiV1)

  // for real-time
  const server = http.createServer(app)
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    // console.log('New client: ', socket.id)

    // socket.on('disconnect', () => {
    //   console.log('Client disconnected: ', socket.id)
    // })

    // xử lý thôgns báo đến
    inviteUserToBoardSocket(socket)
    // xử lý người hiển thị người dùng mới chấp nhận join board
    userAcceptedInvitationToBoardSocket(socket)
    // xử lý hiển thị tạo cột mới trong board 
    createNewColumnSocket(socket)
    // xử lý hiển thị cập nhật column trong board 
    updateColumnSocket(socket)
    // xử lý hiển thị cập nhật card trong board và activeCardModal 
    updateCardSocket(socket)
  })


  // app.listen(env.APP_PORT, env.APP_HOST, () => {
  //   console.log(`Hello trungquandev, I'm running at ${env.APP_HOST}:${env.APP_PORT}/`)
  // })

  // Support heroku deploy
  server.listen(process.env.PORT || env.APP_PORT, () => {
    console.log(`Hello FromSunNews, I'm running at port: ${process.env.PORT || env.APP_PORT}/`)
  })
}
