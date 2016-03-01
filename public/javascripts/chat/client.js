var ChatClass = function(){
    this.user = false;
    this.room = false;
};

ChatClass.prototype.init = function(selector, config){
    this.initSocket(config.socket);
    this.preRender(selector);
    this.setPanelListeners();
    this.setMessageListener(config);
    this.confirmMessageSend(config.onSendSubmit);
};

ChatClass.prototype.initSocket = function(socket){
    this.socket = io.connect(socket);
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

ChatClass.prototype.preRender = function(selector){
    var container = this.$(selector);

    container.className = 'chat-container';
    console.log(container);
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
    node.className = 'msg';
    node.appendChild(textnode);

    return node;
};

ChatClass.prototype.sendMessage = function(selector){
    var input;

    input = this.$(selector);

    if(input[0].value !== ''){
        this.socket.emit('client-message', {
            type: 'client-message',
            message: input[0].value,
            room: this.room
        });
    }
};

ChatClass.prototype.confirmMessageSend = function(callback){
    var scope;

    scope = this;

    this.$('.message-submit')[0].addEventListener('click', function() {
        scope.sendMessage('.message-input');

        if(callback){
            callback();
        }
        return false;
    });

    this.$('.message-input')[0].addEventListener('keypress', function(event) {
        try {
            if (event.keyCode == 13) {
                scope.sendMessage('.message-input');

                if(callback){
                    callback();
                }
            }
        } catch (e) {
            //..
        }
        return false;
    });
};

ChatClass.prototype.setMessageListener = function(config){
    var scope = this;

    this.socket.on('message', function (data) {
        var node, mesContainer, roomsSelect, textnode;

        mesContainer = scope.$('.messages-container');

        switch (data.type) {
            case 'text-message':
                node = scope.prepareMessage(data);
                mesContainer[0].children[0].appendChild(node);

                config.onMessageReceive(data);

                break;
            case 'update-rooms':
                roomsSelect = scope.$('.created-rooms');

                if(data.rooms !== 'default'){
                    roomsSelect[0].innerHTML = '';
                    var i = 0, length = data.rooms.length;
                    for(i = 0; i < length; i++){
                        node = document.createElement("option");
                        textnode = document.createTextNode(data.rooms[i]);
                        node.setAttribute("value", data.rooms[i]);
                        node.className = 'msg';
                        node.appendChild(textnode);
                        roomsSelect[0].appendChild(node);
                    }

                    if(data.message !== ''){
                        node = scope.prepareMessage(data);
                        mesContainer[0].children[0].appendChild(node);
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

ChatClass.prototype.setPanelListeners = function(){
    var scope = this;

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
        var roomsSelect = scope.$('.created-rooms'),
            room = roomsSelect[0].options[roomsSelect[0].selectedIndex].value;

        if(room !== ''){
            scope.socket.emit('leaveRoom', {
                room: room,
                user: this.user
            });
        }
        return false;
    });

    this.$('.enter-btn')[0].addEventListener('click', function() {
        var user = prompt("User Name:", ''),
            roomsSelect = scope.$('.created-rooms'),
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

var chat = new ChatClass();