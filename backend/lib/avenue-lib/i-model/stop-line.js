var Flow = require('./flow');
var model = require('./model');
var utils       = require('../utils/utils')();

function StopLine(options, network){
    Flow.apply(this, arguments);
    this.parent = options.hasOwnProperty('parent')
        ? options.parent : false;


    this.phaseSaturation = function () {
        if (! this.parent) {
            return;
        }
        var that = this;
        var crossRoad = this.network.getNode(this.parent);
        var phaseOffset = 0;
        that.phasesSaturation = [];
        that.phasesSaturation.fillArray(crossRoad.phases.length, 0);
        crossRoad.phases.map(function(phase, inx){

            if (!that.greenPhases[inx]) {
                phaseOffset += phase.length;
                that.phasesSaturation[inx] = 0;
                return;
            }

            var fq = (phaseOffset - 1 + crossRoad.offset + that.cycleTime) % that.cycleTime;
            var queue = that.queueFunc[fq];

            var sumInPhase = 0;
            var effectiveGreen = 0;//phase.length ;//- phase.intertact;
            for (var i = 0; i < phase.length; i++){
                var iq = (phaseOffset + i) % that.cycleTime;
                sumInPhase += that.inFlow[iq];
                if (that.isGreenMoment(iq)) {
                    effectiveGreen++;
                }
            }
            var saturation = (queue + sumInPhase)/(effectiveGreen * that.capacityPerSecond);
            that.phasesSaturation[inx] = saturation;
            if (saturation > phase.saturation) {
                phase.saturation = saturation;
                phase.stoplineId = that.id;
                //phase.weight = that.weight;
                //phase.effectiveGreen = effectiveGreen;
                //phase.queue = queue;
                //phase.sumInPhase = sumInPhase;
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
        this.phaseSaturation();
    };

}

module.exports = StopLine;
