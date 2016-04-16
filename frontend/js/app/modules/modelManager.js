(function(App){
    var controls  = App.Controls;
    var api;
    var that;

    App.Modules.modelManager = {
        injectDependencies: function(modules) {
            api   = modules.apiCalls;
        },
        initModule: function(){
            that = this;
            controls.buttons.btnCreateNewModel.click(function(){
                api.createModel();
            });
        }
    }
})(AvenueApp);

