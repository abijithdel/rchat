const express = require('express')
const { createServer } = require('node:http')
const { Server } = require('socket.io');
const path = require('path')
const { InitConnection } = require('./helpers/sockethelp')
const { SaveLog } = require('./helpers/setlog')
require('dotenv').config();

const app = express()
const server = createServer(app)
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));


let waiting = []
const connections = {}
let online = 0
let IP;

io.on('connection', (socket) => {
  online++;
  socket.on('ip', (ip) => {
    IP = ip
    SaveLog(socket.id, ip, 'Join')
    console.log(`Join user. ${socket.id}, IP:${ip}`)
  })
  io.to(socket.id).emit('init', { socketid: socket.id })
  io.emit('onlineusers', online)

  socket.on('find', async ({ peerid, pid }) => {
    if (waiting.length >= 1) {
      const touser = await InitConnection(waiting, connections, socket.id)
      if(!touser) return;

      io.to(socket.id).emit('peerid', { socketid: touser.socketid, peerid: touser.peerid, initiator: true, mysocketid: socket.id })
      io.to(touser.socketid).emit('peerid', { socketid: socket.id, peerid: peerid, initiator: false, mysocketid: socket.id })

      connections[socket.id] = { socketid: touser.socketid, peerid: touser.peerid }
      connections[touser.socketid] = { socketid: socket.id, peerid: peerid }

      io.to(touser.socketid).emit('smessage', { to: 'system', message: `connected` })
      io.to(socket.id).emit('smessage', { to: 'system', message: `connected` })

      waiting = waiting.filter(item => item.socketid !== socket.id && item.socketid !== touser.socketid)
    } else {
      waiting.push({ socketid: socket.id, peerid, pcid: pid ? pid : null })
    }
  })

  socket.on('cmessage', ({ to, message }) => {
    io.to(to).emit('smessage', { to: socket.id, message })
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
    io.emit('onlineusers', online)
    console.log(`Leave user. ${socket.id}, IP: ${IP}`);
    SaveLog(socket.id, IP, 'Leave')
  });
});


const IndexRouter = require('./routers/index')
app.use('/', IndexRouter)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Running on ${PORT}`))

module.exports = server;