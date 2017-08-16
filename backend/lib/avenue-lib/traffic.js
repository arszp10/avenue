var _           = require('lodash');
var utils       = require('./utils/utils')();
var settings    = require('./settings');

module.exports = {

    readToGreenInterPhase: function(len, addGreen){
        var ipDefaults = settings.interPhaseDefaults;
        if (len < ipDefaults.totalLength) {
            len = ipDefaults.totalLength;
        }
        if (addGreen + ipDefaults.amber > len) {
            addGreen = len - ipDefaults.amber;
        }
        if (addGreen < 0) { addGreen = 0 }
        var green = addGreen;

        var red = len - addGreen - ipDefaults.amber;
        if (red < 0) { red = 0 }

        var amber = ipDefaults.amber;
        var green = addGreen;

        var signals = [];
        if (red > 0) {
            signals.push({ color: 'red', length: red });
        }
        signals.push({ color: 'amber', length: amber });
        if (green > 0) {
            signals.push({ color: 'green', length: green });
        }
        return {
            length : len,
            signals : signals
        }


    },
    greenToRedInterPhase: function(len, addGreen){
        var ipDefaults = settings.interPhaseDefaults;
        if (len < ipDefaults.totalLength) {
            len = ipDefaults.totalLength;
        }

        if (addGreen + ipDefaults.blink + ipDefaults.yellow > len) {
            addGreen = len - (ipDefaults.blink + ipDefaults.yellow);
        }
        if (addGreen < 0) { addGreen = 0 }
        var green = addGreen;


        var blink = ipDefaults.blink;
        if (ipDefaults.blink + ipDefaults.yellow > len) {
            blink = len - ipDefaults.yellow;
        }

        var yellow = ipDefaults.yellow;

        var red = len - (blink + ipDefaults.yellow + addGreen);
        if (red < 0) { red = 0 }

        var signals = [];
        if (green > 0) {
            signals.push({ color: 'green', length: green });
        }
        signals.push({ color: 'blink', length: blink });
        signals.push({ color: 'yellow', length: yellow });

        if (red > 0) {
            signals.push({ color: 'red', length: red });
        }

        return {
            length : len,
            signals : signals
        }
    },

    signalDiagramData:  function(stopLine, crossRoad){
        var itertactOrder = crossRoad.itertactOrder;
        var i = 0, icolor = '', inext = 0, iprev=0;
        var diagram = [];
        var phCount =  crossRoad.phases.length;
        var interTact ;

        for (i = 0; i < phCount; i++){
            icolor = stopLine.greenPhases[i] ? 'green' : 'red';
            inext = (i + 1) % phCount;
            iprev = (i - 1 +  phCount) % phCount;

            var checkPhase = itertactOrder == 'after' ? inext : iprev;
            if (stopLine.greenPhases[i] === stopLine.greenPhases[checkPhase]) {
                diagram.push({
                    color : icolor,
                    length : crossRoad.phases[i].length
                });
                continue;
            }
            var addGreen = stopLine.hasOwnProperty('additionalGreens')
                ? stopLine.additionalGreens[i] : 0;
            var interPhaseLength = crossRoad.phases[i].hasOwnProperty('intertact')
                ? crossRoad.phases[i].intertact : 3;

            var checkColor = itertactOrder == 'after'
                ? stopLine.greenPhases[i]
                : !stopLine.greenPhases[i];

            interTact = checkColor
                ? this.greenToRedInterPhase(interPhaseLength, addGreen)
                : this.readToGreenInterPhase(interPhaseLength, addGreen);


            if (itertactOrder == 'after') {
                diagram.push({
                    color: icolor,
                    length: crossRoad.phases[i].length - interTact.length
                });
                diagram = diagram.concat(JSON.parse(JSON.stringify(interTact.signals)));
            } else {
                diagram = diagram.concat(JSON.parse(JSON.stringify(interTact.signals)));
                diagram.push({
                    color: icolor,
                    length: crossRoad.phases[i].length - interTact.length
                });
            }
        }
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

};
