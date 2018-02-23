var Flow = require('./flow');
var model = require('./model');

function BottleNeck(options, network){
    Flow.apply(this, arguments);

    this.calc = function (){
        var hasOverflow = this.initInFlow();
        var hasQueueSpillBackOnAheadNodes = this._dynamicCapacity();
        model.bottleNeck(this);


        this.phaseSaturation();
    };

}

module.exports = BottleNeck;
