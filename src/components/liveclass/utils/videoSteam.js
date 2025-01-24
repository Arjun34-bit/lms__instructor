const socket = io('localhost:3001');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;
let peer;

export const initPeer = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        localStream = stream;

        peer = new SimplePeer({
            initiator: location.hash === '#init',
            trickle: false,
            stream: localStream
        });

        peer.on('signal', data => {
            socket.emit('signal', data);
        });

        peer.on('stream', stream => {
            remoteVideo.srcObject = stream;
        });

        peer.on('error', err => {
            console.error('Peer error:', err);
        });

        socket.on('signal', data => {
            peer.signal(data);
        });
    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
        alert('Could not access your camera and microphone. Please ensure they are connected and enabled.');
    });

}

socket.on('connect', () => {
    console.log('Connected to signaling server');
});

socket.on('signal', data => {
    peer.signal(data);
});
