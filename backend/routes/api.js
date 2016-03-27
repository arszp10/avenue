var _ = require('lodash');

var User = require('../models/user');
var avenueLib = require('../lib/avenue-lib');

function wrongCredentials(res){
    res.status(401);
    res.json({
        "code": 401,
        "message": "Wrong api_key and api_secret combination"
    })
};

function authenticateApi(req, res, next) {
    if (req.session.user_id) {
        next(); return;
    };
    var query = _.assign({api_key:false, api_secret:false}, req.query);
    if (query.api_key && query.api_secret) {
        var cond = {
            apiKey: query.api_key,
            apiSecret: query.api_secret
        };
        User.findOne(cond, function (err, user) {
            if (user) {
                next(); return;
            }
            wrongCredentials(res);
        });
        return;
    }
    wrongCredentials(res);
}

module.exports = function(app) {

    app.post('/api/user/sign-up', function (req, res) {
        var newUser = User(req.body);
        newUser.save(function (err) {
            if (err) {
                var errors = [];
                _.forIn(err.errors, function (v, k) {
                    errors.push({path: v.path, message: v.message});
                });
                res.json({
                    result: false,
                    message: err.message,
                    data: errors
                });
                return;
            }
            res.json({
                result: true,
                message: 'User successfully created!',
                data: []
            });
        });
    });

    app.post('/api/user/sign-in', function (req, res) {
        User.findOne({email: req.body.email}, function (err, user) {
            if (user && user.authenticate(req.body.password)) {
                req.session.user_id = user.id;
                req.session.user_name = user.fullName;
                req.session.user_email = user.email;
                var c = {
                    userId: user.id,
                    fullName: user.fullName,
                    email: user.email
                };
                res.cookie('_avenue', c);
                res.json({
                    result: true,
                    message: 'User login successfully!',
                    data: []
                });
            } else {
                res.json({
                    result: false,
                    message: 'User invalid credentials!',
                    data: [
                        {path: 'email', message: 'Invalid email'},
                        {path: 'password', message: '... or Password.'}
                    ]
                });
            }
        });
    });

    app.post('/api/user/reset-password', function (req, res) {
        User.findOne({email: req.body.email}, function (err, user) {
            if (user) {
                res.json({
                    result: true,
                    message: 'Password recovery instructions sent successfully!',
                    data: []
                });
            } else {
                res.json({
                    result: false,
                    message: 'User invalid credentials!',
                    data: [{path: 'email', message: 'Sorry, but we doesn\'t have such email'}]
                });
            }
        });
    });

    app.get('/api/ping', authenticateApi, function (req, res) {
        res.json({
            result: true,
            message: 'Pong',
            data: []
        });
    });

    app.post('/api/model/recalculate', function (req, res) {
        var errors = avenueLib.validate(req.body.data);
        if (errors.length) {
            res.json({
                result: false,
                message: 'The requested data has some errors!',
                data: errors
            });
            return;
        }
        res.json({
            result: true,
            message: 'Everything alright !',
            data: avenueLib.recalculate(req.body.data)
        });
    });




}