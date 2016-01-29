
function stopLine(options)
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
        ],
    };

    this.options = defaults;
}


stopLine.prototype.calc = function(inFlow, queueTail)
{
    var cicleTime = this.options.cicleTime;
    var capacityPerSecond = this.options.capacityPerSecond;
    if (inFlow == undefined) {
        inFlow = [].fill(cicleTime, this.options.avgIntensityPerSecond);
    }
    var outFlow = [].fill(cicleTime, 0);
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

    var start = last.s;
    var currIntervalInx = intervals.length - 1;
    var currInterval = intervals[currIntervalInx];
    var rTime = currInterval.length;
    var t = 0;
    var sumInFlow = 0;
    var sumOutFlow = 0;

    for (var i = 0; i < inFlow.length; i++){
        var j = (i + start) % cicleTime;
        var value = inFlow[j];
        sumInFlow += value;
        queue += value;
        if (j >= currInterval.s && j<= currInterval.f) {
            delay += (rTime - t + Math.floor(queue/capacityPerSecond))*value;
            t++;
            outFlow[j] = 0;
            //console.log('OUT: ', j, outFlow[j], queue ,rTime - t);
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
        //console.log('OUT: ', j, outFlow[j], queue, 0);
        sumOutFlow += value;
        continue;
    }

    //console.log('QUEUE REST: ',queue);
    //console.log('DELAY: ',delay);
    //console.log(outFlow);
    //console.log('SUM: ', sumInFlow, sumOutFlow);
    if (sumInFlow != sumOutFlow) {
        return this.calc(inFlow, queue);
    }
    return outFlow;
};


Array.prototype.fill = function(len, value){
    return Array.apply(null, Array(len)).map(Number.prototype.valueOf,value);
};

Array.prototype.last = function(){
    if (this.length > 0){
        return this[this.length - 1];
    }
    return false;
};

Array.prototype.first = function(){
    if (this.length > 0){
        return this[0];
    }
    return false;
};

var sl = new stopLine();
console.log(new Date());
for (var i = 0; i < 100000; i++) {
    sl.calc();
}
console.log(new Date());

