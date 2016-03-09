var Chat = function (swig, theme, io) {
    this.path = require('path');
    this.theme = theme || 'default';
    this.rooms = [];
    this.swig = swig;
    this.io = io;
};

Chat.prototype.addUserToChat = function (chat, data, user) {
    var message, time;

    this.join(data.room);
    time = new Date().getTime();

    message = chat.prepareMessage({
        system: true,
        text: 'user \'' + data.user + '\' connected to \'' + data.room + '\' room',
        username: false,
        time: time
    });

    if (data.user && data.user !== '') {
        var id = user.serializeUser(user.signinUser({
            name: data.user
        }));
    }

    this.emit('message', {
        type: 'system-data',
        action: 'join-room',
        data: {id: id},
        time: time
    });

    chat.io.to(data.room).emit('message', {
        type: 'system-message',
        message: message,
        time: time
    });
};

Chat.prototype.removeUserFromChat = function (chat, data, user) {
    var message, removedUser, time;
    removedUser = user.removeUser(data.user.id);

    time = new Date().getTime();
    message = chat.prepareMessage({
        system: true,
        text: 'user \'' + removedUser.name + '\' disconnected from \'' + data.room + '\' room',
        user: removedUser,
        time: time
    });

    this.leave(data.room, function (err) {
    });

    this.emit('message', {
        type: 'system-data',
        action: 'leave-room',
        data: removedUser,
        time: time
    });

    chat.io.emit('message', {
        type: 'system-message',
        message: message,
        time: time
    });
};

Chat.prototype.receiveMessage = function (chat, data, user) {
    var message, time;

    time = new Date().getTime();

    message = chat.prepareMessage({
        system: false,
        text: data.message,
        username: user.deserializeUser(data.user_id).name,
        time: time
    });

    chat.io.sockets.in(data.room).emit('message', {
        type: 'text-message',
        message: message,
        user: user.deserializeUser(data.user_id),
        time: time
    });
};

Chat.prototype.canAccess = function () {
    //..
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

Chat.prototype.createRoom = function (data) {
    var message, time;

    this.updateRoomsList('add-room', data.room);
    time = new Date().getTime();
    message = this.prepareMessage({
        system: true,
        text: 'new room \'' + data.room + '\' created',
        username: false,
        time: time
    });

    this.io.emit('message', {
        type: 'update-rooms',
        message: message,
        rooms: this.getActiveRooms(),
        time: time
    });
};

Chat.prototype.deleteChat = function () {
    //..
};

Chat.prototype.broadcastMessage = function () {
    //..
};

Chat.prototype.wrapDate = function (date) {//TODO: remove if no need in future
    var dateObj;

    dateObj = new Date(date);
    return dateObj.getHours() + ':' + dateObj.getMinutes() + ':' + dateObj.getSeconds();
};

Chat.prototype.prepareMessage = function (config) {
    var messageLayout, date, scope;

    scope = this;

    messageLayout = this.swig.renderFile(
        this.path.join(__dirname, '../themes/' + scope.theme + '/includes/message.html'),
        {
            time: config.time,
            system: config.system,
            username: config.username,
            says: config.text
        }
    );

    return messageLayout;
};

Chat.prototype.loadHistory = function () {
    //..
};

module.exports = Chat;