var utils = require('./utils.js')();
var StopLine = require('./stop-line.js');
var CarriageWay = require('./carriageway.js');

var sl = new StopLine();
sl.calc();

//console.log(sl.outFlow);

var cw = new CarriageWay();
console.log(new Date());
for (var i = 0; i < 1000000; i++) {
    cw.calc(sl.outFlow);
//for (var i = 0; i < cw.options.cicleTime; i++) {
    //console.log(cw.inFlow[i], cw.outFlow[i]);
//}
}
console.log(new Date());
