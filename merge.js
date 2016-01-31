var Flow = require('./flow');
var model = require('./model');

function Merge(options, inFlows){
    this.flow = new Flow(options);
    if (inFlows = undefined) {
        inFlows = [];
    }
    this.inFlows = inFlows;
}

Merge.prototype.calc = function(){
    return model.merger(this.flow, this.inFlows);
};

module.exports = Merge;
