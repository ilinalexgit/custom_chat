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
            console.log(data);
        }
    }
);