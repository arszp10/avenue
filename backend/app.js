var env = 'dev';
var express = require('express');
var connect = require('connect');
var bodyParser = require('body-parser')
var config =  require('./config/config-' + env + '.js');
var app = express();

app.set('views', __dirname + '/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(__dirname + '/public'));
app.use('/app', authenticate, function(req, res) {
    res.sendFile('app.html', {root: __dirname + '/public'});
});

function authenticate(req, res, next) {
    //res.redirect('/sign-in/');
    //return;
    next();
}


app.post('/api/model/validate', function(req, res) {
    //console.log(req.body);
    res.send({
        result: true,
        message : 'Success !!',
        data: []
    });
});

app.listen(8000);