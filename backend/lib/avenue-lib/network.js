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
    crossRoad:      require('./i-model/crossroad'),
    pedestrian:     require('./i-model/pedestrian')
};

function Network(request) {
    this.network     = request;
    this.indexMap    = {};
    this.crIndexMap  = {};
    this.crStopLines = {};
    this.delay  = 0;
    this.performanaceIndex  = 0;

    var network = this.network;
    var indexMap = this.indexMap;
    var that = this;

    _.forEach(network, function(node, index){
        indexMap[node.id] = index;
    });

    _.forEach(network, function(node, index){
        if (node.hasOwnProperty('edges')) {
            console.log(node.id, node.edges.length);
            node.edges.forEach(function(edge, index){

                if (!edge.distance) return;
                if (!edge.speed) return;

                var vms = edge.speed/3.6;

                var newCarriageway = JSON.parse(JSON.stringify(settings.carriageway));
                newCarriageway.id = edge.target + '_cwb_'+ index;
                newCarriageway.avgIntensity = edge.portion;
                //console.log(indexMap, edge.target);
                newCarriageway.capacity = network[indexMap[edge.target]].capacity;
                newCarriageway.dispersion = edge.hasOwnProperty('pedestrian') ? 0.15 : 0.5;
                newCarriageway.length = edge.distance;
                newCarriageway.routeTime = Math.round(edge.distance/vms);

                delete newCarriageway.icon;
                delete newCarriageway.tag;
                delete edge.speed;
                delete edge.distance;

                var newEdge = JSON.parse(JSON.stringify(edge));
                newEdge.id = newEdge.id + '_cwb_' + index;
                newEdge.target = newCarriageway.id;

                newCarriageway.edges = [newEdge];
                network.push(newCarriageway);
                edge.source = newCarriageway.id;
            }, this);
        }
    });

    _.forEach(network, function(node, index){
        indexMap[node.id] = index;
        node['routeWeight'] = 0;
    });

    _.forEach(network, function(node){
        if ((node.type == 'stopline' || node.type == 'pedestrian' ) && node.hasOwnProperty('parent')) {
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

    this.weighNodes();
    this.network.sort(function (a, b) { return a.routeWeight - b.routeWeight;});

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


Network.prototype.weighNodes = function () {
    this.outterNodes = this.findOutterNodes();
    this.traceRoute(this.outterNodes, 0, []);
};


Network.prototype.findOutterNodes = function () {
    var outterNodes = [];
    var whatEverInx = this.network.length - 1;
    _.forEach(this.network, function(node, inx){
        if (!node.hasOwnProperty('edges') && node.type != 'crossRoad') {
            outterNodes.push(node.id);
        }
        if (node.type != 'crossRoad') {
            whatEverInx = inx;
        }
    });
    if (outterNodes.length == 0) {
        outterNodes.push(this.network[whatEverInx].id);
    }
    return outterNodes;
};


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

        if (node.routeWeight < nextWeight) {
            that.setNodeProperty(id, 'routeWeight', nextWeight);
            if (node.hasOwnProperty('to')) {
                var clone = trace.slice(0);
                clone.push(id);
                that.traceRoute(node.to, nextWeight, clone);
            }
        }
    });
};


Network.prototype.simulate = function(numberOfIteration){
    var sumDelay = 0;
    var sumPI = 0;
    var that = this;
    var delay = 0;
    var weight = 1;
    for (var i = 0; i < numberOfIteration; i++) {
        _.forEach(this.network, function(node){
            var isNotSingleOutterNode = that.outterNodes.indexOf(node.id) > -1 && i > 0 && that.outterNodes.length > 1;
            if (isNotSingleOutterNode) {
                return;
            }
            node.calc();

            if (i == numberOfIteration - 1){
                delay = node.hasOwnProperty('delay') ? parseFloat(node['delay']) : 0;
                weight = node.hasOwnProperty('weight') ? parseFloat(node['weight']) : 1;
                sumDelay += delay;
                sumPI += delay * weight;
            }
        });
    }
    this.delay = sumDelay;
    this.performanaceIndex = sumPI;
    return this;
};


Network.prototype.optimizeOffsets = function(numberOfIteration){
    var steps = settings.offsetOptimizationSteps();
    var that = this;
    var crossRoad;
    var offsets = [0, 0, 0];
    var performanaceIndexArray  = [0.0, 0.0, 0.0];
    var mi      = 0;
    var offset  = 0;
    var cycleTime;
    var stepInSeconds =  1;

    _.forEach(steps, function(step){
        _.forEach(that.crIndexMap, function(inx){
            crossRoad = that.network[inx];
            cycleTime = crossRoad.cycleTime;
            offset = crossRoad.offset;
            stepInSeconds =  Math.round(cycleTime * step);
            offsets = [
                offset,
                (offset + stepInSeconds) % cycleTime,
                (offset + cycleTime - stepInSeconds) % cycleTime
            ];

            for(var i = 0; i < 3; i++) {
                crossRoad.offset = offsets[i];
                that.simulate(numberOfIteration);
                performanaceIndexArray[i] = that.performanaceIndex;

            }
            mi = performanaceIndexArray.minIndex3();
            crossRoad.offset = offsets[mi];
        });
    });
    return this;
};

Network.prototype.phasesSaturationStat = function(crossRoad){
    var notMinLenCtnr = 0;
    var notMinLenSaturation = 0;

    var maxSaturation = 0;
    var minSaturation = 10000;
    var maxSaturationPhase = -1;
    var minSaturationPhase = -1;

    crossRoad.phases.map(function(phase, inx){
        if (phase.length != phase.minLength){
            notMinLenCtnr++;
            notMinLenSaturation += phase.saturation;
            if (phase.saturation > maxSaturation) {
                maxSaturation = phase.saturation;
                maxSaturationPhase = inx;
            }
            if (phase.saturation < minSaturation) {
                minSaturation = phase.saturation;
                minSaturationPhase = inx;
            }
        }
    });
    return {
        avg: notMinLenSaturation/notMinLenCtnr,
        max: maxSaturation,
        min: minSaturation,
        maxPhase: maxSaturationPhase,
        minPhase: minSaturationPhase
    };
};

Network.prototype.refreshPhasesLengthAndCycle = function(crossRoad, newCycle){

    var that = this;

    crossRoad.phases.map(function(phase){
        phase.saturation = 0;
    });

    _.forEach(that.crStopLines[crossRoad.id], function(id){
        var sl = that.getNode(id);
        sl.resetIntervals(traffic.redIntervals(sl, crossRoad));
    });

    if (newCycle) {
        _.forEach(this.network, function(node){
            node.cycleTime = newCycle;
        });
    }

};

Network.prototype.optimizeCycleSingleCrossroad = function(){
        //return this;
        var that = this;
        var index;
        _.forEach(this.crIndexMap, function(inx){
            index = inx;
        });
        var result = [];
        var crossRoad = that.network[index];
            crossRoad.offset = 0;

        var minLengthSum = crossRoad.phases.reduce(function(sum, phase){
            return sum  + phase.minLength;
        }, 0);

        var leftCycleBound = minLengthSum + crossRoad.phases.length;
        var rightCycleBound = 300;

        crossRoad.phases.map(function(phase){
            phase.length = Math.round(minLengthSum/crossRoad.phases.length);
        });

        for(var ct = leftCycleBound; ct <=rightCycleBound; ct = ct + crossRoad.phases.length) {
            crossRoad.phases.map(function(phase){
                phase.length++;
            });
            that.refreshPhasesLengthAndCycle(crossRoad, ct);
            that.simulate(1);

            var avgSaturationPrev = 0;

            for (var t = 0; t <= 50; t++) {
                var deltaR = 1;
                var s = that.phasesSaturationStat(crossRoad);
                crossRoad.phases[s.maxPhase].length+= deltaR;
                crossRoad.phases[s.minPhase].length-= deltaR;
                that.refreshPhasesLengthAndCycle(crossRoad);
                that.simulate(1);
                if (avgSaturationPrev == s.avg) {
                    break;
                }
                avgSaturationPrev = s.avg;
            }

            var sumcongestion = 0;
            var sumdelay = 0;

            _.forEach(that.crStopLines[crossRoad.id], function(id){
                var node = that.getNode(id);
                var x = node.sumInFlow/node.sumOutFlow;
                var overSatDelay = 0;
                if ( x > 1 ) {
                    //var T = 10/ct;
                    //overSatDelay = 900*T*(x-1) + Math.sqrt((x-1)*(x-1) + 8*0.5*0.9*x/(T*ct))|0;
                    var T = 1;//ct/3600;
                    overSatDelay = 900*T*(x-1) + Math.sqrt((x-1)*(x-1) + 4*x/(T*ct))|0;

                }
                var delay = node.delay/ct + overSatDelay;
                sumcongestion += (node.isCongestion?1:0);
                sumdelay += delay ;
            });

            result.push({
                cycleTime: ct,
                avgCycleSaturation: avgSaturationPrev,
                sumDelay: sumdelay,
                sumCongestion: sumcongestion,
                phases: JSON.parse(JSON.stringify(crossRoad.phases))
            });

        }

    return result;
};



//Network.prototype.optimizeSplits = function(){
//    var that = this;
//
//    _.forEach(this.crIndexMap, function(inx){
//        var crossRoad = that.network[inx];
//
//        var maxSatEl = _.maxBy(crossRoad.phases, 'saturation');
//        var minSatEl = _.minBy(crossRoad.phases, 'saturation');
//        if (maxSatEl.saturation - minSatEl.saturation < 0.11) {
//            return that;
//        }
//        var maxInx = crossRoad.phases.indexOf(maxSatEl);
//        var minInx = crossRoad.phases.indexOf(minSatEl);
//        var sumSat = maxSatEl.saturation + minSatEl.saturation;
//        var sumLen = parseInt(maxSatEl.length) + parseInt(minSatEl.length);
//        var dMax = Math.round(sumLen * maxSatEl.saturation/sumSat);
//        var dMin = Math.round(sumLen * minSatEl.saturation/sumSat);
//        if (dMin < parseInt(minSatEl.minLength)) {
//            dMin = parseInt(minSatEl.minLength);
//            dMax = sumLen - dMin;
//        }
//        maxSatEl.length = dMax;
//        minSatEl.length = dMin;
//        _.forEach(that.crStopLines[crossRoad.id], function(id){
//            var sl = that.getNode(id);
//            sl.resetIntervals(traffic.redIntervals(sl, crossRoad));
//        });
//
//    });
//
//    return this;
//};

module.exports = Network;