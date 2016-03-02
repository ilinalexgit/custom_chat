var User = function(){
    this.status = 'active';
};

User.prototype.loginUser = function() {
    //..
};

User.prototype.logoutUser = function() {
    //..
};

User.prototype.getRole = function() {
    //..
};

User.prototype.getMeta = function() {
    //..
};

User.prototype.setStatus = function() {
    return this.status;
};

User.prototype.getUserChats = function() {
    //..
};

module.exports = User;