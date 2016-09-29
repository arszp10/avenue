var _           = require('lodash');
var utils       = require('./utils/utils')();
var traffic     = require('./traffic');
var settings    = require('./settings');

var objects = {
    stopline:       require('./i-model/stop-line'),
    carriageway:    require('./i-model/carriageway'),
    bottleneck:     require('./i-model/bottleneck'),
    concurrent:     require('./i-model/competitor'),
    concurrentMerge:require('./i-model/competitor-merge'),
    point:          require('./i-model/point'),
    crossRoad:      require('./i-model/crossroad')
};

function Network(request) {
    this.network     = request;
    this.indexMap    = {};
    this.crIndexMap  = {};
    this.crStopLines = {};
    this.delay  = 0;

    var network = this.network;
    var indexMap = this.indexMap;
    var that = this;

    _.forEach(network, function(node, index){
        indexMap[node.id] = index;
        node['weight'] = 0;
    });

    _.forEach(network, function(node){
        if (node.type == 'stopline' && node.hasOwnProperty('parent')) {
            node.intervals = traffic.redIntervals(node, that.getNode(node.parent));
            if (!that.crStopLines.hasOwnProperty(node.parent)) {
                that.crStopLines[node.parent] = [node.id];
            } else {
                that.crStopLines[node.parent].push(node.id);
            }
        }

        if (node.hasOwnProperty('edges')) {
            node.edges.map(function(e){
                that.pushToNodeProperty(e.target, 'from', e.source);
                that.pushToNodeProperty(e.source, 'to', e.target);
            }, this);
        }
    });

    var outterNodes = [];

    _.forEach(network, function(node){
        if (!node.hasOwnProperty('edges') && node.type != 'crossRoad') {
            outterNodes.push(node.id);
        }
    });

    if (outterNodes.length == 0) {
        outterNodes.push(network[0].id);
    }

    this.outterNodes = outterNodes;

    this.traceRoute(outterNodes, 0, []);
    network.sort(function (a, b) { return a.weight - b.weight;});

    _.forEach(network, function(node, i){
        indexMap[node.id] = i;
        if (node.type == 'crossRoad') {
            that.crIndexMap[node.id] = i;
        }
        network[i] = new objects[node.type](node, that);
    });

    this.network = network;
    this.indexMap = indexMap;
}

Network.prototype.json = function () {
    return this.network.map(function(node){
        return node.json();
    });
};

Network.prototype.getNode = function (id) {
    return this.network[this.indexMap[id]];
};

Network.prototype.setNodeProperty = function (id, prop, value) {
    var node = this.getNode(id);
    node[prop] = value;
};

Network.prototype.pushToNodeProperty = function (id, prop, value) {
    var node = this.getNode(id);
    if (! node.hasOwnProperty(prop)){
        node[prop] = [value];
    } else {
        node[prop].push(value);
    }
};

Network.prototype.traceRoute = function(nodes, w, trace){
    var that = this;
    _.forEach(nodes, function(id){
        var node = that.getNode(id);
        var nextWeight =  w + 1;

        // if a loop
        if (trace.indexOf(id) > -1) {
            return;
        }

        if (node.weight < nextWeight) {
            that.setNodeProperty(id, 'weight', nextWeight);
            if (node.hasOwnProperty('to')) {
                var clone = trace.slice(0);
                clone.push(id);
                that.traceRoute(node.to, nextWeight, clone);
            }
        }
    });
};


Network.prototype.simulate = function(numberOfIteration){
    var sum = 0;
    var that = this;
    for (var i = 0; i < numberOfIteration; i++) {
        _.forEach(this.network, function(node){
            if (that.outterNodes.indexOf(node.id) > -1 && i > 0) {
                return;
            }
            node.calc();
            if (i == numberOfIteration - 1){
                sum += node.hasOwnProperty('delay')
                    ? parseFloat(node['delay'])
                    : 0;
            }
        });
    }
    this.delay = sum;
    return this;
};


Network.prototype.optimizeOffsets = function(numberOfIteration){
    var cycleTime = this.network[0].cycleTime;
    var steps = settings.offsetOptimizationSteps(cycleTime);
    var that = this;
    var crossRoad;
    var offsets = [0, 0, 0];
    var delays  = [0.0, 0.0, 0.0];
    var mi      = 0;
    var offset  = 0;

    _.forEach(steps, function(step){
        _.forEach(that.crIndexMap, function(inx){

            crossRoad = that.network[inx];
            offset = crossRoad.offset;
            offsets = [
                offset,
                (offset + step) % cycleTime,
                (offset + cycleTime - step) % cycleTime
            ];

            for(var i = 0; i < 3; i++) {
                crossRoad.offset = offsets[i];
                that.simulate(numberOfIteration);
                delays[i] = that.delay;

            }
            mi = delays.minIndex3();
            crossRoad.offset = offsets[mi];
        });
    });
    return this;
};


Network.prototype.optimizeSplits = function(){
    var that = this;

    _.forEach(this.crIndexMap, function(inx){
        var crossRoad = that.network[inx];

        var maxSatEl = _.maxBy(crossRoad.phases, 'saturation');
        var minSatEl = _.minBy(crossRoad.phases, 'saturation');
        if (maxSatEl.saturation - minSatEl.saturation < 0.11) {
            return this;
        }
        var maxInx = crossRoad.phases.indexOf(maxSatEl);
        var minInx = crossRoad.phases.indexOf(minSatEl);
        var sumSat = maxSatEl.saturation + minSatEl.saturation;
        var sumLen = parseInt(maxSatEl.length) + parseInt(minSatEl.length);
        var dMax = Math.round(sumLen * maxSatEl.saturation/sumSat);
        var dMin = Math.round(sumLen * minSatEl.saturation/sumSat);
        if (dMin < parseInt(minSatEl.minLength)) {
            dMin = parseInt(minSatEl.minLength);
            dMax = sumLen - dMin;
        }
        maxSatEl.length = dMax;
        minSatEl.length = dMin;
        _.forEach(that.crStopLines[crossRoad.id], function(id){
            var sl = that.getNode(id);
            sl.resetIntervals(traffic.redIntervals(sl, crossRoad));
        });

    });

    return this;
};

module.exports = Network;