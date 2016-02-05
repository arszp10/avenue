var Flow = require('./flow');
var model = require('./model');

function Competitor(options, mainFlow){
    this.main = mainFlow;
    this.flow = new Flow(options);
}

Competitor.prototype.calc = function(){
    return model.competitor(this.main, this.flow);
};

module.exports = Competitor;
