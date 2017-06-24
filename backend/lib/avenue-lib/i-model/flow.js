var _      = require('lodash');
var utils  = require('../utils/utils')();

function Flow(options, network)
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
        edges: [],
        weight: 1,
        queueLimit: 0
    };
    var flow = Object.assign({}, defaults, options);

    this.id = flow.id;
    this.type = flow.type;
    this.edges = flow.edges;
    this.tag = flow.tag;
    this.parent = flow.parent;
    this.greenPhases = flow.greenPhases;
    this.cycleTime      = parseInt(flow.cycleTime);
    this.avgIntensity   = parseInt(flow.avgIntensity);
    this.capacity       = parseInt(flow.capacity);
    this.secondaryFlowCapacity  = parseInt(flow.secondaryFlowCapacity);
    this.avgIntensityPerSecond  = this.avgIntensity/3600;
    this.capacityPerSecond      = this.capacity/3600;
    this.inFlow         = [].fillArray(this.cycleTime, 0);
    this.outFlow        = [].fillArray(this.cycleTime, 0);
    this.length         = parseInt(flow.length);
    this.routeTime      = parseInt(flow.routeTime);
    this.dispersion     = parseFloat(flow.dispersion);
    this.weight         = parseInt(flow.weight);
    this.queueLimit     = parseInt(flow.queueLimit);
    this.intervals      = flow.intervals.map(function(v){
        return {
            s: parseInt(v[0]),
            f: parseInt(v[1]),
            length: v[1] - v[0]
        }
    });

    var last = this.intervals.last();
    var first = this.intervals.first();
    if (last && first) {
        if ((last.f + 1) % this.cycleTime == first.s) {
            last.length += first.length;
        }
    }
    this.sourceNodes = false;
    this.isCongestion   = false;
    this.maxQueueLength = 0;
    this.delay          = 0;
    this.greenSaturation = 0;
    this.network  = network;
    this.sumInFlow = 0;
    this.sumOutFlow = 0;

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
            type: this.type,
            cycleTime: this.cycleTime,
            inFlow: this.inFlow,
            outFlow: this.outFlow,
            isCongestion: this.isCongestion,
            maxQueue: this.maxQueueLength,
            queueLimit: this.queueLimit,
            delay: this.delay,
            greenSaturation: this.greenSaturation,
            sumInFlow: this.sumInFlow,
            sumOutFlow: this.sumOutFlow
        }
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
        var that = this;
        if (this.edges.length > 0) {
            var sourceNodes = this._flowSourceNodes();
            var cfc = this.constantFlowCoeff();
            var avFlow = (this.avgIntensity - this.avgIntensity/cfc) / 3600;
            for (var i = 0; i < this.inFlow.length; i++){
                var sumI = 0;

                _.forEach(this.edges, function(el){
                    sumI +=  that._calcEdgePortionI(i, el, sourceNodes[el.source]);
                });

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
        return sourceNode.outFlow[i] * parseInt(edge.portion) / sourceNode.getAvgIntensity();
    };

    this._flowSourceNodes = function () {
        var result = {};
        this.edges.map(function(el){
            var sourceNode = this.network.getNode(el.source);
            if (sourceNode.type == 'concurrent' && !el.hasOwnProperty('secondary')) {
                sourceNode = sourceNode.primary;
            }
            result[el.source] = sourceNode;
        }, this);

        return result;
    };

    this.getAvgIntensity = function(){
        return this.avgIntensity;
    };

    this.resetIntervals = function(intervals){
        this.intervals = intervals.map(function(v){
            return {
                s: parseInt(v[0]),
                f: parseInt(v[1]),
                length: v[1] - v[0]
            }
        });

        var last = this.intervals.last();
        var first = this.intervals.first();
        if (last && first) {
            if ((last.f + 1) % this.cycleTime == first.s) {
                last.length += first.length;
            }
        }
    }


}


module.exports = Flow;
