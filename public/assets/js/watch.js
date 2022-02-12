let peerConnection;
const config = {
  iceServers: [
      { 
        "urls": "stun:stun.l.google.com:19302",
      },
      // { 
      //   "urls": "turn:TURN_IP?transport=tcp",
      //   "username": "TURN_USERNAME",
      //   "credential": "TURN_CREDENTIALS"
      // }
  ]
};

const socket = io.connect(window.location.origin);
const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");
const liveId = document.querySelector("#liveId");
const visitors_num = document.querySelector(".visitors_num");
const send_comment = document.querySelector("#send_comment");
const comment = document.querySelector("#comment_text");
const comments_div = document.querySelector(".comments");
const events_div = document.querySelector(".events");


socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});


socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher",liveId.value.toString());
});

socket.on("connect", () => {
  socket.emit("visit",liveId.value.toString());
});

socket.on("connect", () => {
  socket.emit("shake_hands",liveId.value.toString());
});

socket.on("broadcaster", () => {
  socket.emit("watcher",liveId.value.toString());
});

socket.on("visitors_number", number => {
  visitors_num.innerHTML = number;
});

socket.on("shake_hands", () => {
  new_row = `
    <div class="row fadeOut">
      <i class='bx bxs-user-plus bx-tada' style='color:#95d63d;font-size:28px'></i> 
      <span>new user joined</span>
    </div>
  `;
  events_div.innerHTML = new_row + events_div.innerHTML;
});

socket.on("comment", (text,type) => {
  if(type == "admin"){
    comment_html = 
      `<div class="comment">
        <div class="avatar admin">
          <img src='/images/avatar.png' />
        </div>
        <div class="user">
          <span>Admin</span>
          <p>${text}</p>
        </div>
      </div>`;
  }else{
    comment_html = 
      `<div class="comment">
        <div class="avatar">
          <img src='/images/avatar.png' />
        </div>
        <div class="user">
          guest
          <p>${text}</p>
        </div>
      </div>`;
  }
  comments_div.innerHTML += comment_html;
});

window.onunload = window.onbeforeunload = () => {
  socket.emit("disconnect",liveId.value.toString());
  socket.close();
  peerConnection.close();
};

function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}

function disableAudio() {
  console.log("Disabling audio")
  video.muted = true;
}

document.querySelector('#mute-unmute').addEventListener('click',function(){
  let isMuted = this.children[0].classList.contains('bxs-volume-full');
  if(isMuted) {
    console.log('muted');
    disableAudio();
  }else{
    console.log('unmuted');
    enableAudio();
  }
});
enableAudio();

send_comment.addEventListener('click',function(){
  let text = comment.value;
  socket.emit("new_comment",liveId.value.toString(),text,"user");
});


