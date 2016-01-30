
function StopLine(options)
{
    var defaults = {
        hash: 0000,
        avgIntensity: 1800,
        avgIntensityPerSecond: 1800/3600,
        capacity: 3600,
        capacityPerSecond: 3600/3600,
        cicleTime: 100,
        intervals: [
            {s:0, f:9, length: 10},
            {s:60, f:67, length: 8},
            {s:90, f:99, length: 10}
            //{s:0, f:90, length: 91}
        ]
    };
    this.options = defaults;
    this.isCongestion = false;
    this.inFlow = [];
    this.outFlow = [].fill(this.options.cicleTime, 0);

    this.maxQueueLength = 0;
    this.delay = 0;
}


StopLine.prototype.calc = function(inFlow, queueTail)
{
    var cicleTime = this.options.cicleTime;
    var capacityPerSecond = this.options.capacityPerSecond;
    if (inFlow == undefined) {
        if (this.inFlow.length == 0) {
            this.inFlow = [].fill(cicleTime, this.options.avgIntensityPerSecond);
        }
        inFlow = this.inFlow;
    }
    this.inFlow = inFlow;
    this.maxQueueLength = 0;
    var outFlow = this.outFlow;
    var delay = 0;
    var queue = queueTail == undefined ? 0 : queueTail;

    var intervals = this.options.intervals;
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

        if (queue > this.maxQueueLength) {
            this.maxQueueLength = queue;
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
        return this.calc(inFlow, queue);
    }
    this.delay = delay;
    this.outFlow = outFlow;
    this.isCongestion = (sumInFlow - 1) > sumOutFlow && queueTail != undefined;
    return this.outFlow;
};

module.exports = StopLine;
