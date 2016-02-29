var chat = new ChatClass({});

chat.defaultRender('#chat-container');

chat.$('.message-input')[0].addEventListener('keypress', function(event) {
    try {
        if (event.keyCode == 13) {
            chat.sendMessage('.message-input');
        }
    } catch (e) {
        //..
    }
    return false;
});

chat.$('.message-submit')[0].addEventListener('click', function() {
    chat.sendMessage('.message-input');
    return false;
});

chat.$('.create-btn')[0].addEventListener('click', function() {
    var roomName;

    roomName = prompt("Room Name:", '');

    if(roomName && roomName !== ''){
        chat.socket.emit('createRoom', {
            room: roomName
        });
    }
    return false;
});

chat.$('.leave-btn')[0].addEventListener('click', function() {
    var roomsSelect = chat.$('.created-rooms'),
        room = roomsSelect[0].options[roomsSelect[0].selectedIndex].value;

    if(room !== ''){
        chat.socket.emit('leaveRoom', {
            room: room,
            user: chat.user
        });
    }
    return false;
});

chat.$('.enter-btn')[0].addEventListener('click', function() {
    var user = prompt("User Name:", ''),
        roomsSelect = chat.$('.created-rooms'),
        room = roomsSelect[0].options[roomsSelect[0].selectedIndex].value;

    if(user && user !== '' && room !== ''){
        chat.room = room;
        chat.user = user;
        chat.socket.emit('joinRoom', {
            user: chat.user,
            room: chat.room
        });
    }
    return false;
});

chat.setMessageListener();