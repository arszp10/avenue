
function CarriageWay(options)
{
    var defaults = {
        hash: 0000,
        avgIntensity: 1800,
        avgIntensityPerSecond: 1800/3600,
        capacity: 3600,
        capacityPerSecond: 3600/3600,
        cicleTime: 100,
        routeTime: 60,
        dispersion: 0.5
    };
    this.options = defaults;
    this.inFlow = [];
    this.outFlow = [].fill(this.options.cicleTime, 0);

}


CarriageWay.prototype.calc = function(inFlow)
{
    if (inFlow == undefined) {
        if (this.inFlow.length == 0) {
            this.inFlow = [].fill(this.options.cicleTime, this.options.avgIntensityPerSecond);
        }
        inFlow = this.inFlow;
    }
    this.inFlow = inFlow;
    var f = 1/(1 + this.options.dispersion * this.options.routeTime);
    var outFlow = this.outFlow;
    var k = 0;
    var sumInFlow = inFlow.sum();
    var sumOutFlow = 0;
    do {
        k++;
        for (var i = 0; i < inFlow.length; i++) {
            var ttprm1 = (i + this.options.routeTime) % this.options.cicleTime;
            var ttpr = (i + this.options.routeTime + 1) % this.options.cicleTime;
            outFlow[ttpr] = (1 - f) * outFlow[ttprm1] + inFlow[i] * f;
        }
        sumOutFlow = outFlow.sum();
    } while (Math.abs(sumInFlow - sumOutFlow) > 0.0001 && k < 10)

    this.outFlow = outFlow;
    return this.outFlow;
};

module.exports = CarriageWay;



