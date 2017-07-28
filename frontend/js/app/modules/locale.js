(function(App){
    var browserLang = navigator.language || navigator.userLanguage;
    var locales = {
        ru: {
            'api-doc'       : 'Документация API',
            'app-title'     : 'Avenue 2.0 - Моделирование транспортных потоков и оптимизация координированных режимов управления.',
            'create-new-model' : 'Новая модель',
            'newest-first' : 'Сначала новые',
            'oldest-first' : 'Сначала старые',
            'from' : 'из',
            'welcome': 'Добро пожаловать',
            'you-do-not-have-any-models': 'У вас нет ни одной модели, нажмите на конопку, чтобы создать свою первую модель.',
            'add-green': 'Доб. зеленый',
            'sec': 'сек',
            'done': 'Готово',
            'model': 'Модель',
            'routes': 'Маршруты',
            'coordination-plan-properties':'Свойства плана координации',
            'cycle-time': 'Время цикла',
            'name': 'Название',
            'notes': 'Заметки',
            'save': 'Сохранить',
            'cancel': 'Отмена',
            'intervals': 'Интервалы',
            'point': 'Точка',
            'stopline': 'Стоп линия',
            'carriageway': 'Перегон',
            'bottleneck': 'Бутылочное горлышко',
            'concurrent': 'Конфликтная точка',
            'concurrent-merge': 'Конфликт со слиянием',
            'horizontal-align': 'Выровнять по горизонтали',
            'vertical-align': 'Выровнять по вертикали',

            'node-type': 'Тип точки',
            'node-tag': 'Ярлык',
            'intensity': 'Интенс.',
            'v_h': 'авт/ч',
            'capacity': 'Насыщ.',
            'secondary-flow-capacity': 'Насыщ. втор.',
            'length': 'Длина',
            'm': 'м',
            'v': 'авт',
            'route-time': 'Время проезд',
            'dispersion': 'Дисперсия',
            'weight': 'Вес',
            'queue-limit': 'Макс очередь',
            'red-intervals': 'Красн. интер.',
            'direction-icon': 'Иконка маневра',
            'choose-icon': 'выбрать',

            'samples': 'Примеры',
            'conflict-point': 'Конфликтная точка',
            'crossroad-and-carriageway': 'Перекресток + перегон',
            'four-cross-in-line': '4 перекрестка в линию',
            'ilinskoe-highway-212': 'Ильинское шоссе утро (212)',
            'launch': 'Запуск',
            'phases': 'Фазы',
            'offsets': 'Сдвиги',
            'choose-route': 'Выбрать маршрут',
            'add-route': 'Маршрут',
            'create': 'Создать',
            'my-account': 'Мой аккаунт',
            'log-out': 'Выход',

            'interval-tag': 'Ярлык',
            'interval-length': 'Длительн.',
            'interval-minimal': 'Мин. длит.',
            'interval-intertact': 'Пром. такт',
            'crossroad-diagrams': 'Диаграммы',
            'intervals-count' : 'Количество фаз',
            'offset' : 'Смещение',

            'constant-comp-intensity': 'Пост. сост. интенсивности',
            'full-intensity': 'Интенсивность',
            'full-capacity': 'Поток насыщения',
            'unit': 'ед.',
            'validation-errors' : 'Ошибки валидации',

            'modeling-results': 'Результаты моделирования',
            'delay': 'Задежка',
            'green-saturation': 'Насыщ. зеленого',
            'limit-max-queue': 'Предел/Max. очередь',
            'sum-io-flow': 'Сумма I/O потока',
            'congestion': 'Затор',
            'no-congestion': 'Свободно',

            'veh_sec': 'авт*с',
            'vehicle': 'авт',
            'open-in-new-tab': 'Открыть в новой вкладке',
            'open':'Открыть',
            'remove': 'Удалить',
            'update': 'Применить',
            'edit-selected-nodes': 'Изменить выбранные точки',
            'locate': 'Найти',
            'edit': 'Редактировать',

            'import-properties': 'Форма импорта моделей',
            'import-model-type': 'Тип',
            'import-zoom-map': 'Масштаб карты',
            'import-zoom-intersection' : 'Масшт. перекр.',
            'file': 'Файл',
            'import': 'Импорт',
            'import-model': 'Импорт модели',
            'map': 'Карта',
            'model-list':'Модели',
            'cycle-length': 'Длительность цикла',
            'phases-order': 'Порядок фаз',
            'rename': 'Переименовать',

        },
        en: {
            'api-doc' : 'API Doc',
            'app-title': 'Avenue 2.0 - Service and API for mesoscopic modeling of traffic and optimization of coordinated control modes.',
            'create-new-model' : 'Create new model',
            'newest-first' : 'Newest first',
            'oldest-first' : 'Oldest first',
            'from' : 'from',
            'welcome': 'Welcome',
            'you-do-not-have-any-models': 'You do not have any models, click the button to create your first model.',
            'add-green': 'Add. green',
            'sec': 'sec',
            'done': 'Done',
            'model': 'Model',
            'routes': 'Routes',
            'coordination-plan-properties':'Coordination plan properties',
            'cycle-time': 'Cycle time',
            'name': 'Name',
            'notes': 'Notes',
            'save': 'Save',
            'cancel': 'Cancel',
            'intervals': 'Intervals',
            'point': 'Point',
            'stopline': 'Stopline',
            'carriageway': 'Carriageway',
            'bottleneck': 'Bottleneck',
            'concurrent': 'Conflict point',
            'concurrent-merge': 'Conflict point with merge (Ramp)',
            'horizontal-align': 'Horizontal align',
            'vertical-align': 'Vertical align',

            'node-type': 'Node type',
            'node-tag': 'Node tag',
            'intensity': 'Intensity',
            'v_h': 'v/h',
            'capacity': 'Capacity',
            'secondary-flow-capacity': 's.f. capacity',
            'length': 'Length',
            'm': 'm',
            'v': 'v',
            'route-time': 'Route time',
            'dispersion': 'Dispersion',
            'weight': 'Weight',
            'queue-limit': 'Queue limit',
            'red-intervals': 'Red intervals',
            'direction-icon': 'Direction icon',
            'choose-icon': 'choose icon',

            'samples': 'Samples',
            'conflict-point': 'Conflict point',
            'crossroad-and-carriageway': 'Crossroad & Carriageway',
            'four-cross-in-line': '4 Crossroads in line',
            'ilinskoe-highway-212': 'Ilinskoe highway morning (212)',
            'launch': 'Launch',
            'phases': 'Phases',
            'offsets': 'Offsets',
            'choose-route': 'Choose a route',
            'add-route': 'Route',
            'create': 'Create',
            'my-account': 'My account',
            'log-out': 'Log out',

            'interval-tag': 'Tag',
            'interval-length': 'Lenght',
            'interval-minimal': 'Minimal',
            'interval-intertact': 'Intertact',
            'crossroad-diagrams': 'Diagrams',
            'intervals-count' : 'Intervals count',
            'offset' : 'Offset',

            'constant-comp-intensity': 'Constant comp. of intensity',
            'full-intensity': 'Intensity',
            'full-capacity': 'Capacity',
            'unit': 'unit',
            'validation-errors' : 'Validation errors',

            'modeling-results': 'Modeling results',
            'delay': 'Delay',
            'green-saturation': 'Green saturation',
            'limit-max-queue': 'Limit / Max. queue',
            'sum-io-flow': 'Sum I/O flow',
            'congestion': 'Congestion',
            'no-congestion': 'No congestion',

            'veh_sec': 'veh*sec',
            'vehicle': 'vehicle',
            'open-in-new-tab': 'Open in new tab',
            'open':'Open',
            'remove': 'Remove',
            'update': 'Update',
            'edit-selected-nodes': 'Edit selected nodes',
            'locate': 'Locate',
            'edit': 'Edit',
            'import-properties': 'Import form',
            'import-model-type': 'Type',
            'import-zoom-map': 'Zoom map',
            'import-zoom-intersection' : 'Zoom intersection',
            'file': 'File',
            'import': 'Import',
            'import-model': 'Import model',
            'map': 'Map',
            'model-list':'Model list',
            'cycle-length': 'Cycle lenght',
            'phases-order': 'Phases order',
            'rename': 'Rename',
        }
    };

    App.Modules.locale = {
        injectDependencies: function(modules) {},
        initModule: function(){
            if (!locales.hasOwnProperty(browserLang)) {
                browserLang = 'en'
            }

            $('[locale]').each(function(){
                var th = $(this);
                var text = locales[browserLang][th.attr('locale')];
                th.text(text);
            })
        },

        localize: function(key){
            var keyExist = locales[browserLang].hasOwnProperty(key);
            return keyExist ? locales[browserLang][key] : key ;
        }
    }

})(AvenueApp);
