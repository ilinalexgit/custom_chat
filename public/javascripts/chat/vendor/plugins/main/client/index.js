chat.plugins.main = function(){

    /*chat.$('.create-btn')[0].addEventListener('click', function () {
        var roomName;
        roomName = prompt("Room Name:", '');
        if(roomName && roomName !== ''){
            var room;
            room = new Room(chat.socket);
            chat.rooms.push(room);
            room.createRoom(roomName);
        }
    });*/

    /*chat.$('.enter-btn')[0].addEventListener('click', function () {
        var view, user, userName;

        userName = prompt("User Name:", '');

        if(userName && userName !== ''){
            var roomsSelect, currentRoom, room;

            roomsSelect = chat.$('.created-rooms');
            currentRoom = roomsSelect[0].options[roomsSelect[0].selectedIndex].innerHTML;//TODO: check room name on server side (value or innerHTML where stored)

            if (userName && userName !== '' && currentRoom !== '') {
                room = new Room(chat.socket);//TODO: store instance of room in parent class
                room.joinRoom(userName, currentRoom, '#chat1', function(response){
                    localStorage.setItem('user-id', response.data.user.id);
                    user = new User(response.data, chat);
                    chat.users.push(user);
                    view = new View(
                        response.data.room,
                        response.data.container,
                        chat.getConfig(),
                        chat
                    );
                    chat.views.push(view);
                    view.render();
                    user.setOwner(view, response.data.user.id);
                    if(response.message){
                        chat.prepareMessage(response.message, chat);
                    }
                });
            }
        }
    });*/

    /*chat.$('.leave-btn')[0].addEventListener('click', function () {
        var room, container, userId;
        var roomsSelect = chat.$('.created-rooms'),
            currentRoom = roomsSelect[0].options[roomsSelect[0].selectedIndex].innerHTML;

        if (currentRoom !== '') {
            localStorage.removeItem('user-id');
            container = chat.$('.room-' + currentRoom);
            userId = container[0].classList[2].split('-')[1];
            container[0].classList.remove('owner-' + userId);
            room = new Room(chat.socket);//TODO: store instance of room in parent class
            room.leaveRoom(userId, currentRoom, function(response){
                chat.prepareMessage(response.message, chat);
            });
        }
    });*/
};