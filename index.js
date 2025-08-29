const express = require('express')
const { createServer } = require('node:http')
const { Server } = require('socket.io');
const path = require('path')
const GetIndex = require('./helpers/index')

const app = express()
const server = createServer(app)
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));


const waiting = []
const connections = {}
let online = 0

io.on('connection', (socket) => {
  console.log(`a user connected: ${socket.id}`);
  online++;
  io.emit('onlineusers',online)
  socket.on('find', (peerid) => {
    if (waiting.length >= 1) {
      const index = GetIndex(waiting.length - 1)
      
      const touser = waiting[index]
      if (touser.socketid === socket.id) return;

      io.to(socket.id).emit('peerid', { socketid: touser.socketid, peerid: touser.peerid, initiator: true })
      io.to(touser.socketid).emit('peerid', { socketid: socket.id, peerid: peerid, initiator: false })

      connections[socket.id] = { socketid: touser.socketid, peerid: touser.peerid }
      connections[touser.socketid] = { socketid: socket.id, peerid: peerid }

      io.to(touser.socketid).emit('smessage',{ to:'system', message:`connected` })
      io.to(socket.id).emit('smessage',{ to:'system', message:`connected` })

      waiting.splice(index,1)
      waiting.filter(item => item.socketid !== socket.id)
    } else {
      waiting.push({ socketid: socket.id, peerid, pcid: null })
    }
  })

  socket.on('cmessage', ({to, message}) => {
    io.to(to).emit('smessage',{to:socket.id, message })
  })

  socket.on('skip', (peerid) => {
    const conn = connections[socket.id];
    if (conn) {
      io.to(conn.socketid).emit('leaveuser', socket.id);
      delete connections[conn.socketid];
    }
    delete connections[socket.id]
  });

  socket.on('disconnect', () => {
    online--;
    const conn = connections[socket.id];
    if (conn) {
      io.to(conn.socketid).emit('leaveuser', socket.id);
      delete connections[conn.socketid];
    }
    delete connections[socket.id];
    waiting.filter(item => item.socketid !== socket.id)
    io.emit('onlineusers',online)
    console.log(`user disconnected: ${socket.id}`);
  });
});


const IndexRouter = require('./routers/index')
app.use('/', IndexRouter)

const PORT = 3000 || process.env.PORT
server.listen(PORT, () => console.log(`Running on ${PORT}`))

module.exports = server;