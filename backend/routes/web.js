var express = require('express');
var User = require('../models/user');
var mailer = require('./mailer');

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

module.exports = function(app, config) {

    app.use('/', express.static(__dirname + '/../public'));

    app.use('/app/:modelId', authenticateWeb, function (req, res) {
        res.sendFile('app.html', {root: __dirname + '/../public'});
    });

    app.use('/models', authenticateWeb, function (req, res) {
        res.sendFile('models.html', {root: __dirname + '/../public'});
    });

    app.use('/user/activate/:key', function (req, res) {
        var key = req.params.key;
        User.findOne({activationKey: key}, function (err, user) {
            if (user) {
                user.active = true;
                user.activationKey = '';
                user.save();
                res.redirect('/sign-in#activation-success');
                return;
            }
            res.redirect('/sign-in#activation-failed');
        });
    });


    app.use('/user/reset-password/:key', function (req, res) {

        var key = req.params.key;
        User.findOne({activationKey: key}, function (err, user) {
            if (user) {
                var password = Math.random().toString(36).substr(2, 8);

                user.password = password;
                user.passwordHash  = user.encryptPassword(password);
                user.activationKey = '';
                user.save();

                var data = {
                    password: password,
                    fullName: user.fullName
                };
                mailer.sendMail('newPasswordEmail', user.email, data);

                res.redirect('/sign-in#reset-password-success');
                return;
            }
            res.redirect('/sign-in#reset-password-failed');
        });
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