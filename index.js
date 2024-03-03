import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io'

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://meet.piyushg.com', // change this to the domain you will make the request from
  }
});

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Welcome to socket io of virtual meet');
});

const users = {};
const admins = []
const rooms = io.sockets.adapter.rooms;

io.on('connection', (socket) => {
  let currRoom;
    socket.on('join', (room) => {
      const roomValues = [...rooms].map(([roo]) => roo);
      if(room){
        if(roomValues.includes(room)){
          socket.join(room);
          socket.emit('joined-room', room)
        }else {
          socket.emit('joined-room', false)
        }
      }else{
        let roomId = generateId()
        while (roomValues.includes(roomId)) {
          roomId = generateId()
        }
        socket.join(roomId)
        admins.push(socket.id)
        socket.emit('joined-room', roomId)
        console.log(socket.id, 'created room:', roomId)
      }
    })
   
    socket.on('user-model', (data) => {
      currRoom = [...socket.rooms][1];
      users[currRoom] = {...users[currRoom], [socket.id]: data};
    });
    
    socket.on('get-all-users', () => {
      currRoom = [...socket.rooms][1]
      const allUsers = { ...users[currRoom] }
      delete allUsers[socket.id]
      socket.emit('all-users', allUsers);
    });
    
    socket.on('disconnect', () => {
      if (currRoom && users[currRoom] && users[currRoom][socket.id]) {
        const data = users[currRoom][socket.id];
        socket.broadcast.to(currRoom).emit('user-disconnected', {socketId: socket.id, peerId: data['peerId']});
        delete users[currRoom][socket.id]
      }
      if (currRoom && users[currRoom] && Object.keys(users[currRoom]).length === 0) {
        delete users[currRoom]
        console.log('deleted room:', currRoom)
      }
    });

    socket.on('end-for-all', () => {
      if(admins.includes(socket.id)){
        socket.broadcast.to(currRoom).emit('admin-ended-call')
      }
    })
});

server.listen(port, () => {
  console.log(`server running at port ${port}`);
});

const generateId = () => {
   const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
   let randomCode = '';
   for (let i = 0; i < 6; i++) {
     randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
   }
    return randomCode;
}