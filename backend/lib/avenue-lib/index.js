var _         = require('lodash');
var validate  = require('validate.js');
var utils     = require('./utils/utils')();
var settings  = require('./settings');
var traffic   = require('./traffic');
var Network     = require('./network');

var headerConstraints        = require('./constraints/header');
var nodeConstraints          = require('./constraints/node');
var edgeConstraints          = require('./constraints/edge');
var carriagewayConstraints   = require('./constraints/carriageway');
var concurrentConstraints   = require('./constraints/concurrent');
var crossroadConstraints     = require('./constraints/cross-road');
var phasesConstraints        = require('./constraints/phase-data');
var stoplineConstraints      = require('./constraints/stopline');
var extraConstraints         = require('./constraints/parametrized');

Object.assign(validate.validators, require('./validators/custom'));

module.exports = {
    errors : [],

    checkConstraint: function(node, constraints, options){
        var err = validate(node, constraints, {format: 'flat'});
        if (err === undefined) return true;

        var defaults = {
            type: 'none',
            parentId: ''
        };

        options = Object.assign(defaults, options);

        var nodeId = {
            edge : node.target,
            phase : options.parentId,
            none: node.id
        };

        this.errors.push({
            node: nodeId[options.type],
            errors: err
        });

        return false;
    },

    isEmptyRequest: function(request){
        return request == undefined || request.length == 0;
    },

    optimizeSplits: function(request){
        if (this.isEmptyRequest(request)) return [];
        this.replacePercentPortionToAbs(request);
        var network = new Network(request);
        return network
            .simulate(3)
            .optimizeSplits()
            .simulate(3)
            .json();
    },

    optimizeOffsets: function(request){
        if (this.isEmptyRequest(request)) return [];
        this.replacePercentPortionToAbs(request);
        var network = new Network(request);
        return network.optimizeOffsets(1).json();

    },

    simulate: function(request){
        if (this.isEmptyRequest(request)) return [];
        this.replacePercentPortionToAbs(request);
        var network = new Network(request);
        return network.simulate(5).json();

    },

    validate : function(data) {
        var parents = {};
        var parentsIds = [];
        var targetIds = [];
        var sourcesPortionSum = {};
        this.errors = [];

        if (validate.isEmpty(data)) {return this.errors;}

        /* First iteration  */
        data.map(function(node, inx){
            if (! this.checkConstraint(node, headerConstraints)) { return;  }
            var res = false;
            switch (node.type) {
                case "crossRoad":
                    res = this.checkConstraint(node, crossroadConstraints);
                    if (res) {
                        node.phases.map(function(a){
                            this.checkConstraint(a, phasesConstraints, {type:'phase', parentId: node.id});
                        }, this);
                        parents[node.id] = inx;
                        parentsIds.push(node.id);
                    }
                    break;
                case "carriageway":
                    this.checkConstraint(node, carriagewayConstraints);
                    this.checkConstraint(node, nodeConstraints);
                    break;
                case "stopline":
                    this.checkConstraint(node, stoplineConstraints);
                    this.checkConstraint(node, nodeConstraints);
                    break;
                case "concurrent":
                case "concurrentMerge":
                    this.checkConstraint(node, concurrentConstraints);
                default:
                    this.checkConstraint(node, nodeConstraints);
            }
            if (node.hasOwnProperty('edges') && node.edges.length > 0) {
                node.edges.map(function(edge) {

                    var portion = this.portionPercentToAbs(edge, data);
                    edge.portion = portion;

                    if (! this.checkConstraint(edge, edgeConstraints, {type:'edge'})) {
                        return;
                    }

                    if (edge.hasOwnProperty('secondary')) {
                        return;
                    }

                    if (!sourcesPortionSum.hasOwnProperty(edge.source)) {
                        sourcesPortionSum[edge.source] = parseInt(edge.portion);
                    } else {
                        sourcesPortionSum[edge.source] += parseInt(edge.portion);
                    }

                }, this);
            }
            if (this.errors.length === 0) {
                targetIds.push(node.id);
            }
        }, this);


        if (this.errors.length !== 0) {
            return  this.errors;
        }

        /* Extra iteration  */
        data.map(function(node){
            if (sourcesPortionSum.hasOwnProperty(node.id) && node.type != 'concurrent') {
                this.checkConstraint(node, extraConstraints.sumOfOutterEdges(sourcesPortionSum[node.id]));
            }
            if (node.type == 'stopline' && node.hasOwnProperty('parent')) {
                var constr = extraConstraints.stoplineExtra(parentsIds, data[parents[node.parent]].phases.lenght);
                this.checkConstraint(node, constr);
                return;
            }
            if (node.hasOwnProperty('edges') && node.edges.length > 0) {
                node.edges.map(function(edge) {
                    var constr = extraConstraints.edgeExtra(targetIds);
                    this.checkConstraint(edge, constr, {type:'edge'});
                }, this);
                return;
            }
        }, this);


        return  this.errors;
    },

    replacePercentPortionToAbs: function(request){
        var that = this;
        request.map(function(node, inx){
            if (node.hasOwnProperty('edges') && node.edges.length > 0) {
                node.edges.map(function(edge) {
                    edge.portion = that.portionPercentToAbs(edge, request);
                })
            }
        });
    },

    portionPercentToAbs: function portionPercentToAbs(edge, data){
        if (!edge.hasOwnProperty('source') || !edge.hasOwnProperty('portion')) {
            return 0;
        }

        var lastChar = (edge.portion + '').slice(-1);
        if (lastChar !== '%') {
            return edge.portion;
        }

        var percent = edge.portion.substring(0, edge.portion.length - 1);
        var source = edge.source;

        percent = parseInt(percent);
        percent = isNaN(percent) ? 0 : percent;
        percent = percent > 100 ? 100 : percent;
        percent = percent < 0 ? 0 : percent;

        var node = _.find(data, {id: source});
        if (!node || !node.hasOwnProperty('avgIntensity')) { return 0;}

        var result = parseInt(parseInt(node.avgIntensity) * percent / 100);
        var result = isNaN(result) ? 0 : result;

        return result;
    }

};


