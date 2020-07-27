const Peer = window.Peer;

(async function main() {
    //const localVideo = document.getElementById('js-local-video');
    //const localId = document.getElementById('js-local-id');
    const videosContainer = document.getElementById('js-videos-container');
    const roomId = document.getElementById('js-room-id');
    const messages = document.getElementById('js-messages');
    const joinTrigger = document.getElementById('js-join-trigger');
    const leaveTrigger = document.getElementById('js-leave-trigger');
    const myPeer = getParam('myPeer');

    // const localStream = await navigator.mediaDevices.getDisplayMedia({
    //     video: true,
    //     audio: false,
    //     flameRate: { max: 0.25, min: 0.01 }
    // });
    //localVideo.srcObject = localStream;

    // const peer = new Peer({
    //     key: window.__SKYWAY_KEY__,
    //     debug: 3,
    // });

    const peer = new Peer(myPeer, {
        key: window.__SKYWAY_KEY__,
    });

    // peer.on('open', (id) => {
    //     localId.textContent = id;
    // });

    joinTrigger.addEventListener('click', () => {
        const room = peer.joinRoom(roomId.value, {
            mode: 'sfu',
            //stream: localStream,
        });

        room.on('open', () => {
            messages.textContent += `===You joined "${roomId.value}"===\n`;
        });

        room.on('peerJoin', peerId => {
            messages.textContent += `===${peerId} joined===\n`;
        });

        room.on('stream', async stream => {
            const makeDiv = document.createElement('div');
            makeDiv.playsInline = true;
            makeDiv.setAttribute('del-peer-id', stream.peerId);
            videosContainer.append(makeDiv);

            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = stream;
            remoteVideo.playsInline = true;
            remoteVideo.setAttribute('data-peer-id', stream.peerId);
            makeDiv.append(remoteVideo);
            await remoteVideo.play().catch(console.error);

            const theirID = document.createElement('p');
            makeDiv.append(theirID);
            theirID.playsInline = true;
            const text = document.createTextNode(stream.peerId);
            theirID.appendChild(text);
        });

        // room.on('stream', async stream => {
        //     const remoteVideo = document.createElement('video');
        //     remoteVideo.srcObject = stream;
        //     remoteVideo.playsInline = true;
        //     remoteVideo.setAttribute('data-peer-id', stream.peerId);
        //     videosContainer.append(remoteVideo);
        //     await remoteVideo.play().catch(console.error);
        //     const theirID = document.createElement('p');
        //     videosContainer.append(theirID);
        //     const text = document.createTextNode(stream.peerId);
        //     theirID.appendChild(text);
        // });

        room.on('peerLeave', peerId => {
            const remoteVideo = videosContainer.querySelector(`[data-peer-id="${peerId}"]`);
            const delDiv = videosContainer.querySelector(`[del-peer-id="${peerId}"]`);
            remoteVideo.srcObject.getTracks().forEach(track => {
                track.stop();
            });
            remoteVideo.srcObject = null;
            delDiv.remove();

            messages.textContent += `===${peerId} left===\n`;
        });

        room.once('close', () => {
            messages.textContent += '===You left ===\n';
            const remoteVideos = videosContainer.querySelectorAll('[data-peer-id]');
            const delDiv = videosContainer.querySelector('[del-peer-id]');
            Array.from(remoteVideos)
                .forEach(remoteVideo => {
                    remoteVideo.srcObject.getTracks().forEach(track => track.stop());
                    remoteVideo.srcObject = null;
                    delDiv.remove();
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

