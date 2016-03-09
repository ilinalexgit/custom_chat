module.exports = function (app) {
    var socket_io, lib, time, rooms,
        chat, user, layout, swig, theme;

    socket_io = require("socket.io");
    swig = require('swig');
    theme = 'default';

    lib = require("./lib");

    app.io = socket_io();
    app.io.use(function (socket, next) {
        var config = socket.request;
        theme = config._query['theme'];
        next();
    });

    user = new lib.User();
    chat = new lib.Chat(swig, theme, app.io);

    app.io.sockets.on('connection', function (socket) {
        rooms = chat.getActiveRooms();
        time = new Date().getTime();
        layout = swig.renderFile(__dirname + '/themes/' + theme + '/index.html', {
            rooms: rooms
        });

        socket.emit('message', {
            type: 'system-data',
            action: 'send-layout',
            data: {layout: layout},
            time: time
        });

        socket.on('createRoom', chat.createRoom.bind(chat));

        socket.on('joinRoom', function(data){
            chat.addUserToChat.call(socket, chat, data, user);
        });

        socket.on('leaveRoom', function (data) {
            chat.removeUserFromChat.call(socket, chat, data, user);
        });

        socket.on('client-message', function (data) {
            chat.receiveMessage.call(socket, chat, data, user);
        });
    });
};