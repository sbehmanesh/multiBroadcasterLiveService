const express = require("express");
const app = express();
const redis = require("redis");

app.set('view engine', 'ejs');

let broadcaster = {};
const port = 4000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

usersRoute = require('./routes/users')
app.use(usersRoute)

const redisPort = 6379
const client = redis.createClient(redisPort);
client.connect();
client.on('error', err => {
  console.log('Error ' + err);
});
client.on('connect', err => {
  console.log('Redis Connected successfully');
});
client.set("key", "value", redis.print);

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", (liveId) => {
    console.log('new live : '+liveId);
    client.set('visitors_num-'+liveId,0,function(err,reply){
      if (err) throw err;
      console.log('Redis value set '+reply);
    });
    broadcaster[liveId] = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("visit", (liveId)=>{
    client.get('visitors_num-'+liveId,function(err,reply){
      if (err) throw err;
      console.log('new visitor to : '+liveId);
      console.log('visitors_num  from : '+reply);
      client.set('visitors_num-'+liveId, +reply + +1,function(){
        console.log('visitors_num  to: '+reply);
        socket.broadcast.emit("visitors_number",+reply + +1);
      });
    });
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
    // visitors_num -= 1;
    // socket.broadcast.emit("visitors_number",visitors_num);
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
