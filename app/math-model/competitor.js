var _ = require('lodash');
var Flow = require('./flow');
var model = require('./model');

function Competitor(options, edges, network){
    this.primary = {};
    var primaryEdges = [];
    var secondaryEdges =[];

    _.each(edges, function(v){
        if (v.hasOwnProperty('secondary')){
            secondaryEdges.push(v);
        } else {
            primaryEdges.push(v);
    }});

    Flow.apply(this.primary, [options, primaryEdges, network]);
    Flow.apply(this, [options, secondaryEdges, network]);

    var sId  = primaryEdges[0].source;

    this.primary.avgIntensity = network[sId].avgIntensity;
    this.primary.capacity = network[sId].capacity;
    this.calc = function (){
        this.initInFlow();
        this.primary.initInFlow();
        this.primary.copyFlow();
        //console.log(this.primary.outFlow);
        model.competitor(this.primary, this);
    };

}

module.exports = Competitor;
