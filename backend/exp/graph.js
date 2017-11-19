var _       = require('lodash');
var fs      = require('fs');
var model   = require('./lib/model');
var traces  = require('./lib/traces');

var fileName  = process.argv[2];
var trackNum  = process.argv[3] ? parseInt(process.argv[3]) : 2000 ;
var qx = process.argv[4];


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
var p1Id = '1pjwfbozk2x';  // bottleneck d
var p2Id = 'kj0mfc6mjsq';  // next stopline e
var p3aId = 'kdmv36wldip'; // stopline a
var p3bId = 'xe8nubtb7f';  // stopline b
var p3cId = '0p7180djy9a'; // stopline c

var p1 = _.find(jsonData.data, {id: p1Id});
var p2 = _.find(jsonData.data, {id: p2Id});

var p3a = _.find(jsonData.data, {id: p3aId});
var p3b = _.find(jsonData.data, {id: p3bId});
var p3c = _.find(jsonData.data, {id: p3cId});

if (qx) {
    _.forEach(p1.edges, function(edge) {
        edge.portion = 0;
    });

    p1.avgIntensity = qx;
    p2.avgIntensity = qx;
}
//p3a.avgIntensity = Math.round(qx/3);
//p3b.avgIntensity = Math.round(qx/3);
//p3c.avgIntensity = Math.round(qx/3);

var result1 = model.simulate(jsonData);

var graphdata1 = traces.traces(result1, p1Id, p2Id, slot, distance, trackNum);
var l = graphdata1.traces.length;

var single = graphdata1.traces[l-1];

var result2 = model.simulate(jsonData);
var graphdata2 = traces.traces(result2, p1Id, p2Id, slot, distance, 1000);

var output = {
    single: single,
    queueOut:graphdata2.queueOutMeters,
    queueIn:graphdata2.queueInMeters,
    traces:graphdata2.traces,
};
console.log('var data='+JSON.stringify(output)+';');

