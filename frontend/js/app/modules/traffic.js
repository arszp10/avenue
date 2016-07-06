(function(App){
    var settings  = App.Resources.Settings;

    var booleanArrayPad = function (n, v) {
        if (n < 1 ) return [];
        return Array.apply(null, Array(n)).map(Boolean.prototype.valueOf, v);
    };


    App.Modules.traffic =  {
        signalDiagramData:  function(crossRoad, node){
            var stopLine = node;
            var i = 0, icolor = '', inext = 0, goff = 0;
            var diagram = [];
            var phCount =  crossRoad.phases.length;
            var interTact = settings.interTact;
            var prevGoff = 0;
            for (i = 0; i < phCount; i++){
                icolor = stopLine.greenPhases[i] ? 'green' : 'red';
                goff = stopLine.greenPhases[i] ? parseInt(stopLine.greenOffset2) : parseInt(stopLine.greenOffset1);
                inext = (i + 1) % phCount;
                if (stopLine.greenPhases[i] === stopLine.greenPhases[inext]) {
                    diagram.push({
                        color : icolor,
                        length : crossRoad.phases[i].length
                    });
                    continue;
                }
                diagram.push({
                    color : icolor,
                    length : crossRoad.phases[i].length - interTact[icolor].length + prevGoff + goff
                });
                diagram = diagram.concat(JSON.parse(JSON.stringify(interTact[icolor].signals)));
                prevGoff = -goff;
            }
            diagram[0].length += prevGoff;
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
