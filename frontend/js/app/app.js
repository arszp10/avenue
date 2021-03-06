var AvenueApp = {
    Templates: {},
    Modules:   {},
    Resources: {},
    Controls:  {},
    State: {
        clickMode: 'select-mode', // select, add-stopline, ... add-concurrent
        nodeType:  'stopline',
        lastModelingResult: [],
        lastErrors: [],
        currentModel: {},
        selectedRoute: false,

        getSimulationData: function(nodeId){
            var results = this.lastModelingResult.filter(function(val){
                return val.id == nodeId;
            });
            return results.length > 0
                ? results[0]
                : false;
        }
    },

    linkModules: function(){
        $.each(AvenueApp.Modules, function(i, v){
            if (v.hasOwnProperty('injectDependencies')) {
                v.injectDependencies(AvenueApp.Modules);
            }
        });
        var v = AvenueApp.Templates;
        if (v.hasOwnProperty('injectDependencies')) {
            v.injectDependencies(AvenueApp.Modules);
        }
    },
    initModules: function(){
        $.each(AvenueApp.Modules, function(i, v){
            if (v.hasOwnProperty('initModule') ) {
                v.initModule();
            }
        });
    },
    run: function(){
        this.linkModules();
        this.initModules();
    }

};


$(document).ready(function() {
    AvenueApp.run();
});

