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
const rooms = io.sockets.adapter.rooms;

io.on('connection', (socket) => {
  let currRoom;
    console.log('a user connected with id:', socket.id);
    socket.on('join', (room) => {
      const roomValues = [...rooms].map(([roo]) => roo);
      if(room){
        if(roomValues.includes(room)){
          socket.join(room);
          socket.emit('joined-room', room)
          console.log(socket.id, 'joined room:', room)
        }else {
          socket.emit('joined-room', false)
          socket.disconnect()
        }
      }else{
        let roomId = generateId()
        while (roomValues.includes(roomId)) {
          roomId = generateId()
        }
        socket.join(roomId)
        socket.emit('joined-room', roomId)
        console.log(socket.id, 'created room:', roomId)
      }
    })
   
    socket.on('user-model', (data) => {
      currRoom = [...socket.rooms];
      users[socket.id] = data;
      socket.broadcast.to(currRoom[1]).emit('user-model', { id: socket.id, data: data });
    });
    
    socket.on('get-all-users', () => {
      currRoom = [...socket.rooms]
      const allUsers = { ...users }
      delete allUsers[socket.id];
      Object.keys(allUsers).forEach(key => {
        if (allUsers[key]['room'] !== currRoom[1]) {
          delete allUsers[key]
        }
      })
      console.log(allUsers)
      socket.emit('all-users', allUsers);
    });
    
    socket.on('disconnect', () => {
      console.log('a user disconnected with id:', socket.id);
      const data = users[socket.id];
      if (data) {
        socket.broadcast.to(currRoom[1]).emit('user-disconnected', {socketId: socket.id, peerId: data['peerId']});
        delete users[socket.id];
      }
    });
});

server.listen(port, () => {
  console.log(`server running at port ${port}`);
});

const generateId = () => {
   const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
   let randomCode = '';
   for (let i = 0; i < 8; i++) {
     randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
   }
    return randomCode;
}