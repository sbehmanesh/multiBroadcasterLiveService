const peerConnections = {};
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

const videoElement = document.querySelector("video");
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");
const muted = document.querySelector("#mute-unmute");
const liveId = document.querySelector("#liveId");
const visitorsNum = document.querySelector(".visitors_num");
const sendComment = document.querySelector("#send_comment");
const comment = document.querySelector("#comment_text");
const commentsDiv = document.querySelector(".comments");
const eventsDiv = document.querySelector(".events");
const socket = io.connect(window.location.origin);


window.onload = () => {
  init();
  socket.emit("newBroadcaster",liveId.value.toString());
}

async function init() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = stream;
  const peer = createPeer();
  stream.getTracks().forEach(track => peer.addTrack(track, stream));
}

function createPeer() {
  const peer = new RTCPeerConnection(config);
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
  const { data } = await axios.post('/broadcast', payload);
  const desc = new RTCSessionDescription(data.sdp);
  peer.setRemoteDescription(desc).catch(e => console.log(e));
}


window.onunload = window.onbeforeunload = () => {
  socket.close();
};

socket.on("visitorsNumber", (number) => {
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


muted.onclick = getStream
audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

getStream()
  .then(getDevices)
  .then(gotDevices);

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos;
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
      audioSelect.appendChild(option);
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    video: { deviceId: videoSource ? { exact: videoSource } : undefined }
  };
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {
  window.stream = stream;
  let isMuted = muted.children[0].classList.contains('bxs-microphone-off');
  if(isMuted) {
    console.log('muted');
    stream.getAudioTracks()[0].enabled = false;
  }else{
    console.log('not muted');
    stream.getAudioTracks()[0].enabled = true;
    audioSelect.selectedIndex = [...audioSelect.options].findIndex(
      option => option.text === stream.getAudioTracks()[0].label
    );
  }
  videoSelect.selectedIndex = [...videoSelect.options].findIndex(
    option => option.text === stream.getVideoTracks()[0].label
  );
  videoElement.srcObject = stream;
  socket.emit("broadcaster",liveId.value.toString());
}

function handleError(error) {
  console.error("Error: ", error);
}

sendComment.addEventListener('click',function(){
  let text = comment.value;
  socket.emit("newComment",liveId.value.toString(),text,"admin");
});