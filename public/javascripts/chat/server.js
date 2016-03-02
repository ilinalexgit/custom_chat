module.exports = function (app) {
    var socket_io, lib, time, rooms, chat, user;

    socket_io = require("socket.io");
    lib = require("./lib");

    app.io = socket_io();
    chat = new lib.Chat();
    user = new lib.User();
    rooms = chat.getActiveRooms();

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

            app.io.emit('message', {
                type: 'update-rooms',
                message: 'new room \'' + data.room + '\' created',
                rooms: chat.getActiveRooms(),
                time: time
            });
        });

        socket.on('joinRoom', function (data) {
            socket.join(data.room);
            time = new Date().getTime();

            if(data.user && data.user !== ''){
                var id = user.serializeUser(user.signinUser({
                    name: data.user
                }));
            }

            socket.emit('message', {
                type: 'private-data',
                action: 'join-room',
                data: {id: id},
                time: time
            });

            app.io.to(data.room).emit('message', {
                type: 'system-message',
                message: 'user \'' + data.user + '\' connected to \'' + data.room + '\' room',
                time: time
            });
        });

        socket.on('leaveRoom', function (data) {
            var time = new Date().getTime();

            socket.leave(data.room, function (err) {
            });

            var removedUser = user.removeUser(data.user.id);

            socket.emit('message', {
                type: 'system-data',
                action: 'leave-room',
                data: removedUser,
                time: time
            });

            app.io.emit('message', {
                type: 'system-message',
                message: 'user \'' + removedUser.name + '\' disconnected from \'' + data.room + '\' room',
                time: time
            });
        });

        socket.on('client-message', function (data) {
            time = new Date().getTime();

            app.io.sockets.in(data.room).emit('message', {
                type: 'text-message',
                message: data.message,
                user: user.deserializeUser(data.user_id),
                time: time
            });
        });
    });
};