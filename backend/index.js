var validate = require('validate.js');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use('/app', express.static('build'));

app.listen(8000, function () {
    console.log('Example app listening on port 8000!');
});