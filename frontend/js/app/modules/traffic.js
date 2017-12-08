(function(App){
    var settings  = App.Resources.Settings;

    var booleanArrayPad = function (n, v) {
        if (n < 1 ) return [];
        return Array.apply(null, Array(n)).map(Boolean.prototype.valueOf, v);
    };


    App.Modules.traffic =  {

        readToGreenInterPhase: function(len, addGreen,isPedestrian){
            var signals = [];
            var ipDefaults = isPedestrian
                ? settings.pedestrianInterPhaseDefaults
                : settings.interPhaseDefaults;

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

            if (red > 0) {
                signals.push({ color: 'red', length: red });
            }
            if (amber > 0){
                signals.push({ color: 'amber', length: amber });
            }
            if (green > 0) {
                signals.push({ color: 'green', length: green });
            }
            return {
                length : len,
                signals : signals
            };

        },
        greenToRedInterPhase: function(len, addGreen, isPedestrian){
            var signals = [];

            var ipDefaults = isPedestrian
                ? settings.pedestrianInterPhaseDefaults
                : settings.interPhaseDefaults;
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

            if (green > 0) {
                signals.push({ color: 'green', length: green });
            }
            signals.push({ color: 'blink', length: blink });
            if (yellow > 0) {
                signals.push({color: 'yellow', length: yellow});
            }
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
                    ? program.phases[i].intertact : 3;

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

        signalDiagramDataPhasesOnly:  function(crossroad){
            var diagram = [];
            var program = crossroad.programs[crossroad.currentProgram];
            var phCurrentOrder = program.currentOrder;
            if (phCurrentOrder < 0 || phCurrentOrder == null) {
                return diagram;
            }
            var phOrder = program.phasesOrders[phCurrentOrder];
            var phCount = phOrder.order.length;
            for (var j = 0; j < phCount; j++){
                var i = phOrder.order[j] - 1;
                var icolor = 'green';
                diagram.push({
                    color : icolor,
                    length : program.phases[i].length
                });
            }
            return diagram;
        },


        signalDiagramData1:  function(itertactOrder, crossroad, program, node, order, noOffset){
            var stopLine = node;
            var isPedestrian = stopLine.type == 'pedestrian';
            var j = 0, icolor = '', inext = 0, iprev = 0;
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
                iprev = phOrder.order[(j - 1 +  phCount) % phCount] - 1;

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

                var checkPhase = itertactOrder == 'after' ? inext : iprev;

                if (stopLine.greenPhases[cpi][i] === stopLine.greenPhases[cpi][checkPhase]) {
                    diagram.push({
                        color : icolor,
                        length : program.phases[i].length
                    });
                    continue;
                }

                var checkColor = itertactOrder == 'after'
                    ? stopLine.greenPhases[cpi][i]
                    : !stopLine.greenPhases[cpi][i];

                interTact = checkColor
                    ? this.greenToRedInterPhase(interPhaseLength, addGreen, isPedestrian)
                    : this.readToGreenInterPhase(interPhaseLength, addGreen, isPedestrian);

                if (itertactOrder == 'after') {
                    diagram.push({
                        color : icolor,
                        length : program.phases[i].length - interTact.length
                    });
                    diagram = diagram.concat(JSON.parse(JSON.stringify(interTact.signals)));
                } else {
                    diagram = diagram.concat(JSON.parse(JSON.stringify(interTact.signals)));
                    diagram.push({
                        color : icolor,
                        length : program.phases[i].length - interTact.length
                    });
                }

            }
            return noOffset
                ? diagram
                : this.offsetDiagram(diagram, program.offset, program.cycleTime);
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
