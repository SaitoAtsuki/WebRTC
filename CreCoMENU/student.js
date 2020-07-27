const Peer = window.Peer;

(async function main() {
    const localVideo = document.getElementById('js-local-video');
    const localId = document.getElementById('js-local-id');
    const videosContainer = document.getElementById('js-videos-container');
    const roomId = document.getElementById('js-room-id');
    const messages = document.getElementById('js-messages');
    const joinTrigger = document.getElementById('js-join-trigger');
    const leaveTrigger = document.getElementById('js-leave-trigger');
    const myPeer = getParam('myPeer');

    const localStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        flameRate: { max: 0.25, min: 0.01 }
    });
    localVideo.srcObject = localStream;

    const peer = new Peer(myPeer, {
        key: window.__SKYWAY_KEY__
    });

    peer.on('open', (id) => {
        localId.textContent = id;
    });

    joinTrigger.addEventListener('click', () => {
        const room = peer.joinRoom(roomId.value, {
            mode: 'sfu',
            stream: localStream,
        });

        room.on('open', () => {
            messages.textContent += `===You joined "${roomId.value}"===\n`;
        });

        room.on('peerJoin', peerId => {
            messages.textContent += `===${peerId} joined===\n`;
        });

        room.on('peerLeave', peerId => {
            messages.textContent += `===${peerId} left===\n`;
        });

        room.once('close', () => {
            messages.textContent += '===You left ===\n';
            const remoteVideos = videosContainer.querySelectorAll('[data-peer-id]');
            Array.from(remoteVideos)
                .forEach(remoteVideo => {
                    remoteVideo.srcObject.getTracks().forEach(track => track.stop());
                    remoteVideo.srcObject = null;
                    remoteVideo.remove();
                });
        });

        leaveTrigger.addEventListener('click', () => {
            room.close();
        }, { once: true });
    });

    peer.on('error', console.error);
})();

function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

