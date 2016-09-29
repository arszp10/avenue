var _           = require('lodash');
var utils       = require('./utils/utils')();
var settings    = require('./settings');

module.exports = {

    signalDiagramData: function(stopLine, crossRoad){
        var i = 0, icolor = '', inext = 0, goff = 0;
        var diagram = [];
        var phCount =  crossRoad.phases.length;
        var interTact = settings.interTact;
        var prevGoff = 0;
        for (i = 0; i < phCount; i++){
            crossRoad.phases[i].saturation = 0;
            icolor = stopLine.greenPhases[i] ? 'green' : 'red';
            goff = stopLine.greenPhases[i]
                ? parseInt(stopLine.greenOffset2)
                : parseInt(stopLine.greenOffset1);
            inext = (i + 1) % phCount;
            if (stopLine.greenPhases[i] === stopLine.greenPhases[inext]) {
                diagram.push({
                    color : icolor,
                    length : parseInt(crossRoad.phases[i].length)
                });
                continue;
            }
            diagram.push({
                color : icolor,
                length : parseInt(crossRoad.phases[i].length) - interTact[icolor].length + prevGoff + goff
            });
            diagram = diagram.concat(interTact[icolor].signals);
            prevGoff = -goff;
        }
        diagram[0].length += prevGoff;
        return diagram;
    },

    redIntervals: function(stopLine, crossRoad){
        var diagram = this.signalDiagramData (stopLine, crossRoad);
        var intervals = [];
        var s = 0, i = 0;
        _.forEach(diagram, function(v){
            if (v.color == 'amber') {
                intervals.push([s, i + v.length-1]);
            }
            if (v.color == 'yellow') {
                s = i-1;
            }
            i += v.length;
        });

        var lastInterval = ( diagram[0].color == diagram[diagram.length-1].color && diagram[0].color == 'red') ||
            ( diagram[0].color == 'red' && diagram[diagram.length-1].color == 'yellow');

        if (lastInterval) {
            intervals.push([s, i-1]);
        }
        return intervals;
    }

}
