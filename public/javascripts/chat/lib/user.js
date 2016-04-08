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
            socket_id: data.socket.id,
            id: data.id
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
    return data;
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

User.prototype.deserializeUserByName = function (name) {//TODO: refactor deserialize methods to avoid duplication
    var i, length;

    i = 0;
    length = this.users.length;

    for (i; i < length; i++) {
        if (this.users[i].name === name) {
            return this.users[i];
        }
    }

    return false;
};

module.exports = User;