var Flow = require('./flow');
var model = require('./model');

function StopLine(options, edges, network){
    Flow.apply(this, arguments);

    this.calc = function (){
        var hasOverflow = this.initInFlow();
        var delay = 0;
        if (hasOverflow) {
            model.bottleNeck(this);
            delay = this.delay;
            this.flipBack();
        }
        model.stopLine(this);
        this.delay += delay;
    };

}

module.exports = StopLine;
