const tovideo = document.getElementById('to')
const loader = document.getElementById('loader')
const mevideo = document.getElementById('me')
const from = document.getElementById('form')
const input = document.getElementById('input')
const messageBox = document.getElementById('message')
const onlineTag = document.getElementById('online')

const socket = io();
const peer = new Peer();

let mystream;
let TOID;
let PEERID;

async function startScreenShare() {
    console.log("🔵 startScreenShare() called");
    try {
        mystream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("🟢 Got stream:", mystream);

        mevideo.srcObject = mystream;
        mevideo.onloadedmetadata = () => mevideo.play();

    } catch (err) {
        console.error("❌ Error accessing screen:", err);
    }
}

peer.on('open', async function (id) {
    await startScreenShare();
    PEERID = id;
    socket.emit('find', id)
})

socket.on('onlineusers', (online) => {
    onlineTag.innerHTML = online;
    console.log(online)
})

socket.on('leaveuser', (toid) => {
    if (toid !== toid) return;
    TOID = null;
    socket.emit('find', PEERID)
    tovideo.style.display = 'none'
    loader.style.display = 'block'
    messageBox.innerHTML = ''
})

socket.on('peerid', async ({ socketid, peerid, initiator }) => {
    TOID = socketid;
    loader.style.display = 'none'
    if (initiator) {
        await Call(peerid)
    }

})

socket.on('smessage', ({ to, message }) => {
    const p = document.createElement('p')
    if (to === 'system') {
        p.innerHTML = `<span style="color: yellow;">System</span>: ${message}`
        messageBox.appendChild(p)
    }
    if (TOID !== to) return;
    p.innerHTML = `<span style="color: red;">Stranger</span>: ${message}`
    messageBox.appendChild(p)
})

peer.on('call', async function (call) {
    call.answer(mystream);

    call.on('stream', function (stream) {
        tovideo.style.display = 'block'
        tovideo.srcObject = stream;
        tovideo.play()
    });
});

async function Call(peerid) {
    var call = peer.call(peerid, mystream);

    call.on('stream', function (stream) {
        tovideo.style.display = 'block'
        tovideo.srcObject = stream;
        tovideo.play()
    });
}

function skip() {
    socket.emit('skip', PEERID)
    tovideo.style.display = 'none'
    loader.style.display = 'block'
    socket.emit('find', PEERID)
    messageBox.innerHTML = ''
    TOID = null
}

from.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!TOID || !input.value || input.value === '') return;
    socket.emit('cmessage', { to: TOID, message: input.value })
    const p = document.createElement('p')
    p.innerHTML = `<span style="color: rgb(0, 255, 42);">You</span>: ${input.value}`
    messageBox.appendChild(p)
    input.value = ''
})