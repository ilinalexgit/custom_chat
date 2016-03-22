module.exports = function (app, loginCallback) {
    var socket_io, lib, time, rooms,
        chat, user, layout, swig, theme,
        plugins, fs, path, initPlugins;

    path = require('path');
    fs = require('fs');
    socket_io = require("socket.io");
    swig = require('swig');
    lib = require("./lib");
    theme = 'default';
    plugins = [];

    app.io = socket_io();
    app.io.use(function (socket, next) {
        var config = socket.request;
        theme = config._query['theme'];
        next();
    });

    user = new lib.User();
    chat = new lib.Chat(swig, theme, app.io);

    fs.readdir(path.join(__dirname, 'plugins'), function(err, files){
        files.forEach(function (item) {//load all plugins
            if(item.split('-')[0] === 'plugin'){
                plugins.push({
                    name: item.split('.')[0],
                    module: require(path.join(__dirname, 'plugins/' + item))
                });
            }
        });
    });

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

        socket.emit('message', {
            type: 'update-rooms',
            rooms: rooms !== 'default' ? rooms : 'default'
        });

        socket.on('createRoom', chat.createRoom.bind(chat));
        socket.on('joinRoom', chat.addUserToChat.bind(socket, chat, user));
        socket.on('leaveRoom', chat.removeUserFromChat.bind(socket, chat, user));
        socket.on('client-message', chat.receiveMessage.bind(socket, chat, user));

        socket.on('get-theme', function (data) {
            chat.theme =  data.theme;

            layout = swig.renderFile(__dirname + '/themes/' + chat.theme + '/index.html', {
                rooms: rooms
            });

            socket.emit('message', {
                type: 'system-data',
                action: 'send-custom-layout',
                data: {layout: layout},
                time: time
            });
        });

        socket.on('update-messages', function (data) {
            chat.updateMessages.call(socket, chat, data, user);
        });

        if(plugins.length !== 0){
            plugins.forEach(function (item) {//load all plugins
                socket.on(item.name, function(data){
                    var plugin = item.module(socket, chat, user);
                    plugin.callback(data);
                });
            });
        }
    });
};