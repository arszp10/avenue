var Flow = require('./flow');
var model = require('./model');

function StopLine(options, network, indexMap){
    Flow.apply(this, arguments);
    this.parent = options.hasOwnProperty('parent')
        ? options.parent : false;

    this.calc = function (){
        var hasOverflow = this.initInFlow();
        var delay = 0;
        if (hasOverflow) {
            model.bottleNeck(this);
            delay = this.delay;
            this.flipBack();
        }
        var offset  = this.parent ? this.getNode(this.parent).offset : 0;
        console.log(this.intervals, offset);
        model.stopLine(this, offset);
        this.delay += delay;
    };

}

module.exports = StopLine;
