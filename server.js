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

const store = require('global-key-value-store');


io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {

  socket.on("broadcaster", (liveId) => {
    store.set('visitors_num-'+liveId,0);
    broadcaster[liveId] = socket.id;
    socket.broadcast.emit("broadcaster");
  });

  socket.on("visit", (liveId)=>{
    let visitors_num = store.get('visitors_num-'+liveId);
    visitors_num += 1;
    store.set('visitors_num-'+liveId, visitors_num);
    io.emit("visitors_number", visitors_num);    
  });

  socket.on("new_comment", (liveId,comment_text,type)=>{
    console.log(comment_text);
    io.emit("comment", comment_text , type);    
  });
  
  socket.on("shake_hands", (liveId,)=>{
    socket.broadcast.emit("shake_hands");    
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

  socket.on("disconnect", (liveId) => {
    let visitors_num = store.get('visitors_num-'+liveId);
    visitors_num -= 1;
    store.set('visitors_num-'+liveId, visitors_num);
    io.emit("visitors_number",visitors_num);
  });
  
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
