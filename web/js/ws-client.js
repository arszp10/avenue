var socket = null;
var login = 'ws-user-00001';
$('#btn-connect').click(function(){
    if (socket != null) {
        return;
    }
    socket = io.connect('http://localhost:3000',   {query: "login="+login+"&token=token00001"});

    socket.on('calc-response', function (data) {
        console.log('response:', data);

        var foo = [];

        for (var i = 1; i <= 100; i++) {
            foo.push(i);
        }
        new Chartist.Line('.ct-chart', {
            labels: foo,
            series: [
                data.ID2.flow.inFlow,
                data.ID2.flow.outFlow
            ]
        }, {
            low: 0,
            showArea: true,
            width: '500px',
            height: '300px'
        });

        $('.chart-panel').drag();

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
    socket.emit('calc-request', login, app.actions.prepareCalcRequest());
});
