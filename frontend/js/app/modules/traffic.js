(function(App){
    var settings  = App.Resources.Settings;

    var booleanArrayPad = function (n, v) {
        if (n < 1 ) return [];
        return Array.apply(null, Array(n)).map(Boolean.prototype.valueOf, v);
    };


    App.Modules.traffic =  {

        readToGreenInterPhase: function(len, addGreen){
            var ipDefaults = settings.interPhaseDefaults;
            if (len < ipDefaults.totalLength) {
                len = ipDefaults.totalLength;
            }
            if (addGreen + ipDefaults.amber > len) {
                addGreen = len - ipDefaults.amber;
            }

            var red = len - addGreen - ipDefaults.amber;
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

            var green = addGreen;
            var blink = ipDefaults.blink;
            var yellow = ipDefaults.yellow;
            var red = len - (ipDefaults.blink + ipDefaults.yellow + addGreen);
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

        signalDiagramPhases:  function(crossroad, program, order){
            var diagram = [];
            var j = 0, icolor = 'clean', inext = 0;
            var cpi = crossroad.currentProgram;
            var phCurrentOrder = order !== undefined ? order : program.currentOrder;
            if (phCurrentOrder < 0 || phCurrentOrder == null) {
                return diagram;
            }
            var phOrder = program.phasesOrders[phCurrentOrder];
            var phCount = phOrder.order.length;
            for (j = 0; j < phCount; j++) {
                var i = phOrder.order[j] - 1;
                var interPhaseLength = program.phases[i].hasOwnProperty('intertact')
                    ? program.phases[i].intertact : 6;

                var calcLength = program.phases[i].length - interPhaseLength;
                if (calcLength <= 0) {
                    diagram.push({
                        label: '#error',
                        color : 'error',
                        length : interPhaseLength
                    });
                    continue;
                }

                diagram.push({
                    label : '<b>'+phOrder.order[j] + '</b>: &nbsp;' + program.phases[i].length ,
                    color : icolor,
                    length : program.phases[i].length
                });
            }
            return diagram;
        },

        signalDiagramData1:  function(crossroad, program, node, order, noOffset){
            var stopLine = node;
            var j = 0, icolor = '', inext = 0;
            var diagram = [];
            var cpi = crossroad.currentProgram;
            var phCurrentOrder = order !== undefined ? order : program.currentOrder;
            if (phCurrentOrder < 0 || phCurrentOrder == null) {
                return diagram;
            }
            var phOrder = program.phasesOrders[phCurrentOrder];
            var phCount = phOrder.order.length;
            var interTact ;


            for (j = 0; j < phCount; j++){
                var i = phOrder.order[j] - 1;
                icolor = stopLine.greenPhases[cpi][i] ? 'green' : 'red';
                inext = phOrder.order[(j + 1) % phCount] - 1;

                var addGreen = stopLine.hasOwnProperty('additionalGreens')
                    ? stopLine.additionalGreens[cpi][i] : 0;
                var interPhaseLength = program.phases[i].hasOwnProperty('intertact')
                    ? program.phases[i].intertact : 6;

                var calcLength = program.phases[i].length - interPhaseLength;
                if (calcLength <= 0) {
                    diagram.push({
                        label : '#error',
                        color : 'error',
                        length : interPhaseLength
                    });
                    continue;
                }

                if (stopLine.greenPhases[cpi][i] === stopLine.greenPhases[cpi][inext]) {
                    diagram.push({
                        color : icolor,
                        length : program.phases[i].length
                    });
                    continue;
                }

                interTact = stopLine.greenPhases[cpi][i]
                    ? this.greenToRedInterPhase(interPhaseLength, addGreen)
                    : this.readToGreenInterPhase(interPhaseLength, addGreen);

                diagram.push({
                    color : icolor,
                    length : program.phases[i].length - interTact.length
                });
                diagram = diagram.concat(JSON.parse(JSON.stringify(interTact.signals)));
            }
            return noOffset
                ? diagram
                : this.offsetDiagram(diagram, program.offset, program.cycleTime);
        },

        signalDiagramData:  function(crossRoad, node){
            var stopLine = node;
            var i = 0, icolor = '', inext = 0;
            var diagram = [];
            var phCount =  crossRoad.phases.length;
            var interTact ;

            for (i = 0; i < phCount; i++){
                icolor = stopLine.greenPhases[i] ? 'green' : 'red';
                inext = (i + 1) % phCount;
                if (stopLine.greenPhases[i] === stopLine.greenPhases[inext]) {
                    diagram.push({
                        color : icolor,
                        length : crossRoad.phases[i].length
                    });
                    continue;
                }
                var addGreen = stopLine.hasOwnProperty('additionalGreens')
                    ? stopLine.additionalGreens[i] : 0;
                var interPhaseLength = crossRoad.phases[i].hasOwnProperty('intertact')
                    ? crossRoad.phases[i].intertact : 6;

                interTact = stopLine.greenPhases[i]
                    ? this.greenToRedInterPhase(interPhaseLength, addGreen)
                    : this.readToGreenInterPhase(interPhaseLength, addGreen);

                diagram.push({
                    color : icolor,
                    length : crossRoad.phases[i].length - interTact.length
                });
                diagram = diagram.concat(JSON.parse(JSON.stringify(interTact.signals)));
            }
            return this.offsetDiagram(diagram, crossRoad.offset, crossRoad.cycleTime);
        },
        offsetDiagram:      function(diagram, offset, cycle){
            if (offset == 0) {
                return diagram;
            }
            var backOffset = cycle - offset - 1;
            var sum = 0;
            var l = diagram.length;
            var i = 0;
            var head = [];
            var tail = [];
            while (i < l){
                sum += diagram[i].length;
                if (backOffset > sum ) {
                    head.push(diagram[i]);
                } else {
                    if (tail.length == 0) {
                        var icolor = diagram[i].color;
                        var ilen = diagram[i].length ;
                        head.push({
                            color : icolor,
                            length : ilen - (sum - backOffset) + 1
                        });
                        tail.push({
                            color : icolor,
                            length : sum - backOffset - 1
                        });
                        i++;
                        continue;
                    }
                    tail.push(diagram[i]);
                }
                i++;
            }
            return tail.concat(head);
        },
        redIntervals:       function(diagram){
            var intervals = [];
            var s = 0, i = 0;
            diagram.forEach(function(v){
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
        },

        greenRedArray: function(diagram){
            var result = [];
            diagram.forEach(function(block){
                result = result.concat(booleanArrayPad(block.length, block.color == 'green'||block.color == 'blink'))
            });
            return result;
        }
    };


})(AvenueApp);
