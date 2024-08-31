const express = require('express');
const PORT= process.env.PORT || 5000;
const app = express();
const http = require('http');

const server = http.createServer(app);
const { Server } = require("socket.io");
const Action = require('./src/Action');

const io = new Server(server);

app.get('/', (req, res) => {
    res.send('Hello World');
});

const userSocketMap={};
function getAllConnectedClients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId)||[]).map(
        (socketId)=>{
            return{
                socketId,
                username: userSocketMap[socketId]
            };
    });
}

io.on('connection', (socket) => {
    console.log('A user connected',socket.id);
    
    socket.on(Action.JOIN,({roomId,username})=>{
        userSocketMap[socket.id]=username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId})=>{
            io.to(socketId).emit(Action.JOINED,{
                clients,
                username,
                socketId: socket.id
            });
        })
    });
    
    socket.on(Action.CODE_CHANGE,({roomId,code})=>{
            socket.in(roomId).emit(Action.CODE_CHANGE,{code});
    });
    socket.on(Action.SYNC_CODE,({socketId,code})=>{
        io.to(socketId).emit(Action.CODE_CHANGE,{code});
    });

    socket.on('disconnecting',()=>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId)=>{
            socket.in(roomId).emit(Action.DISCONNECTED,{
                socketId: socket.id,
                username: userSocketMap[socket.id]
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
    
});

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})