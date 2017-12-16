var _ = require('lodash');

var capacity = 0.5;
function tracesExtremePoints(flow){
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
}

function queueInOutProfilesinVeh(point, slot, distance){
    var queueOut = [];
    var queueOutStop = [];
    var startX = 0;

    for (var x = 0; x < point.cycleTime; x++){
        queueOutStop.push(point.outFlow[x] == 0);
    }

    for (var x = 0; x < point.cycleTime; x++){
        if (point.outFlow[x-1] == 0 && point.outFlow[x] > 0){
            startX = x;
            var sum = 0;
            for (var i = startX; i < point.cycleTime; i++){
                sum += capacity;
                queueOut.push({x:i, y:Math.round(sum)});
                if (sum * slot >= distance) break;
            }
        } else if (queueOutStop[x]){
            queueOut.push({x:x, y:0});
        }
    }

    return {
        queueOutStop: queueOutStop,
        queueOut: queueOut
    };
}


function findFirstOverValue(arr, val){
    for(var i=0; i<=arr.length-1; i++){
        if (arr[i] > val) return i;
    }
    return val;
}

module.exports = {
    traces: function(result, p1Id, p2Id, slot, distance, limit){
        var p1 = _.find(result, {id: p1Id});
        var p2 = _.find(result, {id: p2Id});
        var p12 = _.find(result, {id: p2Id+'_cwb_'+0});

        var speed0 = Math.round(50/3.6);

        var startXarray  = tracesExtremePoints(p1.outFlow);
        startXarray  = startXarray.slice(0, 130);

        var exitXarray  = tracesExtremePoints(p12.outFlow);

        var queueProfile = queueInOutProfilesinVeh(p2, slot, distance);
        var queueOutStop = queueProfile.queueOutStop;
        var queueOut     = queueProfile.queueOut;
        var queueInMeters  = queueOutStop.map(function(val){ return distance - slot * val;});
        var queueOutMeters = queueOut.map(function(val){ return {x:val.x, y:distance - slot * val.y};});

        var queue = new Array(p1.cycleTime).fill(0);

        var traces = startXarray.map(function(startX, inxxx){
            var trace = [];
            var x = 0;
            var y = 0;
            var exit = 0;
            //var arrivalTimeIndex = findFirstOverValue(exitXarray, startX + distance/speed0);//!!!
            //var arrivalTime = exitXarray[arrivalTimeIndex];
            //exitXarray = exitXarray.slice(arrivalTimeIndex + 1);
            var speed = speed0;//Math.round(distance/(arrivalTime-startX));
            var moved = true;
            trace.push({x:startX, y:0});
            for (x = startX + 1; x < p1.cycleTime; x++) {

                if (y >= distance) {
                    return trace;
                }

                if (moved){
                    if (y + speed > distance - slot*(queue[x]) || (queueOutStop[x] && y + speed >= distance)){
                        y =  distance - slot*(queue[x]);
                        if (y <= 0) {
                            return trace;
                        }
                        moved = false;

                        if (queue[x] == 0) {
                            exit = x;
                            for(var j = x; j< p1.cycleTime; j++){
                                if (!queueOutStop[j]) {
                                    exit = j;
                                    break;
                                }
                            }
                        } else {
                            exit = x;
                            for(var j = 0; j < queueOut.length-1; j++){
                                var condition = capacity > 1
                                        ? queueOut[j].y >= queue[x] && queue[x] < queueOut[j+1].y && queueOut[j].x >= x
                                        : queueOut[j].y == queue[x] && queueOut[j].x >= x;

                                if (condition) {
                                    exit = queueOut[j].x;
                                    break;
                                }
                            }
                        }

                        var delta = queue[x-1] + 1 == queue[x] ? 2 : 1;

                        for(var j = x ; j < exit; j++){
                            queue[j] = queue[x - 1] + delta;
                        }

                        trace.push({x:x,y:y});
                        continue;

                    } else {
                        y = y + speed;
                    }

                }
                if (!moved){
                    if (x >= exit) {
                        moved = true;
                        speed = speed0;
                    }
                }

                trace.push({x:x,y:y});
            }
            return trace;
        });

        return {
            traces:traces,
            queueInMeters:queueInMeters,
            queueOutMeters:queueOutMeters
        };
    }


};