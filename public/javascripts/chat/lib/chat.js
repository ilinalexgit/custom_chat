var Chat = function (swig, theme, io) {
    this.path = require('path');
    this.theme = theme || 'default';
    this.rooms = [];
    this.swig = swig;
    this.io = io;

    this.default_events = {
        'messageReceived': []
    };

    this.custom_events = {

    };
};

Chat.prototype.createRoom = function (data) {
    var message, time;
    time = new Date().getTime();

    this.updateRoomsList('add-room', {
        name: data.room,
        id: this.setId()
    });

    message = {
        type: 'update-rooms',
        time: time,
        system: true,
        username: false,
        rooms: this.getActiveRooms(),
        says: 'new room \'' + data.room + '\' created'
    };

    this.io.emit('message', message);
};

Chat.prototype.addUserToChat = function (chat, user, data) {
    var message, time, storedUser, says, restoreConnection;

    this.join(data.room, function(err){
        /*console.log(err);*/
    });
    time = new Date().getTime();
    restoreConnection = false;

    if (data.user && data.user !== '') {
        if (!user.deserializeUserByName(data.user)) {
            storedUser = user.serializeUser(user.signinUser({
                name: data.user
            }));
            says = 'user \'' + data.user + '\' connected to \'' + data.room + '\' room';
        } else {
            storedUser = user.deserializeUserByName(data.user);
            says = 'user \'' + data.user + '\' restore connection to \'' + data.room + '\' room';
            restoreConnection = true;
        }
    }

    this.emit('message', {
        type: 'system-data',
        action: 'join-room',
        data: {
            container: data.container,
            room: data.room,
            user: storedUser
        },
        time: time
    });

    message = {
        restoreConnection: restoreConnection,
        type: 'text-message',
        time: time,
        system: true,
        username: false,
        says: says
    };

    chat.io.to(data.room).emit('message', message);
};

Chat.prototype.removeUserFromChat = function (chat, user, data) {
    var message, removedUser, time;

    removedUser = user.removeUser(data.user);

    if (removedUser) {
        time = new Date().getTime();
        this.leave(data.room, function (err) {
           /* console.log(err);*/
        });

        this.emit('message', {
            type: 'system-data',
            action: 'leave-room',
            data: removedUser,
            time: time
        });

        message = {
            type: 'text-message',
            time: time,
            system: true,
            username: false,
            says: 'user \'' + removedUser.name + '\' disconnected from \'' + data.room + '\' room'
        };

        chat.io.emit('message', message);
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
            says: data.message
        };
        var edited_message_obj = chat.triggerEvent('messageReceived', message);
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
};

Chat.prototype.getActiveRooms = function () {
    return (this.rooms.length !== 0) ? this.rooms : 'default';
};

Chat.prototype.wrapDate = function (date) {//TODO: remove if no need in future
    var dateObj;

    dateObj = new Date(date);
    return dateObj.getHours() + ':' + dateObj.getMinutes() + ':' + dateObj.getSeconds();
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