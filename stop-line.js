
function stopLine(options)
{
    var defaults = {
        hash: 5454651340015154,
        avgIntensity: 600,
        avgIntensityPerSecond: 600/3600,
        capacity: 1800,
        capacityPerSecond: 1800/3600,
        cicleTime: 60,
        redTime: [0,1,2,3,4,5,6,7,8,9]
    };

    this.options = defaults;
}


/**
 *
 * @param inFlow
 * @returns {number}
 */
stopLine.prototype.getLastRedPoint = function(){
    if (this.options.redTime.length == 0) {
        return 0;
    }
    var i = this.options.cicleTime - this.options.redTime[this.options.redTime.length-1];
    while (this.options.redTime.indexOf(this.options.cicleTime - i) > -1) {
        i++;
    }
    return this.options.cicleTime - i + 1;

}

stopLine.prototype.calc = function(inFlow)
{
    if (inFlow == undefined) {
        inFlow = arrayFill(this.options.cicleTime, this.options.avgIntensityPerSecond);
    }
    var outFlow = arrayFill(this.options.cicleTime, 0);
    var delay = 0;
    var queue = 0;
    var start = this.getLastRedPoint();
    var t = 0;
    var r = 10;
    inFlow.map(function(v, i, data){
        var j = (i + start) % this.options.cicleTime;
        var value = data[j];
        queue += value;
        if (this.options.redTime.indexOf(j) > -1) {
            delay += (r - t + Math.floor(queue/this.options.capacityPerSecond))*value;
            //console.log("---", t, r-t+ Math.floor(queue/this.options.capacityPerSecond),value);
            t++;
            outFlow[j] = 0;
            return 0;
        } else if (queue <= this.options.capacityPerSecond){
            value = queue;
            queue -= value;
        } else {
            value = this.options.capacityPerSecond;
            queue -= value;
            delay += Math.floor(queue/this.options.capacityPerSecond)*value;
            //console.log("---",Math.floor(queue/this.options.capacityPerSecond),value);
        }
        t = 0;
        outFlow[j] = value;
        return value;
    }, this);

    console.log(delay);
    //console.log(outFlow);
    console.log(
        outFlow.reduce(function(a, b) { return a + b; }, 0),
        inFlow.reduce(function(a, b) { return a + b; }, 0)
    );
};


function arrayFill(len, value){
    return Array.apply(null, Array(len)).map(Number.prototype.valueOf,value);
}


var sl = new stopLine();
sl.calc();