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

// Get camera and microphone
const videoElement = document.querySelector("video");
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");
const muted = document.querySelector("#mute-unmute");
const liveId = document.querySelector("#liveId");
const visitors_num = document.querySelector(".visitors_num");
const send_comment = document.querySelector("#send_comment");
const comment = document.querySelector("#comment_text");
const comments_div = document.querySelector(".comments");
const events_div = document.querySelector(".events");
const socket = io.connect(window.location.origin);

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", id => {
  console.log('Hello new watcher');
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  let stream = videoElement.srcObject;
  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };

  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription);
    });
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", id => {
  peerConnections[id].close();
  delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

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

send_comment.addEventListener('click',function(){
  let text = comment.value;
  socket.emit("new_comment",liveId.value.toString(),text,"admin");
});