var _ = require('lodash');
var nodemailer = require('nodemailer');

var User = require('../models/user');
var Model = require('../models/model');
var avenueLib = require('../lib/avenue-lib');
var responses = require('./api-responses');

var isint = /^[0-9]+$/;
var isfloat = /^([0-9]+)?\.[0-9]+$/;

function coerce(str) {
    if ('null' == str) return null;
    if ('true' == str) return true;
    if ('false' == str) return false;
    if (isfloat.test(str)) return parseFloat(str, 10);
    if (isint.test(str)) return parseInt(str, 10);
    return undefined;
}


function authenticateApi(req, res, next) {
    if (req.session.user_id) {
        next();
        return;
    };
    var query = Object.assign({api_key:false, api_secret:false}, req.query);
    if (!query.api_key || !query.api_secret) {
        res.status(401);
        res.json(responses.wrongCredentials());
        return;
    }
    var cond = {
        apiKey: query.api_key,
        apiSecret: query.api_secret
    };
    User.findOne(cond, function (err, user) {
        if (user) {
            next(); return;
        }
        res.status(401);
        res.json(responses.wrongCredentials());
        return;
    });
}

function requestBodyData(req) {
    return _.cloneDeepWith(req.body.data, coerce);
}

function validateModel(req, res, next) {
    var errors = avenueLib.validate(requestBodyData(req));
    if (errors.length == 0) {
        next(); return;
    }
    res.json(responses.modelValidationFailed(errors));
    return;
}

module.exports = function(app, config) {

    var transporter = nodemailer.createTransport(config.mailTransportOptions);

    app.get('/api/ping', authenticateApi, function (req, res) {
        res.json(responses.pong());
    });

    app.post('/api/user/sign-up', function (req, res) {
        var newUser = User(req.body);
        newUser.save(function (err) {
            if (err) {
                res.json(responses.fieldsErrorsList(err));
                return;
            }

            var mail = Object.assign({}, config.emailTemplates.activation);
            var link = config.baseUrl + '/user/activate/' + newUser.activationKey;
            mail.to = newUser.email;
            mail.html = mail.html.split('{link}').join(link);
           // transporter.sendMail(mail, function(error, info){});

            res.json(responses.entityCreatedSuccessfully('User', []));
        });
    });
    app.post('/api/user/sign-in', function (req, res) {
        User.findOne({email: req.body.email, active:true}, function (err, user) {
            if (user && user.authenticate(req.body.password)) {
                req.session.user_id = user.id;
                req.session.user_name = user.fullName;
                req.session.user_email = user.email;
                var c = {
                    userId:    user.id,
                    fullName:  user.fullName,
                    email:     user.email,
                    apiKey:    user.apiKey,
                    apiSecret: user.apiSecret
                };
                res.cookie('_avenue', c);
                res.json(responses.userLoginSuccessfully());
                return;
            }
            res.json(responses.userLoginFailed());
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


    app.post('/api/model/execute', authenticateApi, validateModel,  function (req, res) {
        var bodyData = requestBodyData(req);
        res.json(
            responses.modelSimulationSuccess(
                avenueLib.simulate(bodyData)
        ));
    });
    app.post('/api/model/optimize/phases', authenticateApi, validateModel, function (req, res) {
        var bodyData = requestBodyData(req);
        console.log();
        res.json(
            responses.modelSimulationSuccess(
                avenueLib.optimizeSplits(bodyData)
            ));
    });

    app.post('/api/model/optimize/offsets',authenticateApi, validateModel, function (req, res) {
        var bodyData = requestBodyData(req);
        res.json(
            responses.modelSimulationSuccess(
                avenueLib.optimizeOffsets(bodyData)
        ));
    });


    app.post('/api/model/create', function (req, res) {
        var userId = req.session.user_id;
        var data = {
            name: 'New coordination plan',
            content: [],
            _creator: userId
        };
        var newAveModel = Model(data);
        newAveModel.save(function (err) {
            if (err) {
                res.json(responses.fieldsErrorsList(err));
                return;
            }
            res.json(responses.entityCreatedSuccessfully('Model', {id: newAveModel._id}));
        });
    });
    app.post('/api/model/update/:modelId', function (req, res) {
        var modelId = req.params.modelId;
        var userId = req.session.user_id;
        Model.findOne({_id: modelId, _creator:userId}, function (err, model) {
            if (err || !model) {
                res.status(404);
                res.json(responses.entityNotFound('Model', modelId));
                return;
            }
            var bodyData = _.cloneDeepWith(req.body.data, coerce);
            model.name          = bodyData.name;
            model.nodeCount     = bodyData.nodeCount;
            model.crossCount    = bodyData.crossCount;
            model.cycleTime     = bodyData.cycleTime;
            model.notes         = bodyData.notes;
            model.content       = bodyData.content;
            model.routes        = bodyData.routes;
            model.save(function(err){
                if (err) {
                    throw err;
                }
                res.json(responses.entityUpdatedSuccessfully('Model', {id:modelId}));
            });
        });
    });
    app.get('/api/model/get/:modelId', function (req, res) {
        var modelId = req.params.modelId;
        var userId = req.session.user_id;
        Model.findOne({_id: modelId, _creator:userId}, function (err, model) {
            if (err || !model) {
                res.status(404);
                res.json(responses.entityNotFound('Model', modelId));
                return;
            }
            var result  = model.toObject();
            delete result._creator;
            delete result._id;
            delete result.__v;
            res.json(responses.entityFound('Model', modelId, result));
        });
    });
    app.get('/api/model/list', function (req, res) {
        var params = _.cloneDeepWith(req.query, coerce);
            params.userId = req.session.user_id;


        Model.findWithPages(params, function(err, data){
                if (err) {
                    res.status(404);
                    res.json(responses.entityNotFound('Model', ''));
                }
                res.json(
                    responses.entityListFound('Model', data.table.length, data)
                );
            }
        );

    });
    app.get('/api/model/remove/:modelId', function (req, res) {
        var modelId = req.params.modelId;
        var userId = req.session.user_id;

        Model.remove({_id: modelId, _creator:userId}, function (err, model) {
            if (err || !model) {
                res.status(404);
                res.json(responses.entityNotFound('Model', modelId));
                return;
            }
            res.json(responses.entityRemoved('Model', modelId, {id:modelId}));
        });


    });
};
