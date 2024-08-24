import https from 'https'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { Server, LobbyRoom } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import { RoomType } from '../types/Rooms'
// import socialRoutes from "@colyseus/social/express"
import { SkyOffice } from './rooms/SkyOffice'

// SSL 証明書と秘密鍵のパスを指定
const privateKey = fs.readFileSync('../cert/localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('../cert/localhost.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };

const port = Number(process.env.PORT || 2567)
const app = express()

app.use(cors())
app.use(express.json())
// app.use(express.static('dist'))

// HTTPS サーバーを作成
const server = https.createServer(credentials, app)
const gameServer = new Server({
  server,
})

// register room handlers
gameServer.define(RoomType.LOBBY, LobbyRoom)
gameServer.define(RoomType.PUBLIC, SkyOffice, {
  name: 'Public Lobby',
  description: 'For making friends and familiarizing yourself with the controls',
  password: null,
  autoDispose: false,
})
gameServer.define(RoomType.CUSTOM, SkyOffice).enableRealtimeListing()

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor AFTER registering your room handlers
app.use('/colyseus', monitor())

gameServer.listen(port)
console.log(`Listening on https://localhost:${port}`)
