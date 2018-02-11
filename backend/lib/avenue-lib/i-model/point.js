var Flow = require('./flow');
var model = require('./model');

function Point(options, network){
    Flow.apply(this, arguments);

    this.calc = function (){
        var hasOverflow = this.initInFlow();
        this.copyFlow();
        this.phaseSaturation();
    };

}

module.exports = Point;
