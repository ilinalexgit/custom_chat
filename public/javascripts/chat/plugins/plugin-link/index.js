var request = require("request"),
    cheerio = require("cheerio"),
    Promise = require("promise"),
    path = require('path');

String.prototype.limit = function (limit, userParams) {
    var text, options, prop, lastSpace;

    text = this;
    options = {
        ending: '...', trim: true, words: true
    };

    if (limit !== parseInt(limit) || limit <= 0) return this;

    if (typeof userParams == 'object') {
        for (prop in userParams) {
            if (userParams.hasOwnProperty.call(userParams, prop)) {
                options[prop] = userParams[prop];
            }
        }
    }

    if (options.trim) text = text.trim();

    if (text.length <= limit) return text;

    text = text.slice(0, limit);
    lastSpace = text.lastIndexOf(" ");
    if (options.words && lastSpace > 0) {
        text = text.substr(0, lastSpace);
    }
    return text + options.ending;
};

module.exports = function (chat, user) {

    var Plugin = function () {
        this.socket = null;

        chat.subscribe('messageReceived', this.test, 10);
        chat.subscribe('messageReceived', this.test1, 2);
        chat.subscribe('messageReceived', this.test2, 7);

        chat.subscribe('myCustomEvent', this.test3, 7);
    };

    Plugin.prototype.test = function (message) {
        message.says += '1';
        return message;
    };

    Plugin.prototype.test1 = function (message) {
        message.says += '2';
        return message;
    };

    Plugin.prototype.test2 = function (message) {
        message.says += '3';
        return message;
    };

    Plugin.prototype.test3 = function (data) {
        console.log('TEST 3');
        console.log(data);
    };


    Plugin.prototype.callback = function (result) {
        var $, description, title, time, message, scope;

        /*function urlify(text) {
         var urlRegex = /(https?:\/\/[^\s]+)/g;
         return text.replace(urlRegex, function(url) {
         return '<a href="' + url + '">' + url + '</a>';
         });
         }*/

        //console.log(urlify(result.text));

        scope = this;
        this.message = '';

        result.data.forEach(function (item, i) {
            request(item, function (error, response, body) {
                if (!error) {
                    $ = cheerio.load(body);
                    description = $('meta[name=\'description\']').attr('content') || '';
                    title = $('title').text() || '';
                    time = new Date().getTime();
                    scope.message += chat.swig.renderFile(
                        path.join(__dirname, './message.html'),
                        {
                            url: result.data[0],
                            description: description.limit(100),
                            title: title
                        }
                    );

                    if (i === result.data.length - 1) {
                        setTimeout(function () {
                            chat.io.sockets.in(result.room).emit('message', {
                                type: 'text-message',
                                message: '<li class=\'msg\'>' +
                                    '<span class="time">(' + chat.wrapDate(time) + ')</span>' +
                                    '<span class="username">' + user.deserializeUser(result.user_id).name + ':</span>' +
                                    scope.message +
                                    '</li>',
                                text: scope.message,
                                user: user.deserializeUser(result.user_id),
                                time: time
                            });
                            
                            console.log('result', result);
                        }, 0);
                    }
                } else {
                    console.log("Error: " + error);
                }
            });
        });
    };

    return new Plugin();
};