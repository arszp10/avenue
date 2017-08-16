(function(App){
    var controls  = App.Controls;
    var templates = App.Templates;
    var cy, editor, modelManager, map, intersectionEditor;

    var nop = function(r,o){ };

    var sum = function(items, prop){
        return items.reduce( function(a, b){
            return b.hasOwnProperty(prop)
                ? a + parseFloat(b[prop])
                : a;
        }, 0);
    };

    var doneCalcHandler = function (r, options){
        if (r.success) {
            App.State.lastModelingResult = r.data;
            App.State.lastErrors = [];
            var data = {
                sumDelay            : sum(r.data, 'delay'),
                sumDelayPerHour     : sum(r.data, 'delayPerHour'),
                overSaturationDelay : sum(r.data, 'overSaturationDelay'),
                sumQueue            : sum(r.data, 'maxQueue')
            };
            controls.panels.statusBar.html(
                templates.sumDelayStatus(data, options.singleCrossroad)
            );
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
                doneCalcHandler(r, options);
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

                    cy.add(App.State.currentModel.content);
                    cy.viewport({
                        zoom: zoom, pan : { x:-1*extent.x1*zoom, y:-1*extent.y1*zoom }
                    });

                    if(App.State.currentModel.anchored) {
                        cy.cyZoom = r.data.position.cyZoom;
                        cy.cyBaseExtent = r.data.position.cyExtent;
                        cy.mapExtent = r.data.position.mapExtent;
                        cy.mapScale = r.data.position.mapScale;
                        cy.xC = r.data.position.xC;
                        cy.yC = r.data.position.yC;

                        if (map.Classes.Extent) {
                            cy.aveScaleCyToArcGis();
                        }

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
