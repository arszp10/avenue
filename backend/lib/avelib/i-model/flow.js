var _      = require('lodash');
var utils  = require('../utils/utils')();

function Flow(props, network) {

    this.resetIntervals =  function(intervals){
        this.intervals = intervals.map(function(v){
            return {
                s: parseInt(v[0]),
                f: parseInt(v[1]),
                length: v[1] - v[0]
            }
        });

        var last = this.intervals.last();
        var first = this.intervals.first();
        if (last && first) {
            if ((last.f + 1) % this.cycleLength == first.s) {
                last.length += first.length;
            }
        }
    };

    this.flipBack = function () {
        for (var i = 0; i < this.inFlow.length; i++){
            this.inFlow[i] = this.outFlow[i];
        }
    };

    this.merge = function(outFlow) {
        for (var i = 0; i < this.outFlow.length; i++){
            this.outFlow[i] = this.outFlow[i] + outFlow[i];
        }
    };

    this.copyFlow = function() {
        for (var i = 0; i < this.inFlow.length; i++){
            this.outFlow[i] = this.inFlow[i];
        }
    };

    this.json = function () {
        return {
            id:              this.id,
            type:            this.type,
            tag:             this.tag,
            parent:          this.parent,
            cycleLength:     this.cycleLength,
            flowRate:        this.flowRate,
            saturationFlowRate:this.saturationFlowRate,
            inFlow:          this.inFlow,
            outFlow:         this.outFlow,
            queue:           this.queue,
            isCongestion:    this.isCongestion,
            maxQueue:        this.maxQueueLength,
            delay:           this.delay,
            greenSaturation: this.greenSaturation,
            sumInFlow:       this.sumInFlow,
            sumOutFlow:      this.sumOutFlow
        }
    };

    this.constantFlowCoeff = function(){
        var sum = 0;
        _.forEach(this.edges, function(edge, i){
            sum += parseInt(edge.portion);
        });
        return this.flowRate / sum;
    };

    this.initInFlow = function () {
        var sumInTotal = 0;
        var hasOverflow = false;
        var that = this;
        if (this.edges && this.edges.length > 0) {
            var sourceNodes = this.sourceNodes();
            var cfc = this.constantFlowCoeff();
            var avFlow = (this.flowRate - this.flowRate/cfc) / 3600;
            for (var i = 0; i < this.inFlow.length; i++){
                var sumI = 0;

                _.forEach(this.edges, function(el){
                    sumI +=  that.edgePortionFlowRate(i, el, sourceNodes[el.source]);
                });

                if (cfc <= 1) {
                    sumI = sumI * cfc;
                } else {
                    sumI += avFlow;
                }

                if (sumI > this.saturationFlowRatePerSecond) {
                    hasOverflow = true;
                }
                this.inFlow[i] = sumI;
                sumInTotal += sumI;
            }
        }
        if (sumInTotal == 0) {
            this.inFlow = [].fillArray(this.cycleLength, this.flowRatePerSecond);
        }
        return hasOverflow;
    };

    this.edgePortionFlowRate = function (i, edge, parentFlow, constFlowPerSecond){
        return parentFlow.outFlow[i] * parseInt(edge.portion) / parentFlow.getFlowRate();
    };

    this.sourceNodes = function () {
        var result = {};
        this.edges.map(function(edge){
            var sourceNode = this.network.getNode(edge.source);
            if (sourceNode.type == 'concurrent' && !edge.hasOwnProperty('secondary')) {
                sourceNode = sourceNode.primary;
            }
            result[edge.source] = sourceNode;
        }, this);
        return result;
    };

    this.getFlowRate = function(){
        return this.flowRate;
    };

    // common node/flow properties
    this.id           = props.id;
    this.type         = props.type;
    this.edges        = props.edges;
    this.tag          = props.tag;
    this.parent       = props.parent;

    this.cycleLength                      = parseInt(props.cycleLength);
    this.flowRate                         = parseInt(props.flowRate);
    this.flowRatePerSecond                = this.flowRate / 3600;
    this.saturationFlowRate               = parseInt(props.saturationFlowRate);
    this.saturationFlowRatePerSecond      = this.saturationFlowRate / 3600;

    // init stop-line properties
    this.greenPhases  = props.greenPhases;
    this.greenOffset1 = props.greenOffset1;
    this.greenOffset2 = props.greenOffset2;

    if (this.type == 'stopline') {
        this.resetIntervals(props.intervals);
    }

    // additional conflicting approach node property
    this.secondaryFlowSaturationFlowRate  = parseInt(props.secondaryFlowSaturationFlowRate);

    // freeway node properties
    this.length                = parseInt(props.length);
    this.travelTime             = parseInt(props.travelTime);
    this.platoonDispersion     = parseFloat(props.platoonDispersion);


    // init output calculated object props
    this.inFlow         = [].fillArray(this.cycleLength, 0);
    this.outFlow        = [].fillArray(this.cycleLength, 0);
    this.queue          = [].fillArray(this.cycleLength, 0);
    this.isCongestion    = false;
    this.maxQueueLength  = 0;
    this.delay           = 0;
    this.greenSaturation = 0;
    this.sumInFlow       = 0;
    this.sumOutFlow      = 0;

    // store pointer to whole network
    this.network         = network;

}



module.exports = Flow;
