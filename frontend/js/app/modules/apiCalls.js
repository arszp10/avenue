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

        modelExecute: function(data, options) {
            return action('POST:/api/model/execute', data, handlers.modelExecute, options);
        },
        offsetsOptimize: function(data, options) {
            return action('POST:/api/model/optimize/offsets', data, handlers.offsetsOptimize, options);
        },
        phasesOptimize: function(data, options) {
            return action('POST:/api/model/optimize/phases', data, handlers.phasesOptimize, options);
        },

        createModel: function(data, options) {
            return action('POST:/api/model/create', data, handlers.createModel, options);
        },
        saveModel: function(id, data, options) {
            return action('POST:/api/model/update/'+id, data, handlers.saveModel, options);
        },
        getModel: function(id, options) {
            return action('GET:/api/model/get/'+id, {}, handlers.getModel, options);
        },

    };

})(AvenueApp);
