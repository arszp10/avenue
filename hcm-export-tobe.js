var toBe =
{
    MetaData:{
        name: "Участок дорого от ул. Светлая до ул. Садовая",
        description: "....",
        created: "2017-06-01T12:00:00+0060",
        version: "8.1",
        totalObjects: {
            hcmControllers: 12,
            hcmIntersections: 15,
            hcmSignalGroups: 205
            /* ... итд */
        }
    },
    Body: {
        HcmIntersection:[
            {
                id: "int1", /*Будем использовать семантико-цифровую нотацию, для примера*/
                name: "Перекресток ул. Клары Цеткин - пр. Мира",
                hcmEnters: [ "ent1", "ent2", "ent3", "ent4"] 
                /* просто массив ссылок */
            },
            {
                id: "int2", 
                name: "ост. Сибзавод - пешеходый переход",
                hcmEnters: [ "ent5", "ent6"] 
                /* сквозная нумерация подходов к перекрестку */
            }
        ],
        /* Выносим на первый уровень подходы*/
        HcmEnter:[
            {
                id: "ent1", /* фиктивный ключ */
                hcmIntersection: "int1", /* внешний ключ, связь перекрестка и подхода*/
                pos: 0,   /* это просто свойство, с одной стороны я вас понимаю конечно,
                             трудно тайти перекресток, где это свойство не уникально для подходов,
                             но с другой стоорны адресоваться в дальнейшем к ним в виде масссива разнотипных элементов ["1",270] хммм */
                lanes:[
                    {
                        "enterTraffic": 1,
                        "type":"turn_bay", /*tram,tram_traffic,traffic,bus,island,island_ped,turn_bay,bus_stop,type,*/
                        "size": [114,104]
                    },
                    {"enterTraffic": 1},
                    {"enterTraffic": 1},
                    {"enterTramTraffic": 1},
                    {"exitTramTraffic": 1},
                    {"exitTraffic": 1},
                    {"exitTraffic": 1},
                    {"exitTraffic": 1}
                ],
                hcmPedBicCross:{ "crosWidth":6.2, "vp":200, "lcc":28},

                /*список манёвров выходящих с подхода*/
                hcmManeuver:[
                    "man1", "man2", "man3"
                ],
                /*список групп полос, на входе к перекрёстку*/
                /*число полос, и список разрешённых с данной полосы манёвров, принадлежащих данному подходу*/
                HcmLaneGroup:[
                    {
                        "lanes":1,
                        "dataManeurSet":["man1"] /* меняем тут на строковые ссылки и убираем лишний объект и массив*/
                    },
                    {
                        "lanes":1,
                        "blocking": 3,
                        "dataManeurSet":["man1", "man2"]
                    },
                    {
                        "lanes":1,
                        "dataManeurSet":["man3"]
                    }
                ]
            }
            /* , не стал добавлять остальные подходы */
        ],
        /* Выносим на первый уровень и маневры!
           в самом маневре нет нужды на обратные ссылки на перекрестки, но если очень надо то лучше добавить ключ*/
        HcmManeuver:[
            {
                id: "man1",
                hcmIntersection: "int1", // необязательная ссылка - связь сущностей  маневр -- перекресток
                hcmEnterStart: "ent1",
                hcmEnterFinish: "ent2",
                volume: 400,
                percentHeavyVehicle: 0.03,
                type: "R",
                laneendConnectR: 0,
                laneaddR: 0,
                laneaddL: 0
            },
            {
                id: "man2",
                hcmIntersection: "int1",
                hcmEnterStart: "ent1",
                hcmEnterFinish: "ent3",
                volume: 400,
                percentHeavyVehicle: 0.03,
                type: "S"
            },
            {
                id: "man3",
                hcmIntersection: "int1",
                hcmEnterStart: "ent1",
                hcmEnterFinish: "ent4",
                volume: 400,
                type: "S",
                isTramManeuver: true
                /* для примера, так как если склеивать буквы в типе Rt то мы склеиваем Право с Трамваем*/
                /* ничего не значащий type может лучше заменить на  direction : R,S,T*/
                /* и ко всем маневрам записыывать в поле type: Car, Tram, Whatever, CT */
            }
        ],

        HcmControllerSimple:[
            {
                id: "cont1", // id - везде id
                name: "ДКМ-12, сер. №7645722",
                cycle: 120, /*длительность цикла*/
                shift: 0,  /*сдвиг начала цикла*/

                /* Не знаю стоит ли тащить эти две сущности на первый уровень, из других сущностей
                 на них ссылок нет можно и оставить вложенными, но можно и вынести, так же как маневры*/
                HcmSignalGroup:[

                    {
                        id: "sg1", //идентификатор сигнальной группы // id - везде id
                        hcmManeuver:["man1", "man2"]
                    },
                    {
                        id:"sg2",
                        hcmManeuver:["man1"]
                    },
                    {
                        id:"sg3",
                        hcmManeuver:["man1", "man2"],
                        hcmTramManeuver:["man3"]  /*не думаю, что тут надо два разных ключа, так-как в самом манере есть тип какой он*/
                    }
                    /* ..... */
                ],
                HcmPhase:[
                    {
                        id:"ph1", // id - везде id
                        minDuration: 20,
                        maxDuration: 120,
                        duration: 20,
                        hcmSignalGroup:["sg1","sg3","sg9p","sg11p","sg14t"],

                        /*описание промтакта*/ /*не очень понятно зачем тут массив ???*/
                        HcmInterphase:[
                            {
                                hcmPhaseNext: "ph2",
                                durationVehicle:4,
                                InterphaseElement:[
                                    /*создаём возможный переход из данной фазы в фазу HcmPhase_Next:(индекс или имя), длит-ть промтакта:durationveh*/
                                    /*для данной сигнальной группы определяем добавочное время горения зелёного в промтакте */
                                    {
                                        hcmSignalGroup: "sg9p",
                                        addGreen: 1
                                    },
                                    {
                                        hcmSignalGroup: "sg4",
                                        addGreen: 2
                                    }
                                ]
                            }
                        ]
                    },
                    /* .... другие фазы .... */
                ],
                cycleOrder:["ph1","ph2","ph3","ph4"]
            }
        ],
        
        HcmRoad:[
            /* тут все нормально оставим все как есть */
        ]
    }
};
