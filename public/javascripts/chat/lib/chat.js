var Chat = function (swig, theme, io) {
    this.path = require('path');
    this.theme = theme || 'default';
    this.rooms = [];
    this.swig = swig;
    this.io = io;
    /*this.additionally = {
        'before-name': [],
        'after-name': [],
        'before-message': [],
        'after-message': []
    };*/

    this.default_events = {
        'messageReceived': []
    };

    this.custom_events = {

    };
};

Chat.prototype.createRoom = function (socket, chat, user, data) {
    var response, time, room;
    time = new Date().getTime();

    room = this.updateRoomsList('add-room', {
        name: data.room,
        id: this.setId()
    });

    socket.join(data.room, function(err){
        //console.log(err);
    });

    response = {
        time: time,
        system: true,
        username: false,
        rooms: this.getActiveRooms(),
        room: room,
        says: 'new room \'' + data.room + '\' created'
    };

    this.io.emit('update-rooms', response);
    return response;
};

Chat.prototype.addUserToChat = function (socket, chat, user, data) {
    var message, time, storedUser, says, restoreConnection;

    time = new Date().getTime();
    restoreConnection = false;
    socket.join(data.room, function(err){/*console.log(err);*/});

    if (data.user && data.user !== '') {
        if (!user.deserializeUserByName(data.user.name)) {
            storedUser = user.serializeUser(user.signinUser({
                name: data.user.name,
                id: data.user.id,
                socket: socket
            }));
            says = 'user \'' + data.user.name + '\' connected to \'' + data.room + '\' room';
        } else {
            storedUser = user.deserializeUserByName(data.user.name);
            says = 'user \'' + data.user.name + '\' restore connection to \'' + data.room.name + '\' room';
            restoreConnection = true;
        }
    }

    return {
        /*type: 'system-data',
        action: 'join-room',*/
        message: {
            restoreConnection: restoreConnection,
            type: 'text-message',
            time: time,
            system: true,
            username: false,
            //additionally: this.addAdditionally(),
            says: says
        },
        room: data.room,
        user: storedUser,
        time: time
    };
};

Chat.prototype.removeUserFromChat = function (socket, chat, user, data) {
    var message, removedUser, time;

    removedUser = user.removeUser(data.user);

    if (removedUser) {
        time = new Date().getTime();
        socket.leave(data.room, function (err) {
           /* console.log(err);*/
        });

        return {
            type: 'system-data',
            action: 'leave-room',
            message: {
                type: 'text-message',
                time: time,
                system: true,
                username: false,
                //additionally: this.addAdditionally(),
                says: 'user \'' + removedUser.name + '\' disconnected from \'' + data.room + '\' room'
            },
            data: removedUser,
            time: time
        };
    }
};

Chat.prototype.receiveMessage = function (chat, user, data, fn) {
    var time, message;

    time = new Date().getTime();

    if((data.user_id)){//TODO: check api to handle this case more correctly
        message = {
            type: 'text-message',
            time: time,
            system: false,
            username: user.deserializeUser(data.user_id).name,
            //additionally: chat.addAdditionally({'before-name': 'test'}),
            says: data.message
        };

        //var edited_message_obj = chat.triggerEvent('messageReceived', message);
        chat.io.sockets.in(data.room).emit('message', message);
    }
};

Chat.prototype.canAccess = function () {
    //..
};

Chat.prototype.setId = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

Chat.prototype.updateRoomsList = function (action, room) {
    switch (action) {
        case 'add-room':
            this.rooms.push(room);
            break;
        case 'remove-room':
            //..
            break;
        default:
            break;
    }

    return room;
};

Chat.prototype.getActiveRooms = function () {
    return (this.rooms.length !== 0) ? this.rooms : 'default';
};

Chat.prototype.wrapDate = function (date) {
    var dateObj;

    dateObj = new Date(date);
    return dateObj.getHours() + ':' + dateObj.getMinutes() + ':' + dateObj.getSeconds();
};

Chat.prototype.disconnect = function (data) {
    data.user.users.forEach(function(item){
        if(item.socket_id === data.socket.id){
            console.log('user ' + item.socket_id + ' disconnected');
        }
    });
};

Chat.prototype.addAdditionally = function (config) {
    if(config && 'before-name' in config){
        this.additionally['before-name'].push(config['before-name']);
    }
    return this.additionally;
};

Chat.prototype.subscribe = function (event_name, function_name, priority) {
    var sub_obj = {
        'name' : function_name,
        'priority' : priority,
        'event_name' : event_name
    };
    if(this.default_events.hasOwnProperty(event_name)){
        this.default_events[event_name].push(sub_obj);
    }else{
        if(this.custom_events.hasOwnProperty(event_name)){
            this.custom_events[event_name].push(sub_obj);
        }else{
            this.custom_events[event_name] = [];
            this.custom_events[event_name].push(sub_obj);
        }
    }
};

Chat.prototype.sortEventsByPriority = function () {
    var sortArray = ['default_events', 'custom_events'];
    var scope = this;
    sortArray.forEach(function(item){
        for (prop in scope[item]){
            if (scope[item].hasOwnProperty(prop)){
                scope[item][prop].sort(function(a, b){
                    return b.priority - a.priority;
                });
            }
        }
    });
};

Chat.prototype.triggerEvent = function (event_name, data) {
    var registered_events = [];
    var new_data = data;
    if(this.default_events.hasOwnProperty(event_name)){
        registered_events = this.default_events[event_name];
    }

    registered_events.forEach(function(item, index){
        new_data = item.name(data);
    });

    return new_data;
};

Chat.prototype.setCustomListeners = function (socket) {
    for (prop in this.custom_events){
        if (this.custom_events.hasOwnProperty(prop)){
            this.custom_events[prop].forEach(function(item, index){
                socket.on(item.event_name, item.name.bind());
            });
        }
    }
};

module.exports = Chat;