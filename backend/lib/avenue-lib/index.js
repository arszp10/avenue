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

var headerConstraints   = require('./constraints/header');
var nodeConstraints   = require('./constraints/node');
var edgeConstraints   = require('./constraints/edge');
var carriagewayConstraints   = require('./constraints/carriageway');
var crossRoadConstraints = require('./constraints/cross-road');

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
    _nodeValidate: function(node, constraints, edge){
        var err = validate(node, constraints, {format: 'flat'});
        if (err === undefined) {
            return true;
        }
        this._errors.push({
            node: edge ? node.target : node.id,
            errors: err
        });
        return false;
    },

    validate : function(data) {
        this._errors = [];
        data.map(function(v){
            if (! this._nodeValidate(v, headerConstraints)) {
                return;
            };
            switch (v.type) {
                case "crossRoad":
                    this._nodeValidate(v, crossRoadConstraints);
                    break;
                case "carriageway":
                    this._nodeValidate(v, carriagewayConstraints);
                default:
                    this._nodeValidate(v, nodeConstraints);
            }
            if (v.hasOwnProperty('edges') && v.edges.length > 0) {
                v.edges.map(function(v) {
                    this._nodeValidate(v, edgeConstraints, true);
                }, this);
            }
        }, this);
        return  this._errors;
    }
};


