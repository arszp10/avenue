var utils       = require('./utils/utils')();
var CrossRoad   = require('./math-model/crossroad');
var Point       = require('./math-model/point');
var StopLine    = require('./math-model/stop-line');
var CarriageWay = require('./math-model/carriageway');
var BottleNeck  = require('./math-model/bottleneck');
var Competitor  = require('./math-model/competitor');
var CompetitorMerge  = require('./math-model/competitor-merge');
var _ = require('lodash');

module.exports = {
    calc: function(request){

        var edges = {};
        var network = request.nodes;

        _.forEach(request.edges, function(v,i){
            if (!edges.hasOwnProperty(v.target)) {
                edges[v.target] = [];
            }
            edges[v.target].push(v);
        });


        _.forEach(network, function(v, i){
            switch (v.type) {
                case "stopline":
                    network[i] = new StopLine(v, edges[i], network);
                    break;
                case "carriageway":
                    network[i] = new CarriageWay(v, edges[i], network);
                    break;
                case "bottleneck":
                    network[i] = new BottleNeck(v, edges[i], network);
                    break;
                case "concurrent":
                    request.nodes[i] = new Competitor(v, edges[i], network);
                    break;
                case "concurrentMerge":
                    request.nodes[i] = new CompetitorMerge(v, edges[i], network);
                    break;
                case "point":
                    network[i] = new Point(v, edges[i], network);
                    break;
                case "crossRoad":
                    network[i] = new CrossRoad(v, network);
                    break;
                //default:
                //    request.nodes[i] = new StopLine(v);
            }
        });

        console.log('calc start');
        for (var i = 0; i < 100; i++) {
            _.forEach(network, function (v) {
                v.calc();
            });
        }
        console.log('calc end');

        var result = {};
        _.forEach(network, function(v, i){
           result[i] = v.json();
        });

        console.log('calc result');
        return result;
    }
};