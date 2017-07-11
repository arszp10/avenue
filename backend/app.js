var _ =             require('lodash');
var express =       require('express');
var mongoose =      require('mongoose');
var validate =      require('validate.js');
var bodyParser =    require('body-parser');
var cookieParser =  require('cookie-parser');
var session =       require('express-session');
var MongoDBStore =  require('connect-mongodb-session')(session);
                    require('dotenv').config();

var config =        require('./config/config.js');

var store = new MongoDBStore({
    uri: config.database,
    collection: 'sessions'
});

var db   = mongoose.connect(config.database);
var app  = express();

app.set('views', __dirname + '/views');
app.use(bodyParser.json(config.urlEncodedMiddlewareOptions));
app.use(bodyParser.urlencoded(config.urlEncodedMiddlewareOptions));
app.use(cookieParser());

app.use(session(config.session(store)));

require('./routes/example.js')(app);
require('./routes/web.js')(app, config);
require('./routes/api.js')(app, config);
require('./routes/errors.js')(app);

var port = process.argv[2];
app.listen(port);

//var connect =       require('connect');
//var connectTimeout = require('connect-timeout');
