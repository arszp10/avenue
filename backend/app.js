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
var app = express();

app.set('views', __dirname + '/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cookieParser());

app.use(require('express-session')(config.session(store)));

require('./routes/example.js')(app);
require('./routes/web.js')(app);
require('./routes/api.js')(app, config);
require('./routes/errors.js')(app);
var port = process.env.PORT || 80;
app.listen(port);