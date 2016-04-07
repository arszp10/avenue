var AvenueApp = {
    Templates: {},
    Modules:   {
        controls:  {},
        cytoscape: {},
        editor: {},
        traffic:   {},
        apiCalls:  {},
        apiHandlers: {}
    },
    Resources: {},
    Controls: {},
    State: {
        clickMode: 'select-mode', // select, add-stopline, ... add-concurrent
        nodeType: 'stopline',
        lastModelingResult: [],
        lastErrors: [],
        coordinationPlan:{}
    },
    linkModules: function(){
        $.each(AvenueApp.Modules, function(i, v){
            if (v.hasOwnProperty('injectDependencies')) {
                v.injectDependencies(AvenueApp.Modules);
            }
        });
    },
    initModules: function(){
        $.each(AvenueApp.Modules, function(i, v){
            if (v.hasOwnProperty('initModule') && i != 'controls') {
                v.initModule(AvenueApp.Modules);
            }
        });
    }

};


$(document).ready(function() {

    var options   = AvenueApp.Resources.Settings.cytoscape;
    options.style = AvenueApp.Resources.CyStyles;
    options.ready = function() {
        var cy = $.extend(this, AvenueApp.Modules.cytoscape);
        AvenueApp.Modules.cytoscape = cy;
        cy.edgehandles({ });
        cy.panzoom({});


        AvenueApp.linkModules();
        AvenueApp.initModules();
    };

    AvenueApp.Modules.controls.initModule();
    AvenueApp.Controls.panels.cytoscape.cytoscape(options);

});

