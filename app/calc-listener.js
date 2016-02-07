var utils       = require('./utils/utils')();
var StopLine    = require('./math-model/stop-line');
var CarriageWay = require('./math-model/carriageway');
var BottleNeck  = require('./math-model/bottleneck');
var Fork        = require('./math-model/fork');
var Merge       = require('./math-model/merge');
var Competitor  = require('./math-model/competitor');
var _ = require('lodash');

module.exports = {
    calc: function(request){
        _.each(request.nodes, function(v, i){
            switch (v.type) {
                case "stopline":
                    request.nodes[i] = new StopLine(v);
                    break;
                case "carriageway":
                    request.nodes[i] = new CarriageWay(v);
                    break;
                case "fork":
                    request.nodes[i] = new Fork(v);
                    break;
                case "merge":
                    request.nodes[i] = new Merge(v);
                    break;
                case "bottleneck":
                    request.nodes[i] = new BottleNeck(v);
                    break;
                case "concurrent":
                    request.nodes[i] = new Competitor(v);
                    break;
                default:
                    request.nodes[i] = new StopLine(v);
            }
        });

        _.each(request.edges, function(v,i){
            var s = v.source;
            var t = v.target;
            request.nodes[t].flow.inFlow = request.nodes[s].flow.outFlow;
        });

        _.each(request.nodes, function(v,i){
            v.calc();
        });

        // пока один проход так сказать
        return request.nodes;
    }
};