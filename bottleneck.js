
function BottleNeck(options)
{
    var defaults = {
        hash: 0000,
        avgIntensity: 1800,
        capacity: 1200,
        avgIntensityPerSecond: 1800/3600,
        capacityPerSecond: 2300/3600,
        cicleTime: 100

    };
    this.options = defaults;
    this.isCongestion = false;
    this.inFlow = [];
    this.outFlow = [].fill(this.options.cicleTime, 0);
    this.maxQueueLength = 0;
    this.delay = 0;
}


BottleNeck.prototype.calc = function(inFlow, queueTail)
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
        if (queue > this.maxQueueLength) {
            this.maxQueueLength = queue;
        }
    }

    if (sumInFlow != sumOutFlow && queueTail == undefined) {
        return this.calc(inFlow, queue);
    }

    this.delay = delay;
    this.outFlow = outFlow;
    this.isCongestion = (sumInFlow - 1) > sumOutFlow && queueTail != undefined;
    return this.outFlow;
};

module.exports = BottleNeck;
