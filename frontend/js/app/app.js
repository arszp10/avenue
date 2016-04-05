var AvenueApp = {
    Templates: {},
    Modules:   {
        controls:  null,
        traffic:   null,
        cytoscape: null
    },
    Resources: {},
    Controls: {},
    State: {
        clickMode: 'select-mode', // select, add-stopline, ... add-concurrent
        nodeType: 'stopline',
        lastModelingResult: [],
        lastErrors: [],
        coordinationPlan:{}
    }

};


$(document).ready(function() {

    var options   = AvenueApp.Resources.Settings.cytoscape;
    options.style = AvenueApp.Resources.CyStyles;
    options.ready = function() {
        var cy = $.extend(this, AvenueApp.Modules.cytoscape);

        AvenueApp.Modules.cytoscape = cy;
        AvenueApp.Modules.controls.injectDependencies(AvenueApp.Modules);
        AvenueApp.Modules.cytoscape.injectDependencies(AvenueApp.Modules);

        cy.edgehandles({ });
        cy.panzoom({});
        cy.avenue();

    };

    AvenueApp.Modules.controls.initControls();
    AvenueApp.Controls.panels.cytoscape.cytoscape(options);

});

