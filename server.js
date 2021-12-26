const express = require("express");
const app = express();

app.set('view engine', 'ejs');

let broadcaster = {};
const port = 4000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

usersRoute = require('./routes/users')
app.use(usersRoute)

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", (liveId) => {
    broadcaster[liveId] = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", (liveId) => {
    socket.to(broadcaster[liveId]).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", (liveId) => {
    socket.to(broadcaster[liveId]).emit("disconnectPeer", socket.id);
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
