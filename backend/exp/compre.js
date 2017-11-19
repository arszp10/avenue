var _ = require('lodash');
var fs = require('fs');
var model = require('./model');
var traces = require('./traces');
var trackProps = require('./track-props');
var fileName = process.argv[2];

var contents = fs.readFileSync(fileName, 'utf8');
try {
    var jsonData1 = JSON.parse(contents);
    var jsonData2 = JSON.parse(contents);
}
catch (e){
    if(e instanceof SyntaxError) {
        throw new Error('Invalid JSON request');
    }
}


var distance = 300;
var slot = 5;
var p1Id = '1pjwfbozk2x'; // bottleneck  d
var p2Id = 'kj0mfc6mjsq'; // next stopline e

var p3aId = 'kdmv36wldip'; // stopline a
var p3bId = 'xe8nubtb7f'; // stopline b
var p3cId = '0p7180djy9a'; // stopline c

var p1 = _.find(jsonData1.data, {id: p1Id});
var p2 = _.find(jsonData1.data, {id: p2Id});
var p3a = _.find(jsonData1.data, {id: p3aId});
var p3b = _.find(jsonData1.data, {id: p3bId});
var p3c = _.find(jsonData1.data, {id: p3cId});

var pp1 = _.find(jsonData2.data, {id: p1Id});
var pp2 = _.find(jsonData2.data, {id: p2Id});
var pp3a = _.find(jsonData2.data, {id: p3aId});
var pp3b = _.find(jsonData2.data, {id: p3bId});
var pp3c = _.find(jsonData2.data, {id: p3cId});

_.forEach(pp1.edges, function(edge) {
    edge.portion = 0;
});
_.forEach(p1.edges, function(edge) {
    edge.portion = 0;
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

for(var qx = 200; qx <= 900; qx = qx + 100) {

    p1.avgIntensity = qx;
    p2.avgIntensity = qx;
    //p3a.avgIntensity = Math.round(qx/3);
    //p3b.avgIntensity = Math.round(qx/3);
    //p3c.avgIntensity = Math.round(qx/3);

    var result1 = model.simulate(jsonData1);
    var graphdata1 = traces.traces(result1, p1Id, p2Id, slot, distance, 1000);

    var singles = [];
    var singlesInx = [];
    _.forEach(graphdata1.traces, function(trace, inx) {
        if (model.hasStops(trace, distance) && trace[0].x > 90 && singles.length < 2000){
            singles.push(trace);
            singlesInx.push(inx);
            //console.log(inx);
        }
    });

    var result2;
    var graphdata2;
    var minps = singles.map(function(){ return [];});
    var mind = singles.map(function(){ return 1000000000;});

    var res = singles.map(function(){ return []});


    for(var q = 200; q <= 900; q = q + 2) {
        //console.log(q,qx);
        var minq = [];
        pp1.avgIntensity = q;
        pp2.avgIntensity = q;
        //pp3a.avgIntensity = Math.round(q/3);
        //pp3b.avgIntensity = Math.round(q/3);
        //pp3c.avgIntensity = Math.round(q/3);

        try{
            result2 = model.simulate(jsonData2);
            graphdata2 = traces.traces(result2, p1Id, p2Id, slot, distance, 1000);

        } catch(e){
            return;
        }

        var neighborhood     = 3600/(1.5*q);
        var rrr = singles.map(function(single, inx){
            var inx2;
            do {
                inx2 = getRandomInt(0, singles.length-1);
            } while (inx2 == inx);

            var mmin1, mmin2;

            var v1 = trackProps.vectorByMinSqareNeighborhoodOfTrack(single,        graphdata2.traces, distance, neighborhood, p2, singlesInx[inx]);
            var v2 = trackProps.vectorByMinSqareNeighborhoodOfTrack(singles[inx2], graphdata2.traces, distance, neighborhood, p2, singlesInx[inx2]);

            mmin1 = v1 ? trackProps.evklid(v1) : 1000000000;
            mmin2 = v2 ? trackProps.evklid(v2) : 1000000000;

            if (mmin1 <= mind[inx]) {
                mind[inx] = mmin1;
                minps[inx].push({q:q,m:mmin1});
            }
            if (mmin2 <= mind[inx]) {
                mind[inx] = mmin2;
                minps[inx].push({q:q,m:mmin2});
            }
        });

    }

    rrr = singles.map(function(single, inx) {
        if (minps[inx].length == 0) return;
        if (minps[inx].length == 1) { minq.push(minps[inx][0].q); return;}

        minps[inx] = _.sortBy(minps[inx], ['m','q']);

        //console.log(minps[inx]);
        //console.log(q,qx,'-----------------');
        var minm = 100000;
        var qq = 0;
        var qc = 0;
        for(var i = 1; i < minps[inx].length; i++ ){
            if (minps[inx][i].q == minps[inx][i-1].q
                && minps[inx][i].m == minps[inx][i-1].m
                && minps[inx][i].m <= minm) {
                minm = minps[inx][i].m;
                qq = qq + minps[inx][i].q;
                qc++
            }
        }
        if (qc == 0) {
            minq.push(minps[inx][0].q);
        } else {
            minq.push(Math.round(qq/qc));
        }

    });

    minq.map(function(v){
        console.log([qx,v].join(';'));
    });

}
