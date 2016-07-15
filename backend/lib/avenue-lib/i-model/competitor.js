var _ = require('lodash');
var Flow = require('./flow');
var model = require('./model');

function Competitor(options, network, indexMap){
    this.primary = {};

    var primaryEdges = [];
    var secondaryEdges =[];

    _.each(options.edges, function(edge){
        if (edge.hasOwnProperty('secondary')){
            secondaryEdges.push(edge);
        } else {
            primaryEdges.push(edge);
    }});

    this.primaryIntensity  =  parseInt(primaryEdges[0].portion);
    this.secondaryIntensity  = parseInt(secondaryEdges[0].portion);

    var pOptions = Object.assign({}, options);
    var sOptions = Object.assign({}, options);

    pOptions.edges = primaryEdges;
    pOptions.avgIntensity = this.primaryIntensity;

    sOptions.edges = secondaryEdges;
    sOptions.capacity = options.secondaryFlowCapacity;
    sOptions.avgIntensity = this.secondaryIntensity;


    Flow.apply(this.primary, [pOptions, network, indexMap]);
    Flow.apply(this, [sOptions, network, indexMap]);

    this.calc = function(){
        this.initInFlow();
        this.primary.initInFlow();
        this.primary.copyFlow();
        model.competitor(this.primary, this);
    };

}

module.exports = Competitor;
