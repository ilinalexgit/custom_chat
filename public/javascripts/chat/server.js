module.exports = function (app) {
    var socket_io, lib, time, rooms, users, chat;

    socket_io = require("socket.io");
    lib = require("./lib");
    users = [];

    app.io = socket_io();
    chat = new lib.Chat();
    rooms = chat.getActiveChats();

    app.io.sockets.on('connection', function (socket) {
        time = new Date().getTime();

        socket.emit('message', {
            type: 'update-rooms',
            message: '',
            rooms: (rooms.length === 0) ? 'default' : rooms,
            time: time
        });

        socket.on('createRoom', function (data) {
            chat.updateRoomsList('add-room', data.room);
            console.log(chat.getActiveChats());

            app.io.emit('message', {
                type: 'update-rooms',
                message: 'new room \'' + data.room + '\' created',
                rooms: chat.getActiveChats(),
                time: time
            });
        });

        socket.on('joinRoom', function (data) {
            socket.join(data.room);
            time = new Date().getTime();

            if(data.user && data.user !== ''){
                var user = new lib.User;
                user.signinUser({
                    name: data.user
                });

                users.push(user.getMeta());
                console.log(users);
            }

            app.io.to(data.room).emit('message', {
                type: 'system-message',
                action: 'join-room',
                message: 'user \'' + data.user + '\' connected to \'' + data.room + '\' room',
                data: user.getMeta(),
                time: time
            });
        });

        socket.on('leaveRoom', function (data) {
            var time = new Date().getTime();
            socket.leave(data.room, function (err) {
            });

            app.io.emit('message', {
                type: 'system-message',
                action: 'leave-room',
                message: 'user \'' + data.user + '\' disconnected from \'' + data.room + '\' room',
                time: time
            });
        });

        socket.on('client-message', function (data) {
            time = new Date().getTime();
            
            console.log(data);

            app.io.sockets.in(data.room).emit('message', {
                type: 'text-message',
                message: data.message,
                time: time
            });
        });
    });
};