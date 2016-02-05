var Flow = require('./flow');
var model = require('./model');

function CarriageWay(options){
    this.flow = new Flow(options);
}

CarriageWay.prototype.calc = function(){
    return model.carriageWay(this.flow);
}

module.exports = CarriageWay;


