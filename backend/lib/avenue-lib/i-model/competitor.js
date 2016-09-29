var _ = require('lodash');
var Flow = require('./flow');
var model = require('./model');

function Competitor(options, network){
    this.primary = {};

    var primaryEdges = [];
    var secondaryEdges =[];

    _.each(options.edges, function(v){
        if (v.hasOwnProperty('secondary')){
            secondaryEdges.push(v);
        } else {
            primaryEdges.push(v);
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


    Flow.apply(this.primary, [pOptions, network]);
    Flow.apply(this, [sOptions, network]);

    this.calc = function(){
        this.initInFlow();
        this.primary.initInFlow();
        this.primary.copyFlow();
        model.competitor(this.primary, this);
    };

}

module.exports = Competitor;
