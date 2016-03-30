var _ = require('lodash');
var Flow = require('./flow');
var model = require('./model');

function Competitor(options, network, indexMap){
    this.primary = {};

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

    Flow.apply(this.primary, [pOptions, network, indexMap]);
    Flow.apply(this, [sOptions, network, indexMap]);

    this.calc = function(){
        this.primary.avgIntensity = this.network[this.indexMap[ this.sourceId ]].avgIntensity;
        this.primary.capacity = this.network[this.indexMap[ this.sourceId ]].capacity;
        this.initInFlow();
        this.primary.initInFlow();
        this.primary.copyFlow();
        model.competitor(this.primary, this);
    };

}

module.exports = Competitor;
