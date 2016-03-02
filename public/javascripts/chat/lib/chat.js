var Chat = function(){
    this.rooms = [];
};

Chat.prototype.addUserToChat = function() {
    //..
};

Chat.prototype.deleteUserFromChat = function() {
    //..
};

Chat.prototype.canAccess = function() {
    //..
};

Chat.prototype.updateRoomsList = function(action, room) {
    switch (action) {
        case 'add-room':
            this.rooms.push(room);
            break;
        case 'remove-room':
            //..
            break;
        default:
            break;
    }
};

Chat.prototype.getActiveRooms = function() {
    return this.rooms;
};

Chat.prototype.createChat = function() {
    //..
};

Chat.prototype.deleteChat = function() {
    //..
};

Chat.prototype.broadcastMessage = function() {
    //..
};

Chat.prototype.loadHistory = function() {
    //..
};

module.exports = Chat;