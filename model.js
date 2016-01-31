module.exports = {

    stopLine:function(flow, queueTail){
        flow.maxQueueLength = 0;
        var cicleTime = flow.cicleTime;
        var capacityPerSecond = flow.capacityPerSecond;
        var inFlow = flow.inFlow;
        var outFlow = flow.outFlow;
        var delay = 0;
        var queue = queueTail == undefined ? 0 : queueTail;
        var intervals = flow.intervals;
        var last = intervals.last();
        var first = intervals.first();

        if (last && first) {
            if((last.f + 1) % cicleTime == first.s) {
                last.length += first.length;
            }
        }

        var currIntervalInx = intervals.length - 1;
        var currInterval = intervals[currIntervalInx];
        var rTime = currInterval.length;
        var t = 0;
        var sumInFlow = 0;
        var sumOutFlow = 0;

        for (var i = 0; i < inFlow.length; i++){
            var j = (i + last.s) % cicleTime;
            var value = inFlow[j];
            sumInFlow += value;
            queue += value;

            if (queue > flow.maxQueueLength) {
                flow.maxQueueLength = queue;
            }
            if (j >= currInterval.s && j<= currInterval.f) {
                delay += (rTime - t + Math.floor(queue/capacityPerSecond))*value;
                t++;
                outFlow[j] = 0;
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
            } else {
                value = capacityPerSecond;
                queue -= value;
                delay += Math.floor(queue/capacityPerSecond)*value;
            }

            t = 0;
            outFlow[j] = value;
            sumOutFlow += value;
        }

        if (sumInFlow != sumOutFlow && queueTail == undefined) {
            return this.stopLine(flow, queue);
        }
        flow.delay = delay;
        flow.outFlow = outFlow;
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
                var ttprm1 = (i + flow.routeTime) % flow.cicleTime;
                var ttpr = (i + flow.routeTime + 1) % flow.cicleTime;
                outFlow[ttpr] = (1 - f) * outFlow[ttprm1] + inFlow[i] * f;
            }
            sumOutFlow = outFlow.sum();
        } while (Math.abs(sumInFlow - sumOutFlow) > 0.0001 && k < 10)

        flow.outFlow = outFlow;
        return flow;
    },


    bottleNeck: function(flow, queueTail) {
        flow.maxQueueLength = 0;
        var cicleTime = flow.cicleTime;
        var capacityPerSecond = flow.capacityPerSecond;
        var inFlow = flow.inFlow;
        var outFlow = flow.outFlow;
        var delay = 0;
        var queue = queueTail == undefined ? 0 : queueTail;
        var lt = 0;
        var sumInFlow = 0;
        var sumOutFlow = 0;
        //console.log(flow.id, inFlow);
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
        flow.isCongestion = (sumInFlow - 1) > sumOutFlow && queueTail != undefined;
        return flow;
    },


    merger: function(flow, inFlows) {
        flow.outFlow = [].fill(flow.cicleTime, 0);
        flow.inFlow = [].fill(flow.cicleTime, 0);
        for (var i = 0; i < flow.inFlow.length; i++){
            for (var k = 0; k < inFlows.length; k++){
                flow.inFlow[i] += inFlows[k].outFlow[i];
            }
        }
        return this.bottleNeck(flow);
    },


    fork: function(flow, outFlows){
        for (var k = 0; k < flow.divisionRates.length; k++){
            for (var i = 0; i < flow.inFlow.length; i++){
                outFlows[k].outFlow[i] = flow.inFlow[i] * flow.divisionRates[k];
            }
        }
        return outFlows;
    },


    competitor: function(flow1, flow2, queueTail){
        flow2.maxQueueLength = 0;
        var cicleTime = flow1.cicleTime;
        var capacityPerSecond1 = flow1.capacityPerSecond;
        var capacityPerSecond2 = flow2.capacityPerSecond;
        var inFlow2 = flow2.inFlow;

        var outFlow1 = flow1.outFlow;
        var outFlow2 = flow2.outFlow;
        var delay = 0;
        var queue = queueTail == undefined ? 0 : queueTail;
        var sumInFlow = 0;
        var sumOutFlow = 0;

        var dynCapacity = 0;
        var value = 0;
        for (var i = 0; i < inFlow2.length; i++){
            dynCapacity = capacityPerSecond2 * Math.pow(
                    Math.abs(outFlow1[i]/capacityPerSecond1 - 1),
                    10
                );
            value = inFlow2[i];
            queue += value;

            if (queue > dynCapacity) {
                outFlow2[i] = dynCapacity;
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
        }
        if (sumInFlow != sumOutFlow && queueTail == undefined) {
            return this.competitor(flow1, flow2, queue);
        }

        flow2.delay = delay;
        flow2.outFlow = outFlow2;
        flow2.isCongestion = (sumInFlow - 1) > sumOutFlow && queueTail != undefined;

        return flow2;
    }

};
