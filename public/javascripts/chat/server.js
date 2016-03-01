module.exports = function (app) {
    var socket_io = require("socket.io");
    var time, rooms = [];

    app.io = socket_io();

    app.io.sockets.on('connection', function (socket) {
        time = new Date().getTime();

        socket.emit('message', {
            type: 'update-rooms',
            message: '',
            rooms: (rooms.length === 0) ? 'default' : rooms,
            time: time
        });

        socket.on('createRoom', function (data) {
            rooms.push(data.room);

            app.io.emit('message', {
                type: 'update-rooms',
                message: 'new room \'' + data.room + '\' created',
                rooms: rooms,
                time: time
            });
        });

        socket.on('joinRoom', function (data) {
            socket.join(data.room);
            time = new Date().getTime();

            app.io.to(data.room).emit('message', {
                type: 'text-message',
                message: 'user \'' + data.user + '\' connected to \'' + data.room + '\' room',
                system: true,
                time: time
            });
        });

        socket.on('leaveRoom', function (data) {
            var time = new Date().getTime();
            socket.leave(data.room, function (err) {
            });

            app.io.emit('message', {
                type: 'text-message',
                message: 'user \'' + data.user + '\' disconnected from \'' + data.room + '\' room',
                system: true,
                time: time
            });
        });

        socket.on('client-message', function (data) {
            time = new Date().getTime();

            app.io.sockets.in(data.room).emit('message', {
                type: 'text-message',
                message: data.message,
                time: time
            });
        });
    });
};