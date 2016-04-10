(function(App){
    var handlers;

    var action = function(url, data, handler, handlerOptions){
        var path = url.split(':');
        var jqxhr = $.ajax({
            method: path[0],
            url: path[1],
            data: data,
            dataType: 'json'
        });

        if (handler.hasOwnProperty('done')) {
            jqxhr.done(function(r){handler.done(r, handlerOptions)});
        }
        if (handler.hasOwnProperty('fail')) {
            jqxhr.fail(function(r){handler.fail(r, handlerOptions)});
        }
        if (handler.hasOwnProperty('always')) {
            jqxhr.always(function(r){handler.always(handlerOptions)});
        }

    };

    App.Modules.apiCalls = {
        injectDependencies: function(modules) {
            handlers = modules.apiHandlers;
        },
        initModule: function(){},
        recalculate: function(data, options) {
            return action('POST:/api/model/recalculate', data, handlers.recalculate, options);
        },
        optimize: function(data, options) {
            return action('POST:/api/model/optimize', data, handlers.optimize, options);
        }
    };

})(AvenueApp);
