(function(App){
    var controls  = App.Controls;
    var api;
    var that;

    App.Modules.modelManager = {
        injectDependencies: function(modules) {
            api   = modules.apiCalls;
        },

        initModule: function(){
            if (!controls.panels.modelListPanel.length) {
                return;
            }

            that = this;
            var cookie = JSON.parse($.cookie('_avenue').substr(2));

            controls.labels.labelWelcomeUsername.text(cookie.fullName);
            controls.buttons.btnCreateNewModel.click(function(){
                api.createModel();
            });

            api.listModel(1);


        }
    }
})(AvenueApp);

