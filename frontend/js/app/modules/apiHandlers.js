(function(App){
    var controls  = App.Controls;
    var templates = App.Templates;
    var cy;
    var editor;


    var sum = function(items, prop){
        return items.reduce( function(a, b){
            return b.hasOwnProperty(prop)
                ? a + parseFloat(b[prop])
                : a;
        }, 0);
    };

    var doneCalcHandler = function (r){
        if (r.success) {
            App.State.lastModelingResult = r.data;
            App.State.lastErrors = [];
            var sumDelay = sum(r.data, 'delay');
            controls.panels.statusBar.html(
                templates.sumDelayStatus(sumDelay)
            );
        } else {
            App.State.lastModelingResult = [];
            App.State.lastErrors = r.data;
            r.data.map(function (v) {
                cy.getElementById(v.node).addClass('has-error');
            });
        }
        $.notify(r.message, {
            position: 'top center',
            className: r.success ? "success" : "error"
        });
    };

    var failCalcHandler = function(r, o){
        console.log("API request error!");
    };

    var alwaysCalcHandler = function(options){
        options.removeClass('fa-spin');
    };

    App.Modules.apiHandlers = {
        injectDependencies: function(modules) {
            cy      = modules.cytoscape;
            editor  = modules.editor;
        },
        initModule: function(){},

        modelExecute: {
            done: doneCalcHandler,
            fail: failCalcHandler,
            always: alwaysCalcHandler
        },
        offsetsOptimize: {
            done: function(r, options){
                doneCalcHandler(r);
                if (!r.success) {
                    return;
                }
                r.data.map(function(v){
                    if (v.type == 'crossRoad') {
                        cy.getElementById(v.id).data('offset', parseInt(v.offset));
                    }
                });
            },
            fail: failCalcHandler,
            always: alwaysCalcHandler
        },
        phasesOptimize: {
            done: function(r, options){
                doneCalcHandler(r);
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
        createModel: {
            done: function(r,o){
                if (r.success) {
                    window.location = '/app/' + r.data.id;
                }
            },
            fail: function(r,o){

            },
            always: function(r,o){

            }
        },
        saveModel: {
            done: function(r,o){
                console.log(r);
            },
            fail: function(r,o){

            },
            always: function(r,o){

            }
        },
        getModel: {
            done: function(r,o){
                if (r.success) {
                    App.State.currentModel = r.data;
                    var content = r.data.content === undefined ? [] : r.data.content;
                    cy.add(content);
                    delete App.State.currentModel.content;
                }
            },
            fail: function(r,o){
                console.log(r.responseJSON);
            },
            always: function(r,o){

            }
        },
        listModel:{
            done: function(r,o){
                console.log(r);
                if (!r.data || r.data.length == 0) {
                    controls.panels.modelListPanel.addClass('hidden');
                    controls.panels.welcomePanel.removeClass('hidden');
                } else {
                    controls.panels.welcomePanel.addClass('hidden');
                    controls.panels.modelListPanel.removeClass('hidden');
                    controls.panels.modelListTable.empty();
                    r.data.map(function(v){
                        controls.panels.modelListTable.append(templates.modelListRow(v));
                    });

                }
            },
            fail: function(r,o){

            },
            always: function(r,o) {

            }
        }

    };

})(AvenueApp);