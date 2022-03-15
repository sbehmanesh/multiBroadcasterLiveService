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
var globalPeer;

const socket = io.connect(window.location.origin);
const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");
const liveId = document.querySelector("#liveId");
const userId = document.querySelector("#userId");
const visitorsNum = document.querySelector(".visitors_num");
const sendComment = document.querySelector("#send_comment");
const comment = document.querySelector("#comment_text");
const commentsDiv = document.querySelector(".comments");
const eventsDiv = document.querySelector(".events");


window.onload = () => {
  init();
}

async function init() {
  const peer = createPeer();
  peer.addTransceiver("video", { direction: "recvonly" });
}

function createPeer() {
  const peer = new RTCPeerConnection(config);
  peer.ontrack = event => {
    video.srcObject = event.streams[0];
  };
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

  return peer;
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
      sdp: peer.localDescription,
      liveId:liveId.value.toString()
  };

  const { data } = await axios.post('/consumer', payload);
  const desc = new RTCSessionDescription(data.sdp);
  peer.setRemoteDescription(desc).catch(e => console.log(e));
}



socket.on("connect", () => {
  socket.emit("visit",liveId.value.toString());
});

socket.on("connect", () => {
  socket.emit("shakeHands",liveId.value.toString(),userId.value.toString());
});

socket.on("visitorsNumber", number => {
  visitorsNum.innerHTML = number;
});

socket.on("shakeHands", (username) => {
  new_row = `
    <div class="row fadeOut" id="joined-${username}">
      <i class='bx bxs-user-plus bx-tada' style='color:#95d63d;font-size:28px'></i> 
      <span>${username} joined</span>
    </div>
  `;
  eventsDiv.innerHTML = new_row + eventsDiv.innerHTML;
  setTimeout(() => {
    document.getElementById('joined-'+username).style.display = 'none';
  } , 3400);
});

socket.on("comment", (username,text,type) => {
  if(type == "admin"){
    comment_html = 
      `<div class="comment">
        <div class="avatar admin">
          <img src='/images/avatar.png' />
        </div>
        <div class="user">
          <span>Poster Admin</span>
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
          ${username}
          <p>${text}</p>
        </div>
      </div>`;
  }
  commentsDiv.innerHTML += comment_html;
});

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

sendComment.addEventListener('click',function(){
  let text = comment.value;
  socket.emit("newComment",liveId.value.toString(),userId.value.toString(),text,"user");
});

window.onunload = window.onbeforeunload = () => {
  socket.emit("disconnect",liveId.value.toString());
  socket.close();
};


