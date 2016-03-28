var Chat = function (swig, theme, io) {
    this.path = require('path');
    this.theme = theme || 'default';
    this.rooms = [];
    this.swig = swig;
    this.io = io;
};

Chat.prototype.createRoom = function (data) {
    var message, time;
    time = new Date().getTime();

    this.updateRoomsList('add-room', {
        name: data.room,
        id: this.setId()
    });

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

Chat.prototype.addUserToChat = function (chat, user, data) {
    var message, time, storedUser;

    this.join(data.room);
    time = new Date().getTime();

    message = chat.prepareMessage({
        system: true,
        text: 'user \'' + data.user + '\' connected to \'' + data.room + '\' room',
        username: false,
        time: time
    });

    if (data.user && data.user !== '') {
        if(!user.deserializeUserByName(data.user)){
            storedUser = user.serializeUser(user.signinUser({
                name: data.user
            }));
        }else{
            storedUser = user.deserializeUserByName(data.user);
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

    chat.io.to(data.room).emit('message', {
        type: 'update-users',
        users: user.users
    });

    chat.io.to(data.room).emit('message', {
        type: 'system-message',
        message: message,
        time: time
    });
};

Chat.prototype.removeUserFromChat = function (chat, user, data) {
    var message, removedUser, time;

    removedUser = user.removeUser(data.user);

    if(removedUser){
        time = new Date().getTime();
        message = chat.prepareMessage({
            system: true,
            text: 'user \'' + removedUser.name + '\' disconnected from \'' + data.room + '\' room',
            user: removedUser,
            time: time
        });

        this.leave(data.room, function (err) {/*console.log(err);*/});

        this.emit('message', {
            type: 'system-data',
            action: 'leave-room',
            data: removedUser,
            time: time
        });

        chat.io.emit('message', {
            type: 'update-users',
            users: user.users
        });

        chat.io.emit('message', {
            type: 'system-message',
            message: message,
            time: time
        });
    }
};

Chat.prototype.receiveMessage = function (chat, user, data) {
    var time, message;

    time = new Date().getTime();

    message = {
        type: 'text-message',
        time: time,
        system: false,
        username: user.deserializeUser(data.user_id).name,
        says: data.message
    };

    chat.io.sockets.in(data.room).emit('message', message);
};

Chat.prototype.updateMessages = function (chat, data, user) {
    var message, messages;

    messages = '';

    data.messages.forEach(function(item){
        message = chat.prepareMessage({
            system: false,
            text: item.text,
            username: item.user.name,
            time: item.time
        });
        messages += message;
    });

    chat.io.sockets.in(data.room).emit('message', {
        type: 'update-messages',
        message: messages
    });
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

Chat.prototype.prepareMessage = function (config) {
    var messageLayout, scope;

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

module.exports = Chat;