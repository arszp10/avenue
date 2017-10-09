var _ = require('lodash');
var fs = require('fs');
var avenueLib = require('../lib/avenue-lib');
var responses = require('../routes/api-responses');

var isint = /^[0-9]+$/;
var isfloat = /^([0-9]+)?\.[0-9]+$/;

function coerce(str) {
    if ('null' == str) return null;
    if ('true' == str) return true;
    if ('false' == str) return false;
    if (isfloat.test(str)) return parseFloat(str, 10);
    if (isint.test(str)) return parseInt(str, 10);
    return undefined;
}

var fileName = process.argv[2];
var contents = fs.readFileSync(fileName, 'utf8');

try {
    var jsonData = JSON.parse(contents);
}
catch (e){
    if(e instanceof SyntaxError) {
        var err = { success: false,  message: 'Invalid JSON request',  data: {code: 500} };
        console.log(JSON.stringify(err));
        process.exit(1);
    }
}

var requestBodyData = _.cloneDeepWith(jsonData, coerce);

requestBodyData = requestBodyData.data;

var errors = avenueLib.validate(requestBodyData);
if (errors.length > 0) {
    console.log(JSON.stringify(responses.modelValidationFailed(errors)));
    return;
}

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


function queueInOutProfilesinVeh1(point){
    var queueInSum = 0;
    var queueOutSum = 0;
    var queueOut = [];
    var queueIn = point.inFlow.map(function(val, inx){
        queueInSum += val;
        queueOutSum += point.outFlow[inx];
        if (Math.abs(queueInSum - queueOutSum) <=0.01) {
            queueInSum = 0;
            queueOutSum = 0;
        }
        if (inx > 0 && point.outFlow[inx-1] > 0 && point.outFlow[inx] == 0){
            queueInSum -= queueOutSum ;
            queueOutSum = 0;
        }

        queueOut.push((queueOutSum));
        return  ((queueInSum));
    });
    return {
        queueInModel: queueIn,
        queueOuModel: queueOut
    }
}

function queueInOutProfilesinVeh(point, dxdo){
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
                sum += 0.5;
                queueOut.push({x:i, y:sum});
                if (sum*5 >=300) break;
            }
        } else if (queueOutStop[x]){
            queueOut.push({x:x, y:0});
        }
    }

    return {
        queueOutStop: queueOutStop,
        queueOut: queueOut
    }
}

var result = avenueLib.simulate(requestBodyData);

var p1Id = '1pjwfbozk2x';
var p2Id = 'kj0mfc6mjsq';

var p1 = _.find(result, {id: p1Id});
var p2 = _.find(result, {id: p2Id});

var distance = 300;
var slot = 5;
var dxdo = 2;
var speed0 = Math.round(50/3.6);

var startXarray  = tracesExtremePoints(p1.outFlow);
    startXarray  = startXarray.slice(0, 174);

var queueProfileModel = queueInOutProfilesinVeh1(p2);

var queueProfile = queueInOutProfilesinVeh(p2,dxdo);
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
    var speed = speed0;
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
                    exit =  p1.cycleTime;
                    for(var j = x; j< p1.cycleTime; j++){
                        if (queue[j] < queue[x]) {
                            exit = j + 2;
                            break;
                        }
                    }
                }

                var delta = queue[x-1] + 1 == queue[x] ? 2 : 1;

                for(var j=x ; j< exit; j++){
                    queue[j] = queue[x-1] + delta;
                }

                trace.push({x:x,y:y});
                continue;

            } else {
                y = y + speed;
            }

        }
        if (!moved){
            if (queue[x] > 0) {
                var ps = _.filter(queueOut, function(o) { return o.y == queue[x]-1 && o.x >= x});
                if(ps.length>0 && x >= ps[0].x){
                    moved = true;
                }
            }
        }


        trace.push({x:x,y:y});
    }
    return trace;
});



var output = {
    queueOutModel:queueProfileModel.queueOuModel.map(function(val){ return distance - slot * val;}),
    queueInModel:queueProfileModel.queueInModel.map(function(val){ return distance - slot * val;}),
    queueOut:queueOutMeters,
    queueIn:queueInMeters,
    traces:traces,
    queue:queue

};

console.log('var data='+JSON.stringify(output)+';');