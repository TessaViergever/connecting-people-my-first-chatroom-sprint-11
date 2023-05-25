import * as path from 'path'

import { Server } from 'socket.io'
import { createServer } from 'http'
import express from 'express'

const app = express()
const http = createServer(app)
const ioServer = new Server(http, {
  connectionStateRecovery: {
    // TIME FOR RECOVERY ATTEMT ON CONNECTION FAIL
    maxDisconnectionDuration: 2 * 60 * 1000,
    // Of middlewares geskipped moeten worden bij recovery (ivm login)
    skipMiddlewares: true,
  },
})
const port = process.env.PORT || 4242
const historySize = 50

let history = []

// SERVE PUBLIC FILES
app.use(express.static(path.resolve('public')))

// START SOCKET.IO SERVER 
ioServer.on('connection', (client) => {
  // LOG CLIENT CONNECTION + GIVE ID
  console.log(`user ${client.id} connected`)

  // SEND HISTORY 
  client.emit('history', history)

  // LISTEN TO MESSAGES OF A CLIENT 
  client.on('message', (message) => {
    // CHECK MAX LENGTH HISTORY 
    while (history.length > historySize) {
      history.shift()
    }
    // ADD MESSAGE TO HISTORY 
    history.push(message)

    // SEND MESSAGE TO ALL CLIENTS 
    ioServer.emit('message', message)
  })

  // LISTEN TO A CLIENT DISCONNECT 
  client.on('disconnect', () => {
    // LOG THE DISCONNECT
    console.log(`user ${client.id} disconnected`)
  })
})

// START HTTP SERVER ON PORT NR AND LOG URL
http.listen(port, () => {
  console.log('listening on http://localhost:' + port)
})

