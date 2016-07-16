var _           = require('lodash');
var validate    = require('validate.js');
var utils       = require('./utils/utils')();
var settings    = require('./settings');
var Network     = require('./network');


var headerConstraints        = require('./constraints/header');
var nodeConstraints          = require('./constraints/node');
var edgeConstraints          = require('./constraints/edge');
var freewayConstraints       = require('./constraints/freeway');
var conflictingConstraints   = require('./constraints/conflicting-approach');
var intersectionConstraints  = require('./constraints/intersection');
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

        var network = new Network(request);
        return network
            .simulate(3)
            .optimizeSplits()
            .simulate(3)
            .json();
    },

    optimizeOffsets: function(request){
        if (this.isEmptyRequest(request)) return [];

        var network = new Network(request);
        return network.optimizeOffsets(1).json();

    },

    simulate: function(request){
        if (this.isEmptyRequest(request)) return [];

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
                case "intersection":
                    res = this.checkConstraint(node, intersectionConstraints);
                    if (res) {
                        node.phases.map(function(a){
                            this.checkConstraint(a, phasesConstraints, {type:'phase', parentId: node.id});
                        }, this);
                        parents[node.id] = inx;
                        parentsIds.push(node.id);
                    }
                    break;
                case "freeway":
                    this.checkConstraint(node, freewayConstraints);
                    this.checkConstraint(node, nodeConstraints);
                    break;
                case "stopline":
                    this.checkConstraint(node, stoplineConstraints);
                    this.checkConstraint(node, nodeConstraints);
                    break;
                case "conflictingApproach":
                case "entranceRamp":
                    this.checkConstraint(node, conflictingConstraints);
                default:
                    this.checkConstraint(node, nodeConstraints);
            }
            if (node.hasOwnProperty('edges') && node.edges.length > 0) {
                node.edges.map(function(node) {

                    if (! this.checkConstraint(node, edgeConstraints, {type:'edge'})) {
                        return;
                    }

                    if (node.hasOwnProperty('secondary')) {
                        return;
                    }

                    if (!sourcesPortionSum.hasOwnProperty(node.source)) {
                        sourcesPortionSum[node.source] = parseInt(node.portion);
                    } else {
                        sourcesPortionSum[node.source] += parseInt(node.portion);
                    }

                }, this);
            }
            if (this.errors.length === 0) {
                targetIds.push(node.id);
            }
        }, this);

        /* Extra iteration  */
        if (this.errors.length !== 0) {
            return  this.errors;
        }    
        
        data.map(function(node){
            if (sourcesPortionSum.hasOwnProperty(node.id) && node.type != 'conflictingApproach') {
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
    }

};


