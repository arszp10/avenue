var Flow = require('./flow');
var model = require('./model');

function StopLine(options, network, indexMap){
    Flow.apply(this, arguments);
    this.parent = options.hasOwnProperty('parent')
        ? options.parent : false;


    this.phaseSaturation = function () {
        var crossRoad = this.getNode(this.parent);
        var cf = 0;
        var j = 0;
        var sat = 0;
        var pi = parseInt(crossRoad.phases[cf].length) - 1;
        for (var i = 0; i < this.outFlow.length; i++){
            j = (i + crossRoad.offset) % this.cycleLength;
            sat +=  this.outFlow[j];
            if (pi == i) {
                sat = sat / this.capacityPerSecond / parseInt(crossRoad.phases[cf].length);
                if (sat > crossRoad.phases[cf].saturation) {
                    crossRoad.phases[cf].saturation = sat;
                }
                sat = 0;
                if (cf < crossRoad.phases.length -1) {
                    cf++;
                    pi+= parseInt(crossRoad.phases[cf].length) - 1;
                }
            }
        }
    };

    this.calc = function (){
        var hasOverflow = this.initInFlow();
        var delay = 0;
        if (hasOverflow) {
            model.bottleNeck(this);
            delay = this.delay;
            this.flipBack();
        }
        var offset  = this.parent ? this.getNode(this.parent).offset : 0;
        model.stopLine(this, offset);
        this.delay += delay;
        if (this.parent) {
            this.phaseSaturation();
        }
    };

}

module.exports = StopLine;
