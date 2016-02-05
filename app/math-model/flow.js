var _ = require('lodash');

function Flow(options)
{
    var defAvgIntensity = 1800;
    var defCapacity = 3600;
    var defaults = {
        // common properties
        id: _.uniqueId(),
        cicleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: defAvgIntensity,
        capacity: defCapacity,
        // carriageway properties
        routeTime: 20,
        length: 300,
        dispersion: 0.5,
        // fork
        divisionRates: [1],
        intervals: []
    };
    var flow = _.assign({}, defaults, options);


    this.id = flow.id;
    this.cicleTime = flow.cicleTime;
    this.avgIntensity = flow.avgIntensity;
    this.capacity = flow.capacity;
    this.avgIntensityPerSecond =  this.avgIntensity/3600;
    this.capacityPerSecond = this.capacity/3600;

    this.inFlow = flow.inFlow.length != 0
        ? flow.inFlow
        : flow.inFlow.fill(this.cicleTime, this.avgIntensityPerSecond);
    this.outFlow = flow.outFlow.length != 0
        ? flow.outFlow
        : flow.outFlow.fill(this.cicleTime, 0);

    this.length = flow.length;
    this.routeTime = flow.routeTime;
    this.dispersion = flow.dispersion;

    this.divisionRates = flow.divisionRates;
    this.intervals = flow.intervals;

    this.isCongestion = false;
    this.maxQueueLength = 0;
    this.delay = 0;
}

module.exports = Flow;
