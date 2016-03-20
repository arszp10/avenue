var _ = require('lodash');
var validate = require('validate.js');
var utils       = require('./utils/utils')();
var CrossRoad   = require('./i-model/crossroad');
var Point       = require('./i-model/point');
var StopLine    = require('./i-model/stop-line');
var CarriageWay = require('./i-model/carriageway');
var BottleNeck  = require('./i-model/bottleneck');
var Competitor  = require('./i-model/competitor');
var CompetitorMerge  = require('./i-model/competitor-merge');

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
    calc: function(request){

        var edges = {};
        var network = request.nodes;

        _.forEach(request.edges, function(v,i){
            if (!edges.hasOwnProperty(v.target)) {
                edges[v.target] = [];
            }
            edges[v.target].push(v);
        });


        _.forEach(network, function(v, i){
            switch (v.type) {
                case "stopline":
                    network[i] = new StopLine(v, edges[i], network);
                    break;
                case "carriageway":
                    network[i] = new CarriageWay(v, edges[i], network);
                    break;
                case "bottleneck":
                    network[i] = new BottleNeck(v, edges[i], network);
                    break;
                case "concurrent":
                    request.nodes[i] = new Competitor(v, edges[i], network);
                    break;
                case "concurrentMerge":
                    request.nodes[i] = new CompetitorMerge(v, edges[i], network);
                    break;
                case "point":
                    network[i] = new Point(v, edges[i], network);
                    break;
                case "crossRoad":
                    network[i] = new CrossRoad(v, network);
                    break;
                //default:
                //    request.nodes[i] = new StopLine(v);
            }
        });

        console.log('calc start');
        for (var i = 0; i < 5; i++) {
            _.forEach(network, function (v) {
                v.calc();
            });
        }
        console.log('calc end');

        var result = {};
        _.forEach(network, function(v, i){
           result[i] = v.json();
        });

        console.log('calc result');
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


