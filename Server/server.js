// #region INIT
const express = require("express");
const ex = express();
const http = require('http');
const { Server }  = require('socket.io')
const server = http.createServer(ex)
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allowed HTTP methods
    credentials: true,
  },
});
const port = 23239;

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.emit('newMessage', { from: 'Server', text: 'Welcome!', createdAt: Date.now() });

  socket.on('createMessage', (message) => {
      console.log('New message:', message);
      io.emit('newMessage', message); // Send to everyone
  });

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});

let rom = server.listen(port, () => {
  console.log(rom.address().port)
  console.log(`server started on ${port}`)
});

const keymap = require("./key-map");
const fs = require("fs");
const path = require("node:path");
const robot = require("@jitsi/robotjs");