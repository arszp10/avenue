var _       = require('lodash');
var fs      = require('fs');
var model   = require('./lib/model');
var trackProps  = require('./lib/track-props');
var traces      = require('./lib/traces');

var fileName   = process.argv[2];
var qx         = process.argv[3] ? process.argv[3] : 400 ;
var st         = process.argv[4] ? parseInt(process.argv[4]) : 120 ;

//var trackNums  = process.argv[3] ? process.argv[3].split(',') : [20] ;
//var constant = process.argv[4].trim() == 'const' ? true : false;
var contents = fs.readFileSync(fileName, 'utf8');
try {
    var jsonData = JSON.parse(contents);
}
catch (e){
    if(e instanceof SyntaxError) {
        throw new Error('Invalid JSON request');
    }
}


var distance = 300;
var slot = 5;
var p1Id = '1pjwfbozk2x'; // bottleneck
var p2Id = 'kj0mfc6mjsq'; // next stopline

var p1 = _.find(jsonData.data, {id: p1Id});
var p2 = _.find(jsonData.data, {id: p2Id});

_.forEach(p1.edges, function(edge) {
    edge.portion = 0;
});
_.forEach(p2.edges, function(edge) {
    edge.portion = '100%';
});
p1.avgIntensity = qx;
p2.avgIntensity = qx;


var result1 = model.simulate(jsonData);
var graphdata1 = traces.traces(result1, p1Id, p2Id, slot, distance, 1000);

var singles = [];
var singlesInx = [];
_.forEach(graphdata1.traces, function(trace, inx) {
    if (trackProps.hasStops(trace, distance) && trace[0].x > st && singles.length < 1){
        singles.push(trace);
        singlesInx.push(inx);
    }
});


var result2;
var graphdata2;
var res = singles.map(function(){ return []});
var neighborhood = 10;

var cap = ['q', 'i1', 'i2', 's1', 's2', 's3', 'v1', 'v2', 'rt1', 'rt2', 'st1', 'st2', 'sl1', 'sl2', 'tan1', 'tan2', 'y', 'm'];
console.log(cap.join(';'));

for(var q = 100; q <= 1000; q = q + 2) {
    p1.avgIntensity  = q;
    p2.avgIntensity  = q;
    neighborhood     = 3600/(1.5*q);

    try{
        result2 = model.simulate(jsonData);
        graphdata2 = traces.traces(result2, p1Id, p2Id, slot, distance, 1000);
    } catch(e){
        return;
    }

    singles.map(function(single, inx){
       var v = trackProps.vectorByMinSqareNeighborhoodOfTrack(single, graphdata2.traces, distance, neighborhood, p2, singlesInx[inx]);
       if (v){
          var m = trackProps.evklid(v);
          var res = [ q, v.i1, v.i2, v.s1, v.s2, v.s3, v.v1, v.v2, v.rt1, v.rt2, v.st1, v.st2, v.sl1, v.sl2, v.tan1, v.tan2, trackProps.ideal(q,qx), m ];
          console.log(res.map(function(v){return (''+v).replace('.',',')}).join(';'));
       }

    });

}

