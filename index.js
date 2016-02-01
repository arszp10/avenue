var utils       = require('./utils')();
var StopLine    = require('./stop-line');
var CarriageWay = require('./carriageway');
var BottleNeck  = require('./bottleneck');
var Fork        = require('./fork');
var Merge       = require('./merge');
var Competitor  = require('./competitor');

var print = function(obj){
    for (var i = 0; i < obj.flow.cicleTime; i++) {
        console.log(obj.flow.inFlow[i], obj.flow.outFlow[i]);
    };
};

var printFork = function(obj){
    for (var i = 0; i < obj.flow.cicleTime; i++) {
        console.log(obj.flow.inFlow[i], obj.outFlows[0].outFlow[i]);
    };
};

var printCompetitor = function(obj){
    for (var i = 0; i < obj.flow.cicleTime; i++) {
        console.log(obj.main.outFlow[i], obj.flow.outFlow[i],obj.flow.inFlow[i]);
    };
};

var sl = new StopLine({avgIntensity: 600, capacity: 1800});
var sl1 = new StopLine({avgIntensity: 600, capacity: 1800});
var cw = new CarriageWay();

var bn = new BottleNeck({capacity: 2500});
var fk = new Fork({divisionRates: [0.3, 0.7]});
var mg = new Merge({capacity: 2000});
var cr = new Competitor({avgIntensity: 300, capacity: 1800});

sl.flow.intervals = [
    {s:0, f:19, length: 20},
    {s:90, f:99, length: 10}
];

sl1.flow.intervals = [
    {s:30, f:59, length: 30}
];


cw.flow.inFlow = sl.flow.outFlow;
sl1.flow.inFlow = cw.flow.outFlow;
//bn.flow.inFlow = cw.flow.outFlow;
//fk.flow.inFlow = bn.flow.outFlow;
//mg.inFlows = fk.outFlows;

cr.main = sl1.flow;


sl.calc();
cw.calc();
sl1.calc();

//bn.calc();
//fk.calc();
//mg.calc();

cr.calc();
console.log(cr.flow.delay);
printCompetitor(cr);


//console.log(cr.flow2.inFlow.sum(), cr.flow2.outFlow.sum());




//
////console.log(sl.outFlow);
//var cw = new CarriageWay();
//cw.calc(sl.outFlow);
//
////
//
//var fk = new Fork();
//
//console.log(new Date());
//for (var j = 0; j < 1000000; j++) {
//    fk.calc(cw.outFlow);
//    //for (var i = 0; i < bn.options.cicleTime; i++) {
//    //    console.log(bn.inFlow[i], bn.outFlow[i]);
//    //}
//}
//console.log(new Date());


//var f = new Flow(
//    {
//        capacity: 1800,
//        avgIntensity: 600,
//        inFlow: [1,2,3],
//        outFlow: [0,0,0],
//    }
//);
