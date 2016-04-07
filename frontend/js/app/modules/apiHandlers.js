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

    App.Modules.apiHandlers = {
        injectDependencies: function(modules) {
            cy      = modules.cytoscape;
            editor  = modules.editor;
        },
        initModule: function(){},

        recalculate: {
            done: function(r, options){
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
            },
            fail: function(r, o){
                console.log("API request error!");
            },
            always: function(options){
                options.removeClass('fa-spin');
            }
        }
    };

})(AvenueApp);
