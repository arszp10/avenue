var _ = require('lodash');
var Flow = require('./flow');
var model = require('./model');

function CompetitorMerge(options, network){
    this.secondary = {};
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

    Flow.apply(this, [pOptions, network]);
    Flow.apply(this.secondary, [sOptions, network]);

    this.calc = function (){
        this.secondary.initInFlow();
        this.initInFlow();
        this.copyFlow();
        model.competitor(this, this.secondary);
        this.merge(this.secondary.outFlow);


        this.sumInFlow = this.inFlow.sum();
        this.sumInFlow += this.secondary.sumInFlow;
        this.sumOutFlow = this.outFlow.sum();

        this.delay = this.secondary.delay;
        this.maxQueueLength = this.secondary.maxQueueLength;

        this.greenSaturation = 100 * this.sumOutFlow / (this.cycleTime * this.capacity/3600);
        this.isCongestion = this.secondary.isCongestion;

        //this.avgIntensity =  this.primaryIntensity + this.secondaryIntensity;
    };

    this.getAvgIntensity = function(){
        return this.primaryIntensity + this.secondaryIntensity;
    };


}

module.exports = CompetitorMerge;
