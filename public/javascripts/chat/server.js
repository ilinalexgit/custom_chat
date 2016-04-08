module.exports = function (app, loginCallback) {
    var socket_io, lib, time, rooms,
        chat, user, layout, swig, theme,
        plugins, fs, path, enabledPlugins;

    path = require('path');
    fs = require('fs');
    socket_io = require("socket.io");
    swig = require('swig');
    lib = require("./lib");
    theme = 'default';
    plugins = [];
    //this array we need to get from global chat config
    enabledPlugins = ['plugin-link'];

    app.io = socket_io();
    app.io.use(function (socket, next) {
        var config = socket.request;
        theme = config._query['theme'];
        next();
    });

    user = new lib.User();
    chat = new lib.Chat(swig, theme, app.io);

    fs.readdir(path.join(__dirname, 'vendor/plugins'), function(err, files){
        //load plugins
        var plugin_module = '';
        files.forEach(function (item) {
            if (enabledPlugins.indexOf(item) != -1){
                plugins.push({
                    name: item.split('.')[0],
                    module: require(path.join(__dirname, 'vendor/plugins/' + item))
                });

                //init plugins
                var plugin_module = require(path.join(__dirname, 'vendor/plugins/' + item));
                if (isFunction(plugin_module)){
                    plugin_module(chat, user);
                }else{
                    var plugin_obj = plugin_module();
                    plugin_obj.init(chat, user);
                }
            }
        });
        chat.sortEventsByPriority();
    });

    app.io.sockets.on('connection', function (socket) {
        rooms = chat.getActiveRooms();
        time = new Date().getTime();

        socket.emit('update-rooms', {
            rooms: rooms !== 'default' ? rooms : 'default'
        });

        socket.on('createRoom', function(data, fn){
            fn(chat.createRoom(socket, chat, user, data));
        });
        socket.on('joinRoom', function(data, fn){
            var result = chat.addUserToChat(socket, chat, user, data);
            fn(result);
        });
        socket.on('leaveRoom', function(data, fn){
            var result = chat.removeUserFromChat(socket, chat, user, data);
            fn(result);
        });
        socket.on('getUserList', function(data, fn){
            fn({users: user.users});
        });
        socket.on('check-connection', function (data) {
            socket.emit('message', {
                type: 'connection-response',
                user: user.deserializeUser(data.id)
            });
        });

        socket.on('disconnect', function(){
            chat.disconnect({
                user: user,
                socket: socket
            });
        });

        socket.on('client-message', chat.receiveMessage.bind(socket, chat, user));
        chat.setCustomListeners(socket);
    });

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }
};