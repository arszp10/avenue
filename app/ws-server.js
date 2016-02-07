var io = require('socket.io')(process.argv[2]);
var sessions = {};
var options = {
    sessionsPerLogin: 2
};

io.use(function(socket, next) {
    var login = socket.handshake.query.login;
    /*
     make sure the handshake data looks good as before
     if error do this:
     next(new Error('not authorized'));
     else just call next
    */
    if (sessions.hasOwnProperty(login)) {
        if (sessions[login].length >= options.sessionsPerLogin) {
            next(new Error('Too many sessions per one account'));
            return;
        }
        sessions[login].push(socket);
    } else {
        sessions[login] = [socket];
    }
    console.log('The user: '+ login + ' connected ('+socket.id+')');
    next();
});

io.sockets.on('connection', function (socket) {
    var login = socket.handshake.query.login;
    //socket.emit('this', 'Hello [' + login + ']!');

    socket.on('request', function (login, data) {
        console.log('I received request by ', login, ' saying ', data);

        if (! sessions.hasOwnProperty(login)) {
            return;
        }
        sessions[login].forEach(function(v,i){
            v.emit('response', data);
        })

    });

    socket.on('disconnect', function () {
        var login = socket.handshake.query.login;
        if (! sessions.hasOwnProperty(login)) {
            return;
        }
        var i = sessions[login].indexOf(socket);
        if (i != -1) {
            sessions[login].splice(i, 1);
        }
        console.log('The user: '+ login + ' disconnected ('+socket.id+')');
    });

});