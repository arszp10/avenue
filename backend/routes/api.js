var fs = require('fs');
var _ = require('lodash');
var Twig = require('twig');
var Mailgun = require('mailgun-js');

var User = require('../models/user');
var Model = require('../models/model');
var avenueLib = require('../lib/avenue-lib');
var responses = require('./api-responses');
var mailer = require('./mailer');

var multer = require('multer');
var upload = multer({
    dest: 'backend/public/uploads/',
    limits : {

    }
});

var sumoImport = require('../lib/avenue-lib/import/sumo');

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
    if (req.session.user) {
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
            req.session.user = user;
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

            var data = {
                link: config.baseUrl + '/user/activate/' + newUser.activationKey,
                fullName: newUser.fullName
            };
            mailer.sendMail('activationEmail', newUser.email, data);

            res.json(responses.entityCreatedSuccessfully('User', []));
        });
    });

    app.post('/api/user/sign-in', function (req, res) {
        User.findOne({email: req.body.email, active:true}, function (err, user) {
            if (user && user.authenticate(req.body.password)) {
                var userData = JSON.parse(JSON.stringify(user));
                req.session.user = userData;
                userData.id = userData._id;
                delete userData.passwordHash;
                delete userData.activationKey;
                delete userData.password;
                delete userData.__v;
                delete userData.models;
                delete userData._id;

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
                res.json(responses.userLoginSuccessfully());
                return;
            }
            res.json(responses.userLoginFailed());
        });
    });
    app.post('/api/user/reset-password', function (req, res) {
        User.findOne({email: req.body.email}, function (err, user) {
            if (user) {
                user.activationKey = user.genActivationKey();
                user.save(function(){
                    var data = {
                        link: config.baseUrl + '/user/reset-password/' + user.activationKey,
                        fullName: user.fullName
                    };
                    mailer.sendMail('passResetEmail', user.email, data);
                    res.json(responses.passwordResetSuccess());
                });
                return;
            }
            res.json(responses.passwordResetFailed());
        });
    });


    /**
     * @apiName ModelExecute
     * @apiGroup  Simulate
     *
     * @api {post} /model/execute?api_key={:api_key}&api_secret={:api_secret} Execute
     * @apiDescription Рассчитать модель. Рассчитываются функции интенсивности входа/выхода для каждой точки, задержка, насыщеность зеленого и т.д.
     * В данном методе не изменяются ни сдвиги ни длительности фаз на перекрестках, просто валидация и рассчет параметров, отправленных в теле запроса, модели сети.
     *
     * `Внимание!` Данный запрос доступен только зарегистрированным пользователям и требует на вход два параметра `api_key` и `api_secret`.
     *
     * @apiParam  {Object[]} data Массив объектов типа `stopline`, `carriageway`, `crossroad` и т.д. см. [Примеры](#api-Examples)
     * @apiParamExample {json} Simulate request example:
     * Content-Type: application/json;
     * POST URL: "http://avenue-app.com/api/model/execute?api_key=3c3eed686e&api_secret=4042dcea13"
     * POST BODY:
     * {
     *    data: [
     *      {
     *           id: "1yjpdnra9a76dut2",
     *           type: "point",
     *           cycleTime: 100,
     *           ...
     *      },
     *      {
     *           id: "uxbjeic5f2ar8m2i",
     *           type: "stopline",
     *           cycleTime: 100,
     *           ...
     *      },
     *      ....
     *   ]
     * }
     *
     * @apiSuccess {Boolean} success Результат запроса (успешно/неуспешно).
     * @apiSuccess {String}  message Текстовое сообщение об ошибке.
     * @apiSuccess {Object[]} data Массив содержащий данные ответа сервера, там могут быть как результаты моделирования, так и список ошибок валидации модели.
     * При удачном результате рассчета в секции `data` содержится массив объектов, каждый из которых соответсвует объекту поданному на вход, примеры ответов см. [Примеры](#api-Examples)
     *
     * В случае если модель не может быть построена, или же параметры вне допустимых диапазонов, пример ответа может выглядеть так:
     *
     * @apiErrorExample Execute model ErrorResponse:
     * HTTP/1.1 200 (!)
     * {
     *   success: false,
     *   message: "The model failed a validation!",
     *   data: [
     *      {
     *          node: "28hsh1ugilg874ic",
     *          errors: ["Avg intensity  must be less than 1800"]
     *      },
     *      {
     *          node: "21g19fmdkfodid1s",
     *          errors: ["Edges array length must be equal 2"]
     *      }
     *   ]
     * }
     *
     */
    app.post('/api/model/execute', authenticateApi, validateModel,  function (req, res) {
        var bodyData = requestBodyData(req);
        res.json(
            responses.modelSimulationSuccess(
                avenueLib.simulate(bodyData)
        ));
    });

    /**
     * @apiName ModelOptimizeOffsets
     * @apiGroup  Simulate
     *
     * @api {post} /model/optimize/offsets?api_key={:api_key}&api_secret={:api_secret} OptimizeOffsets
     * @apiDescription Производится запуск процедуры оптимизации сдвигов циклов регулирования исходя из минимальной суммарной задержки во всей сети.
     * Параметры запроса и ответы абсолютно идентичны запросу на [рассчет модели](#api-Simulate-ModelExecute).
     * Запрос изменяет значения ключа `offset` у всех объектов типа [crossroad](#api-Examples-CrossroadExample).
     *
     * `Внимание!` Данный запрос доступен только зарегистрированным пользователям и требует на вход два параметра `api_key` и `api_secret`.
     *
     * @apiParam  {Object[]} data Массив объектов типа `stopline`, `carriageway`, `crossroad` и т.д. см. [Примеры](#api-Examples)
     */
     app.post('/api/model/optimize/offsets',authenticateApi, validateModel, function (req, res) {
        var bodyData = requestBodyData(req);
        res.json(
            responses.modelSimulationSuccess(
                avenueLib.optimizeOffsets(bodyData)
        ));
    });

    /**
     * @apiName ModelOptimizePhases
     * @apiGroup  Simulate
     *
     * @api {post} /model/optimize/phases?api_key={:api_key}&api_secret={:api_secret} OptimizePhases
     * @apiDescription Производится запуск процедуры оптимизации длительностей фаз на перекрестке исходя из рассичтанной насыщенности каждой фазы.
     * Параметры запроса и ответы абсолютно идентичны запросу на [рассчет модели](#api-Simulate-ModelExecute).
     * Запрос изменяет значения ключей `phases[].length` у всех объектов типа [crossroad](#api-Examples-CrossroadExample).
     *
     * `Внимание!` Данный запрос доступен только зарегистрированным пользователям и требует на вход два параметра `api_key` и `api_secret`.
     *
     * @apiParam  {Object[]} data Массив объектов типа `stopline`, `carriageway`, `crossroad` и т.д. см. [Примеры](#api-Examples)
     */
    app.post('/api/model/optimize/phases', authenticateApi, validateModel, function (req, res) {
        var bodyData = requestBodyData(req);
        res.json(
            responses.modelSimulationSuccess(
                avenueLib.optimizeSplits(bodyData)
            ));
    });

    app.post('/api/model/create', authenticateApi, function (req, res) {
        var userId = req.session.user.id;
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

    app.post('/api/model/update/:modelId', authenticateApi, function (req, res) {
        var modelId = req.params.modelId;
        var userId = req.session.user.id;

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

    app.get('/api/model/get/:modelId', authenticateApi, function (req, res) {
        var modelId = req.params.modelId;
        var userId = req.session.user.id;
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

    app.get('/api/model/list', authenticateApi, function (req, res) {
        var params = _.cloneDeepWith(req.query, coerce);
            params.userId = req.session.user.id;


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

    app.get('/api/model/remove/:modelId', authenticateApi, function (req, res) {
        var modelId = req.params.modelId;
        var userId = req.session.user.id;

        Model.remove({_id: modelId, _creator:userId}, function (err, model) {
            if (err || !model) {
                res.status(404);
                res.json(responses.entityNotFound('Model', modelId));
                return;
            }
            res.json(responses.entityRemoved('Model', modelId, {id:modelId}));
        });
    });


    app.post('/api/model/import', authenticateApi, upload.single('inputImportFile'), function (req, res, next) {
        var allowedMimeTypes = ['text/xml'];
        var maxFileSize      = 20000000;
        var zoomMap          = req.body.inputZoomMap;
        var zoomIntersection = req.body.inputZoomIntersection;

        if (allowedMimeTypes.indexOf(req.file.mimetype) < 0) {
            fs.unlinkSync(req.file.path);
            res.json(responses.importWrongMime());
        }

        if (req.file.size > maxFileSize) {
            fs.unlinkSync(req.file.path);
            res.json(responses.importWrongSize());
        }

        sumoImport.convert(req.file.path, zoomMap, zoomIntersection, function(err, result){

            fs.unlinkSync(req.file.path);
            if (err) {
                res.json(responses.importConvertError(err));
            }

            var userId = req.session.user.id;
            var data = {
                name: req.file.originalname,
                content: result,
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
    });


};
