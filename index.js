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

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Welcome to socket io of virtual meet');
});

const users = {};

io.on('connection', (socket) => {
    console.log('a user connected with id:', socket.id);
    socket.on('user-model', (data) => {
      users[socket.id] = data;
      socket.broadcast.emit('user-model',{id: socket.id, data: data});
    });

    socket.on('get-all-users', () => {
      const allUsers = { ...users }
      delete allUsers[socket.id];
      socket.emit('all-users', allUsers);
    });
    
    socket.on('disconnect', () => {
      console.log('a user disconnected with id:', socket.id);
      const data = users[socket.id];
      if (data) {
        socket.broadcast.emit('user-disconnected', {socketId: socket.id, peerId: data['peerId']});
        delete users[socket.id];
      }
    });
});

server.listen(port, () => {
  console.log(`server running at port ${port}`);
});