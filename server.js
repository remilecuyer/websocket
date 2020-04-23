// Import packages
const express = require("express");
const socketIO = require("socket.io");
const path = require("path");

// Configuration
const PORT = process.env.PORT || 3003;
const INDEX = path.join(__dirname, 'index.html');

// Start server
const server = express()
  .use((req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log("Listening on localhost:" + PORT));

// Initiatlize SocketIO
const io = socketIO(server);

let deviceList = [];
let deviceListIds = [];

// Register "connection" events to the WebSocket
io.on("connection", function (socket) {
  // Register "join" events, requested by a connected client
  socket.on("join", function (room) {
    console.log(room, 'join')
    // join channel provided by client
    socket.join(room)

    socket.broadcast.to(room).emit("pingDevices", "ping");


    // Register "image" events, sent by the client
    var clients = io.sockets.adapter.rooms[room];
    console.log(clients, 'number of client in the room' + room)
    socket.broadcast.to(room).emit("room_detail", clients);

    var srvSockets = io.sockets.sockets;
    console.log(Object.keys(srvSockets).length, 'Count all clients connected to server');

    var nspSockets = io.of('/chat').sockets;
    console.log(Object.keys(nspSockets).length, 'Count all clients connected to namespace chat')

    socket.on("image", function (msg) {
      console.log(msg, 'image')
      // Broadcast the "image" event to all other clients in the room
      socket.broadcast.to(room).emit("image", msg);
    });

    socket.on("newScan", function (msg) {
      console.log(msg, 'newScan')
      // Broadcast the "image" event to all other clients in the room
      socket.broadcast.to(room).emit("newScan", msg);
    });

    socket.on('disconnect', function () {
      console.log('disconnect');

      var clients = io.sockets.adapter.rooms[room];
      console.log(clients, 'number of client in the room' + room)
      socket.broadcast.to(room).emit("room_detail", clients);
      // deviceList = [];
      // deviceListIds = [];

      deviceList.map((key, i) => 
        deviceList[i]['status'] = false
      );


      socket.broadcast.to(room).emit("pingDevices", "ping");
      console.log('ping');


    });

    socket.on('newDevice', function (msg) {
      console.log(deviceListIds);
      // console.log(msg.id);
      // console.log(deviceListIds.indexOf(msg.id) === -1);
      // deviceList[msg.id] = msg;
      // console.log(deviceList.find(x => x.id === msg.id).status, 'check Status '+x.id)
      if(deviceListIds.indexOf(msg.id) === -1) {
        msg['status'] = true
        deviceList.push(msg);
        deviceListIds.push(msg.id)
      }
      else {
        let key = deviceList.findIndex(x => x.id === msg.id);
        deviceList[key]['status'] = true;
        // console.log(deviceList.findIndex(x => x.id === msg.id), 'key');
        
      }  

      console.log(deviceList, 'deviceList - websocket')
      socket.broadcast.to(room).emit("devicesList", deviceList);
    });


  })
});