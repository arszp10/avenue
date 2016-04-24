(function(App){
    var controls  = App.Controls;
    var api;
    var that;
    var state = {
        page:  1,
        limit: 10,
        text:  '',
        orderBy: '-updatedAt'
    };

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


            controls.buttons.btnsModelOrder.click(function(e){
                controls.buttons.btnsModelOrder.removeClass('hidden');
                state.orderBy = $(this).data('order');
                state.page = 1;
                $(this).addClass('hidden');
                api.listModel(state);
            });

            controls.buttons.btnModePagePrev.click(function(){
                state.page--;
                api.listModel(state);
            });

            controls.buttons.btnModePageNext.click(function(){
                state.page++;
                api.listModel(state);
            });

            controls.inputs.inputModelSearchForm.submit(function(){
                state.text = controls.inputs.inputModelSearch.val();
                state.page = 1;
                api.listModel(state);
                return false;
            });


            $(document).on('click', 'a.btn-model-remove', function(){
                var id = $(this).closest('tr').data('id');
                api.removeModel(id, function(){api.listModel(state);});
            });

            api.listModel(state);

        },

        setPage: function(p){
            state.page = p;
        },

        getState: function(p){
            return state;
        }
    }
})(AvenueApp);

