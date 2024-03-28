const express = require("express");
const { setUncaughtExceptionCaptureCallback } = require("process");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public")); // Serve static files from 'public' directory

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
let users = [];
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.on("connection", (socket) => {
  users.push(socket.id);
  if (users.length === 2) {
    io.emit("startGame");
  }
  console.log("a user connected", socket.id);
  console.log("users count : ", users.length);

  socket.on("playerMove", (position) => {
    socket.broadcast.emit("playerMoved", position);
  });

  socket.on("playerCurrentPosition", (current) => {
    socket.broadcast.emit("playerCurrentPosition", current);
  });

  socket.on("disconnect", () => {
    users = users.filter((item) => item !== socket.id);
    console.log("user disconnected", socket.id);
    console.log("users count : ", users.length);
  });
});
