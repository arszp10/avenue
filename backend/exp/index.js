var _ = require('lodash');
var fs = require('fs');
var model = require('./model');
var traces = require('./traces');
var fileName = process.argv[2];
var contents = fs.readFileSync(fileName, 'utf8');
try {
    var jsonData = JSON.parse(contents);
}
catch (e){
    if(e instanceof SyntaxError) {
        throw new Error('Invalid JSON request');
    }
}

function findTheNearestPoint(trace, base){
    var inx = trace.length;
    for(inx = 0; inx < trace.length; inx++){
        var point =  trace[inx];
        if (point.x >= base.x && point.y >= base.y) {
            //console.log(point, base);
            return inx==0?0:inx-1;
        }
    }
    return  inx==0?0:inx-1;
}

function metricSquare(tt1,tt2, dist) {
    var t1 = JSON.parse(JSON.stringify(tt1));
    var t2 = JSON.parse(JSON.stringify(tt2));


    //console.log(t1,t2);

    if (t1[0].x > t2[0].x) {
        for(var i = t1[0].x - 1 ; i >= t2[0].x; i-- ){
            t1.unshift({x:i, y:0});
        }
    } else {
        for(var i = t2[0].x - 1; i >= t1[0].x; i-- ){
            t2.unshift({x:i, y:0});
        }
    }
    //console.log('*******************');
    //console.log(t1,t2);

    var l1 = t1.length-1;
    var l2 = t2.length-1;

    if (t1[l1].x > t2[l2].x) {
        for(var i = t2[l2].x ; i < t1[l1].x; i++ ){
            t2.push({x:i, y:dist});
        }
    } else {
        for(var i = t1[l1].x; i < t2[l2].x; i++ ){
            t1.push({x:i, y:dist});
        }
    }

    //console.log(t1,t2);

    var m = 0;
    for(var i = 0; i < t1.length; i++ ){
        m = m + Math.abs(t1[i].y - t2[i].y);
    }

    //console.log(m);
    return m;
}

function Mmin (single, traces, distance){
    var offset = 30;
    var mmin = -1;
    _.forEach(traces, function(trace){
        if (Math.abs(trace[0].x-single[0].x) > offset) {
            return;
        }
        var M = metricSquare(trace,single, distance);

        if (mmin < 0 || M < mmin) {
            mmin = M;
        }
    });
    return mmin;
}

var portions = [
    [	10	,	10	,	80	],
    [	10	,	20	,	70	],
    [	10	,	30	,	60	],
    [	10	,	40	,	50	],
    [	10	,	50	,	40	],
    [	10	,	60	,	30	],
    [	10	,	70	,	20	],
    [	10	,	80	,	10	],
    [	20	,	10	,	70	],
    [	20	,	20	,	60	],
    [	20	,	30	,	50	],
    [	20	,	40	,	40	],
    [	20	,	50	,	30	],
    [	20	,	60	,	20	],
    [	20	,	70	,	10	],
    [	30	,	10	,	60	],
    [	30	,	20	,	50	],
    [	30	,	30	,	40	],
    [	30	,	40	,	30	],
    [	30	,	50	,	20	],
    [	30	,	60	,	10	],
    [	40	,	10	,	50	],
    [	40	,	20	,	40	],
    [	40	,	30	,	30	],
    [	40	,	40	,	20	],
    [	40	,	50	,	10	],
    [	50	,	10	,	40	],
    [	50	,	20	,	30	],
    [	50	,	30	,	20	],
    [	50	,	40	,	10	],
    [	60	,	10	,	30	],
    [	60	,	20	,	20	],
    [	60	,	30	,	10	],
    [	70	,	10	,	20	],
    [	70	,	20	,	10	],
    [	80	,	10	,	10	]
];

portions = [[66.6667,16.66667,16.66667]];

var distance = 300;
var slot = 5;
var p1Id = '1pjwfbozk2x'; // bottleneck
var p2Id = 'kj0mfc6mjsq'; // next stopline

var result1 = model.simulate(jsonData);

var graphdata1 = traces.traces(result1, p1Id, p2Id, slot, distance, 40);
var l = graphdata1.traces.length;
var single = graphdata1.traces[l-1];

var p1 = _.find(jsonData.data, {id: p1Id});
_.forEach(p1.edges, function(edge) {
    edge.portion = 0;
});

var result2;
var graphdata2;

for(var q = 100; q<= 1500; q=q+50) {
    p1.avgIntensity = q;
    var mmin = -1;
    var minport;
    _.forEach(portions, function(port) {
        //_.forEach(p1.edges, function(edge, inx) {
        //    edge.portion = Math.round(q * port[inx]/100);
        //});

        try{
            result2 = model.simulate(jsonData);
            graphdata2 = traces.traces(result2, p1Id, p2Id, slot, distance, 1000);

        } catch(e){
            return;
        }

        var m = Mmin(single, graphdata2.traces,distance);

        if (mmin == -1 || m < mmin) {
            mmin = m;
            minport = port;
        }

        //console.log(q, port.map(function(v){return Math.round(v*q/100);}), m);
    });

    console.log(q+','+ mmin);
    //console.log(q, mmin, minport.map(function(v){return Math.round(v*q/100);}));
}


var output = {
    single: single,
    //queueOutModel:queueProfileModel.queueOuModel.map(function(val){ return distance - slot * val;}),
    //queueInModel:queueProfileModel.queueInModel.map(function(val){ return distance - slot * val;}),
    queueOut:graphdata2.queueOutMeters,
    queueIn:graphdata2.queueInMeters,
    traces:graphdata2.traces,

};
//console.log('var data='+JSON.stringify(output)+';');

