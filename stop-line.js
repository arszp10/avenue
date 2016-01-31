var Flow = require('./flow');
var model = require('./model');

function StopLine(options, mainFlow){
    this.flow = new Flow(options);
    this.main = mainFlow;
}

StopLine.prototype.calc = function(){
    var flow = model.stopLine(this.flow)
    if (this.main != undefined) {
        return model.competitor(this.main, this.flow);
    }
    return flow;
}

module.exports = StopLine;
