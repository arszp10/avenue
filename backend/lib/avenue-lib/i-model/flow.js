var _      = require('lodash');
var utils  = require('../utils/utils')();

function Flow(options, network, indexMap)
{
    var defaults = {
        cycleLength: 100,
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
    var flow = Object.assign({}, defaults, options);

    this.id = flow.id;
    this.type = flow.type;
    this.edges = flow.edges;
    this.tag = flow.tag;
    this.parent = flow.parent;
    this.greenPhases = flow.greenPhases;
    this.greenOffset1 = flow.greenOffset1;
    this.greenOffset2 = flow.greenOffset2;
    this.cycleLength      = parseInt(flow.cycleLength);
    this.avgIntensity   = parseInt(flow.avgIntensity);
    this.capacity       = parseInt(flow.capacity);
    this.secondaryFlowCapacity  = parseInt(flow.secondaryFlowCapacity);
    this.avgIntensityPerSecond  = this.avgIntensity/3600;
    this.capacityPerSecond      = this.capacity/3600;
    this.inFlow         = [].fillArray(this.cycleLength, 0);
    this.outFlow        = [].fillArray(this.cycleLength, 0);
    this.queue          = [].fillArray(this.cycleLength, 0);
    this.length         = parseInt(flow.length);
    this.routeTime      = parseInt(flow.routeTime);
    this.dispersion     = parseFloat(flow.dispersion);

    this.isCongestion    = false;
    this.maxQueueLength  = 0;
    this.delay           = 0;
    this.greenSaturation = 0;
    this.sumInFlow       = 0;
    this.sumOutFlow      = 0;

    this.resetIntervals =  function(intervals){
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
            if ((last.f + 1) % this.cycleLength == first.s) {
                last.length += first.length;
            }
        }
    };

    this.resetIntervals(flow.intervals);
    this.network         = network;
    this.indexMap        = indexMap;


    this.flipBack = function () {
        for (var i = 0; i < this.inFlow.length; i++){
            this.inFlow[i] = this.outFlow[i];
        }
    };

    this.merge = function(outFlow) {
        for (var i = 0; i < this.outFlow.length; i++){
            this.outFlow[i] = this.outFlow[i] + outFlow[i];
        }
    };

    this.copyFlow = function() {
        for (var i = 0; i < this.inFlow.length; i++){
            this.outFlow[i] = this.inFlow[i];
        }
    };

    this.json = function () {
        return {
            id:             this.id,
            type:           this.type,
            tag:            this.tag,
            cycleLength:      this.cycleLength,
            inFlow:         this.inFlow,
            outFlow:        this.outFlow,
            queue:          this.queue,
            isCongestion:   this.isCongestion,
            maxQueue:       this.maxQueueLength,
            delay:          this.delay,
            greenSaturation: this.greenSaturation,
            sumInFlow:      this.sumInFlow,
            sumOutFlow:     this.sumOutFlow
        }
    };

    this.getNode = function (id) {
        return this.network[this.indexMap[id]];
    };

    this.constantFlowCoeff = function(){
        var sum = 0;
        _.forEach(this.edges, function(edge, i){
            sum += parseInt(edge.portion);
        });
        return this.avgIntensity / sum;
    };

    this.initInFlow = function () {
        var sumInTotal = 0;
        var hasOverflow = false;
        var that = this;
        if (this.edges.length > 0) {
            var sourceNodes = this.sourceNodes();
            var cfc = this.constantFlowCoeff();
            var avFlow = (this.avgIntensity - this.avgIntensity/cfc) / 3600;
            for (var i = 0; i < this.inFlow.length; i++){
                var sumI = 0;

                _.forEach(this.edges, function(el){
                    sumI +=  that.edgePortionFlowRate(i, el, sourceNodes[el.source]);
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
            this.inFlow = [].fillArray(this.cycleLength, this.avgIntensityPerSecond);
        }
        return hasOverflow;
    };

    this.edgePortionFlowRate = function (i, edge, sourceNode, constFlowPerSecond){
        return sourceNode.outFlow[i] * parseInt(edge.portion) / sourceNode.getAvgIntensity();
    };

    this.sourceNodes = function () {
        var result = {};
        this.edges.map(function(edge){
            var sourceNode = this.getNode(edge.source);
            if (sourceNode.type == 'concurrent' && !edge.hasOwnProperty('secondary')) {
                sourceNode = sourceNode.primary;
            }
            result[edge.source] = sourceNode;
        }, this);
        return result;
    };

    this.getAvgIntensity = function(){
        return this.avgIntensity;
    };

}



module.exports = Flow;
