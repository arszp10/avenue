var express = require('express');

function authenticateWeb(req, res, next) {
    if (req.session.user) {
        var user = req.session.user;
        var c = {
            userId:    user.id,
            fullName:  user.fullName,
            email:     user.email,
            apiKey:    user.apiKey,
            apiSecret: user.apiSecret
        };
        res.cookie('_avenue', c, {
            expires: new Date(req.session.cookie._expires),
            maxAge : req.session.cookie.originalMaxAge
        });
        next();
        return;
    };
    res.redirect('/sign-in');
}

module.exports = function(app) {

    app.use('/', express.static(__dirname + '/../public'));

    app.use('/app/:modelId', authenticateWeb, function (req, res) {
        res.sendFile('app.html', {root: __dirname + '/../public'});
    });

    app.use('/models', authenticateWeb, function (req, res) {
        res.sendFile('models.html', {root: __dirname + '/../public'});
    });

    app.use('/user/activate/:key', function (req, res) {
        if (true) {
            res.redirect('/sign-in#activation-success');
            return;
        }
        res.redirect('/sign-in#activation-failed');
    });


    app.use('/sign-in', function (req, res) {
        if (req.session.user) {
            res.redirect('/models');
            return;
        }
        res.sendFile('sign-in.html', {root: __dirname + '/../public'});
    });

    app.use('/sign-out', function (req, res) {
        res.clearCookie('connect.sid', {path: '/'});
        res.clearCookie('_avenue', {path: '/'});
        req.session.destroy(function () {});
        res.redirect('/sign-in');
    });
};