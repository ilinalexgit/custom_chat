var Chat = function(swig){
    this.rooms = [];
    this.swig = swig;
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

Chat.prototype.wrapDate = function (date) {
    var dateObj;

    dateObj = new Date(date);
    return dateObj.getHours() + ':' + dateObj.getMinutes() + ':' + dateObj.getSeconds();
};

Chat.prototype.prepareMessage = function(config) {
    var messageLayout, date;

    date = this.wrapDate(config.time);

    messageLayout = this.swig.renderFile('public/javascripts/chat/themes/default/includes/message.html', {
        time: date,
        username: config.user.name,
        says: config.text

    });

    return messageLayout;
};

Chat.prototype.loadHistory = function() {
    //..
};

module.exports = Chat;