var utils  = require('../utils/utils')();
var _      = require('lodash');

module.exports = {

    stopLine:function(flow, offset, queueTail){
        flow.maxQueueLength = 0;
        var cycleTime = flow.cycleTime;
        var capacityPerSecond = flow.capacityPerSecond;
        var inFlow = flow.inFlow;
        var outFlow = flow.outFlow;
        var delay = 0;
        var queue = queueTail == undefined ? 0 : queueTail;

        var intervals = flow.intervals;
        var lastStart = intervals.last() ? intervals.last().s : 0;

        if (intervals.length == 0) {
            intervals = [[-10, -1]];
        }

        var currIntervalInx = intervals.length - 1;
        var currInterval = intervals[currIntervalInx];
        var rTime = currInterval.length;
        var t = 0;
        var sumInFlow = 0;
        var sumOutFlow = 0;
        var sumGreenFlow = 0;
        var sumGreenCpacity = 0;

        for (var i = 0; i < inFlow.length; i++){
            var j = (i + lastStart) % cycleTime;
            var value = inFlow[(j + offset) % cycleTime];
            sumInFlow += value;
            queue += value;
            if (queue > flow.maxQueueLength) {
                flow.maxQueueLength = queue;
            }
            if (j >= currInterval.s && j<= currInterval.f) {
                delay += (rTime - t + Math.floor(queue/capacityPerSecond))*value;
                t++;
                outFlow[(j + offset) % cycleTime] = 0;
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
            ;
            t = 0;
            outFlow[(j + offset) % cycleTime] = value;
            sumOutFlow += value;
            sumGreenFlow += value;
        }

        if (sumInFlow != sumOutFlow && queueTail == undefined) {
            return this.stopLine(flow, offset, queue);
        }

        flow.sumInFlow = sumInFlow;
        flow.sumOutFlow = sumOutFlow;
        flow.delay = delay;
        flow.outFlow = outFlow;

        flow.greenSaturation = Math.round(100*sumGreenFlow/sumGreenCpacity);
        flow.isCongestion = (sumInFlow - 1) > sumOutFlow && queueTail != undefined;
        return flow;
    },


    carriageWay: function(flow){
        var inFlow = flow.inFlow;
        var f = 1/(1 + flow.dispersion * flow.routeTime);
        var outFlow = flow.outFlow;
        var k = 0;
        var sumInFlow = inFlow.sum();
        var sumOutFlow = 0;
        do {
            k++;
            for (var i = 0; i < inFlow.length; i++) {
                var ttprm1 = (i + flow.routeTime) % flow.cycleTime;
                var ttpr = (i + flow.routeTime + 1) % flow.cycleTime;
                outFlow[ttpr] = (1 - f) * outFlow[ttprm1] + inFlow[i] * f;
            }
            sumOutFlow = outFlow.sum();
        } while (Math.abs(sumInFlow - sumOutFlow) > 0.0001 && k < 10)

        flow.sumInFlow = sumInFlow;
        flow.sumOutFlow = sumOutFlow;
        flow.outFlow = outFlow;
        flow.greenSaturation = Math.round(100*sumOutFlow/(flow.capacityPerSecond*flow.cycleTime));
        return flow;
    },


    bottleNeck: function(flow, queueTail) {
        flow.maxQueueLength = 0;
        var cycleTime = flow.cycleTime;
        var capacityPerSecond = flow.capacityPerSecond;
        var inFlow = flow.inFlow;
        var outFlow = flow.outFlow;
        var delay = 0;
        var queue = queueTail == undefined ? 0 : queueTail;
        var lt = 0;
        var sumInFlow = 0;
        var sumOutFlow = 0;
        for (var i = 0; i < inFlow.length; i++){
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
            if (queue > flow.maxQueueLength) {
                flow.maxQueueLength = queue;
            }
        }

        if (sumInFlow != sumOutFlow && queueTail == undefined) {
            return this.bottleNeck(flow, queue);
        }
        flow.delay = delay;
        flow.outFlow = outFlow;
        flow.sumInFlow = sumInFlow;
        flow.sumOutFlow = sumOutFlow;
        flow.greenSaturation = Math.round(100*sumOutFlow/(flow.capacityPerSecond*flow.cycleTime));
        flow.isCongestion = (sumInFlow - 1) > sumOutFlow && queueTail != undefined;
        return flow;
    },

    competitor: function(flow1, flow2, queueTail){
        flow2.maxQueueLength = 0;
        var capacityPerSecond1 = flow1.capacity/3600;
        var capacityPerSecond2 = flow2.capacity/3600;
        var inFlow2 = flow2.inFlow;

        var outFlow1 = flow1.outFlow;
        var outFlow2 = flow2.outFlow;
        var delay = 0;
        var queue = queueTail == undefined ? 0 : queueTail;
        var sumInFlow = 0;
        var sumOutFlow = 0;
        var virtRedTime = 0;
        var avgInVirtRed = 0;

        var dynCapacity = [];
        var value = 0;

        for (var i = 0; i < inFlow2.length; i++){
            value = inFlow2[i];
            queue += value;
            dynCapacity[i] = capacityPerSecond2 * Math.pow(
                Math.abs(outFlow1[i] / capacityPerSecond1 - 1),
                5
            );
            if (queue > dynCapacity[i]) {
                outFlow2[i] = dynCapacity[i];
            } else {
                if (queue <= capacityPerSecond2){
                    value = queue;
                } else {
                    value = capacityPerSecond2;
                }
                outFlow2[i] = value;
            }
            queue -= outFlow2[i];
            sumInFlow += value;

            sumOutFlow += outFlow2[i];
            if (queue > flow2.maxQueueLength) {
                flow2.maxQueueLength = queue;
            }
            if (outFlow2[i] <= 0.05){
                virtRedTime++;
                avgInVirtRed+=inFlow2[i];
            }
        }
        if (sumInFlow != sumOutFlow && queueTail == undefined) {
            return this.competitor(flow1, flow2, queue);
        }
        flow2.sumInFlow = sumInFlow;
        flow2.sumOutFlow = sumOutFlow;
        flow2.delay = 0.5 * 0.5 * virtRedTime * avgInVirtRed;
        flow2.outFlow = outFlow2;
        flow2.greenSaturation = Math.round(100*sumOutFlow/(flow2.capacityPerSecond*flow2.cycleTime));
        flow2.isCongestion = (sumInFlow - 1) > sumOutFlow && queueTail != undefined;

        return flow2;
    }

};
