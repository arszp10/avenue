(function(App){
    var settings  = App.Resources.Settings;

    var booleanArrayPad = function (n, v) {
        if (n < 1 ) return [];
        return Array.apply(null, Array(n)).map(Boolean.prototype.valueOf, v);
    };

    function findFirstOverValue(arr, val){
        for(var i=0; i<=arr.length-1; i++){
            if (arr[i] > val) return i;
        }
        return val;
    }


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
        signalDiagramPhases: function(crossroad, program, order){
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
        signalDiagramDataPhasesOnly: function(crossroad, noOffset){
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
            return noOffset
                ? diagram
                : this.offsetDiagram(diagram, program.offset, program.cycleTime);
        },
        signalDiagramData1: function(itertactOrder, crossroad, program, node, order, noOffset){
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
        offsetDiagram: function(diagram, offset, cycle){
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
                if (backOffset >= sum ) {
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
        redIntervals:  function(diagram){
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
        },


        tracesExtremePoints: function(flow){
            var result = [];
            var sum = 0;
            flow.forEach(function(val, inx){
                sum += val;
                if (sum < 1) {return;}
                var rest = sum - Math.floor(sum);
                var intPartOfNumber = Math.floor(sum);
                for (var j=0; j < intPartOfNumber; j++){
                    result.push(inx);
                }
                sum = rest;
            });
            return result;
        },

        traces: function(cycleTime, slot, distance, speed0, slOutFlow, slInFlow, capacityPerSecond){
            var alfa = capacityPerSecond < 0.5 ? 0.5 : capacityPerSecond;
            var beta = capacityPerSecond < 1 ? capacityPerSecond * 1.14 : capacityPerSecond* 0.86;
                beta = capacityPerSecond == 1 ? 1 :beta;
            slot = Math.round(slot/(alfa*2));

            var startXarray  = this.tracesExtremePoints(slInFlow);
            var queueOutStop = [];
            for (var x = 0; x < cycleTime; x++){
                queueOutStop.push(slOutFlow[x] == 0);
            }

            var queue = new Array(cycleTime).fill(0);

            var traces = startXarray.map(function(startX){
                var trace = [];
                var x = 0, y = 0, exit = 0;
                var speed = speed0; // m/s
                var moved = true;
                startX = startX - Math.round(distance/speed0);

                trace.push({x:startX, y:0});
                for (x = startX + 1; x < cycleTime; x++) {
                    if (y >= distance) {
                        return trace;
                    }

                    if (!moved){
                        if (x >= exit) {
                            moved = true;
                            speed = speed0;
                        }
                        trace.push({x:x,y:y});
                        continue;
                    }

                    //moved == true

                    if (y + speed >= distance - slot*(queue[x]) || (queueOutStop[x] && y + speed >= distance)){
                        y = distance - slot*(queue[x]);
                        if (y <= 0) {
                            return trace;
                        }
                        moved = false;

                        if (!queueOutStop[x]) {
                            exit = x;
                            for(var j = x; j > 0; j--){
                                if (queueOutStop[j]) {
                                    exit = j + Math.round((queue[x])/beta) - 1;
                                    break;
                                }
                            }
                        } else {
                            exit = x;
                            for(var j = x; j < cycleTime; j++){
                                if (queue[x] > queue[j-1]) {
                                    exit = j;
                                    break;
                                } else if (!queueOutStop[j]) {
                                    exit = j + Math.round((queue[x])/beta) - 1 ;
                                    break;
                                }
                            }
                        }

                        for(var j = x ; j < exit; j++){
                            queue[j] = queue[x-1] + 1;
                        }

                        trace.push({x:x,y:y});
                        continue;

                    } else {
                        y = y + speed;
                    }

                    trace.push({x:x,y:y});
                }
                return trace;
            });
            return traces
        }


};


})(AvenueApp);
