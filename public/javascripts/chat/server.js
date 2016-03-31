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

    fs.readdir(path.join(__dirname, 'plugins'), function(err, files){
        //load plugins
        var plugin_module = '';
        files.forEach(function (item) {
            if (enabledPlugins.indexOf(item) != -1){
                plugins.push({
                    name: item.split('.')[0],
                    module: require(path.join(__dirname, 'plugins/' + item))
                });

                //init plugins
                var plugin_module = require(path.join(__dirname, 'plugins/' + item));
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

        socket.emit('message', {
            type: 'update-rooms',
            rooms: rooms !== 'default' ? rooms : 'default'
        });

        socket.on('getUserList', function(data, fn){
            fn({users: user.users});
        });

        socket.on('createRoom', chat.createRoom.bind(chat));
        socket.on('joinRoom', chat.addUserToChat.bind(socket, chat, user));
        socket.on('leaveRoom', chat.removeUserFromChat.bind(socket, chat, user));
        socket.on('client-message', chat.receiveMessage.bind(socket, chat, user));
        /*socket.on('client-message', function(data, fn){
            chat.receiveMessage(chat, user, data, fn);
        });*/
        socket.on('check-connection', function (data) {
            socket.emit('message', {
                type: 'connection-response',
                user: user.deserializeUser(data.id)
            });
        });

        chat.setCustomListeners(socket);
    });

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }
};