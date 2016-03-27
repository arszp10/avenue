var Flow = require('./flow');
var model = require('./model');

function BottleNeck(options, edges, network, indexMap){
    Flow.apply(this, arguments);

    this.calc = function (){
        var hasOverflow = this.initInFlow();
        model.bottleNeck(this);
    };

}

module.exports = BottleNeck;
