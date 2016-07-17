var _           = require('lodash');
var nodemailer  = require('nodemailer');

var User        = require('../models/user');
var Model       = require('../models/model');
var avenueLib   = require('../lib/avelib');
var responses   = require('./api-responses');

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
        next(); return;
    };
    var query = _.assign({api_key:false, api_secret:false}, req.query);
    if (!query.api_key || !query.api_secret) {
        res.status(401);
        res.json(responses.wrongCredentials());
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
    });
}

function validateRequest(req, res, next) {
    var errors = avenueLib.validate(req.body.data);
    if (errors.length > 0) {
        res.json(responses.modelValidationFailed(errors));
        return;
    }
    next(); return;
}

/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 *
 *  @namespace
 * @property {object}  defaults               - The default values for parties.
 * @property {number}  defaults.players       - The default number of players.
 * @property {string}  defaults.level         - The default level for the party.
 * @property {object}  defaults.treasure      - The default treasure.
 * @property {number}  defaults.treasure.gold - How much gold the party starts with.
 */
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

            var mail = _.assign({}, config.emailTemplates.activation);
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
                    userId: user.id,
                    fullName: user.fullName,
                    email: user.email
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




    app.post('/api/model/execute', validateRequest,  function (req, res) {
        var bodyData = _.cloneDeepWith(req.body.nodes, coerce);
        res.json(
            responses.modelSimulationSuccess(
                avenueLib.simulate(bodyData)
        ));
    });

    app.post('/api/model/optimize/offsets', validateRequest, function (req, res) {
        var bodyData = _.cloneDeepWith(req.body.nodes, coerce);
        res.json(
            responses.modelSimulationSuccess(
                avenueLib.optimizeOffsets(bodyData)
        ));
    });

    app.post('/api/model/optimize/splits', validateRequest, function (req, res) {
        var bodyData = _.cloneDeepWith(req.body.nodes, coerce);
        res.json(
            responses.modelSimulationSuccess(
                avenueLib.optimizeSplits(bodyData)
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
            model.cycleLength   = bodyData.cycleLength;
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
            res.json(responses.entityRemoved('Model', modelId, {id: modelId}));
        });


    });

};


var example = {

    nodes: [
        {
            "type": "point",
            "id": "sehh5gug4tz751h2",
            "tag": "",
            "cycleLength": 100,
            "flowRate": 900,
            "saturationFlowRate": 1800,
            "edges": [{
                "source": "yh5bn7i24xjjqwmq",
                "target": "sehh5gug4tz751h2",
                "portion": 900
            }]
        },  {
            "type": "stopline",
            "id": "bu14ipfs608kt9fq",
            "tag": "",
            "cycleLength": 100,
            "flowRate": 900,
            "saturationFlowRate": 1800,
            "intervals": [[0, 20], [40, 55]],
            "edges": [{
                "source": "315ultyg379j41nn",
                "target": "bu14ipfs608kt9fq",
                "portion": 900
            }]
        }, {
            "type": "freeway",
            "id": "qp8fi01xz48zfbub",
            "tag": "",
            "cycleLength": 100,
            "flowRate": 900,
            "saturationFlowRate": 1800,
            "length": 300,
            "travelTime": 20,
            "platoonDispersion": 0.5,
            "edges": [{
                "source": "yh5bn7i24xjjqwmq",
                "target": "qp8fi01xz48zfbub",
                "id": "ele22",
                "secondary": "true",
                "portion": 500
            }]
        }, {
            "type": "bottleneck",
            "id": "0mg1yowyocz9tesa",
            "tag": "",
            "cycleLength": 100,
            "flowRate": 900,
            "saturationFlowRate": 2000
        }, {
            "type": "conflictingApproach",
            "id": "yh5bn7i24xjjqwmq",
            "tag": "",
            "cycleLength": 100,
            "flowRate": 900,
            "saturationFlowRate": 1800,
            "secondaryFlowSaturationFlowRate": 1800,
            "edges": [{
                "source": "0mg1yowyocz9tesa",
                "target": "yh5bn7i24xjjqwmq",
                "portion": 500
            }, {
                "source": "r2082od4yu20ql6n",
                "target": "yh5bn7i24xjjqwmq",
                "secondary": "true",
                "portion": 500
            }]
        }, {
            "type": "entranceRamp",
            "id": "315ultyg379j41nn",
            "tag": "",
            "cycleLength": 100,
            "flowRate": 900,
            "saturationFlowRate": 1800,
            "secondaryFlowSaturationFlowRate": 1800,
            "edges": [{
                "source": "0mg1yowyocz9tesa",
                "target": "315ultyg379j41nn",
                "id": "ele7",
                "portion": 400
            }, {
                "source": "r2082od4yu20ql6n",
                "target": "315ultyg379j41nn",
                "secondary": "true",
                "portion": 400
            }]
        }, {
            "type": "intersection",
            "id": "zb5bapgzzl947i89",
            "name": "Intersection #1",
            "cycleLength": 100,
            "offset": 44,
            "phases": [
                {"tag": "ph-1", "length": 50, "minLength": 15},
                {"tag": "ph-2", "length": 50, "minLength": 15}
            ]
        }, {
            "type": "stopline",
            "id": "r2082od4yu20ql6n",
            "parent": "zb5bapgzzl947i89",
            "tag": "",
            "cycleLength": 100,
            "flowRate": 900,
            "saturationFlowRate": 1800,
            "greenOffset1": 0,
            "greenOffset2": 0,
            "intervals": [[0, 20], [40, 55]],
            "greenPhases": [true, false]

        }
    ]
};