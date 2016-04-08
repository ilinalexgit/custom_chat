var Chat = function () {
    //this.plugins = {};
    //this.availPlagins = [
    //    'main'
    //];
    //this.theme = '';
    //this.layout = '';
};

Chat.prototype.init = function (config) {
    //this.theme = (config.theme) ? config.theme : 'default';//TODO: move to view class
    this.config = config || null;
    this.initSocket(config.socket);
    //this.checkConnection();
    this.setMessageListener();
    //this.initPlugins();

    return this;
};

Chat.prototype.createRoom = function (name, fn) {
    var scope = this;

    if(name){
        this.socket.emit('createRoom', {
            room: name
        }, function(data){
            /*if(data && data.room){
                scope.rooms.push(data.room);
            }*/
            var room = new Room(scope, data.room.name, data.room.id);
            room.setSocket(scope.socket);
            fn(room, data);
        });
    }
};

Chat.prototype.initPlugins = function () {
    for(var i in this.plugins) {
        if (this.plugins.hasOwnProperty(i)) {
            var item = this.plugins[i];
            if(this.checkPluginAvail(i)){
                item();
            }
        }
    }
};

Chat.prototype.initSocket = function (socket) {
    this.socket = io.connect(socket, {query: 'theme=' + this.theme});
};

Chat.prototype.checkConnection = function () {
    this.socket.emit('check-connection', {
        id: localStorage.getItem('user-id')
    });
};

Chat.prototype.checkPluginAvail = function (value) {
    for(var i in this.availPlagins) {
        if (this.availPlagins.hasOwnProperty(i)) {
            return this.availPlagins[i] === value;
        }
    }
};

Chat.prototype.getConfig = function () {
    return this.config;
};

Chat.prototype.$ = function (a) {//TODO: remove from view class
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

Chat.prototype.sendMessage = function (input, targetRoom) {
    var userId, url;

    if (input.parentNode.parentNode.classList[2]) {
        userId = input.parentNode.parentNode.classList[2].split('-')[1];
    }
    /*url = function (text) {
        var source, urlArray, url, matchArray, regexToken;

        source = (text || '').toString();
        urlArray = [];
        regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

        while ((matchArray = regexToken.exec(source)) !== null) {
            var token = matchArray[0];
            urlArray.push(token);
        }

        return urlArray;
    };*/

    if (input.value && input.value !== '') {
        var textarea, i, length;
        /*var found = url(input.value);
        if (!found.length) {
        } else {
            this.socket.emit('plugin-link', {//TODO: remove this when event system get ready
                data: found,
                text: input.value,
                room: targetRoom,
                user_id: userId
            });
        }*/

        this.socket.emit('client-message', {
            type: 'client-message',
            message: input.value,
            room: targetRoom,
            user_id: userId
        });

        textarea = chat.$('.message-input');
        length = textarea.length;

        for(i = 0; i < length; i++){
            textarea[i].value = '';
        }
    }
};

Chat.prototype.logMessage = function (message) {
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

Chat.prototype.clearLog = function () {
    localStorage.removeItem('message-log');
};

Chat.prototype.prepareMessage = function (data, scope) {
    if(data){
        scope.logMessage(data);
        /*if (data.restoreConnection) {
            scope.views.forEach(function (item) {
                item.updateThemeMessages();
            });
        } else {
            scope.renderMessage(data);
        }*/
        scope.renderMessage(data);
    }
};

Chat.prototype.renderMessage = function (data) {
    var layout, mesContainer, i, length;

    swig.setFilter('myfilter', function (input) { return input; });
    data.myvar = 'test';
    layout = swig.run(tpl.default_message_tpl, data);
    mesContainer = this.$('.messages-container');
    length = mesContainer.length;

    for (i = 0; i < length; i++) {
        mesContainer[i].children[0].insertAdjacentHTML('beforeend', layout);
    }
};

Chat.prototype.setMessageListener = function () {
    var scope = this;

    this.socket.on('message', function (response) {

        switch (response.type) {
            case 'text-message':
                scope.prepareMessage(response, scope);
                break;
            case 'update-messages':
                scope.views.forEach(function (item) {
                    item.redrawMessages(response);
                });
                break;
            /*case 'connection-response':
                if (response.user) {
                    var user, state, currentUserID, view;

                    state = scope.room.getState('room1');//point 1
                    console.log(state);
                    scope.room.joinRoom(state.owner.name, state.room, function(response){
                        user = new User(response.user, scope);
                        currentUserID = response.user.id;

                        view = new View(
                            state.room,
                            '#chat1',
                            scope.room
                        );
                        view.render();
                        //view.setOwner(user, response.user.id);
                        scope.prepareMessage(response.message, scope);
                    });
                }
                break;*/
            case 'server-authorize':
                break;
            default:
                console.log('unknown type:', response.type);
                break;
        }
    });
};

var User = function (data) {
    this.id = this.setId();
    this.name = data.name || null;
    this.last_name = data.last_name || null;

    //this.users = [];
    //this.users.push(data);
};

User.prototype.setId = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

User.prototype.getUser = function (id) {
    var result = false;
    this.users.forEach(function (item) {
        if (item.id === id) {
            result = item;
        }
    });

    return result;
};

var View = function (theme, selector, room) {
    this.el = null;
    this.room_id = room.id || null;
    this.rootScope = room.parentScope || null;
    this.parentScope = room || null;
    this.selector = selector || null;
    this.theme = theme || 'default';

    /*this.room = this.parentScope.getRoom(this.room_id);
    this.parentScope.views.push(this);*/

    return this;
};

View.prototype.render = function () {
    var container, scope, layout;
    container = this.rootScope.$(this.selector);
    layout = swig.run(tpl[this.theme + '_index_tpl'], {});
    this.el = container;
    scope = this;

    if (container.innerHTML === '') {
        container.innerHTML = layout;
        container.className = 'chat-container';
        container.className += " room-" + this.parentScope.roomName;
        this.includeStylesheet();
        this.messageSendHandler(this.parentScope.roomName);
        this.updateUsers();
        this.setOwner(this.parentScope.user, false);

        this.el.querySelector('.switch-theme').addEventListener('click', function () {
            scope.switchTheme('green');
        });
    }

    return this;
};

View.prototype.includeStylesheet = function () {//TODO: move to view class
    var head, link, createdEl;

    createdEl = document.querySelector('#chat-style');
    head = document.getElementsByTagName('head')[0];
    link = document.createElement('link');
    link.id = 'chat-style';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '/javascripts/chat/vendor/themes/' + this.theme + '/style.css';
    link.media = 'all';

    if (!createdEl) {
        head.appendChild(link);
    } else {
        createdEl.parentNode.removeChild(createdEl);
        head.appendChild(link);
    }
};

View.prototype.setOwner = function (user, id) {
    /*var i, length;

    length = user.users.length;

    for (i = 0; i < length; i++) {
        if (user.users[i].id === id) {
            this.el.className += " owner-" + user.users[i].id;
            this.owner = user.users[i];
        }
    }*/

    this.el.className += " owner-" + user.id;
    this.owner = user;
    this.parentScope.storeState(this);
};

View.prototype.updateUsers = function(){
    var scope;

    scope = this;

    this.rootScope.socket.emit('getUserList', null, function(data) {
        scope.rootScope.$('.users-container')[0].querySelector('ul').innerHTML = '';
        data.users.forEach(function (item) {
            var el = '<li>' + item.name + '</li>';
            scope.rootScope.$('.users-container')[0].querySelector('ul').insertAdjacentHTML('beforeend', el);
        });
    });
};

View.prototype.unrender = function () {
    var container;

    container = this.rootScope.$(this.selector);
    container.innerHTML = '';
};

View.prototype.messageSendHandler = function (room) {
    var scope, currentRoom, submitButton, inputField, submitListener, inputListener;

    scope = this;
    submitButton = document.querySelectorAll(".room-" + room + " .message-submit");
    inputField = document.querySelectorAll(".room-" + room + " .message-input");
    submitListener = function () {
        currentRoom = this.parentNode.parentNode.parentNode.classList[1].split('-')[1];
        scope.rootScope.sendMessage(this.parentNode.previousElementSibling, currentRoom);
        return false;
    };
    inputListener = function (event) {
        try {
            if (event.keyCode == 13) {
                currentRoom = this.parentNode.parentNode.classList[1].split('-')[1];
                scope.rootScope.sendMessage(this, currentRoom);
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

View.prototype.switchTheme = function (theme) {
    var scope;
    var user;

    scope = this.rootScope;
    scope.theme = theme;

    scope.views.forEach(function (item) {
        user = scope.getUser(item.owner.id);
        item.unrender();
        item.render();
        //user.setOwner(item, item.owner.id);
        item.updateThemeMessages();
    });
    this.rootScope.includeStylesheet();
};

View.prototype.updateThemeMessages = function () {
    var log, scope;

    log = JSON.parse(localStorage.getItem('message-log'));
    scope = this;

    log.forEach(function (item) {
        scope.rootScope.renderMessage(item);
    });
};

View.prototype.redrawMessages = function (data) {
    this.el.querySelector('.messages-container ul').innerHTML = data.message;
};

var Room = function (scope, name, id) {
    this.parentScope = scope || null;//TODO: rename to rootScope
    this.roomName = name || null;
    this.id = id || null;
    this.socket = null;
    this.rooms = [];//TODO: move to chatClass
    this.views = [];
};

Room.prototype.updateRoomsList = function (rooms) {
    var i, length;

    length = rooms.length;

    for (i = 0; i < length; i++) {
        this.rooms.push(rooms[i]);
    }
};

Room.prototype.setSocket = function (socket) {
    this.socket = socket || null;
};

Room.prototype.setName = function (name) {
    this.roomName = name || null;
};

Room.prototype.joinUser = function (user, sfn, efn) {
    var scope = this;
    this.socket.emit('joinRoom', {
        user: {
            id: user.id,
            name: user.name,
            last_name: user.last_name
        },
        room: this.roomName
    }, function(response) {
        if(response){
            scope.user = response.user;
            sfn(scope, response);
        }else{
            efn({error: true});
        }
    });
};

Room.prototype.getRoom = function (id) {
    var result = false;
    this.rooms.forEach(function (item) {
        if (item.id === id) {
            result = item;
        }
    });

    return result;
};

Room.prototype.joinRoom = function (user, room, fn) {
    this.socket.emit('joinRoom', {
        user: user,
        room: room
    }, function(response) {
        localStorage.setItem('user-id', response.user.id);
        fn(response);
    });
};

Room.prototype.leaveRoom = function (fn) {
    this.socket.emit('leaveRoom', {
        room: this.roomName,
        user: this.user.id
    }, function(response) {
        localStorage.removeItem('user-id');
        fn(response);
    });
};

Room.prototype.sendMessage = function (message, fn) {
    var scope = this;
    this.socket.emit('client-message', {
        type: 'client-message',
        user_id: scope.user.id,
        message: message,
        room: scope.roomName
    }, function(response) {
        fn(response);
    });
};

Room.prototype.storeState = function (view) {
    localStorage.setItem(view.parentScope.roomName, JSON.stringify({
        owner: view.owner,
        room: {}
    }));
};

Room.prototype.getState = function (name) {
    return JSON.parse(localStorage.getItem(name));
};

var chat = new Chat();