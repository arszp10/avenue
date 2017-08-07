    var Flow = require('./flow');
var model = require('./model');

function StopLine(options, network){
    Flow.apply(this, arguments);
    this.parent = options.hasOwnProperty('parent')
        ? options.parent : false;


    this.phaseSaturation = function () {
        var that = this;
        var crossRoad = this.network.getNode(this.parent);
        var phaseOffset = 0;
        crossRoad.phases.map(function(phase, inx){

            if (!that.greenPhases[inx]) {
                phaseOffset += phase.length;
                return;
            }

            var fq = (phaseOffset - 1 + crossRoad.offset + that.cycleTime) % that.cycleTime;
            var queue = that.queueFunc[fq];
            //console.log(fq, JSON.stringify(that.queueFunc));
            var sumInPhase = 0;
            var effectiveGreen = phase.length - phase.intertact;
            for (var i=0; i < effectiveGreen; i++){
                var iq = (phaseOffset + i + crossRoad.offset) % that.cycleTime;
                sumInPhase += that.inFlow[iq];
            }
            var saturation = (queue + sumInPhase)/(effectiveGreen * that.capacityPerSecond);
            //console.log(that.tag, fq, saturation , queue , sumInPhase,  effectiveGreen , that.capacityPerSecond);
            if (saturation > phase.saturation) {
                phase.saturation = saturation;
            }
            phaseOffset += phase.length;
        });
    };

    this.calc = function (){
        var hasOverflow = this.initInFlow();
        var delay = 0;
        if (hasOverflow) {
            model.bottleNeck(this);
            delay = this.delay;
            this.flipBack();
        }
        var offset  = this.parent ? this.network.getNode(this.parent).offset : 0;
        model.stopLine(this, offset);
        this.delay += delay;
        if (this.parent) {
            this.phaseSaturation();
        }
    };

}

module.exports = StopLine;
