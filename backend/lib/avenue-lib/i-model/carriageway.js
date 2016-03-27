var Flow = require('./flow');
var model = require('./model');

function CarriageWay(options, network, indexMap){
    Flow.apply(this, arguments);

    this.calc = function (){
        var hasOverflow = this.initInFlow();
        var delay = 0;
        if (hasOverflow) {
            model.bottleNeck(this);
            delay = this.delay;
            this.flipBack();
        }
        model.carriageWay(this);
        this.delay += delay;
    };

}

module.exports = CarriageWay;
