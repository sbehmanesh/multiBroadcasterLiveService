const express = require('express');
const router = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

let senderStream = {};

router.post("/consumer", async ({ body }, res) => {
    const liveId = body.liveId;
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream[liveId].getTracks().forEach(track => peer.addTrack(track, senderStream[liveId]));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});

router.post('/broadcast', async ({ body } , res) => {
    const liveId = body.liveId;
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.ontrack = (e) => handleTrackEvent(e, liveId);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});

function handleTrackEvent(e, liveId) {
    senderStream[liveId] = e.streams[0];
};

module.exports = router