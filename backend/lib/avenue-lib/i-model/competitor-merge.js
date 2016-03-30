var _ = require('lodash');
var Flow = require('./flow');
var model = require('./model');

function CompetitorMerge(options, network, indexMap){
    this.secondary = {};
    var primaryEdges = [];
    var secondaryEdges =[];

    _.each(options.edges, function(v){
        if (v.hasOwnProperty('secondary')){
            secondaryEdges.push(v);
        } else {
            primaryEdges.push(v);
        }});

    this.sourceId  = primaryEdges[0].source;

    var pOptions = _.assign({}, options);
    var sOptions = _.assign({}, options);

    pOptions.edges = primaryEdges;
    sOptions.edges = secondaryEdges;

    Flow.apply(this, [pOptions, network, indexMap]);
    Flow.apply(this.secondary, [sOptions, network, indexMap]);
    //this.avgIntensity = network[indexMap[sId]].avgIntensity;
    //this.capacity = network[indexMap[sId]].capacity;
    this.calc = function (){
        this.avgIntensity = this.network[this.indexMap[ this.sourceId ]].avgIntensity;
        this.capacity = this.network[this.indexMap[ this.sourceId ]].capacity;
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
