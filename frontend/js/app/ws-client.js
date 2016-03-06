var socket = null;
var login = 'ws-user-00001';

$('#btn-calc').click(function(){
    var th = $(this);

    if (socket != null) {
        socket.emit('calc-request', login, app.actions.prepareCalcRequest());
        th.find('i').addClass('fa-spin');
        return;
    }

    socket = io.connect('http://localhost:3001',   {query: "login="+login+"&token=token00001"});

    socket.on('calc-response', function (data) {
        //console.log('response:', data);
        app.state.lastCalc = data;
        socket.disconnect();
        socket = null;
        th.find('i').removeClass('fa-spin')
    });

    socket.on('error', function (data) {
        console.log('error:', data);
        socket.disconnect();
        socket = null;
        th.find('i').removeClass('fa-spin');
    });

    socket.emit('calc-request', login, app.actions.prepareCalcRequest());
    th.find('i').addClass('fa-spin');
});
