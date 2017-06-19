var responses = require('./api-responses');

module.exports = function(app, config) {

    /**
     * @apiName StopLineExample
     * @apiGroup  NodeTypes
     *
     * @api {post} /example/stopline Stopline (example)
     * @apiDescription Этот API вызов не делает никаких  вычислений или преобразований, он нужен лишь для того, чтобы показать
     * пример объекта типа стоп-линия, который используется в теле запроса на [рассчет](#ancor) или [оптимизацию модели](link).
     * То есть если передать в запросе на рассчет модели объект типа stopline, то ответ будет содержать объект описанный ниже.
     *
     * @apiHeader {String} Content-Type=application/x-www-form-urlencoded  Параметры передаются в теле запроса либо в виде _JSON_, либо *URLENCODED*.
     * Если вы передаете параметры в виде JSON. то значение заголовка должно быть `application/json`
     *
     * @apiParam  {String} id Уникальный идентификатор точки.
     * @apiParam  {String} type тип объекта  `stopline` - для объекта(точки) типа стоп-линия. так же (crossRoad, carriageway, bottleneck, concurrent, concurrentMerge, point)
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
     * @apiParam  {Array[]} [intervals] Если ключа `parent` нет т.е. данная стоп-линия не привязана к перекрестку, то необходимо указать времена [[от, до], ...] красного сигнала, например intervals: [[0, 20], [40, 55]]
     * @apiParam  {Edge[]} [edges] Массив объектов типа `Edge`, свзяи *ВХОДЯЩИЕ* в данную точку
     *
     * @apiParam  (Edge){String} id Уникальный идентификатор ребра графа, соединяющего точки.
     * @apiParam  (Edge){String} source Идентификатор точки, из которой проведена данная связь.
     * @apiParam  (Edge){String} target Идентификатор точки, в которую проведена данная связь.
     * @apiParam  (Edge){Number} portion  Приведенная интенсивность (авт/ч), которая перераспределяется из точки  `source` в `target`
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
     * @apiSuccess {Array[]} data Массив содержащий данные ответа сервера, там могут быть как результаты моделирования(см ниже), так и список ошибок валидации модели.
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
    app.post('/api/example/stopline', function (req, res) {
        res.json(responses.modelSimulationSuccess(
            {
               id: "ysrszmq1llb5lsbd",
               type: "stopline",
               cycleTime: 100,
               delay: 205.973,
               greenSaturation: 91,
               maxQueue: 5.215,
               isCongestion: false,
               inFlow: [0.0045, 0.0041, 0.0038, 0.0034],
               outFlow: [0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5],
               sumInFlow: 20.99,
               sumOutFlow: 21
            }
        ));
        return;
    });


    /**
     * @apiName CarriagewayExample
     * @apiGroup  NodeTypes
     *
     * @api {post} /example/carriageway Carriageway (example)
     * @apiDescription Этот API вызов не делает никаких  вычислений или преобразований, он нужен лишь для того, чтобы показать
     * формат объекта типа перегон, который используется в теле запроса на [рассчет](#ancor) или [оптимизацию модели](link).
     *
     * @apiHeader {String} Content-Type=application/x-www-form-urlencoded  Параметры передаются в теле запроса либо в виде _JSON_, либо *URLENCODED*.
     * Если вы передаете параметры в виде JSON. то значение заголовка должно быть `application/json`
     *
     * @apiParam  {String} id Уникальный идентификатор точки.
     * @apiParam  {String} type тип объекта  `carriageway` - для объекта(точки) типа перегон.
     * @apiParam  {String} [tag] Ярлык пользователя для данного объекта
     * @apiParam  {String} [parent] Идентификатор объекта типа `crossroad` -  перекресток, к которому относится данная перегон,
     * для перегона это не влияет на рассчета параметров, просто указывает на группировку в редакторе.
     * @apiParam  {Number} cycleTime Длительность цикла (сек)
     * @apiParam  {Number} capacity Пропускная способность (авт/ч)
     * @apiParam  {Number} avgIntensity Приведенная интенсивность (авт/ч)
     * @apiParam  {Number{0..1}} dispersion Дисперсия пачки
     * @apiParam  {Number} length Длинна перегона в метрах
     * @apiParam  {Number} routeTime Время проезда (с)
     *
     * @apiParam  {Edge[]} [edges] Массив объектов типа `Edge`, свзяи *ВХОДЯЩИЕ* в данную точку
     *

     * @apiParamExample {json} Carriageway node example:
     * Content-Type:application/json;
     * POST request body as JSON string:
     * {
     *     id: "1yjpdnra9a76dut2",
     *     parent: "uxbjeic5f2ar8m2i",
     *     type: "carriageway",
     *     tag: "",
     *     cycleTime: 100,
     *     avgIntensity: 900,
     *     constantIntensity: 0,
     *     capacity: 1800,
     *     routeTime: 20,
     *     length: 300,
     *     dispersion: 0.5,
     *     edges: [{
     *         id: "ele2",
     *         source: "p3hpxzb05oxpbovb",
     *         target: "1yjpdnra9a76dut2",
     *         portion: 900
     *     }]
     * }
     *
     * @apiSuccess {Boolean} success Результат запроса (успешно/неуспешно).
     * @apiSuccess {String}  message Текстовое сообщение об ошибке.
     * @apiSuccess {Array[]} data Массив содержащий данные ответа сервера, там могут быть как результаты моделирования, так и список ошибок валидации модели.
     * При удачном результате рассчета содержание секции `data` имеет формат идентичный тому, что возвращается при запросе на моделирование стоп-линии. см [Stopline response object](#api-NodeTypes-StopLineExample),
     * только ключ `type` имеет значение `carriageway`.
     *
     */
    app.post('/api/example/carriageway', function (req, res) {
        res.json(responses.modelSimulationSuccess(
            {
                id: "1yjpdnra9a76dut2",
                type: "carriageway",
                cycleTime: 100,
                delay: 205.973,
                greenSaturation: 91,
                maxQueue: 5.215,
                isCongestion: false,
                inFlow: [0.0045, 0.0041, 0.0038, 0.0034],
                outFlow: [0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5],
                sumInFlow: 20.99,
                sumOutFlow: 21
            }
        ));
        return;
    });

};

