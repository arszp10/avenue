var Flow = require('./flow');
var model = require('./model');

function Point(options, edges, network){
    Flow.apply(this, arguments);

    this.calc = function (){
        var hasOverflow = this.initInFlow();
        this.copyFlow();
    };

}

module.exports = Point;