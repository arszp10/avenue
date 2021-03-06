var utils  = require('../utils/utils')();
var _      = require('lodash');

var dynamicCapacityDelay = function dynamicCapacityDelay(cycleTime, dynCapacity, i, queue, value){
    var j = 0;
    while (queue > 0) {
        queue -= dynCapacity[(i + j) % cycleTime];
        j++;
    }
    return (j+1) * value;
};

var checkCongestion = function checkCongestion(sumInFlow, sumOutFlow, queueTail, queueLimit, maxQueueLength){
    return (
                   (sumInFlow - 1) > sumOutFlow // Incoming cars < Outcoming more than 1
                || (queueLimit > 0 && queueLimit < maxQueueLength) // MaxQueue above than queue limit for this node
           ) && queueTail != undefined; //second iteration
};

module.exports = {

    stopLine:function(flow, offset, queueTail){
        var cycleTime           = flow.cycleTime;
        var capacityPerSecond   = flow.capacityPerSecond;
        var queueFunc           = flow.queueFunc;
        var inFlow              = flow.inFlow;
        var outFlow             = flow.outFlow;
        var queue               = queueTail == undefined ? 0 : queueTail;

        var intervals = flow.intervals;
        var lastStart = intervals.last() ? intervals.last().s : 0;

        if (intervals.length == 0) {
            intervals = [[-10, -1]];
        }

        var currIntervalInx = intervals.length - 1;
        var currInterval = intervals[currIntervalInx];
        var rTime = currInterval.length;
        var t               = 0;
        var delay           = 0;
        var sumInFlow       = queue;
        var sumOutFlow      = 0;
        var sumGreenFlow    = 0;
        var sumGreenCpacity = 0;
        var maxQueueLength  = 0;
        var j, jo, value;

        for (var i = 0; i < inFlow.length; i++){
            j = (i + lastStart) % cycleTime;
            jo = (j + offset) % cycleTime;
            value = inFlow[jo];
            sumInFlow += value;
            queue += value;
            if (queue > maxQueueLength) {
                maxQueueLength = queue;
            }
            if (j >= currInterval.s && j<= currInterval.f) {
                delay += (rTime - t + Math.floor(queue/capacityPerSecond))*value;
                t++;
                outFlow[jo] = 0;
                queueFunc[jo] = queue;
                if (j != currInterval.f) {
                    continue;
                }
                currIntervalInx = (currIntervalInx + 1) % intervals.length;
                currInterval = intervals[currIntervalInx];
                rTime = currInterval.length;
                t = 0;
                continue;

            } else if (queue <= capacityPerSecond){
                value = queue;
                queue -= value;
                sumGreenCpacity += capacityPerSecond;
            } else {
                value = capacityPerSecond;
                queue -= value;
                delay += Math.floor(queue/capacityPerSecond)*value;
                sumGreenCpacity += capacityPerSecond;
            }
            t = 0;
            outFlow[jo]   = value;
            queueFunc[jo] = queue;
            sumOutFlow    += value;
            sumGreenFlow  += value;
        }

        if (sumInFlow != sumOutFlow && queueTail == undefined) {
            return this.stopLine(flow, offset, queue);
        }

        flow.sumInFlow          = sumInFlow;
        flow.sumOutFlow         = sumOutFlow;
        flow.delay              = delay;
        flow.outFlow            = outFlow;
        flow.queueFunc          = queueFunc;
        flow.maxQueueLength     = maxQueueLength;
        flow.greenSaturation    = Math.round(100*sumGreenFlow/sumGreenCpacity)|0;
        flow.isCongestion       = checkCongestion(sumInFlow, sumOutFlow, queueTail, flow.queueLimit, maxQueueLength);
        return flow;
    },

    carriageWay: function(flow){
        var inFlow  = flow.inFlow;
        var f       = 1/(1 + flow.dispersion * flow.routeTime);
        var outFlow = flow.outFlow;
        var k           = 0;
        var sumInFlow   = inFlow.sum();
        var sumOutFlow  = 0;
        do {
            k++;
            for (var i = 0; i < inFlow.length; i++) {
                var ttprm1 = (i + flow.routeTime) % flow.cycleTime;
                var ttpr = (i + flow.routeTime + 1) % flow.cycleTime;
                outFlow[ttpr] = (1 - f) * outFlow[ttprm1] + inFlow[i] * f;
            }
            sumOutFlow = outFlow.sum();
        } while (Math.abs(sumInFlow - sumOutFlow) > 0.0001 && k < 10);

        flow.sumInFlow      = sumInFlow;
        flow.sumOutFlow     = sumOutFlow;
        flow.outFlow        = outFlow;
        flow.greenSaturation = Math.round(100*sumOutFlow/(flow.capacityPerSecond*flow.cycleTime));
        return flow;
    },

    bottleNeck: function(flow, queueTail) {
        var cycleTime           = flow.cycleTime;
        var capacityPerSecond   = flow.capacityPerSecond;
        var inFlow              = flow.inFlow;
        var outFlow             = flow.outFlow;
        var queueFunc           = flow.queueFunc;
        var queue               = queueTail == undefined ? 0 : queueTail;
        var delay       = 0;
        var lt          = 0;
        var sumInFlow   = queue;
        var sumOutFlow  = 0;
        var maxQueueLength = 0;

        for (var i = 0; i < inFlow.length; i++){
            queueFunc[i] = queue;
            var value = inFlow[i];
            sumInFlow += value;
            lt = queue + value - capacityPerSecond;
            if (lt > 0) {
                outFlow[i] =  capacityPerSecond;
                queue = lt;
                delay += Math.floor(queue/capacityPerSecond)*value;
            } else {
                outFlow[i] =  value;
                queue = 0;
            }
            sumOutFlow += outFlow[i];
            if (queue > maxQueueLength) {
                maxQueueLength = queue;
            }
        }
        if (sumInFlow != sumOutFlow && queueTail == undefined) {
            return this.bottleNeck(flow, queue);
        }
        flow.delay          = delay;
        flow.outFlow        = outFlow;
        flow.sumInFlow      = sumInFlow;
        flow.sumOutFlow     = sumOutFlow;
        flow.maxQueueLength = maxQueueLength;
        flow.queueFunc          = queueFunc;
        flow.greenSaturation = Math.round(100*sumOutFlow/(flow.capacityPerSecond*flow.cycleTime));
        flow.isCongestion = checkCongestion(sumInFlow, sumOutFlow, queueTail, flow.queueLimit, maxQueueLength);
        return flow;
    },

    competitor: function(flow1, flow2, queueTail){
        var cycleTime           = flow1.cycleTime;
        var capacityPerSecond1  = flow1.capacity/3600;
        var capacityPerSecond2  = flow2.capacity/3600;
        var queueFunc           = flow2.queueFunc;
        var inFlow2             = flow2.inFlow;
        var outFlow1            = flow1.outFlow;
        var outFlow2            = flow2.outFlow;
        var queue               = queueTail == undefined ? 0 : queueTail;
        var delay               = 0;
        var sumInFlow           = 0;
        var sumOutFlow          = 0;

        var dynCapacity = [];
        var value = 0;
        var maxQueueLength = 0;

        var power = flow1.pedestrian ? 9 : 5;
        for (var j = 0; j < inFlow2.length; j++){
            dynCapacity[j] = capacityPerSecond2 * Math.pow(Math.abs(outFlow1[j] / capacityPerSecond1 - 1), power);
        }

        for (var i = 0; i < inFlow2.length; i++){
            value = inFlow2[i];
            queue += value;
            queueFunc[i] = queue;
            if (queue > dynCapacity[i]) {
                outFlow2[i] = dynCapacity[i];
                delay += dynamicCapacityDelay(cycleTime, dynCapacity, i, queue, value);
            } else {
                value = (queue <= capacityPerSecond2) ? queue : capacityPerSecond2;
                outFlow2[i] = value;
            }
            queue -= outFlow2[i];
            sumInFlow += value;
            sumOutFlow += outFlow2[i];
            if (queue > maxQueueLength) {
                maxQueueLength = queue;
            }
        }

        if (sumInFlow != sumOutFlow && queueTail == undefined) {
            return this.competitor(flow1, flow2, queue);
        }

        flow2.sumInFlow         = sumInFlow;
        flow2.sumOutFlow        = sumOutFlow;
        flow2.delay             = delay;
        flow2.outFlow           = outFlow2;
        flow2.queueFunc          = queueFunc;
        flow2.maxQueueLength    = maxQueueLength;
        flow2.greenSaturation   = Math.round(100 * sumOutFlow / (flow2.capacityPerSecond * flow2.cycleTime));
        flow2.isCongestion      = checkCongestion(sumInFlow, sumOutFlow, queueTail, flow2.queueLimit, maxQueueLength);

        return flow2;
    }

};
