import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io'

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to socket io of virtual meet');
});

const users = {};

io.on('connection', (socket) => {
    console.log('a user connected with id:', socket.id);
    socket.on('user-model', (data) => {
      // console.log(data);
      users[socket.id] = data;
      socket.broadcast.emit('user-model',{id: socket.id, data: data});
    });

    socket.emit('get-all-users', users);
    socket.on('disconnect', () => {
      console.log('a user disconnected with id:', socket.id);
      delete users[socket.id];
      socket.broadcast.emit('user-disconnected', socket.id)
    });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});