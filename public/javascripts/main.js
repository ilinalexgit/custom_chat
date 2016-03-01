chat.init(
    '#chat1',
    {
        socket: 'http://localhost:3000',
        onSendSubmit: function(){
            var input;
            input = chat.$('.message-input');
            input[0].value = '';
        },
        onMessageReceive: function(data){
            console.log('onMessageReceive', data);
            if(!data.system){
                data.el.insertAdjacentHTML('beforeend',
                    '<span class="msg-actions">' +
                        '<a href="#" class="edit-msg">Edit</a>' +
                        '&nbsp<a href="#" class="delete-msg">Delete</a>' +
                        '</span>'
                );
            }
        }
    }
);

console.log(chat);