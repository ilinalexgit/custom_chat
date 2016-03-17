chat.init(
    '#chat1',
    {
        socket: 'http://igor.dnet:3000',
        id: null,
        theme: false,
        setupInterface: function(){
            //..
        },
        onSendSubmit: function(){
            var input, i, length;
            input = chat.$('.message-input');
            length = input.length;

            for(i = 0; i < length; i++){
                input[i].value = '';
            }
        },
        onMessageReceive: function(data){
            //..
        }
    }
);

chat.$('.create-btn')[0].addEventListener('click', function () {
    var roomName;
    roomName = prompt("Room Name:", '');
    if(roomName){
        chat.createRoomInstance(roomName);
    }else{
        return false;
    }
});

chat.$('.enter-btn')[0].addEventListener('click', function () {
    var userName = prompt("User Name:", '');
    if(userName){
        chat.callJoinRoom(userName, '#chat1');
    }else{
        return false;
    }
});

chat.$('.enter-another-btn')[0].addEventListener('click', function () {
    var userName = prompt("User Name:", '');
    if(userName){
        chat.callJoinRoom(userName, '#chat2');
    }else{
        return false;
    }
});

chat.$('.leave-btn')[0].addEventListener('click', function () {
    var roomsSelect = chat.$('.created-rooms'),
        currentRoom = roomsSelect[0].options[roomsSelect[0].selectedIndex].innerHTML;

    if (currentRoom !== '') {
        chat.callLeaveRoom(currentRoom);
    }
    return false;
});

/*chat.$('.leave-another-btn')[0].addEventListener('click', function () {
    var roomsSelect = chat.$('.created-rooms'),
        currentRoom = roomsSelect[0].options[roomsSelect[0].selectedIndex].value;

    if (currentRoom !== '') {
        chat.callLeaveRoom(currentRoom);
    }
    return false;
});*/
