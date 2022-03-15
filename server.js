const express = require("express");
const sqlite3 = require('sqlite3');

const app = express();
const db = new sqlite3.Database('./live.db');
broadcastDbServices = require('./db_services/broadcast_db')(db)
watcherDbServices = require('./db_services/watcher_db')(db)
commentDbServices = require('./db_services/comment_db')(db)

app.set('view engine', 'ejs');

let broadcaster = {};
const port = 4000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

usersRoute = require('./routes/users')
app.use(usersRoute)

SFURoute = require('./routes/SFU')
app.use(SFURoute)

const store = require('global-key-value-store');


io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {

  socket.on("newBroadcaster", (liveId) => {
    socket.join(liveId);
  });

  socket.on("visit", (liveId)=>{
    socket.join(liveId);
    broadcastDbServices.getBroadcastInfoByBroadcastId(liveId)
    .then((row) => {
      let visitNumber = row.visit_number;
      visitNumber += 1;
      broadcastDbServices.updateBroadcastVisitNumber(liveId,visitNumber);
      io.emit("visitorsNumber", visitNumber);    
    }).catch((error) => {
      console.log(error);
    });
  });

  socket.on("newComment", (liveId,userId,commentText,type)=>{
    watcherDbServices.getWatcherInfoByUserId(userId)
    .then((row) => {
      commentDbServices.createComment(commentText,userId,liveId);
      io.sockets.in(liveId).emit("comment", row.user_name , commentText , type);    
    });
  });
  
  socket.on("shakeHands", (liveId,userId)=>{
    watcherDbServices.getWatcherInfoByUserId(userId)
    .then((row) => {
      socket.broadcast.to(liveId).emit("shakeHands" , row.user_name);    
    });
  });

  socket.on("disconnect", (liveId) => {
  });
  
});


server.listen(port,() => console.log(`Server is running on port ${port}`));
