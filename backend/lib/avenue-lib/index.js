var _ = require('lodash');
var validate = require('validate.js');
var utils       = require('./utils/utils')();

var objects = {
    stopline:       require('./i-model/stop-line'),
    carriageway:    require('./i-model/carriageway'),
    bottleneck:     require('./i-model/bottleneck'),
    concurrent:     require('./i-model/competitor'),
    concurrentMerge:require('./i-model/competitor-merge'),
    point:          require('./i-model/point'),
    crossRoad:      require('./i-model/crossroad')
};


var headerConstraints        = require('./constraints/header');
var nodeConstraints          = require('./constraints/node');
var edgeConstraints          = require('./constraints/edge');
var carriagewayConstraints   = require('./constraints/carriageway');
var crossroadConstraints     = require('./constraints/cross-road');
var phasesConstraints        = require('./constraints/phase-data');
var stoplineConstraints      = require('./constraints/stopline');
var extraConstraints         = require('./constraints/parametrized');

_.assign(validate.validators, require('./validators/custom'));

module.exports = {

    recalculate: function(request){
        if (request.length == 0) {
            return [];
        }

        var network = request;
        var indexMap = {};

        var getNode = function (id) {
            return network[indexMap[id]];
        };

        var setNodeProperty = function (id, prop, value) {
            network[indexMap[id]][prop] = value;
        };

        var pushToNodeProperty = function (id, prop, value) {
            if (!network[indexMap[id]].hasOwnProperty(prop)){
                network[indexMap[id]][prop] = [value];
            } else {
                network[indexMap[id]][prop].push(value);
            };
        };

        var traceRoute = function(nodes, w, trace){
            _.forEach(nodes, function(id){
                var node = getNode(id);
                var nextWeight =  w + 1;

                // if a loop
                if (trace.indexOf(id) > -1) {
                    return;
                }

                if (node.weight < nextWeight) {
                    setNodeProperty(id, 'weight', nextWeight);
                    if (node.hasOwnProperty('to')) {
                        var clone = trace.slice(0);
                        clone.push(id);
                        traceRoute(node.to, nextWeight, clone);
                    }
                }
            });
        };

        _.forEach(network, function(v, i){
            indexMap[v.id] = i;
            v['weight'] = 0;
        });

        _.forEach(network, function(v){
            if (v.hasOwnProperty('edges')) {
                v.edges.map(function(e){
                    pushToNodeProperty(e.target, 'from', e.source);
                    pushToNodeProperty(e.source, 'to', e.target);
                }, this);
            }
        });

        var outterNodes = [];
        _.forEach(network, function(v){
            if (!v.hasOwnProperty('edges') && v.type != 'crossRoad') {
                outterNodes.push(v.id);
            }
        });

        if (outterNodes.length == 0) {
            outterNodes.push(network[0].id);
        }

        traceRoute(outterNodes, 0, []);
        network.sort(function (a, b) { return a.weight - b.weight;});

         _.forEach(network, function(v, i){
            indexMap[v.id] = i;
            network[i] = new objects[v.type](v, network, indexMap);
        });

        for (var i = 0; i < 1; i++) {
            _.forEach(network, function(v, i){
                v.calc();
            });
        }

        var result = network.map(function(v){
           return v.json();
        });

        return result;
    },

    _errors : [],
    _validate: function(node, constraints, type, parentId){
        var err = validate(node, constraints, {format: 'flat'});
        if (err === undefined) {
            return true;
        }
        var nodeId = '';
        switch (type) {
            case "edge" :
                nodeId = node.target;
                break;
            case "phase" :
                nodeId = parentId;
                break;
            default:
                nodeId = node.id;
        }
        this._errors.push({
            node: nodeId,
            errors: err
        });
        return false;
    },

    validate : function(data) {
        var parents = {};
        var parentsIds = [];
        var targetIds = [];
        this._errors = [];

        if (validate.isEmpty(data)) {return this._errors;}

        /* First iteration  */
        data.map(function(v, inx){
            if (! this._validate(v, headerConstraints)) {
                return;
            };
            var res = false;
            switch (v.type) {
                case "crossRoad":
                   res = this._validate(v, crossroadConstraints);
                   if (res) {
                        v.phases.map(function(a){
                            this._validate(a, phasesConstraints, 'phase', v.id);
                        }, this);
                        parents[v.id] = inx;
                        parentsIds.push(v.id);
                   }
                   break;
                case "carriageway":
                    this._validate(v, carriagewayConstraints);
                    this._validate(v, nodeConstraints);
                    break;
                case "stopline":
                    this._validate(v, stoplineConstraints);
                    this._validate(v, nodeConstraints);
                    break;
                default:
                    this._validate(v, nodeConstraints);
            }
            if (v.hasOwnProperty('edges') && v.edges.length > 0) {
                v.edges.map(function(v) {
                    this._validate(v, edgeConstraints, 'edge');
                }, this);
            }
            if (this._errors.length === 0) {
                targetIds.push(v.id);
            }
        }, this);

        /* Extra iteration  */
        if (this._errors.length === 0) {
            data.map(function(v, inx){
                if (v.type == 'stopline' && v.hasOwnProperty('parent')) {
                    var constr = extraConstraints.stoplineExtra(parentsIds, data[parents[v.parent]].phases.lenght);
                    this._validate(v, constr);
                    return;
                }
                if (v.hasOwnProperty('edges') && v.edges.length > 0) {
                    v.edges.map(function(v) {
                        var constr = extraConstraints.edgeExtra(targetIds);
                        this._validate(v, constr, 'edge');
                    }, this);
                    return;
                }
            }, this);
        }

        return  this._errors;
    }
};

