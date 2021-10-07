const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('gamepad type', (id) => {
        console.log('gamepad: ' + id);
        io.emit('gamepad type', id)
    });

    socket.on('buttons pushed', (controller) => {
        io.emit('buttons pushed', controller)
    })
});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});

