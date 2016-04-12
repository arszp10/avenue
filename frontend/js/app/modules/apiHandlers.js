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
        if (r.result) {
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
            className: r.result ? "success" : "error"
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

        recalculate: {
            done: doneCalcHandler,
            fail: failCalcHandler,
            always: alwaysCalcHandler
        },
        offsetsOptimize: {
            done: function(r, options){
                doneCalcHandler(r);
                if (!r.result) {
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
                if (!r.result) {
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
        }
    };

})(AvenueApp);
