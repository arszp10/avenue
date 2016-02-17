var _ = require('lodash');

function Flow(options, edges, network)
{
    var defAvgIntensity = 1800;
    var defCapacity = 3600;
    var defaults = {
        id: _.uniqueId(),
        cicleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: defAvgIntensity,
        capacity: defCapacity,
        routeTime: 20,
        length: 300,
        dispersion: 0.5,
        intervals: []
    };
    var flow = _.assign({}, defaults, options);

    this.id = flow.id;
    this.cicleTime = flow.cicleTime;
    this.avgIntensity = flow.avgIntensity;
    this.capacity = flow.capacity;
    this.avgIntensityPerSecond =  this.avgIntensity/3600;
    this.capacityPerSecond = this.capacity/3600;
    this.inFlow = [].fill(this.cicleTime, 0);
    this.outFlow = [].fill(this.cicleTime, 0);
    this.length = flow.length;
    this.routeTime = flow.routeTime;
    this.dispersion = flow.dispersion;
    this.intervals = flow.intervals;
    this.isCongestion = false;
    this.maxQueueLength = 0;
    this.delay = 0;
    this.type = flow.type;
    this.edges = edges;
    this.network = network;

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
            cicleTime: this.cicleTime,
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
            _.forEach(this.edges, function(el){
                if (!el.hasOwnProperty('portion')) {
                    el['portion'] = 0;
                }

                var sourceNode = network[el.source];
                if (sourceNode.type == 'concurrent' && !el.hasOwnProperty('secondary')) {
                    sourceNode = sourceNode.primary;
                }

                sumI += sourceNode.outFlow[i] * el.portion / sourceNode.avgIntensity;
            });
            if (sumI > this.capacityPerSecond) {
                hasOverflow = true;
            }
            this.inFlow[i] = sumI;
            sumInTotal += sumI;
        }
        if (sumInTotal == 0) {
            this.inFlow = [].fill(this.cicleTime, this.avgIntensityPerSecond);
        }
        return hasOverflow;
    }
}


module.exports = Flow;
