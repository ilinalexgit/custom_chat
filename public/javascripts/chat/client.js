var ChatClass = function () {
    this.users = [];
    this.rooms = [];
    this.views = [];
    this.theme = '';
    this.selector = null;
    this.layout = '';
};

ChatClass.prototype.init = function (selector, config) {
    this.theme = (config.theme) ? config.theme : 'default';
    this.config = config || null;
    this.selector = selector;
    this.initSocket(config.socket);
    this.checkConnection();
    this.setMessageListener();
    this.includeStylesheet();
};

ChatClass.prototype.checkConnection = function () {
    this.socket.emit('check-connection', {
        id: localStorage.getItem('user-id')
    });
};

ChatClass.prototype.initSocket = function (socket) {
    this.socket = io.connect(socket, {query: 'theme=' + this.theme});
};

ChatClass.prototype.getConfig = function () {
    return this.config;
};

ChatClass.prototype.getUserInstance = function (id) {
    var result = false;
    this.users.forEach(function (item) {
        if (item.data.user.id === id) {
            result = item;
        }
    });

    return result;
};

ChatClass.prototype.$ = function (a) {
    switch (a.charAt(0)) {
        case '#':
            return document.getElementById(a.substring(1));
            break;
        case '.':
            return document.getElementsByClassName(a.substring(1));
            break;
        default:
            return new Error('wrong selector');
            break;
    }
};

ChatClass.prototype.includeStylesheet = function () {
    var head, link, createdEl;

    createdEl = document.querySelector('#chat-style');
    head = document.getElementsByTagName('head')[0];
    link = document.createElement('link');
    link.id = 'chat-style';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '/javascripts/chat/themes/' + this.theme + '/style.css';
    link.media = 'all';

    if (!createdEl) {
        head.appendChild(link);
    } else {
        createdEl.parentNode.removeChild(createdEl);
        head.appendChild(link);
    }
};

ChatClass.prototype.sendMessage = function (input, targetRoom) {
    var userId, url;

    userId = input.parentNode.parentNode.classList[2].split('-')[1];
    url = function (text) {
        var source, urlArray, url, matchArray, regexToken;

        source = (text || '').toString();
        urlArray = [];
        regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

        while( (matchArray = regexToken.exec( source )) !== null )
        {
            var token = matchArray[0];
            urlArray.push( token );
        }

        return urlArray;
    };

    if (input.value && input.value !== '') {
        var found = url(input.value);
        if(!found.length){
            this.socket.emit('client-message', {
                type: 'client-message',
                message: input.value,
                room: targetRoom,
                user_id: userId
            });
        }else{
            this.socket.emit('plugin-link', {
                data: found,
                text: input.value,
                room: targetRoom,
                user_id: userId
            });
        }
    }
};

ChatClass.prototype.logMessage = function (message) {
    var log;

    log = JSON.parse(localStorage.getItem('message-log')) || [];

    if (!log) {
        localStorage.setItem('message-log', JSON.stringify([
            {
                text: message.text || null,
                user: message.user || null,
                time: message.time || null
            }
        ]));
    } else {
        if (log.length > 30) {
            log.pop();
        }
        log.push(message);
        localStorage.setItem('message-log', JSON.stringify(log));
    }
};

ChatClass.prototype.clearLog = function () {
    localStorage.removeItem('message-log');
};

ChatClass.prototype.setMessageListener = function () {
    var scope = this;

    this.socket.on('message', function (response) {
        var node, mesContainer, roomsSelect, textnode, view, user;

        switch (response.type) {
            case 'text-message':
                var layout;

                layout = swig.run(message_tpl, response);
                mesContainer = scope.$('.messages-container');

                for (i = 0; i < mesContainer.length; i++) {
                    scope.logMessage(response);
                    mesContainer[i].children[0].insertAdjacentHTML('beforeend', layout);
                }
                scope.config.onMessageReceive(response);
                break;
            case 'initial-data':
                console.log(response);
                break;
            case 'update-messages':
                scope.views.forEach(function (item) {
                    item.redrawMessages(response);
                });
                break;
            case 'system-data':
                switch (response.action) {
                    case 'join-room':
                        //console.log(response);
                        localStorage.setItem('user-id', response.data.user.id);
                        user = new UserClass(response.data, scope);
                        scope.users.push(user);
                        view = new ViewClass(
                            response.data.room,
                            response.data.container,
                            scope.getConfig(),
                            scope
                        );
                        scope.views.push(view);
                        view.render(scope.layout);
                        user.setOwner(view, response.data.user.id);
                        break;
                    case 'leave-room':
                        localStorage.removeItem('user-id');
                        break;
                    case 'send-layout':
                        scope.layout = response.data.layout;
                        break;
                    case 'send-custom-layout':
                        scope.views.forEach(function (item) {
                            user = scope.getUserInstance(item.owner.id);
                            item.unrender();
                            item.render(response.data.layout);
                            user.setOwner(item, item.owner.id);
                            item.updateThemeMessages(scope.theme);
                        });
                        scope.includeStylesheet();
                        break;
                    default:
                        break;
                }

                break;
            case 'system-message':
                //console.log(response);
                mesContainer = scope.$('.messages-container');
                mesContainer[0].children[0].insertAdjacentHTML('beforeend', response.message);
                scope.config.onMessageReceive(response);

                break;
            case 'update-rooms':
                var i = 0, length = response.rooms.length, room;
                mesContainer = scope.$('.messages-container');
                roomsSelect = scope.$('.created-rooms');

                if (response.rooms !== 'default') {
                    for (i = 0; i < length; i++) {
                        room = new RoomClass(scope.socket);
                        room.setName(response.rooms[i].name);
                        scope.rooms.push(room);
                    }

                    scope.updateRoomsList(response.rooms);
                    roomsSelect[0].innerHTML = '';
                    for (i = 0; i < length; i++) {
                        node = document.createElement("option");
                        textnode = document.createTextNode(response.rooms[i].name);
                        node.setAttribute("value", response.rooms[i].id);
                        node.className = 'msg';
                        node.appendChild(textnode);
                        roomsSelect[0].appendChild(node);
                    }

                    if (mesContainer.length > 0 && response.message && response.message !== '') {
                        mesContainer[0].children[0].insertAdjacentHTML('beforeend', response.message);
                    }
                } else {
                    roomsSelect[0].innerHTML =
                        '<option value="" disabled selected>no rooms available</option>';
                }
                break;
            case 'update-users':
                scope.$('.users-container')[0].querySelector('ul').innerHTML = '';
                response.users.forEach(function (item) {
                    var el = '<li>' + item.name + '</li>';
                    scope.$('.users-container')[0].querySelector('ul').insertAdjacentHTML('beforeend', el);
                });
                break;
            case 'connection-response':
                if(response.user){
                    scope.callJoinRoom(response.user.name, '#chat1');
                }
                break;
            case 'server-authorize':
                break;
            default:
                console.log('unknown type:', response.type);
                break;
        }
    });
};

ChatClass.prototype.updateRoomsList = function (rooms) {
    var scope, i, length;

    scope = this;
    length = rooms.length;

    for (i = 0; i < length; i++) {
        scope.rooms[i].setId(rooms[i].id);
    }
};

ChatClass.prototype.createRoomInstance = function (roomName) {
    var room;
    if (roomName && roomName !== '') {
        room = new RoomClass(this.socket);
        this.rooms.push(room);
        room.createRoom(roomName);
    }
};

ChatClass.prototype.callJoinRoom = function (userName, selector) {
    var roomsSelect, currentRoom, room;

    roomsSelect = this.$('.created-rooms');
    currentRoom = roomsSelect[0].options[roomsSelect[0].selectedIndex].innerHTML;//TODO: check room name on server side (value or innerHTML where stored)

    if (userName && userName !== '' && currentRoom !== '') {
        room = new RoomClass(this.socket);//TODO: store instance of room in parent class
        room.joinRoom(userName, currentRoom, selector);
    }
};


ChatClass.prototype.callLeaveRoom = function (roomId) {
    var room, container, userId;

    localStorage.removeItem('user-id');
    container = this.$('.room-' + roomId);
    userId = container[0].classList[2].split('-')[1];
    container[0].classList.remove('owner-' + userId);
    room = new RoomClass(this.socket);//TODO: store instance of room in parent class
    room.leaveRoom(userId, roomId);
};

var UserClass = function (data, rootScope) {
    this.data = data || null;
    this.rootScope = rootScope || null;
};

UserClass.prototype.setOwner = function (view, id) {//TODO: store user id in User class
    var i, length;

    length = this.rootScope.users.length;

    for (i = 0; i < length; i++) {
        if (this.rootScope.users[i].data.user.id === id) {
            view.el.className += " owner-" + this.rootScope.users[i].data.user.id;
            view.owner = this.data.user;
        }
    }
};

var ViewClass = function (room, selector, chatConfig, scope) {
    this.el = null;
    this.room = room || null;
    this.rootScope = scope || null;
    this.selector = selector || null;
    this.config = chatConfig || null;
};

ViewClass.prototype.$ = function (a) {
    switch (a.charAt(0)) {
        case '#':
            return document.getElementById(a.substring(1));
            break;
        case '.':
            return document.getElementsByClassName(a.substring(1));
            break;
        default:
            return new Error('wrong selector');
            break;
    }
};

ViewClass.prototype.render = function () {
    var container, scope, layout;

    container = this.$(this.selector);
    layout = swig.run(index_tpl, {});
    this.el = container;
    scope = this;

    if (container.innerHTML === '') {
        container.innerHTML = layout;
        container.className = 'chat-container';
        container.className += " room-" + this.room;
        this.confirmMessageSend(this.room, this.config.onSendSubmit);

        //this.leaveRoom();
        this.el.querySelector('.switch-theme').addEventListener('click', function () {
            scope.switchTheme('green_theme');
        });
    }
};

ViewClass.prototype.unrender = function () {
    var container;

    container = this.$(this.selector);
    container.innerHTML = '';
};

ViewClass.prototype.confirmMessageSend = function (room, callback) {
    var scope, currentRoom, submitButton, inputField, submitListener, inputListener;

    scope = this;
    submitButton = document.querySelectorAll(".room-" + room + " .message-submit");
    inputField = document.querySelectorAll(".room-" + room + " .message-input");
    submitListener = function () {
        currentRoom = this.parentNode.parentNode.parentNode.classList[1].split('-')[1];
        scope.rootScope.sendMessage(this.parentNode.previousElementSibling, currentRoom);

        if (callback) {
            callback();
        }
        return false;
    };
    inputListener = function (event) {
        try {
            if (event.keyCode == 13) {
                currentRoom = this.parentNode.parentNode.classList[1].split('-')[1];
                scope.rootScope.sendMessage(this, currentRoom);

                if (callback) {
                    callback();
                }
            }
        } catch (e) {
            //..
        }
        return false;
    };

    for (var i = 0; i < submitButton.length; i++) {
        submitButton[i].addEventListener('click', submitListener);
        inputField[i].addEventListener('keypress', function (e) {
            inputListener.call(this, e);
        });
    }
};

ViewClass.prototype.leaveRoom = function () {
    console.log(this.rootScope);
};

ViewClass.prototype.switchTheme = function (theme) {
    this.rootScope.theme = theme;
    this.rootScope.socket.emit('get-theme', {
        theme: theme
    });
};

ViewClass.prototype.updateThemeMessages = function (theme) {
    var log;

    log = JSON.parse(localStorage.getItem('message-log'));

    this.rootScope.socket.emit('update-messages', {
        messages: log,
        theme: theme,
        room: this.room
    });
};

ViewClass.prototype.redrawMessages = function (data) {
    this.el.querySelector('.messages-container ul').innerHTML = data.message;
};

var RoomClass = function (socket) {
    this.socket = socket || null;
    this.roomName = null;
};

RoomClass.prototype.setId = function (id) {
    this.id = id || null;
};

RoomClass.prototype.setName = function (name) {
    this.roomName = name || null;
};

RoomClass.prototype.createRoom = function (name) {
    this.roomName = name || null;
    this.socket.emit('createRoom', {
        room: this.roomName
    });
};

RoomClass.prototype.joinRoom = function (user, room, targetView) {
    this.socket.emit('joinRoom', {
        container: targetView,
        user: user,
        room: room
    });
};

RoomClass.prototype.leaveRoom = function (user, roomName) {
    this.socket.emit('leaveRoom', {
        room: roomName,
        user: user
    });
};

var chat = new ChatClass();