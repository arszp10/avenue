var _ = require('lodash');
var Flow = require('./flow');
var model = require('./model');

function CompetitorMerge(options, edges, network, indexMap){
    this.secondary = {};
    var primaryEdges = [];
    var secondaryEdges =[];

    _.each(edges, function(v){
        if (v.hasOwnProperty('secondary')){
            secondaryEdges.push(v);
        } else {
            primaryEdges.push(v);
        }});

    Flow.apply(this, [options, primaryEdges, network, indexMap]);
    Flow.apply(this.secondary, [options, secondaryEdges, network, indexMap]);

    var sId  = primaryEdges[0].source;

    this.avgIntensity = network[indexMap[sId]].avgIntensity;
    this.capacity = network[indexMap[sId]].capacity;
    this.calc = function (){
        this.secondary.initInFlow();
        this.initInFlow();
        this.copyFlow();
        model.competitor(this, this.secondary);
        this.merge(this.secondary.outFlow);
        this.delay = this.secondary.delay;
        this.maxQueueLength = this.secondary.maxQueueLength;
    };

}

module.exports = CompetitorMerge;
