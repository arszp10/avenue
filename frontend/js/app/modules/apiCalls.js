(function(App){
    var handlers;

    var action = function(url, data, handler, handlerOptions){
        var path = url.split(':');
        var method = path[0];
        var jqxhr;

        if (method !== 'GET') {
           jqxhr = $.ajax({
                method: path[0],
                url: path[1],
                data: data,
                dataType: 'json',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=UTF-8'
            });
        } else {
           jqxhr = $.ajax({
                method: path[0],
                url: path[1],
                data: data,
                dataType: 'json'
            });
        }



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

        singleCrossroadCycle: function(data, options) {
            return action('POST:/api/model/optimize/cycle-single', data, handlers.singleCrossroadCycle, options);
        },

        createModel: function(data, options) {
            return action('POST:/api/model/create', data, handlers.createModel, options);
        },
        saveModel: function(id, data, options) {
            return action('POST:/api/model/update/'+id, data, handlers.saveModel, options);
        },

        downloadModel: function(id) {
            window.location = '/api/model/download/'+id;
        },

        getModel: function(id, options) {
            return action('GET:/api/model/get/'+id, {}, handlers.getModel, options);
        },
        listModel: function(params, options) {
            return action('GET:/api/model/list', params, handlers.listModel, options);
        },
        removeModel: function(id, options) {
            return action('GET:/api/model/remove/'+id, {}, handlers.removeModel, options);
        },
        uploadImportFile: function($form, options){
            var jqxhr = $.ajax({
                method: 'POST',
                url: '/api/model/import',
                data: new FormData($form[0]),
                cache: false,
                contentType: false,
                processData: false
            });

            jqxhr.done(function(r){handlers.importModel.done(r, options)});
            jqxhr.fail(function(r){handlers.importModel.fail(r, options)});
        }
    };

})(AvenueApp);
