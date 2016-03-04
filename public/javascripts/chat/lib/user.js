var User = function () {
    this.users = [];
};

User.prototype.loginUser = function () {
    //..
};

User.prototype.logoutUser = function () {
    //..
};

User.prototype.signinUser = function (data) {
    if (data.name && data.name !== '') {
        return {
            name: data.name,
            id: this.setId()
        };
    }
};

User.prototype.removeUser = function (token) {
    var i, length, removedName;

    i = 0;
    length = this.users.length;

    for (i; i < length; i++) {
        if (this.users[i].id === token) {
            removedName = this.users[i];
            this.users.splice(i, 1);
            return removedName;
        }
    }

    return false;
};

User.prototype.serializeUser = function (data) {
    this.users.push(data);
    return data.id;
};

User.prototype.deserializeUser = function (token) {
    var i, length;

    i = 0;
    length = this.users.length;

    for (i; i < length; i++) {
        if (this.users[i].id === token) {
            return this.users[i];
        }
    }

    return false;
};

User.prototype.getActiveUsers = function () {
    return this.users;
};

User.prototype.setId = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

User.prototype.getRole = function () {
    //..
};

User.prototype.getMeta = function (id) {
    //..
};

User.prototype.setStatus = function () {
    //..
};

User.prototype.getUserChats = function () {
    //..
};

module.exports = User;