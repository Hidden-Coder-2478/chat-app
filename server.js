const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("new user", (username) => {
    socket.username = username;
    socket.broadcast.emit("user joined", username);
  });

  socket.on("chat message", (msgData) => {
    io.emit("chat message", msgData);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      socket.broadcast.emit("user left", socket.username);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
