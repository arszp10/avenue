var express = require('express');

function authenticateWeb(req, res, next) {
    if (req.session.user_id) {
        next();
        return;
    }
    ;
    res.redirect('/sign-in');
}

module.exports = function(app) {

    app.use('/', express.static(__dirname + '/../public'));

    app.use('/app', authenticateWeb, function (req, res) {
        res.sendFile('app.html', {root: __dirname + '/../public'});
    });

    app.use('/sign-in', function (req, res) {
        if (req.session.user_id) {
            res.redirect('/app');
            return;
        }
        res.sendFile('sign-in.html', {root: __dirname + '/../public'});
    });

    app.use('/sign-out', function (req, res) {
        if (req.session.user_id) {
            res.clearCookie('connect.sid', {path: '/'});
            req.session.destroy(function () {
            });
        }
        res.redirect('/sign-in');
    });
};