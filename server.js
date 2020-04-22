// Import packages
const express = require("express");
const socketIO = require("socket.io");
const path = require("path");

// Configuration
const PORT = process.env.PORT || 3003;
const INDEX = path.join(__dirname, 'index.html');

// Start server
const server = express()
  .use((req, res) => res.sendFile(INDEX) )
 .listen(PORT, () => console.log("Listening on localhost:" + PORT));

// Initiatlize SocketIO
const io = socketIO(server);

// Register "connection" events to the WebSocket
io.on("connection", function(socket) {
  // Register "join" events, requested by a connected client
  socket.on("join", function (room) {
    console.log(room, 'join')
    // join channel provided by client
    socket.join(room)
    // Register "image" events, sent by the client
    var clients = io.sockets.adapter.rooms[room];
    console.log(clients, 'number of client in the room'+room)

    var srvSockets = io.sockets.sockets;
    console.log(Object.keys(srvSockets).length, 'Count all clients connected to server');

    var nspSockets = io.of('/chat').sockets;
    console.log(Object.keys(nspSockets).length, 'Count all clients connected to namespace chat')

    socket.on("image", function(msg) {
      console.log(msg, 'image')
      // Broadcast the "image" event to all other clients in the room
      socket.broadcast.to(room).emit("image", msg);
    });
  })
});