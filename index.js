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

io.on('connection', (socket) => {
    console.log('a user connected with id:', socket.id);
    socket.on('disconnect', () => {
      console.log('a user disconnected with id:', socket.id);
    });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});