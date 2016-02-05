var Flow = require('./flow');
var model = require('./model');

function BottleNeck(options){
    this.flow = new Flow(options);
}

BottleNeck.prototype.calc = function(){
    return model.bottleNeck(this.flow);
};

module.exports = BottleNeck;
