var Flow = require('./flow');
var model = require('./model');

function Pedestrian(options, network){
    Flow.apply(this, arguments);
    this.parent = options.hasOwnProperty('parent')
        ? options.parent : false;


    this.calc = function (){
        var hasOverflow = this.initInFlow();
        var offset  = this.parent ? this.network.getNode(this.parent).offset : 0;
        model.stopLine(this, offset);

    };

}

module.exports = Pedestrian;
