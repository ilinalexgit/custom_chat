var chat_obj, created, user, currentUserID, getSelectedRoomId;

chat_obj = chat.init({
    socket: 'http://igor.dnet:3000'
});

/*room_obj = chat_obj.getRoom({'room_id': '43abcdef'});
room_obj.joinUser({'name':'Amigobot'},function(){},function(){});*/

getSelectedRoomId = function(){
    var select, id;

    select = chat.$('.created-rooms');
    id = select[0].options[select[0].selectedIndex].value;

    return id;
};

chat.$('.create-btn')[0].addEventListener('click', function () {
    var name = prompt("Room Name:", 'room1');

    chat_obj.createRoom(name, function(room, params){
        created = room;

        created.joinUser({'name':'holabot'}, function(roomWithHolabot, params){
            roomWithHolabot.sendMessage('Hola, brothers!', function(response){
                console.log(response);
            }, function(err){
                //..
            });
        },function(err){
            //..
        });
    }, function(err){
        //..
    });

});

chat.$('.enter-btn')[0].addEventListener('click', function () {
    var name, selector, roomView;

    name = prompt("User Name:", 'igor');
    selector = prompt("Selector:", '#chat1');

    if(name && selector){
        user = new User({
            'name': name,
            'last_name': 'Smith'
        });

        created.joinUser(user, function(roomWithUser, params){
            roomView = new View('default', selector, roomWithUser);
            roomView.render();

            roomWithUser.sendMessage(params.says, function(response){
                console.log(response);
            }, function(err){
                //..
            });
        },function(err){
            //..
        });
    }
});

chat.$('.leave-btn')[0].addEventListener('click', function () {
    var container;

    container = chat.$('.owner-' + user.id);

    created.leaveRoom(function(response){
        container[0].classList.remove('owner-' + user.id);
        chat.prepareMessage(response.message, chat);
    });
});

chat.socket.on('update-rooms', function (response) {
    var node, mesContainer, select, text, scope;
    var i, length = response.rooms.length;

    scope = chat;
    mesContainer = scope.$('.messages-container');
    select = scope.$('.created-rooms');

    if (response.rooms !== 'default') {
        //room.updateRoomsList(response.rooms);
        select[0].innerHTML = '';
        for (i = 0; i < length; i++) {
            node = document.createElement("option");
            text = document.createTextNode(response.rooms[i].name);
            node.setAttribute("value", response.rooms[i].id);
            node.className = 'msg';
            node.appendChild(text);
            select[0].appendChild(node);
        }

        if (mesContainer.length > 0) {
            chat.prepareMessage(response, chat);
        }
    } else {
        select[0].innerHTML =
            '<option value="" disabled selected>no rooms available</option>';
    }
});