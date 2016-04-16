var AvenueApp = {
    Templates: {},
    Modules:   {
        controls:  {},
        cytoscape: {},
        editor: {},
        modelManager: {},
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
        currentModel: {}
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
            if (v.hasOwnProperty('initModule') && i != 'controls' && i != 'cytoscape' ) {
                v.initModule();
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
        AvenueApp.linkModules();
        AvenueApp.Modules.cytoscape.initModule();

        cy.edgehandles({ });
        cy.panzoom({});
    };

    AvenueApp.Modules.controls.initModule();
    AvenueApp.initModules();
    AvenueApp.linkModules();
    AvenueApp.Controls.panels.cytoscape.cytoscape(options);

});

