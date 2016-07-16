var _ = require('lodash');
var Flow = require('./flow');
var model = require('./model');

function EntranceRamp(options, network, indexMap){
    this.secondary = {};
    var primaryEdges = [];
    var secondaryEdges =[];

    _.each(options.edges, function(v){
        if (v.hasOwnProperty('secondary')){
            secondaryEdges.push(v);
        } else {
            primaryEdges.push(v);
        }});

    this.primaryFlowRate  =  parseInt(primaryEdges[0].portion);
    this.secondaryFlowRate  = parseInt(secondaryEdges[0].portion);

    var pOptions = Object.assign({}, options);
    var sOptions = Object.assign({}, options);

    pOptions.edges = primaryEdges;
    pOptions.flowRate = this.primaryFlowRate;

    sOptions.edges = secondaryEdges;
    sOptions.saturationFlowRate = options.secondaryFlowSaturationFlowRate;
    sOptions.flowRate = this.secondaryFlowRate;

    Flow.apply(this, [pOptions, network, indexMap]);
    Flow.apply(this.secondary, [sOptions, network, indexMap]);

    this.calc = function (){
        this.secondary.initInFlow();
        this.initInFlow();
        this.copyFlow();
        model.conflictingApproach(this, this.secondary);
        this.merge(this.secondary.outFlow);


        this.sumInFlow = this.inFlow.sum();
        this.sumInFlow += this.secondary.sumInFlow;
        this.sumOutFlow = this.outFlow.sum();

        this.delay = this.secondary.delay;
        this.maxQueueLength = this.secondary.maxQueueLength;

        this.greenSaturation = 100 * this.sumOutFlow / (this.cycleLength * this.saturationFlowRate/3600);
        this.isCongestion = this.secondary.isCongestion;

        //this.flowRate =  this.primaryFlowRate + this.secondaryFlowRate;
    };

    
    this.getFlowRate = function(){
        return this.primaryFlowRate + this.secondaryFlowRate;
    };


}

module.exports = EntranceRamp;
