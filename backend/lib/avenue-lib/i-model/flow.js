var _      = require('lodash');
var utils  = require('../utils/utils')();

function Flow(options, network, indexMap)
{
    var defAvgIntensity = 1800;
    var defCapacity = 3600;
    var defaults = {
        id: _.uniqueId(),
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: defAvgIntensity,
        capacity: defCapacity,
        routeTime: 20,
        length: 300,
        dispersion: 0.5,
        intervals: [],
        edges: []
    };
    var flow = _.assign({}, defaults, options);

    this.id = flow.id;
    this.cycleTime = parseInt(flow.cycleTime);
    this.avgIntensity = parseInt(flow.avgIntensity);
    this.capacity = parseInt(flow.capacity);
    this.avgIntensityPerSecond =  this.avgIntensity/3600;
    this.capacityPerSecond = this.capacity/3600;
    this.inFlow = [].fillArray(this.cycleTime, 0);
    this.outFlow = [].fillArray(this.cycleTime, 0);
    this.length = parseInt(flow.length);
    this.routeTime = parseInt(flow.routeTime);
    this.dispersion = parseFloat(flow.dispersion);
    this.intervals = flow.intervals.map(function(v){
        return {
            s: parseInt(v[0]),
            f: parseInt(v[1]),
            length: v[1] - v[0]
        }
    });
    this.isCongestion = false;
    this.maxQueueLength = 0;
    this.delay = 0;
    this.type = flow.type;
    this.edges = flow.edges;
    this.network = network;
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

    this.initInFlow = function initInFlow() {
        var network = this.network;
        var sumInTotal = 0;
        var hasOverflow = false;
        for (var i = 0; i < this.inFlow.length; i++){
            var sumI = 0;
            if (this.hasOwnProperty('edges')) {
                this.edges.map(function(el){
                    if (!el.hasOwnProperty('portion')) {
                        el['portion'] = 0;
                    }

                    var sourceNode = network[this.indexMap[el.source]];
                    if (sourceNode.type == 'concurrent' && !el.hasOwnProperty('secondary')) {
                        sourceNode = sourceNode.primary;
                    }

                    sumI += sourceNode.outFlow[i] * el.portion / sourceNode.avgIntensity;
                }, this);
            }
            if (sumI > this.capacityPerSecond) {
                hasOverflow = true;
            }
            this.inFlow[i] = sumI;
            sumInTotal += sumI;
        }
        if (sumInTotal == 0) {
            this.inFlow = [].fillArray(this.cycleTime, this.avgIntensityPerSecond);
        }
        return hasOverflow;
    }
}


module.exports = Flow;
