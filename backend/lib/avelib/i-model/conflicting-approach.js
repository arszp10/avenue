var _ = require('lodash');
var Flow = require('./flow');
var model = require('./model');

function ConflictingApproach(options, network, indexMap){
    this.primary = {};

    var primaryEdges = [];
    var secondaryEdges =[];

    _.each(options.edges, function(edge){
        if (edge.hasOwnProperty('secondary')){
            secondaryEdges.push(edge);
        } else {
            primaryEdges.push(edge);
    }});

    this.primaryFlowRate  =  parseInt(primaryEdges[0].portion);
    this.secondaryFlowRate  = parseInt(secondaryEdges[0].portion);

    var pOptions = Object.assign({}, options);
    var sOptions = Object.assign({}, options);

    pOptions.edges = primaryEdges;
    pOptions.flowRate = this.primaryFlowRate;

    sOptions.edges = secondaryEdges;
    sOptions.saturationFlowRate = options.secondaryFlowSaturationFlowRate;
    sOptions.flowRate           = this.secondaryFlowRate;


    Flow.apply(this.primary, [pOptions, network, indexMap]);
    Flow.apply(this, [sOptions, network, indexMap]);

    this.calc = function(){
        this.initInFlow();
        this.primary.initInFlow();
        this.primary.copyFlow();
        model.conflictingApproach(this.primary, this);
    };

}

module.exports = ConflictingApproach;
