var asIs =
{
    "HcmIntersection":[
        {
            "id":"1",/*при идентификации может использоваться имя или индекс в массиве */
            "HcmEnter":[
                {
                    "pos":0,/*показатель, идентифицирующий подход к перекрёстку, определяет угол подхода дороги к перекрёстку от направления на север (0) по часовой стрелке*/
                    //"lanes_enter":4, "lanes_exit":4, "RightBayLanes_Length":[104],/*число входящих полос (суммарно с полосами уширения), число выходящих полос, полосы уширения справа - слева*/
                    "lanes":[       //чтобы указать на полосу : enter_traffic_lane[индекс справа налево по ходу дороги]   exit_traffic_lane[справа налево по выходящим] enter_tram_lane[]
                        //exit_tram_lane[] lane[] enter_tram_traffic_lane[] exit_tram_traffic_lane[]
                        {"enter_traffic":1,"type":"turn_bay","size":[114,104]},
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_tram_traffic":1},
                        {"exit_tram_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1}
                    ],/*tram,tram_traffic,traffic,bus,island,island_ped,turn_bay,bus_stop,type,*/
                    "HcmPedBicCross":{"cros_width":6.2,"vp":200,"lcc":28},/*определение пешеходного перехода, пересекающего подход{ ширина перехода, интенсивность пеш/час вел/час, lcc - длина перехода*/
                    "HcmManeuver":[/*список манёвров выходящих с подхода*/
                        {"E_Finish":270,"v":    400,"perc_heavyveh":0.03,"type":"R","laneend_connect_R":0, "laneadd_R":0, "laneadd_L":0},/*определяем манёвр с данного подхода на подход E_Finish, v-интенсивность авт/ч, perc_heavyveh-процент тяж авто,  type-тип манёвра RSLT    laneend_connect_R(L) - опред номер полосы выхода, подключённой к правой(левой) полосе манёвра с учётом полос уширения, laneadd_R(L) - добавочные полосы уширения справа(слева)*/
                        {"E_Finish":180,"v":    1400,"perc_heavyveh":0.03,"type":"S"},
                        {"E_Finish":180,"v":    3,"type":"St"}/*обозначение рельсов трамвая t-tram Lt Rt Tt*/
                    ],
                    "HcmLaneGroup":[/*список групп полос, на входе к перекрёстку*/
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[0,270]}]}, /*число полос, и список разрешённых с данной полосы манёвров, принадлежащих данному подходу*/
                        {"lanes":1,"blocking": 3,"DataManeurSet":[{"HcmManeuver":[0,270]},{"HcmManeuver":[0,180]}]},
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[0,180]}]},
                        {
                            "lanes":1,
                            "DataManeurSet":[
                                {
                                    "HcmManeuver":[0,180]
                                },
                                {
                                    "HcmTramManeuver":[0,180]
                                }
                            ]
                        }
                    ]
                },
                {/*с этого подхода возможен только вход*/
                    "pos":90,
                    "lanes":[
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"island":2.3, "size":[34,25]},
                        {"enter_traffic":1},
                        {"enter_traffic":1}
                    ],
                    "HcmManeuver":[
                        {"E_Finish":0,"v":200,"perc_heavyveh":0.03,"type":"R"},
                        {"E_Finish":270,"v":1300,"perc_heavyveh":0.03,"type":"S"},
                        {"E_Finish":180,"v":300,"perc_heavyveh":0.03,"type":"L"}
                    ],
                    "HcmLaneGroup":[
                        {"lanes":1,"blocking":  3,"DataManeurSet":[{"HcmManeuver":[90,0]}]},
                        {"lanes":2,"DataManeurSet":[{"HcmManeuver":[90,270]}    ]},
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[90,180]},   {"HcmManeuver":[90,270]}]},
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[90,180]}    ]}
                    ]
                },
                {
                    "pos":180,
                    //"lanes_enter":3, "lanes_exit":3,
                    "lanes":[
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_tram_traffic":1},
                        {"exit_tram_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1}
                    ],
                    "HcmManeuver":[
                        {"E_Finish":0,"v":1300,"perc_heavyveh":0.03,"type":"S"},
                        {"E_Finish":0,"v":      3,"type":"St"}
                    ],
                    "HcmLaneGroup":[
                        {"lanes":2,"DataManeurSet":[{"HcmManeuver":[180,0]}]},
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[180,0]},{"HcmTramManeuver":[180,0]}]}
                    ]
                    //"tram":[{"lane":{"way":"enter","numb":"1","from":"L"},"pos":"in_lane"},{"lane":{"way":"exit","numb":"1","from":"L"},"pos":"in_lane"}]
                },
                {
                    "pos":270,/*с этого подхода возможен только выход*/
                    "lanes":[
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1}
                        //,{"exit_bus":1,"size":[53,42,3,11],"type":"bus stop"}
                    ],
                    "HcmPedBicCross":{"cros_width":6.2,"vp":600,"lcc":20}
                }
            ],
            "Function_ConflictFromMainRoad_generate":[0,180]/*команда автоматически сгенерировать матрицу конфликтов, определяя главную дорогу от 0 до 180 подхода, если главные подходы не заданы [] тогда перекрёсток равнозначный*/
        },
        {
            "id":"2",
            "HcmEnter":[
                {
                    "pos":0,
                    "lanes":[
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_tram_traffic":1},
                        {"exit_tram_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1}
                    ],
                    "HcmManeuver":[
                        {"E_Finish":180, "v":1700, "perc_heavyveh":0.03, "type":"S"},
                        {"E_Finish":180,"v":    2,"type":"St"},
                        {"E_Finish":90,"v":     1,"type":"Lt"}
                    ],
                    "HcmLaneGroup":[
                        {"lanes":2,"DataManeurSet":[{"HcmManeuver":[0,180]}]},
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[0,180]},{"HcmTramManeuver":[0,180]},{"HcmTramManeuver":[0,90]}]}
                    ]
                },
                {
                    "pos":90,
                    "lanes":[
                        {"enter_tram":1},
                        {"exit_tram":1},
                        {"island":2, "size":[50,50]},
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1}

                    ],
                    "HcmManeuver":[
                        {"E_Finish":0,"v":      1,"type":"Rt"},
                        {"E_Finish":270,"v":    1,"type":"St"},
                        {"E_Finish":180,"v":    1,"type":"Lt"}
                    ]
                },
                {
                    "pos":180,
                    "lanes":[
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_tram_traffic":1},
                        {"exit_tram_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1}
                    ],
                    "HcmPedBicCross":{"cros_width":6.2,"vp":400,"lcc":24.5},
                    "HcmManeuver":[
                        {"E_Finish":90,"v":100, "perc_heavyveh":0.03, "type":"R"},
                        {"E_Finish":0, "v":900, "perc_heavyveh":0.03, "type":"S"},
                        {"E_Finish":90,"v":     1,"type":"Rt"},
                        {"E_Finish":0,"v":      2,"type":"St"},
                        {"E_Finish":270,"v":    1,"type":"Lt"}
                    ],
                    "HcmLaneGroup":[
                        {"lanes":1,"blocking":  3,"DataManeurSet":[{"HcmManeuver":[180,0]},{"HcmManeuver":[180,90]}]},
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[180,0]}]},
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[180,0]},{"HcmTramManeuver":[180,90]},{"HcmTramManeuver":[180,0]},{"HcmTramManeuver":[180,270]}]}
                    ]
                },
                {
                    "pos":270,
                    "lanes":[
                        {"enter_traffic":1,"type":"turn_bay","size":[106,86]},
                        {"enter_traffic":1},
                        {"island":2.5, "size":[25,5],"signal_ped_div":true},//"signal_ped_div":true (по умолч. false)- разделить пешеходный переход на островке на различные пеш переходы
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_traffic":1,"type":"turn_bay","size":[125,105]},
                        {"island":4.5, "size":[150,120],"signal_ped_div":true},
                        {"enter_tram":1},
                        {"exit_tram":1}
                    ],
                    "HcmPedBicCross":[//описывается три части пешеходного перехода, если на какой -то части перехода нет, тогда как элемент массива вместо объекта пишем null...
                        //обозначаем ["1",270] - нет деления ["1",270,0-1-2-3-...]-для разделённых пеш. переходов, нумерация справа налево как в массиве "lanes"
                        {"cros_width":6.2,"vp":600,"lcc":7.7},
                        {"cros_width":6.2,"vp":600,"lcc":11},
                        {"cros_width":6.2,"vp":600,"lcc":6.5}// переход через трамваи
                    ],
                    "HcmManeuver":[
                        {"E_Finish":180,"v":150, "perc_heavyveh":0.03, "type":"R"},
                        {"E_Finish":90, "v":900, "perc_heavyveh":0.03, "type":"S"},
                        {"E_Finish":0, "v":400, "perc_heavyveh":0.03, "type":"L"},
                        {"E_Finish":90,"v":     1,"type":"St"},
                        {"E_Finish":180,"v":    1,"type":"Rt"}
                    ],
                    "HcmLaneGroup":[
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[270,180]}]},
                        {"lanes":1,"blocking":  5,"DataManeurSet":[{"HcmManeuver":[270,180]},{"HcmManeuver":[270,90]}]},
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[270,90]}]},
                        {"lanes":1,"blocking":  5,"DataManeurSet":[{"HcmManeuver":[270,90]},{"HcmManeuver":[270,0]}]},
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[270,0]}]}
                    ]
                }
            ],
            "Geometry_Align":["HcmTramManeuver_270_90","HcmTramManeuver_0_180"],
            "Function_ConflictFromMainRoad_generate":[0,180]
        },
        {
            "id":"3",
            "HcmEnter":[
                {
                    "pos":0,
                    //"lanes_enter":0, "lanes_exit":4,
                    "lanes":[
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1}
                    ]
                },
                {
                    "pos":120,
                    //"lanes_enter":2, "lanes_exit":2,
                    "lanes":[
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_tram":1},
                        {"exit_tram":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1}
                    ],
                    "HcmPedBicCross":{"cros_width":6.2,"vp":200,"lcc":20},
                    "HcmManeuver":[
                        {"E_Finish":0,"v":350, "perc_heavyveh":0.03, "type":"R"},
                        {"E_Finish":270,"v":    3,"type":"St"}
                    ],
                    "HcmLaneGroup":[
                        {"lanes":2,"DataManeurSet":[{"HcmManeuver":[120,0]}]}
                    ]
                },
                {
                    "pos":270,
                    //"lanes_enter":5, "lanes_exit":0,
                    "lanes":[
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"island":2, "size":[50,50]},
                        {"enter_tram":1},
                        {"exit_tram":1}
                    ],
                    "HcmManeuver":[
                        {"E_Finish":120, "v":400, "perc_heavyveh":0.03, "type":"R"},
                        {"E_Finish":0, "v":600, "perc_heavyveh":0.03, "type":"L"},
                        {"E_Finish":120,"v":    3,"type":"St"}
                    ],
                    "HcmLaneGroup":[
                        {"lanes":2,"DataManeurSet":[{"HcmManeuver":[270,120]}]},
                        {"lanes":3,"DataManeurSet":[{"HcmManeuver":[270,0]}]}
                    ]
                }
            ],
            "Function_ConflictFromMainRoad_generate":[120,0]
        },
        {
            "id":"4",
            "HcmEnter":[
                {
                    "pos":60,
                    //"lanes_enter":3, "lanes_exit":2,
                    "lanes":[
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"island":2, "size":[126,126],"signal_ped_div":true},//разделить сигналы пешеходам/велосипедистам
                        {"exit_traffic":1},
                        {"exit_traffic":1}
                    ],
                    "HcmPedBicCross":[
                        {"cros_width":6.2,"vp":150,"lcc":9},
                        {"cros_width":6.2,"vp":150,"lcc":8.6}
                    ],
                    "HcmManeuver":[
                        {"E_Finish":270,"v":1550, "perc_heavyveh":0.03, "type":"R"}
                    ],
                    "HcmLaneGroup":[
                        {"lanes":3,"DataManeurSet":[{"HcmManeuver":[60,270]}]}
                    ]
                },
                {
                    "pos":180,
                    //"lanes_enter":4, "lanes_exit":0,
                    "lanes":[
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_traffic":1},
                        {"enter_traffic":1}
                    ],
                    "HcmManeuver":[
                        {"E_Finish":60,"v":700, "perc_heavyveh":0.03, "type":"R"},
                        {"E_Finish":270,"v":250, "perc_heavyveh":0.03, "type":"L"}
                    ],
                    "HcmLaneGroup":[
                        {"lanes":1,"DataManeurSet":[{"HcmManeuver":[180,60]}]},
                        {"lanes":1,"blocking":  5,"DataManeurSet":[{"HcmManeuver":[180,60]},{"HcmManeuver":[180,270]}]},
                        {"lanes":2,"DataManeurSet":[{"HcmManeuver":[180,270]}]}
                    ]
                },
                {
                    "pos":270,
                    //"lanes_enter":0, "lanes_exit":5,
                    "lanes":[
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1},
                        {"exit_traffic":1}
                    ]
                }
            ],
            "Function_ConflictFromMainRoad_generate":[]
        }
    ],
    "HcmControllerSimple":[
        {
            "nameID":"c1",
            "cycle":120,/*длительность цикла*/
            "shift":0,/*сдвиг начала цикла*/
            "HcmSignalGroup":[//HcmSignalGroup[] должны быть объявлены перед HcmPhase[]
                {       "nameID":"sg1",//идентификатор сигнальной группы
                    "HcmManeuver":[["1",90,270],["1",90,180]]       //описывает HcmSignalLine, состоящие из 1-го манёвра (в начале каждого манёвра стоит стоп линия)/*перечисляются манёвры, включённые в фазу [имя или индекс перекрёстка, позиция входа, позиция выхода]*/
                    /* конструкция "HcmManeuver":[[["2",180,0],["1",180,0]],[...],[...],...]описывает линию, проходящую через несколько перекрёстков без стоп линий */
                    //,"HcmPedBicCross":[]                  //описывает HcmSignalLine, состоящий из 1-го перехода/*перечисляются пешеходные переходы, включённые в фазу [имя или индекс перекрёстка, позиция пересекаемого подхода(,индекс перехода между островками)]*/
                    //,"HcmTramManeuver":[]                 //описывает манёвр трамвая, аналогично HcmManeuver
                },
                {       "nameID":"sg2",         "HcmManeuver":[["1",90,0]]      },
                {       "nameID":"sg3",         "HcmManeuver":[["2",270,90],["2",270,0]],"HcmTramManeuver":[["2",270,90],["2",270,180]]},
                {       "nameID":"sg4",         "HcmManeuver":[["2",270,180]]   },
                {       "nameID":"sg5",         "HcmManeuver":[["1",0,180]],"HcmTramManeuver":[["1",0,180]]     },
                {       "nameID":"sg6",         "HcmManeuver":[["1",0,270]]     },
                {       "nameID":"sg7",         "HcmManeuver":[["2",0,180]],"HcmTramManeuver":[["2",0,180],["2",0,90]]  },
                {       "nameID":"sg8",         "HcmManeuver":[["2",180,0],["1",180,0],["2",180,90]],"HcmTramManeuver":[["2",180,0],["1",180,0],["2",180,90],["2",180,270]]},
                {       "nameID":"sg9p",        "HcmPedBicCross":[["1",0]]      },
                {       "nameID":"sg10p",       "HcmPedBicCross":[["1",270]]    },
                {       "nameID":"sg11p",       "HcmPedBicCross":[["2",180]]    },
                {       "nameID":"sg12p",       "HcmPedBicCross":[["2",270,0],["2",270,1]]      },
                {       "nameID":"sg13p",       "HcmPedBicCross":[["2",270,2]]  },
                {       "nameID":"sg14t",       "HcmTramManeuver":[["2",90,0],["2",90,270],["2",90,180]]        }
            ],
            "HcmPhase":[
                {       "nameID":"ph1", "mindurat":20,  "maxdurat":120, "duration":20,/*определяем фазу: имя , мин-макс текущ длительность*/
                    "HcmSignalGroup":["sg1","sg3","sg9p","sg11p","sg14t"],
                    "HcmInterphase":[/*описание промтакта*/
                        {"HcmPhase_Next":"ph2","durationveh":4,"InterphaseElement":[/*создаём возможный переход из данной фазы в фазу HcmPhase_Next:(индекс или имя), длит-ть промтакта:durationveh*/
                            {"HcmSignalGroup":"sg9p","add_Green":1},/*для данной сигнальной группы определяем добавочное время горения зелёного в промтакте */
                            {"HcmSignalGroup":"sg4","add_Green":2}
                        ]}
                    ]
                },
                {       "nameID":"ph2", "mindurat":10,  "maxdurat":120, "duration":20,
                    "HcmSignalGroup":["sg1","sg2","sg3","sg4","sg6","sg14t"],
                    "HcmInterphase":[
                        {"HcmPhase_Next":"ph3","durationveh":5,"InterphaseElement":[
                            {"HcmSignalGroup":"sg1","add_Green":2},
                            {"HcmSignalGroup":"sg8","add_Green":1}
                        ]}
                    ]
                },
                {       "nameID":"ph3", "mindurat":10,  "maxdurat":120, "duration":20,
                    "HcmSignalGroup":["sg5","sg8","sg2","sg6","sg7","sg4","sg13p"],
                    "HcmInterphase":[
                        {"HcmPhase_Next":"ph4","durationveh":3,"InterphaseElement":[]}
                    ]
                },
                {       "nameID":"ph4", "mindurat":20,  "maxdurat":120, "duration":20,
                    "HcmSignalGroup":["sg5","sg8","sg2","sg7","sg10p","sg12p","sg13p"],
                    "HcmInterphase":[
                        {"HcmPhase_Next":"ph1","durationveh":3,"InterphaseElement":[
                            {"HcmSignalGroup":"sg8","add_Green":2},
                            {"HcmSignalGroup":"sg14","add_Green":3}
                        ]}
                    ]
                }
            ],
            "CycleOrder":["ph1","ph2","ph3","ph4"]
        },
        {
            "nameID":"c2",
            "cycle":120,
            "shift":20,
            "HcmSignalGroup":[
                {       "nameID":"sg1",         "HcmManeuver":[["3",270,120]]   },
                {       "nameID":"sg2",         "HcmManeuver":[["3",120,0]],"HcmTramManeuver":[["3",120,270]]   },
                {       "nameID":"sg3",         "HcmManeuver":[["3",270,0]]     },
                {       "nameID":"sg4p",        "HcmPedBicCross":[["3",120]]    },
                {       "nameID":"sg5t",        "HcmTramManeuver":[["3",270,120]]       }
            ],
            "HcmPhase":[
                {       "nameID":"ph1", "mindurat":20,  "maxdurat":120, "duration":20,
                    "HcmSignalGroup":["sg1","sg2","sg5t"],
                    "HcmInterphase":[
                        {"HcmPhase_Next":"ph2","durationveh":3,"InterphaseElement":[]}
                    ]
                },
                {       "nameID":"ph2", "mindurat":20,  "maxdurat":120, "duration":20,
                    "HcmSignalGroup":["sg3","sg4p"],
                    "HcmInterphase":[
                        {"HcmPhase_Next":"ph3","durationveh":3,"InterphaseElement":[]}
                    ]
                },
                {       "nameID":"ph3", "mindurat":20,  "maxdurat":120, "duration":20,
                    "HcmSignalGroup":["sg1","sg3"],
                    "HcmInterphase":[
                        {"HcmPhase_Next":"ph1","durationveh":3,"InterphaseElement":[{"HcmSignalGroup":"sg5t","add_Green":2}]}
                    ]
                }
            ],
            "CycleOrder":["ph1","ph2","ph3"]
        },
        {
            "nameID":"c3",
            "cycle":120,
            "shift":80,
            "HcmSignalGroup":[
                {       "nameID":"sg1",         "HcmManeuver":[["4",180,60]]    },
                {       "nameID":"sg2",         "HcmManeuver":[["4",60,270]]    },
                {       "nameID":"sg3",         "HcmManeuver":[["4",180,270]]   },
                {       "nameID":"sg4p",        "HcmPedBicCross":[["4",60,0]]   },
                {       "nameID":"sg5p",        "HcmPedBicCross":[["4",60,1]]   }
            ],
            "HcmPhase":[
                {       "nameID":"ph1", "mindurat":20,  "maxdurat":120, "duration":20,
                    "HcmSignalGroup":["sg3","sg4p","sg5p"],
                    "HcmInterphase":[
                        {"HcmPhase_Next":"ph2","durationveh":3,"InterphaseElement":[]}
                    ]
                },
                {       "nameID":"ph2", "mindurat":20,  "maxdurat":120, "duration":20,
                    "HcmSignalGroup":["sg1","sg2"],
                    "HcmInterphase":[
                        {"HcmPhase_Next":"ph3","durationveh":3,"InterphaseElement":[]}
                    ]
                },
                {       "nameID":"ph3", "mindurat":20,  "maxdurat":120, "duration":20,
                    "HcmSignalGroup":["sg1","sg3","sg4p"],
                    "HcmInterphase":[
                        {"HcmPhase_Next":"ph1","durationveh":3,"InterphaseElement":[]}
                    ]
                }
            ],
            "CycleOrder":["ph1","ph2","ph3"]
        }
    ],
    "HcmRoad":[
        {
            "HcmEnter"      :[null,["1",0]],/*начало и конец дороги (если null тогда свободный конец) [id перекрёстка, позиция в град входа на перекр (можно задавать примерно +-20 - найдётся ближайший)]*/
            "lanes"         :[3,3],/*минимальное число полос на участке в прямом и обратном направлениях [шт]*/
            "max_queue"     :[0,0],/*число автомобилей, помещающихся в прямом и обратном направлении [шт]*/
            "length"        :[300,300],/*длина участка в прямом и обратном направлении [м]*/
            "speed"         :[60,60],/*скорость [км/ч]*/
            "capacity"      :[5000,5000],/*пропускная способность в прямом /обратном [авт/час]*/
            "geometry"      :{"y":[400,100],        "x":[0,0]},
            "tram":[{
                "lane":["L",1],/*R- трамвай в правой полосе, L-в левой полосе EL (R)-эксклюззивный слева(справа) ELB-эксклюззивный слева вместе с автобусами 1-номер полосы слева/справа*/
                "strip":null/*:"" "strip":5 "strip":[[5-ширина,20-длина,"stop"-остановка],2-ширина на остаточном участке]*/
            },{
                "lane":["L",1]
            }],
            "strip":0/*,,,"strip":5   "strip":[[5-ширина,20-длина],2-ширина на остаточном участке]разделитель между проезжими частями*/
        },
        {
            "HcmEnter":[["1",270],null],
            "lanes":[3,0],"max_queue":[0,0],"length":[300,0],"speed":[60,0],"capacity":[5000,0],
            "geometry"      :{"y":[100,100,70],"x":[0,-60,-210]}
        },
        {
            "HcmEnter":[["1",90],["4",270]],
            "lanes":[0,5],"max_queue":[0,29],"length":[0,40],"speed":[0,60],"capacity":[0,8600],
            "geometry"      :{"y":[100,100],"x":[0,50]}
        },
        {
            "HcmEnter":[["1",180],["2",0]],
            "lanes":[3,3],"max_queue":[22,22],"length":[50,50],"speed":[60,60],"capacity":[5000,5000],
            "geometry"      :{"y":[100,50],"x":[0,0]},
            "tram":[{"lane":["L",1]},{"lane":["L",1]}]
        },
        {
            "HcmEnter":[["2",270],null],
            "lanes":[0,3],"max_queue":[0,0],"length":[0,300],"speed":[0,60],"capacity":[0,5000],
            "geometry"      :{"y":[50,50,70],"x":[0,-60,-210]},
            "tram":[{"lane":["EL",1]},{"lane":["EL",1],"strip":1.0}]
        },
        {
            "HcmEnter":[["2",180],null],
            "lanes":[4,3],"max_queue":[0,0],"length":[300,300],"speed":[60,60],"capacity":[6800,5000],
            "geometry"      :{"y":[50,-250],"x":[0,0]},
            "tram":[{"lane":["L",1]},{"lane":["L",1]}]
        },
        {
            "HcmEnter":[["2",90],["3",270]],
            "lanes":[5,1],"max_queue":[38,38],"length":[54,54],"speed":[60,60],"capacity":[8600,1000],
            "geometry"      :{"y":[50,50],"x":[0,50]},
            "tram":[{"lane":["EL",1]},{"lane":["EL",1],"strip":1.0}]
        },
        {
            "HcmEnter":[["3",120],null],
            "lanes":[2,2],"max_queue":[0,0],"length":[300,300],"speed":[60,60],"capacity":[3600,3600],
            "geometry"      :{"y":[50,-100],"x":[50,350]},
            "tram":[{"lane":["L",1]},{"lane":["L",1]}]
        },
        {
            "HcmEnter":[["3",0],["4",180]],
            "lanes":[4,0],"max_queue":[29,0],"length":[50,0],"speed":[60,0],"capacity":[6800,0],
            "geometry"      :{"y":[50,100],"x":[50,50]}
        },
        {
            "HcmEnter":[["4",60],null],
            "lanes":[2,3],"max_queue":[0,0],"length":[300,300],"speed":[60,60],"capacity":[3600,5000],
            "geometry"      :{"y":[100,250],"x":[50,350]}
        }
    ]
};
