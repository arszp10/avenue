(function(App){
    var browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.length > 2) {
        browserLang = browserLang.substr(0, 2);
    }
    var locales = {
        ru: {
            'api-doc'           : 'Документация API',
            'app-title'         : 'Avenue 2.0 - Моделирование транспортных потоков и оптимизация координированных режимов управления.',
            'create-new-model'  : 'Новая модель',
            'newest-first'      : 'Сначала новые',
            'oldest-first'      : 'Сначала старые',
            'from'              : 'из',
            'welcome'           : 'Добро пожаловать',
            'you-do-not-have-any-models': 'У вас нет ни одной модели, нажмите на конопку, чтобы создать свою первую модель.',
            'add-green'         : 'Доб. зеленый',
            'sec'               : 'сек',
            'done'              : 'Готово',
            'model'             : 'Модель',
            'routes'            : 'Маршруты',
            'coordination-plan-properties':'Свойства модели',
            'cycle-time'        : 'Время цикла',
            'name'              : 'Название',
            'notes'             : 'Заметки',
            'save'              : 'Сохранить',
            'cancel'            : 'Отмена',
            'intervals'         : 'Интервалы',
            'point'             : 'Точка',
            'stopline'          : 'Стоп линия',
            'carriageway'       : 'Перегон',
            'bottleneck'        : 'Бутылочное горлышко',
            'concurrent'        : 'Конфликтная точка',
            'concurrent-merge'  : 'Конфликт со слиянием',
            'pedestrian'        : 'Пешеходный переход',
            'horizontal-align'  : 'Выровнять по горизонтали',
            'vertical-align'    : 'Выровнять по вертикали',
            'node-type'         : 'Тип точки',
            'node-tag'          : 'Ярлык',
            'intensity'         : 'Интенс.',
            'v_h'               : 'авт/ч',
            'p_h'               : 'чел/ч',
            'capacity'          : 'Насыщ.',
            'secondary-flow-capacity' : 'Насыщ. втор.',
            'length'            : 'Длина',
            'm'                 : 'м',
            'v'                 : 'авт',
            'veh_h_h'           : 'авт*ч/ч',
            'route-time'        : 'Время проезд',
            'dispersion'        : 'Дисперсия',
            'weight'            : 'Вес',
            'queue-limit'       : 'Макс очередь',
            'red-intervals'     : 'Красн. интер.',
            'direction-icon'    : 'Иконка маневра',
            'choose-icon'       : 'выбрать',
            'samples'           : 'Примеры',
            'conflict-point'    : 'Конфликтная точка',
            'crossroad-and-carriageway': 'Перекресток + перегон',
            'four-cross-in-line': '4 перекрестка в линию',
            'ilinskoe-highway-212': 'Ильинское шоссе утро (212)',
            'launch'            : 'Запуск',
            'phases'            : 'Фазы',
            'offsets'           : 'Сдвиги',
            'choose-route'      : 'Выбрать маршрут',
            'add-route'         : 'Маршрут',
            'create'            : 'Создать',
            'my-account'        : 'Мой аккаунт',
            'log-out'           : 'Выход',
            'interval-tag'          : 'Ярлык',
            'interval-length'       : 'Длительн.',
            'interval-minimal'      : 'Мин. длит.',
            'interval-intertact'    : 'Пром. такт',
            'crossroad-diagrams'    : 'Диаграммы',
            'intervals-count'       : 'Количество фаз',
            'offset'                : 'Смещение',
            'constant-comp-intensity': 'Пост. сост. интенсивности',
            'full-intensity'        : 'Интенсивность',
            'full-capacity'         : 'Поток насыщения',
            'capacity-rate'         : 'Коэфф. насыщения',
            'unit'                  : 'ед.',
            'validation-errors'     : 'Ошибки валидации',
            'modeling-results'      : 'Результат моделирования',
            'delay'                 : 'Задежка',
            'delay-model'           : 'Задежка (модель)',
            'delay-oversaturation'  : 'Задежка (перерузки)',
            'green-saturation'      : 'Насыщ. зеленого',
            'limit-max-queue'       : 'Предел/Max. очередь',
            'sum-io-flow'           : 'Сумма I/O потока',
            'congestion'            : 'Затор',
            'no-congestion'         : 'Свободно',
            'veh_sec'               : 'авт*с/ц',
            'vehicle'               : 'авт',
            'open-in-new-tab'       : 'Открыть в новой вкладке',
            'open'                  :'Открыть',
            'remove'                : 'Удалить',
            'update'                : 'Применить',
            'edit-selected-nodes'   : 'Изменить выбранные точки',
            'locate'                : 'Найти',
            'edit'                  : 'Редактировать',
            'import-properties'     : 'Форма импорта моделей',
            'import-model-type'     : 'Тип',
            'import-zoom-map'       : 'Масштаб карты',
            'import-zoom-intersection' : 'Масшт. перекр.',
            'file'                  : 'Файл',
            'import'                : 'Импорт',
            'import-model'          : 'Импорт модели',
            'map'                   : 'Карта',
            'model-list'            : 'Модели',
            'cycle-length'          : 'Длительность цикла',
            'phases-order'          : 'Порядок фаз',
            'rename'                : 'Переименовать',
            'node-props'            : 'Свойства точки',
            'crossroad-props'       : 'Свойства перекрестка',
            'program'               : 'Программа',
            'apply'                 : 'Применить',
            'crossroad'             : 'Перекресток',
            'type'                  : 'Тип',
            'optimization-exclude'  : 'Исключить из оптимизации',
            /*-----------------------*/
            'edit-model-properties' : 'Редактировать свойства и настройки модели',
            'search-model'          : 'Поиск модели',
            'rectangle-select'      : 'Выделение объектов рамкой',
            'pan-model'             : 'Перемещение модели',
            'point-menu-list'       : 'Список точек для добавления в модель',
            'add-point'             : 'Добавить обычную точку',
            'add-stopline'          : 'Добавить стоплинию',
            'add-carriageway'       : 'Добавить перегон',
            'add-bottleneck'        : 'Добавить бутылочное горлышко',
            'add-concurrent'        : 'Добавить конфликтную точку',
            'add-concurrent-merge'  : 'Добавить конфликтную точку со слиянием',
            'group-nodes'           : 'Сгруппировать точки в перекресток',
            'ungroup-nodes'         : 'Разгруппировать',
            'cut'                   : 'Вырезать Ctrl + X',
            'copy'                  : 'Копировать Ctrl + C',
            'paste'                 : 'Вставить Ctrl + V',
            'undo'                  : 'Отменить Ctrl + Z (повторить Ctrl + Y)',
            'delete'                : 'Удалить Del',
            'save-crossroad-program': 'Сохранить изменения программы для перекрестка',
            'opti-cycle-length'     : 'Расчет оптимальной длительности цикла и фаз',
            'pin-model-to-map'      : 'Прикрепить/открепить модель к гео-подоснове',
            'show-map-in-background': 'Показывать/не показывать модель на фоне карты',
            'enter-route-name'      : 'Имя маршрута',
            'save-model'            : 'Сохранить модель',
            'launch-model'          : 'Запустить моделирование',
            'back-to-model-list'    : 'Назад к списку моделей',
            'back-to-model'         : 'Назад к модели',
            'zoom-in'               : 'Увеличить',
            'zoom-out'              : 'Уменьшить',
            'remove-current-route'  : 'Удалить текущий маршрут',
            'crossroad-name'        : 'Название перекрестка',
            'phase-order'           : 'Порядок фаз (1,2,3)',

            'intertact-order': 'Расположение пром такта',
            'before-stage': 'В начале основного такта',
            'after-stage': 'В конце основного такта',
            'default-flow-value': 'Интенсивность по умолчанию',
            'default-capacity': 'Поток насыщения по умолчанию',
            'download-model': 'Экспорт модели (скачать как файл .json)',
            'download-file': 'Скачать файл модели'

        },

    };

    App.Modules.locale = {
        injectDependencies: function(modules) {},
        initModule: function(){
            if (!locales.hasOwnProperty(browserLang)) {
                return;
            }

            $('[locale]').each(function(){
                var th = $(this);
                var text = locales[browserLang][th.attr('locale')];
                th.text(text);
            });

            $('[title]').each(function(){
                var th = $(this);
                var text = locales[browserLang][th.attr('title')];
                th.attr('title', text);
            });

            $('input[placeholder]').each(function(){
                var th = $(this);
                var text = locales[browserLang][th.attr('placeholder')];
                th.attr('placeholder', text);
            });

        },

        localize: function(key){
            if (!locales.hasOwnProperty(browserLang)) {
                return key;
            }
            var keyExist = locales[browserLang].hasOwnProperty(key);
            return keyExist ? locales[browserLang][key] : key ;
        }
    }

})(AvenueApp);
