var ChatClass = function(customTpl){
    this.socket = io.connect('http://igor.dnet:3000');
    this.user = false;
    this.room = false;
    this.templates = {
        panelTpl: (!customTpl.panelTpl) ?
            '<div class="panel">' +
                '<button type="button" class="create-btn">create room</button>' +
                '<select class="created-rooms"></select>' +
                '<button type="button" class="enter-btn">enter chat</button>' +
                '<button type="button" class="leave-btn">leave chat</button>' +
            '</div>' : customTpl.panelTpl,
        messagesContainerTpl: (!customTpl.messagesContainerTpl) ?
            '<ul class=\'messages-container\'></ul>' : customTpl.messagesContainerTpl,
        inputFieldTpl: (!customTpl.inputFieldTpl) ?
            '<div class="input-container">' +
                '<input type="text" class="message-input">' +
                '<button type="button" class="message-submit">send</button>' +
            '</div>' : customTpl.inputFieldTpl
    };
};

ChatClass.prototype.render = function(config){
    if(config){
        console.log(config);
    }

    chat.defaultRender('#chat-container');
    chat.setTplListeners();
    chat.setMessageListener();
};

ChatClass.prototype.$ = function(a){
    switch (a.charAt(0)){
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

ChatClass.prototype.defaultRender = function(selector){
    var container = chat.$(selector);

    container.insertAdjacentHTML('beforeend', chat.templates.messagesContainerTpl);
    container.insertAdjacentHTML('beforeend', chat.templates.inputFieldTpl);
    container.insertAdjacentHTML('afterBegin', chat.templates.panelTpl);
};

ChatClass.prototype.vrapDate = function(date){
    var dateObj;

    dateObj = new Date(date);
    /*return dateObj.getDay() + 1 + '-' + dateObj.getDate() + '-' + dateObj.getFullYear() +
        ' ' + dateObj.getHours() + ':' + dateObj.getMinutes() + ':' + dateObj.getSeconds();*/
    return dateObj.toUTCString();
};

ChatClass.prototype.prepareMessage = function(data){
    var date, node, textnode;

    date = this.vrapDate(data.time);
    node = document.createElement("li");
    textnode = document.createTextNode(date + ' - ' + data.message);
    node.appendChild(textnode);

    return node;
};


ChatClass.prototype.sendMessage = function(selector){
    var input;

    input = chat.$(selector);

    if(input[0].value !== ''){
        chat.socket.emit('client-message', {
            type: 'client-message',
            message: input[0].value,
            room: chat.room
        });

        input[0].value = '';
    }
};

ChatClass.prototype.setMessageListener = function(){
    var scope = this;

    this.socket.on('message', function (data) {
        var node, mesContainer, roomsSelect, textnode;

        mesContainer = chat.$('.messages-container');

        switch (data.type) {
            case 'server-message':
                node = scope.prepareMessage(data);
                mesContainer[0].appendChild(node);

                break;
            case 'update-rooms':
                roomsSelect = chat.$('.created-rooms');

                if(data.rooms !== 'default'){
                    roomsSelect[0].innerHTML = '';
                    var i = 0, length = data.rooms.length;
                    for(i = 0; i < length; i++){
                        node = document.createElement("option");
                        textnode = document.createTextNode(data.rooms[i]);
                        node.setAttribute("value", data.rooms[i]);
                        node.appendChild(textnode);
                        roomsSelect[0].appendChild(node);
                    }

                    if(data.message !== ''){
                        node = scope.prepareMessage(data);
                        mesContainer[0].appendChild(node);
                    }
                }else{
                    roomsSelect[0].innerHTML =
                        '<option value="" disabled selected>no rooms available</option>';
                }
                break;
            case 'server-authorize':
                break;
            default:
                console.log ('unknown type:', data.type);
                break;
        }
    });
};

ChatClass.prototype.setTplListeners = function(){
    var scope = this;

    this.$('.message-input')[0].addEventListener('keypress', function(event) {
        try {
            if (event.keyCode == 13) {
                scope.sendMessage('.message-input');
            }
        } catch (e) {
            //..
        }
        return false;
    });

    this.$('.message-submit')[0].addEventListener('click', function() {
        scope.sendMessage('.message-input');
        return false;
    });

    this.$('.create-btn')[0].addEventListener('click', function() {
        var roomName;

        roomName = prompt("Room Name:", '');

        if(roomName && roomName !== ''){
            scope.socket.emit('createRoom', {
                room: roomName
            });
        }
        return false;
    });

    this.$('.leave-btn')[0].addEventListener('click', function() {
        var roomsSelect = chat.$('.created-rooms'),
            room = roomsSelect[0].options[roomsSelect[0].selectedIndex].value;

        if(room !== ''){
            scope.socket.emit('leaveRoom', {
                room: room,
                user: chat.user
            });
        }
        return false;
    });

    this.$('.enter-btn')[0].addEventListener('click', function() {
        var user = prompt("User Name:", ''),
            roomsSelect = chat.$('.created-rooms'),
            room = roomsSelect[0].options[roomsSelect[0].selectedIndex].value;

        if(user && user !== '' && room !== ''){
            scope.room = room;
            scope.user = user;
            scope.socket.emit('joinRoom', {
                user: scope.user,
                room: scope.room
            });
        }
        return false;
    });
};

var chat = new ChatClass({});