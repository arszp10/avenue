(function(App){

    var locales = {
        ru: {
            'api-doc' : 'Документация API'
        },
        en: {
            'api-doc' : 'API DOC'
        }
    };

    App.Modules.locale = {
        injectDependencies: function(modules) {},
        initModule: function(){
            var browserLang = navigator.language || navigator.userLanguage;
            if (!locales.hasOwnProperty(browserLang)) {
                return;
            }

            $('[locale]').each(function(){
                var th = $(this);
                var text = locales[browserLang][th.attr('locale')];
                th.text(text);
            })
        }
    }

})(AvenueApp);
