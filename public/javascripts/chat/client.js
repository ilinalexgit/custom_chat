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