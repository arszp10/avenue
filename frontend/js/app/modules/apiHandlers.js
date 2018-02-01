(function(App){
    var controls  = App.Controls;
    var templates = App.Templates;
    var cy, editor,routes, modelManager, map, intersectionEditor;

    var nop = function(r,o){ };


    function sumOfDelaysVector(arr, acceptedNodesArray){
        return arr.filter(
            function(node){
                return acceptedNodesArray.indexOf(node.type) > -1
            }
        ).reduce(function(pv, cv) {
            return {
                delay               : pv.delay + parseFloat(cv.delay)|0,
                delayPerHour        : pv.delayPerHour + parseFloat(cv.delayPerHour)|0,
                overSaturationDelay : pv.overSaturationDelay + parseFloat(cv.overSaturationDelay)|0,
                maxQueue            : pv.maxQueue + parseFloat(cv.maxQueue)|0
            }
        },
        {
            delay : 0,
            delayPerHour: 0,
            overSaturationDelay: 0,
            maxQueue: 0
        });
    }

    var doneCalcHandler = function (r, options){
        if (r.success) {
            App.State.lastModelingResult = r.data;
            App.State.lastErrors = [];

            var dataPedestrians = sumOfDelaysVector(r.data, ['pedestrian']);
            var dataVehicles = sumOfDelaysVector(r.data, ['stopline', 'carriageway', 'bottleneck', 'concurrent', 'concurrentMerge']);

            controls.panels.statusBar.html(
                templates.sumDelayStatus(dataVehicles, dataPedestrians, options.singleCrossroad)
            );

            if (controls.buttons.btnShowRoutes.parent().hasClass('active')){
                routes.refreshSelectedRoute();
            }

        } else {
            App.State.lastModelingResult = [];
            App.State.lastErrors = r.data;
            r.data.map(function (v) {
                cy.getElementById(v.node).addClass('has-error');
            });
        }
        $.notify(r.message, {
            position: 'top right',
            className: r.success ? "success" : "error"
        });
    };

    var failCalcHandler = function(r, o){
        console.log("API request error!");
    };

    var alwaysCalcHandler = function(options){
        if (!options) {
            return;
        }
        options.icon.removeClass('fa-spin');
    };

    App.Modules.apiHandlers = {
        injectDependencies: function(modules) {
            cy      = modules.cytoscape;
            editor  = modules.editor;
            modelManager = modules.modelManager;
            map = modules.map;
            routes = modules.routes;
            intersectionEditor = modules.intersectionEditor;
        },
        initModule: nop,

        modelExecute: {
            done: doneCalcHandler,
            fail: failCalcHandler,
            always: alwaysCalcHandler
        },
        offsetsOptimize: {
            done: function(r, options){
                if (!r.success) {
                    return;
                }
                r.data.map(function(v){
                    if (v.type == 'crossRoad') {
                        var crossroad = cy.getElementById(v.id).data();
                        var program = crossroad.programs[crossroad.currentProgram];
                        program.offset = parseInt(v.offset);
                    }
                });
                doneCalcHandler(r, options);
            },
            fail: failCalcHandler,
            always: alwaysCalcHandler
        },
        phasesOptimize: {
            done: function(r, options){
                doneCalcHandler(r,options);
                if (!r.success) {
                    return;
                }
                r.data.map(function(v){
                    if (v.type == 'crossRoad') {
                        cy.getElementById(v.id).data('phases', v.phases);
                    }
                });
            },
            fail: failCalcHandler,
            always: alwaysCalcHandler
        },

        singleCrossroadCycle:{
            done: function(r, options){
                intersectionEditor.renderCycleGraphData(r.data);
            },
            fail: failCalcHandler,
            always: alwaysCalcHandler
        },
        createModel: {
            done: function(r,o){
                if (r.success) {
                    window.location = '/app/' + r.data.id;
                }
            },
            fail: nop,
            always: nop
        },
        saveModel: {
            done: function(r, o){
                $.notify(r.message, {
                    position: 'top right',
                    className: r.success ? "success" : "error"
                });
            },
            fail: nop,
            always: function(options){
                options.removeClass('fa-spin fa-spinner');
                options.addClass('fa-save');
            }
        },
        getModel: {
            done: function(r,o){
                if (r.success) {
                    var defaults = {
                        routes: [],
                        content: [],
                        anchored: false,
                        showMapInBackground: false,
                        intertactOrder: 'after',
                        defaultIntensity: 600,
                        defaultCapacity: 1800
                    };
                    App.State.currentModel = $.extend({}, defaults, r.data);

                    var zoom = r.data.hasOwnProperty('position') ? r.data.position.cyZoom : 1;
                    var extent = r.data.hasOwnProperty('position')
                        ? $.extend({x1: 0, y1:0}, r.data.position.cyExtent)
                        : {x1: 0, y1:0};

                    var content = App.State.currentModel.content.map(function(element){
                        switch (element.data.type) {
                            case 'carriageway': element.data.icon = '\u0079'; break;
                            case 'point': element.data.icon = '\u0071'; break;
                            case 'bottleneck': element.data.icon = '\u0076'; break;
                            case 'concurrent': element.data.icon = '\u0067'; break;
                            case 'concurrentMerge': element.data.icon = '\u0068'; break;
                        } ;
                        return element;
                    });

                    cy.add(content);
                    //var cySize = r.data.position.cySize;
                    //var cwe = (cy.width()-cySize.width)/2;
                    //var che = (cy.height()-cySize.height)/2;
                    cy.viewport({
                        zoom: zoom, pan : { x:-1*extent.x1*zoom, y:-1*extent.y1*zoom }
                    });

                    if (r.data.position) {
                        cy.cyZoom = r.data.position.cyZoom;
                        cy.cyBaseExtent = r.data.position.cyExtent;
                        cy.mapExtent = r.data.position.mapExtent;
                        cy.mapScale = r.data.position.mapScale;
                        cy.xC = r.data.position.xC;
                        cy.yC = r.data.position.yC;
                        var pos = cy.aveGetExtents();
                        map.mapSetExtentAndScale(pos);
                    }
                    
                    if(App.State.currentModel.anchored) {
                        var button = controls.buttons.btnArcgisSetExtent;
                        var icon = button.find('i');
                            button.toggleClass('active');
                            icon.toggleClass('fa-rotate-90');
                    }
                    if (App.State.currentModel.showMapInBackground) {
                        controls.buttons.btnArcgisSwitch.click();
                    }

                    delete App.State.currentModel.content;
                    editor.renderRoutesDropDown();
                }
            },
            fail: nop,
            always: nop
        },
        listModel:{
            done: function(r,o){
                if (r.data.table.length == 0 && modelManager.getState().text.length == 0) {
                    controls.panels.modelListPanel.addClass('hidden');
                    controls.panels.welcomePanel.removeClass('hidden');
                } else {
                    controls.panels.welcomePanel.addClass('hidden');
                    controls.panels.modelListPanel.removeClass('hidden');
                    controls.panels.modelListTable.empty();
                    controls.panels.modelPagesStat.removeClass('hidden');
                    if (r.data.total == 0) {
                        controls.panels.modelListTable.append(
                            templates.modelEmptyListRow(modelManager.getState())
                        );
                    } else {
                        r.data.table.map(function(v){
                            controls.panels.modelListTable.append(
                                templates.modelListRow(v, modelManager.getState())
                            );
                        });
                    }

                    controls.labels.labelModelPagesStart.text(r.data.start);
                    controls.labels.labelModelPagesFinish.text(r.data.finish);
                    controls.labels.labelModelPagesTotal.text(r.data.total);
                    modelManager.setPage(r.data.page);
                }
            },
            fail: nop,
            always: nop
        },
        removeModel: {
            done: function(r,ready){ if (r.success) { ready(); } },
            fail: nop,
            always: nop
        },
        importModel: {
            done: function(r, ready){
                if (r.success) {
                    ready();
                    window.location = '/app/' + r.data.id;
                } else {
                    $.notify(r.message, {
                        position: 'top center',
                        className: 'error'
                    });
                }
            },
            fail: failCalcHandler
        }

    };

})(AvenueApp);
