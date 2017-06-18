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


    /**
     * @apiName StopLineExample
     * @apiGroup  NodeTypes
     *
     * @api {post} /example/stopline Stopline (example)
     * @apiDescription Этот API вызов не делает никаких  вычислений или преобразований, он нужен лишь для того, чтобы показать
     * пример объекта типа стоп-линия, который используется в теле запроса на [рассчет](link) или [оптимизацию модели](link)
     *
     * @apiHeader {String} Content-Type=application/x-www-form-urlencoded  Параметры передаются в теле запроса либо в виде _JSON_, либо *URLENCODED*.
     * Если вы передаете параметры в виде JSON. то значение заголовка должно быть `application/json`
     *
     * @apiParam  {String} id Уникальный идентификатор точки.
     * @apiParam  {String} type *stopline* - для объекта(точки) типа стоп-линия.
     * @apiParam  {String} [tag] Ярлык пользователя для данного объекта
     * @apiParam  {String} [parent] Идентификатор объекта типа `crossroad` -  перекресток, к которому относится данная стоп-линия.
     * @apiParam  {Number} cycleTime Длительность цикла (сек)
     * @apiParam  {Number} capacity Пропускная способность (авт/ч)
     * @apiParam  {Number} avgIntensity Приведенная интенсивность (авт/ч) [Работающий проект](http://avenue-2p0.herokuapp.com/)
     * @apiParam  {Number} constantIntensity Приведенная интенсивность постоянного потока (авт/ч)
     *
     * @apiParam  {Boolean[]} [greenPhases] Если ключ `parent` присутствует то данный масив указывает цвета фаз, в которых разрешено движение, индекс занчения равен индексу фазы
     * @apiParam  {Number[]} [additionalGreens] Массив времен добавленного зеленого для фаз, так же как и предыдущий параметр длинна массива равна длине массива фаз у соответсвующего объекта `crossroad`
     *
     * @apiParam  {Array[]} [intervals] Если ключа `parent` нет т.е. данная стоп-линия не привязана к перекрестку, то необходимо указать времена[[от, до]] красного сигнала, например intervals :[[0, 20], [40, 55]]
     * @apiParam  {Edge[]} [edges] Массив объектов типа `Edge`, свзяи *ВХОДЯЩИЕ* в данную точку
     *
     *
     * @apiParamExample {json} StopLine node example:
     * Content-Type:application/json;
     * POST request body as JSON string:
     * {
     *      id: "ysrszmq1llb5lsbd",
     *      type: "stopline",
     *      parent: "j36zhrox3tmk87y0",
     *      cycleTime: 100,
     *      avgIntensity: 900,
     *      capacity: 1800,
     *      constantIntensity: 0,
     *      greenPhases: [true,false],
     *      additionalGreens: [0,0],
     *      intervals: [[0, 20], [40, 55]],
     *      edges: [
     *        {
     *          source: "9r81wbrzetweksd0",
     *          target: "ysrszmq1llb5lsbd",
     *          portion: 900,
     *          id: "ele3"
     *        }
     *      ],
     *    }
     *
     *
     *
     * @apiSuccess {Boolean} success Результат запроса (успешно/неуспешно).
     * @apiSuccess {String}  message Текстовое сообщение об ошибке.
     * @apiSuccess {Array[]} data Массив уточняющий, где ошибка или же содержащий данные результатов моделирования.
     *
     *
     * @apiSuccess (Stopline response object) {String} id Уникальный идентификатор точки.
     * @apiSuccess (Stopline response object) {String} type *stopline* - для объекта(точки) типа стоп-линия.
     * @apiSuccess (Stopline response object) {Number} cycleTime Длительность цикла (сек)
     * @apiSuccess (Stopline response object) {Number} delay Задержка в данной точке (авт*ч)
     * @apiSuccess (Stopline response object) {Number{0..100}} greenSaturation Насыщенность зеленого в %
     * @apiSuccess (Stopline response object) {Number} maxQueue Длина максимальной очереди в (авт)
     * @apiSuccess (Stopline response object) {Boolean} isCongestion Является ли данная точка заторной
     * @apiSuccess (Stopline response object) {Number[]} inFlow Кривая интенсивности ТП в течении цикла входящая в данную точку, интервал дискретизации = 1 сек, значения (авт/с)
     * @apiSuccess (Stopline response object) {Number[]} outFlow Кривая интенсивности ТП в течении цикла исходящая из данной точки
     * @apiSuccess (Stopline response object) {Number} sumInFlow Сумма входящего потока (авт)
     * @apiSuccess (Stopline response object) {Number} sumOutFlow Сумма исходящего потока (авт)
     *
     *  @apiSuccessExample StopLine node response example:
     *     HTTP/1.1 200 OK
     *     {
     *       success: true,
     *       message: "Simulation was successful!",
     *       data: [
     *          {
     *               id: "ysrszmq1llb5lsbd",
     *               type: "stopline",
     *               cycleTime: 100,
     *               delay: 205.973,
     *               greenSaturation: 91,
     *               maxQueue: 5.215,
     *               isCongestion: false,
     *               inFlow: [0.0045, 0.0041, 0.0038, 0.0034, … ],
     *               outFlow: [0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5, … ],
     *               sumInFlow: 20.99,
     *               sumOutFlow: 21
     *          }
     *       ]
     *     }
     *
     */
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
