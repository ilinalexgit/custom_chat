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
            if(data.type !== 'system-message'){
                data.el.insertAdjacentHTML('beforeend',
                    '<span class="msg-actions">' +
                        '<a href="#" class="edit-msg">Edit</a>&nbsp' +
                        '<a href="#" class="delete-msg">Delete</a>' +
                    '</span>'
                );
            }
        }
    }
);