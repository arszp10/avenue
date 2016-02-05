var Flow = require('./flow');
var model = require('./model');

function Fork(options){
    this.flow = new Flow(options);
    this.outFlows = this.flow.divisionRates.map(function(v,i){ return new Flow(options)});

}

Fork.prototype.calc = function(){
    this.outFlows = model.fork(this.flow, this.outFlows);
    return this.outFlows;
};

module.exports = Fork;
