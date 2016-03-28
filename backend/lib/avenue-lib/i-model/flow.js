var _      = require('lodash');
var utils  = require('../utils/utils')();

function Flow(options, network, indexMap)
{
    var defaults = {
        id: _.uniqueId(),
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600,
        routeTime: 20,
        length: 300,
        dispersion: 0.5,
        intervals: [],
        edges: []
    };
    var flow = _.assign({}, defaults, options);

    this.id = flow.id;
    this.type = flow.type;
    this.edges = flow.edges;
    this.cycleTime      = parseInt(flow.cycleTime);
    this.avgIntensity   = parseInt(flow.avgIntensity);
    this.capacity       = parseInt(flow.capacity);
    this.avgIntensityPerSecond  = this.avgIntensity/3600;
    this.capacityPerSecond      = this.capacity/3600;
    this.inFlow         = [].fillArray(this.cycleTime, 0);
    this.outFlow        = [].fillArray(this.cycleTime, 0);
    this.length         = parseInt(flow.length);
    this.routeTime      = parseInt(flow.routeTime);
    this.dispersion     = parseFloat(flow.dispersion);
    this.intervals      = flow.intervals.map(function(v){
        return {
            s: parseInt(v[0]),
            f: parseInt(v[1]),
            length: v[1] - v[0]
        }
    });
    this.isCongestion   = false;
    this.maxQueueLength = 0;
    this.delay          = 0;
    this.network  = network;
    this.indexMap = indexMap;

    this.flipBack = function flipBack() {
        for (var i = 0; i < this.inFlow.length; i++){
            this.inFlow[i] = this.outFlow[i];
        }
    };

    this.merge = function merge(outFlow) {
        for (var i = 0; i < this.outFlow.length; i++){
            this.outFlow[i] = this.outFlow[i] + outFlow[i];
        }
    };

    this.copyFlow = function copyFlow() {
        for (var i = 0; i < this.inFlow.length; i++){
            this.outFlow[i] = this.inFlow[i];
        }
    };

    this.json = function json() {
        return {
            id: this.id,
            cycleTime: this.cycleTime,
            inFlow: this.inFlow,
            outFlow: this.outFlow,
            isCongestion: this.isCongestion,
            maxQueue: this.maxQueueLength,
            delay: this.delay
        }
    };

    this.getNode = function (id) {
        return this.network[this.indexMap[id]];
    };

    this.constantFlowCoeff = function(){
        var sum = 0;
        _.forEach(this.edges, function(v,i){
            sum += parseInt(v.portion);
        });
        return this.avgIntensity / sum;
    };

    this.initInFlow = function initInFlow() {
        var sumInTotal = 0;
        var hasOverflow = false;
        if (this.edges.length > 0) {
            var sourceNodes = this._flowSourceNodes();
            var cfc = this.constantFlowCoeff();
            var avFlow = this.avgIntensity / cfc / 3600;
            for (var i = 0; i < this.inFlow.length; i++){
                var sumI = 0;
                this.edges.map(function(el){
                    sumI +=  this._calcEdgePortionI(i, el, sourceNodes[el.source]);
                }, this);

                if (cfc <= 1) {
                    sumI = sumI * cfc;
                } else {
                    sumI += avFlow;
                }


                if (sumI > this.capacityPerSecond) {
                    hasOverflow = true;
                }
                this.inFlow[i] = sumI;
                sumInTotal += sumI;
            }
        }
        if (sumInTotal == 0) {
            this.inFlow = [].fillArray(this.cycleTime, this.avgIntensityPerSecond);
        }
        return hasOverflow;
    };

    this._calcEdgePortionI = function (i, edge, sourceNode, constFlowPerSecond){
        return sourceNode.outFlow[i] * parseInt(edge.portion) / sourceNode.avgIntensity;
    };

    this._flowSourceNodes = function () {
        var result = {};
        this.edges.map(function(el){
            var sourceNode = this.getNode(el.source);
            if (sourceNode.type == 'concurrent' && !el.hasOwnProperty('secondary')) {
                sourceNode = sourceNode.primary;
            }
            result[el.source] = sourceNode;
        }, this);

        return result;
    }
}


module.exports = Flow;
