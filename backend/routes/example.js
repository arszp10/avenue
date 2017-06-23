var responses = require('./api-responses');

module.exports = function(app, config) {

    /**
     * @apiName StopLineExample
     * @apiGroup  Examples
     *
     * @api {post} /example/stopline Stopline
     * @apiDescription
     *
     * Точка типа `stopline` используется для моделирования процесса движения ТП на стоп-линии регулируемого перекрестка.
     * Основной особенностью работы данной точки является накопление очереди на запрещающий сигнал светофора и ее разгрузка на разрешающий.
     * Точка может работать в составе [перекрестка](#api-Examples-CrossroadExample) и тогда длительности сигналов рассчитываются на основе данных перекрестка.
     *
     * `Внимание!` - это метод заглушка [см. прим. 1](#api-_footer)
     *
     * @apiHeader {String} Content-Type=application/x-www-form-urlencoded  Параметры передаются в теле запроса либо в виде _JSON_, либо *URLENCODED*.
     * Если вы передаете параметры в виде JSON. то значение заголовка должно быть `application/json`.
     *
     * `Важно!` Это правило применяется ко всем запросам описанным в данном документе.
     *
     * @apiParam  {String} id Уникальный идентификатор точки.
     * @apiParam  {String} type тип объекта  `stopline` - для объекта(точки) типа стоп-линия. так же (crossRoad, carriageway, bottleneck, concurrent, concurrentMerge, point)
     * @apiParam  {String} [parent] Идентификатор объекта типа `crossroad` -  перекресток, к которому относится данная стоп-линия.
     * @apiParam  {Number} cycleTime Длительность цикла (сек)
     * @apiParam  {Number} capacity Пропускная способность (авт/ч)
     * @apiParam  {Number} avgIntensity Приведенная интенсивность (авт/ч) 
     *
     * @apiParam  {Boolean[]} [greenPhases] Если ключ `parent` присутствует то данный масив указывает цвета фаз, в которых разрешено движение, индекс занчения равен индексу фазы
     * @apiParam  {Number[]} [additionalGreens] Массив времен добавленного зеленого для фаз, так же как и предыдущий параметр длинна массива равна длине массива фаз у соответсвующего объекта `crossroad`
     *
     * @apiParam  {Array[]} [intervals] Если ключа `parent` нет т.е. данная стоп-линия не привязана к перекрестку, то необходимо указать времена [[от, до], ...] красного сигнала, например intervals: [[0, 20], [40, 55]]
     * @apiParam  {Edge[]} [edges] Массив объектов типа `Edge`, свзяи *входящие* в данную точку
     *
     * @apiParam  (Edge){String} id Уникальный идентификатор ребра графа, соединяющего точки.
     * @apiParam  (Edge){String} source Идентификатор точки, из которой проведена данная связь.
     * @apiParam  (Edge){String} target Идентификатор точки, в которую проведена данная связь.
     * @apiParam  (Edge){Number} portion  Приведенная интенсивность (авт/ч), которая перераспределяется из точки  `source` в `target`
     * @apiParam  (Edge){Boolean} [secondary] Признак второстепенного потока(связи). Обонзачает то, что по данной связи перераспределяется трафик с соседней точки типа `concurrent`.
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
     * @apiSuccess {Object[]} data Массив содержащий данные ответа сервера, там могут быть как результаты моделирования(см ниже), так и список ошибок валидации модели.
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
     * @apiSuccess (Stopline response object) {Number} sumInFlow Число автомобилей входящего потока в течении одного цикла регулирования (авт)
     * @apiSuccess (Stopline response object) {Number} sumOutFlow Число автомобилей исходящего потока в течении одного цикла регулирования (авт)
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
     * @apiGroup  Examples
     * @api {post} /example/carriageway Carriageway
     *
     * @apiDescription
     * Точка типа `carriageway` используется для моделирования процесса движения ТП на перегоне(дороге) между двумя перекрестками или пересечениями.
     * Особенностью данной точки явлеятся сглаживание функции интенсивности ТП, таким образом моделируется явление распада пачки по ходу движения.
     *
     * `Внимание!` - это метод заглушка [см. прим. 1](#api-_footer)
     *
     * @apiParam  {String} id Уникальный идентификатор точки.
     * @apiParam  {String} type тип объекта  `carriageway` - для объекта(точки) типа перегон.
     * @apiParam  {String} [parent] Идентификатор объекта типа `crossroad` -  перекресток, к которому относится данная перегон,
     * для перегона это не влияет на рассчета параметров, просто указывает на группировку в редакторе.
     * @apiParam  {Number} cycleTime Длительность цикла (сек)
     * @apiParam  {Number} capacity Пропускная способность (авт/ч)
     * @apiParam  {Number} avgIntensity Приведенная интенсивность (авт/ч)
     * @apiParam  {Number{0..1}} dispersion Дисперсия пачки
     * @apiParam  {Number} length Длинна перегона в метрах
     * @apiParam  {Number} routeTime Время проезда (с)
     *
     * @apiParam  {Edge[]} [edges] Массив объектов типа `Edge`, свзяи *входящие* в данную точку.
     * Развернутое описание объекта Edge [см. Stopline](#api-Examples-StoplineExample).
     *

     * @apiParamExample {json} Carriageway node example:
     * Content-Type:application/json;
     * POST request body as JSON string:
     * {
     *     id: "1yjpdnra9a76dut2",
     *     parent: "uxbjeic5f2ar8m2i",
     *     type: "carriageway",
     *     cycleTime: 100,
     *     avgIntensity: 900,
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
     * @apiSuccess {Object[]} data Массив содержащий данные ответа сервера, там могут быть как результаты моделирования, так и список ошибок валидации модели.
     * При удачном результате рассчета содержание секции `data` имеет формат идентичный тому, что возвращается при запросе на моделирование стоп-линии. см [Stopline response object](#api-Examples-StopLineExample),
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


    /**
     * @apiName BottleneckExample
     * @apiGroup  Examples
     *
     * @api {post} /example/bottleneck Bottleneck
     * @apiDescription Сужение (бутылочное горлышко), при превышении интенсивностью пропускной способности дороги, начинает скапливаться очередь и учитываться задержка в данной точке.
     * Сужение может использоваться для объединения потоков на выходе из перекрестка. Любая точка кроме `point`, `concurrent`, `concurrentMerge` на входе уже включает в себя сужение,
     * так как мы можем привязать неограниченное число связей к точке и суммарный поток может превышать пропускную способность.
     *
     * `Внимание!` - это метод заглушка [см. прим. 1](#api-_footer)
     *
     * @apiParam  {String} id Уникальный идентификатор точки.
     * @apiParam  {String} type тип объекта  `bottleneck` - для объекта(точки) типа "бутылочное горлышко".
     * @apiParam  {String} [parent] Идентификатор объекта типа `crossroad` -  перекресток, к которому относится данная точка,
     * это не влияет на рассчет параметров, просто указывает на группировку в редакторе.
     * @apiParam  {Number} cycleTime Длительность цикла (сек)
     * @apiParam  {Number} capacity Пропускная способность (авт/ч)
     * @apiParam  {Number} avgIntensity Приведенная интенсивность (авт/ч)
     *
     * @apiParam  {Edge[]} [edges] Массив объектов типа `Edge`, свзяи *входящие* в данную точку.
     * Развернутое описание объекта Edge [см. Stopline](#api-Examples-StoplineExample).
     *

     * @apiParamExample {json} Bottleneck node example:
     * Content-Type:application/json;
     * POST request body as JSON string:
     * {
     *     id: "1yjpdnra9a76dut2",
     *     parent: "uxbjeic5f2ar8m2i",
     *     type: "bottleneck",
     *     cycleTime: 100,
     *     avgIntensity: 900,
     *     capacity: 1800,
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
     * @apiSuccess {Object[]} data Массив содержащий данные ответа сервера, там могут быть как результаты моделирования, так и список ошибок валидации модели.
     * При удачном результате рассчета содержание секции `data` имеет формат идентичный тому, что возвращается при запросе на моделирование стоп-линии. см [Stopline response object](#api-Examples-StopLineExample),
     * только ключ `type` имеет значение `bottleneck`.
     *
     */
    app.post('/api/example/bottleneck', function (req, res) {
        res.json(responses.modelSimulationSuccess(
            {
                id: "1yjpdnra9a76dut2",
                type: "bottleneck",
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
     * @apiName PointExample
     * @apiGroup  Examples
     *
     * @api {post} /example/point Point
     * @apiDescription  Точка типа `point` - это вспомогательный объект, служит для указания входящих или исходящих связей в модель,
     * на выходе из этой точки получается ничем(даже пропускной способностью) не ограниченная сумма всех входящиих в данную точку функций интенсивности.
     *
     * `Внимание!` - это метод заглушка [см. прим. 1](#api-_footer)
     *
     * @apiParamExample {json} Point node example:
     * Content-Type:application/json;
     * POST request body as JSON string:
     * {
     *     id: "1yjpdnra9a76dut2",
     *     type: "point",
     *     cycleTime: 100,
     *     avgIntensity: 900,
     *     capacity: 1800,
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
     * @apiSuccess {Object[]} data Массив содержащий данные ответа сервера, там могут быть как результаты моделирования, так и список ошибок валидации модели.
     * При удачном результате рассчета содержание секции `data` имеет формат идентичный тому, что возвращается при запросе на моделирование стоп-линии. см [Stopline response object](#api-Examples-StopLineExample),
     * только ключ `type` имеет значение `point`.
     *
     */

    app.post('/api/example/point', function (req, res) {
        res.json(responses.modelSimulationSuccess(
            {
                id: "1yjpdnra9a76dut2",
                type: "point",
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
     * @apiName ConcurrentExample
     * @apiGroup  Examples
     *
     * @api {post} /example/concurrent Concurrent
     * @apiDescription
     * Точка типа `concurrent` нужна для учета изменения формы функции интенсивности и задержки на второстепенных направлениях в конфликтных точках.
     * К этой точке предьявляются специальные требования на количество и тип связей с другими точками сети. У нее обязательно должно быть 2 входящих и не более двух исходящих
     * связей(дуг) одна из которых, как на входе так и на выходе, *должна* иметь признак secondary: true. Для других точек сети, количество связей не ограничивается.
     *
     * `Внимание!` - это метод заглушка [см. прим. 1](#api-_footer)
     *
     * @apiParam  {String} id Уникальный идентификатор точки.
     * @apiParam  {String} type тип объекта  `concurrent` - для объекта(точки) типа "нерегулируемое пересечение".
     * @apiParam  {String} [parent] Идентификатор объекта типа `crossroad` -  перекресток, к которому относится данная точка,
     * это не влияет на рассчет параметров, просто указывает на группировку в редакторе.
     * @apiParam  {Number} cycleTime Длительность цикла (сек)
     * @apiParam  {Number} capacity Пропускная способность (авт/ч)
     * @apiParam  {Number} avgIntensity Приведенная интенсивность основного потока (авт/ч). Значение интенсивности второстепенного потока для рассчетов берется из связи (Edge), имеющей  признак `secondary: true`
     * @apiParam  {Number} secondaryFlowCapacity Пропускная способность второстепенного потока (авт/ч)
     *
     *
     * @apiParam  {Edge[]} [edges] Массив объектов типа `Edge`, свзяи *входящие* в данную точку, для точек данного типа допустимо иметь ровно две (2) входящиее свзи от других точек, при этом одна из них обязательно должна быть второстепенной
     *
     * @apiParam  (Edge){String} id Уникальный идентификатор ребра графа, соединяющего точки.
     * @apiParam  (Edge){String} source Идентификатор точки, из которой проведена данная связь.
     * @apiParam  (Edge){String} target Идентификатор точки, в которую проведена данная связь.
     * @apiParam  (Edge){Number} portion  Приведенная интенсивность (авт/ч), которая перераспределяется из точки  `source` в `target`
     * @apiParam  (Edge){Boolean} [secondary] Признак второстепенного потока(связи).
     *
     *
     * @apiParamExample {json} Concurrent node example:
     * Content-Type:application/json;
     * POST request body as JSON string:
     * {
     *     id: "1yjpdnra9a76dut2",
     *     parent: "uxbjeic5f2ar8m2i",
     *     type: "concurrent",
     *     cycleTime: 100,
     *     avgIntensity: 900,
     *     capacity: 1800,
     *     secondaryFlowCapacity: 1800,
     *     edges: [
     *          {
     *              id: "ele1",
     *              source: "p3hpxzb05oxpbovb",
     *              target: "1yjpdnra9a76dut2",
     *              portion: 900
     *          },
     *          {
     *              id: "ele2",
     *              secondary: "true"
     *              source: "5x7r6spmi2gbbvlh",
     *              target: "1yjpdnra9a76dut2",
     *              portion: 900
     *          }
     *     ]
     * }
     *
     * @apiSuccess {Boolean} success Результат запроса (успешно/неуспешно).
     * @apiSuccess {String}  message Текстовое сообщение об ошибке.
     * @apiSuccess {Object[]} data Массив содержащий данные ответа сервера, там могут быть как результаты моделирования, так и список ошибок валидации модели.
     * При удачном результате рассчета содержание секции `data` имеет формат идентичный тому, что возвращается при запросе на моделирование стоп-линии. см [Stopline response object](#api-Examples-StopLineExample),
     * только ключ `type` имеет значение `concurrent`.
     *
     */
    app.post('/api/example/concurrent', function (req, res) {
        res.json(responses.modelSimulationSuccess(
            {
                id: "1yjpdnra9a76dut2",
                type: "concurrent",
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
     * @apiName ConcurrentMergeExample
     * @apiGroup  Examples
     *
     * @api {post} /example/concurrent-merge ConcurrentMerge
     * @apiDescription Точка типа `сoncurrentMerge` нужна для учета изменения формы функции интенсивности и задержки в точках слияния второстепенного и основного потока.
     * Например, когда мы имеем учитываемый в модели выезд на основную дорогу или нерегулируемый Т-образный перекресток.
     * К этой точке предьявляются специальные требования на количество и тип связей с другими точками сети. У нее обязательно должно быть 2 входящих и только одна исходящая
     * связь(дуг) одна из входящих связей *должна* иметь признак secondary: true. Для других точек сети, количество связей не ограничивается.
     *
     * `Внимание!` - это метод заглушка [см. прим. 1](#api-_footer)
     *
     * @apiParam  {String} id Уникальный идентификатор точки.
     * @apiParam  {String} type тип объекта  `concurrentMerge` - для объекта(точки) типа "нерегулируемое слияние".
     * @apiParam  {String} [parent] Идентификатор объекта типа `crossroad` -  перекресток, к которому относится данная точка,
     * это не влияет на рассчет параметров, просто указывает на группировку в редакторе.
     * @apiParam  {Number} cycleTime Длительность цикла (сек)
     * @apiParam  {Number} capacity Пропускная способность (авт/ч)
     * @apiParam  {Number} avgIntensity Приведенная интенсивность основного потока (авт/ч). Значение интенсивности второстепенного потока для рассчетов берется из связи (Edge), имеющей  признак `secondary: true`
     * @apiParam  {Number} secondaryFlowCapacity Пропускная способность второстепенного потока (авт/ч)
     *
     *
     * @apiParam  {Edge[]} [edges] Массив объектов типа `Edge`, свзяи *входящие* в данную точку, для точек данного типа
     * допустимо иметь ровно две (2) входящиее свзи от других точек, при этом одна из них обязательно должна быть второстепенной.
     * Развернутое описание объекта Edge [см. Concurrent](#api-Examples-ConcurrentExample).
     *
     *
     * @apiParamExample {json} ConcurrentMerge node example:
     * Content-Type:application/json;
     * POST request body as JSON string:
     * {
     *     id: "1yjpdnra9a76dut2",
     *     parent: "uxbjeic5f2ar8m2i",
     *     type: "concurrentMerge",
     *     cycleTime: 100,
     *     avgIntensity: 900,
     *     capacity: 1800,
     *     secondaryFlowCapacity: 1800,
     *     edges: [
     *          {
     *              id: "ele1",
     *              source: "p3hpxzb05oxpbovb",
     *              target: "1yjpdnra9a76dut2",
     *              portion: 900
     *          },
     *          {
     *              id: "ele2",
     *              secondary: "true"
     *              source: "5x7r6spmi2gbbvlh",
     *              target: "1yjpdnra9a76dut2",
     *              portion: 900
     *          }
     *     ]
     * }
     *
     * @apiSuccess {Boolean} success Результат запроса (успешно/неуспешно).
     * @apiSuccess {String}  message Текстовое сообщение об ошибке.
     * @apiSuccess {Object[]} data Массив содержащий данные ответа сервера, там могут быть как результаты моделирования, так и список ошибок валидации модели.
     * При удачном результате рассчета содержание секции `data` имеет формат идентичный тому, что возвращается при запросе на моделирование стоп-линии. см [Stopline response object](#api-Examples-StopLineExample),
     * только ключ `type` имеет значение `concurrent`.
     *
     */
    app.post('/api/example/concurrent-merge', function (req, res) {
        res.json(responses.modelSimulationSuccess(
            {
                id: "1yjpdnra9a76dut2",
                type: "concurrentMerge",
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
     * @apiName CrossroadExample
     * @apiGroup  Examples
     *
     * @api {post} /example/crossroad Crossroad
     * @apiDescription Объект типа `crossroad` структурно группирует(связывает) все точки, для которых его идентификатор указан в поле `parent`.
     * Те счиатется что все эти точки принадлежат этому перекрестку. Для всех точек, кроме `stopline` это чисто группирующая связь и влияет только на отрисовку модели в редакторе.
     * Для всех точек типа `stopline` переопределяются принципы рассчета функций интенсивности вход/выход, на базе временных интервалов указанных в качестве параметров родительской точки  типа `crossroad`.
     *
     * `Внимание!` - это метод заглушка [см. прим. 1](#api-_footer)
     *
     * @apiParam  {String} id Уникальный идентификатор точки.
     * @apiParam  {String} type тип объекта  `crossRoad` - для объекта(точки) типа "перекресток".
     * @apiParam  {Number} cycleTime Длительность цикла (сек)
     * @apiParam  {Number} offset Смещение начала первой фазы в секундах
     * @apiParam  {Phase[]} phases Массив объектов типа `Phase`, интервалы на которые разбит цикл регулирования
     *
     * @apiParam  (Phase){String} tag Пользователькое наименование фазы - ярлык.
     * @apiParam  (Phase){Number} length Длительность данного интервала в секундах. Сумма длительностей всех интервалов для перекрестка должна быть равна длительности цикла.
     * @apiParam  (Phase){Number} minLength Минимальная допустимая длительность данного интервала в секундах.
     * @apiParam  (Phase){Number} intertact Длительность промежуточного такта в конце данного интервала в секундах.
     *
     * `Примечание`. На данный момент минимальная длительность промтакта составляет 6 секунд, если `intertact` будет указан меньше 6 или не указан, модель будет использовать значение 6 сек.
     * Красный -> Зеленый (3с Кр + 3с КрЖ), Зеленый -> Красный (3с Зм + 3с Ж),
     *
     * @apiParamExample {json} Crossroad node example:
     * Content-Type:application/json;
     * POST request body as JSON string:
     * {
     *     id: "aesefv8fbtoq7tsi",
     *     type: "crossRoad",
     *     cycleTime: 100,
     *     offset: 28,
     *     phases: [
     *        {
     *            tag: "ph-1",
     *            length: 60,
     *            minLength: 15,
     *            intertact: 10
     *        },
     *        {
     *            tag: "ph-2",
     *            length: 40,
     *            minLength: 15,
     *            intertact: 10
     *        }
     *    ]
     * }


     * @apiSuccess {Boolean} success Результат запроса (успешно/неуспешно).
     * @apiSuccess {String}  message Текстовое сообщение об ошибке.
     * @apiSuccess {Object[]} data Массив содержащий данные ответа сервера, там могут быть как результаты моделирования, так и список ошибок валидации модели.
     * При удачном результате рассчета содержание секции `data` имеет формат идентичный тому, что был передан в запросе, может быть изменено значение ключей
     * `offset`, `length`. Добавляется для каждого интервала лишь ключ `saturation` - насыщение данного интервала.
     *
     *
     * @apiSuccessExample Crossroad node response example:
     *     HTTP/1.1 200 OK
     *     {
     *       success: true,
     *       message: "Simulation was successful!",
     *       data: [
     *           {
     *               id: "aesefv8fbtoq7tsi",
     *               type: "crossRoad",
     *               cycleTime: 100,
     *               offset: 28,
     *               phases: [
     *                  {
     *                      tag: "ph-1",
     *                      length: 60,
     *                      minLength: 15,
     *                      intertact: 10,
     *                      saturation: 0.7122
     *                  },
     *                  {
     *                      tag: "ph-2",
     *                      length: 40,
     *                      minLength: 15,
     *                      intertact: 10,
     *                      saturation: 0.0023
     *                  }
     *              ]
     *           }
     *       ]
     *     }
     *
     */
    app.post('/api/example/crossroad', function (req, res) {
        res.json(responses.modelSimulationSuccess(
            {
                id:"aesefv8fbtoq7tsi",
                type:"crossRoad",
                cycleTime:100,
                offset:28,
                phases:[
                    {
                        tag: "ph-1",
                        length: 60,
                        minLength: 15,
                        intertact:10,
                        saturation: 0.7122
                    },
                    {
                        tag: "ph-2",
                        length: 40,
                        minLength: 15,
                        intertact:10,
                        saturation: 0.03
                    }
                ]
            }
        ));
        return;
    });

};

