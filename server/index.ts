import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import nedb from 'nedb'
import { getSession, createNewSession, updateUsername } from './sessions'
import { addMessage, getMessages } from './messages'

// Initialize db from file
const db = {}
db['sessions'] = new nedb({ filename: 'storage/sessions.json', autoload: true})
db['messages'] = new nedb({ filename: 'storage/messages.json', autoload: true })

// Initialize express & socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

io.use(async (socket, next) => {
  const sessionId = socket.handshake.auth.sessionId;
  let session = await getSession(db, sessionId);
  if (!session) {
    // create new session
    session = await createNewSession(db);
    socket.emit('session', session)
  }
 
  socket.data.session = session
  next()
})

io.on('connection', async (socket) => {
  console.log('User connected', socket.data.session);
  // broadcast user join
  io.emit('message feed', [{
    username: 'Server',
    message: `${socket.data.session.username} has joined the room`,
  }])

  // send messages currently in the room
  const messages = await getMessages(db, socket.data.session.sessionId)
  socket.emit('message feed', messages)

  // handle new messages
  socket.on('chat message', (msg) => {
    // attach username and broadcast message
    io.emit('message feed', [{
      username: socket.data.session.username,
      message: msg,
    }])
    addMessage(db, socket.data.session.sessionId, msg)
  });

  // handle username change
  socket.on('change name', (name) => {
    const oldUsername = socket.data.session.username
    socket.data.session.username = name
    updateUsername(db, socket.data.session.sessionId, name)
    socket.emit('session', socket.data.session)
    // broadcast username change
    io.emit('message feed', [{
      username: 'Server',
      message: `${oldUsername} is now ${name}`,
    }])
  })

  // handle exit
  socket.on('exit', () => {
    // broadcast user has left room
    io.emit('message feed', [{
      username: 'Server',
      message: `${socket.data.session.username} has left the room`,
    }])
    socket.disconnect(true);
  })
});

server.listen(3030, () => {
  console.log('listening on *:3030');
});
