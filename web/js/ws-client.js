var socket = null;
var login = 'ws-user-00001';
$('#btn-connect').click(function(){
    if (socket != null) {
        return;
    }
    socket = io.connect('http://localhost:3000',   {query: "login="+login+"&token=token00001"});

    socket.on('response', function (data) {
        console.log('response:', data);
    });

    socket.on('error', function (data) {
        console.log('error:', data);
    });

});

$('#btn-disconnect').click(function(){
    socket.disconnect();
    socket = null;
});

$('#btn-calc').click(function(){
    socket.emit('request', login, {a:1});
});
