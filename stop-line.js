var Flow = require('./flow');
var model = require('./model');

function StopLine(options, mainFlow){
    this.flow = new Flow(options);
    this.flow1 = new Flow(options);
    this.main = mainFlow;
}

StopLine.prototype.calc = function(){
    model.stopLine(this.flow);
    var delay = this.delay;
    if (this.main != undefined) {
        this.flow1.inFlow = this.flow.outFlow;
        this.flow1.intervals = [];
        model.competitor(this.main, this.flow1);
        this.flow.outFlow = this.flow1.outFlow;
        this.flow.delay += this.delay;
    }
    return this.flow;
}

module.exports = StopLine;
