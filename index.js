var utils = require('./utils.js')();
var StopLine = require('./stop-line.js');
var CarriageWay = require('./carriageway.js');
var BottleNeck = require('./bottleneck.js');

var sl = new StopLine();
sl.calc();

//console.log(sl.outFlow);
var cw = new CarriageWay();
cw.calc(sl.outFlow);

var bn = new BottleNeck();
console.log(new Date());
for (var j = 0; j < 1000000; j++) {
    bn.calc(cw.outFlow);
    //for (var i = 0; i < bn.options.cicleTime; i++) {
    //    console.log(bn.inFlow[i], bn.outFlow[i]);
    //}
}
console.log(new Date());
