var env = 'dev';
var _ = require('lodash');
var express = require('express');
var mongoose = require('mongoose');
var validate = require('validate.js');
var connect = require('connect');
var connectTimeout = require('connect-timeout');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

var config =  require('./config/config-' + env + '.js');

var store = new MongoDBStore({
    uri: config.database,
    collection: 'sessions'
});


var db   = mongoose.connect(config.database);
var User = require('./models/user');

var app = express();

app.set('views', __dirname + '/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(require('express-session')({
    secret: 'This is a secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000 * 60 * 24 * 7 // 1 week
    },
    store: store
}));

function authenticate(req, res, next) {
    if (req.session.user_id) {
        next();
        return;
    };
    res.redirect('/sign-in');
}

app.use('/', express.static(__dirname + '/public'));

app.use('/app', authenticate, function(req, res) {
    res.sendFile('app.html', {root: __dirname + '/public'});
});

app.use('/sign-in', function(req, res) {
    if (req.session.user_id) {
        res.redirect('/app');
        return;
    }
    res.sendFile('sign-in.html', {root: __dirname + '/public'});
});

app.use('/sign-out', function(req, res) {
    if (req.session.user_id) {
        res.clearCookie('connect.sid', { path: '/' });
        req.session.destroy(function() {});
    }
    res.redirect('/sign-in');
});


app.post('/api/user/sign-up', function(req, res) {
    var newUser = User(req.body);
    newUser.save(function(err) {
        if (err) {
            var errors = [];
            _.forIn(err.errors, function(v, k){
                errors.push({path: v.path, message:v.message});
            });
            res.send({
                result: false,
                message : err.message,
                data: errors
            });
            return;
        }
        res.send({
            result: true,
            message : 'User successfully created!',
            data: []
        });
    });
});

app.post('/api/user/sign-in', function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (user && user.authenticate(req.body.password)) {
            req.session.user_id = user.id;
            //if (req.body.remember == 'on') {
            //   res.cookie('_avenue', {a:1}, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
            //}
            res.send({
                result: true,
                message : 'User login successfully!',
                data: []
            });
        } else {
            res.send({
                result: false,
                message : 'User invalid credentials!',
                data: [
                    {path: 'email', message: 'Invalid email'},
                    {path: 'password', message: '... or Password.'}
                ]
            });
        }
    });
});


app.post('/api/user/reset-password', function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (user) {
            res.send({
                result: true,
                message : 'Password recovery instructions sent successfully!',
                data: []
            });
        } else {
            res.send({
                result: false,
                message : 'User invalid credentials!',
                data: [ {path: 'email', message: 'Sorry, but we doesn\'t have such email'}]
            });
        }
    });
});

app.post('/api/model/validate', function(req, res) {
    //console.log(req.body);
    res.send({
        result: true,
        message : 'Success !!',
        data: []
    });
});

app.listen(8000);