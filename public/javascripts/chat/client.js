var ChatClass = function () {
    this.user = false;
    this.room = false;
    this.config = null;
    this.theme = '';
    this.selector = null;
    this.layout = '';
};

ChatClass.prototype.init = function (selector, config) {
    this.theme = (config.theme) ? config.theme : 'default';
    this.config = config;
    this.selector = selector;
    this.initSocket(config.socket);
    this.setMessageListener();
};

ChatClass.prototype.initSocket = function (socket) {
    this.socket = io.connect(socket, {query: 'theme=' + this.theme});
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

ChatClass.prototype.render = function () {
    var container;
    container = this.$(this.selector);
    container.innerHTML = this.layout;
    container.className = 'chat-container';
    this.setPanelListeners();
    this.confirmMessageSend(this.config.onSendSubmit);
    this.includeStylesheet();
};

ChatClass.prototype.includeStylesheet = function () {
    var head, link;

    head = document.getElementsByTagName('head')[0];
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '/javascripts/chat/themes/' + this.theme + '/style.css';//TODO: send path to file from server
    link.media = 'all';

    console.log(link);

    head.appendChild(link);
};

ChatClass.prototype.sendMessage = function (selector) {
    var input;

    input = this.$(selector);

    if (input[0].value !== '') {
        this.socket.emit('client-message', {
            type: 'client-message',
            message: input[0].value,
            room: this.room,
            user_id: localStorage.getItem('user-id')
        });
    }
};

ChatClass.prototype.confirmMessageSend = function (callback) {
    var scope;

    scope = this;

    this.$('.message-submit')[0].addEventListener('click', function () {
        scope.sendMessage('.message-input');

        if (callback) {
            callback();
        }
        return false;
    });

    this.$('.message-input')[0].addEventListener('keypress', function (event) {
        try {
            if (event.keyCode == 13) {
                scope.sendMessage('.message-input');

                if (callback) {
                    callback();
                }
            }
        } catch (e) {
            //..
        }
        return false;
    });
};

ChatClass.prototype.setMessageListener = function () {
    var scope = this;

    this.socket.on('message', function (response) {
        var node, mesContainer, roomsSelect, textnode;

        mesContainer = scope.$('.messages-container');

        switch (response.type) {
            case 'text-message':
                mesContainer[0].children[0].insertAdjacentHTML('beforeend', response.message);
                scope.config.onMessageReceive(response);

                break;
            case 'initial-data':
                console.log(response);

                break;
            case 'system-data':
                switch (response.action) {
                    case 'join-room':
                        localStorage.setItem('user-id', response.data.id);
                        scope.user = response.data;
                        break;
                    case 'leave-room':
                        localStorage.removeItem('user-id');
                        break;
                    case 'send-layout':
                        scope.layout = response.data.layout;
                        scope.render();
                        break;
                    default:
                        break;
                }

                break;
            case 'system-message':
                mesContainer[0].children[0].insertAdjacentHTML('beforeend', response.message);
                scope.config.onMessageReceive(response);

                break;
            case 'update-rooms':
                roomsSelect = scope.$('.created-rooms');

                if (response.rooms !== 'default') {
                    roomsSelect[0].innerHTML = '';
                    var i = 0, length = response.rooms.length;
                    for (i = 0; i < length; i++) {
                        node = document.createElement("option");
                        textnode = document.createTextNode(response.rooms[i]);
                        node.setAttribute("value", response.rooms[i]);
                        node.className = 'msg';
                        node.appendChild(textnode);
                        roomsSelect[0].appendChild(node);
                    }

                    if (response.message !== '') {
                        mesContainer[0].children[0].insertAdjacentHTML('beforeend', response.message);
                    }
                } else {
                    roomsSelect[0].innerHTML =
                        '<option value="" disabled selected>no rooms available</option>';
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

ChatClass.prototype.setPanelListeners = function () {
    var scope = this;

    this.$('.create-btn')[0].addEventListener('click', function () {
        var roomName;

        roomName = prompt("Room Name:", '');

        if (roomName && roomName !== '') {
            scope.socket.emit('createRoom', {
                room: roomName
            });
        }
        return false;
    });

    this.$('.leave-btn')[0].addEventListener('click', function () {
        var roomsSelect = scope.$('.created-rooms'),
            room = roomsSelect[0].options[roomsSelect[0].selectedIndex].value;

        if (room !== '' && localStorage.getItem('user-id')) {
            scope.socket.emit('leaveRoom', {
                room: room,
                user: scope.user
            });
        }
        return false;
    });

    this.$('.enter-btn')[0].addEventListener('click', function () {
        var user = prompt("User Name:", ''),
            roomsSelect = scope.$('.created-rooms'),
            room = roomsSelect[0].options[roomsSelect[0].selectedIndex].value;

        if (user && user !== '' && room !== '') {
            scope.room = room;
            scope.socket.emit('joinRoom', {
                user: user,
                room: scope.room
            });
        }
        return false;
    });
};

var chat = new ChatClass();