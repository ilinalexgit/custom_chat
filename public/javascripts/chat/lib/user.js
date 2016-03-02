var User = function(){
    this.id = null;
    this.status = 'active';
    this.name = 'default';
};

User.prototype.loginUser = function() {
    //..
};

User.prototype.logoutUser = function() {
    //..
};

User.prototype.signinUser = function(data) {
    if(data.name && data.name !== ''){
        this.name = data.name;
        this.id = this.setId();
    }
};

User.prototype.serializeUser = function(data) {
    //..
};

User.prototype.deserializeUser = function(data) {
    //..
};

User.prototype.setId = function() {
    return '_' + Math.random().toString(36).substr(2, 9);
};

User.prototype.getRole = function() {
    //..
};

User.prototype.getMeta = function() {
    return {
        name: this.name,
        id: this.id
    };
};

User.prototype.setStatus = function() {
    return this.status;
};

User.prototype.getUserChats = function() {
    //..
};

module.exports = User;