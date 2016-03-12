var env = 'dev';
var express = require('express');
var connect = require('connect');
var bodyParser = require('body-parser')
var config =  require('./config/config-' + env + '.js');
var app = express();

app.set('views', __dirname + '/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/app', express.static(__dirname + '/public'));

app.post('/api/model/validate', function(req, res) {
    //console.log(req.body);
    res.send({
        result: true,
        message : 'Success !!',
        data: []
    });
});

app.listen(8000);