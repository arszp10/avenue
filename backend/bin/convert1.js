var fs = require('fs');
var _  = require('lodash');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({mergeAttrs:true, explicitArray:false});





var data = [];

var defaults  = require('../lib/avenue-lib/settings.js');

var xml = fs.readFileSync('../resources/import/sumo-samples/hello.net.xml');


var nextId = function(){
    return Math.random().toString(36).substr(2, 16);
};

parser.parseString(xml, function (err, result) {
    if (err) {
        console.log(err); return;
    }

    var bound = result.net.location.convBoundary.split(',');
    var yMax = parseInt(bound[bound.length - 1]);
    var edges = result.net.edge;
    var edgesIndex = {};
    var junctionsIndex = {};
    var data = [];


    var junctions = result.net.junction;
    _.forEach(junctions, function(junction, index){
        if (junction.type=='priority' || junction.type=='traffic_light'){
            //if (junction.type=='traffic_light') {
                var paretnId =  nextId();
                junctions[index].parentId = paretnId;

                var jx = parseInt(junction.x);
                var jy = parseInt(junction.y);

                var node = JSON.parse(JSON.stringify(defaults.cyNodeProps));
                node.position.x = jx;
                node.position.y = yMax - jy;
                node.data = JSON.parse(JSON.stringify(defaults.crossRoad));
                node.data.id = paretnId;
                node.data.name = junction.id;

                data.push(JSON.parse(JSON.stringify(node)));

            }
            junctionsIndex[junction.id] = junction;
        //}
    });

    var addStopLines = function(edge){
        return edge.lane.map(function(lane){
            var shape = lane.shape.split(' ');
            var end = shape[shape.length - 1];
            var coord = end.split(',');
            var junction = junctionsIndex[edge.to];
            var jx = junction.x;
            var jy = junction.y;

            var node = JSON.parse(JSON.stringify(defaults.cyNodeProps));
            node.position.x = parseInt(coord[0]);
            node.position.y =parseInt(coord[1]);
            node.data = JSON.parse(JSON.stringify(defaults.stopline));
            node.data.id = nextId();
            if (junction.hasOwnProperty('parentId')) {
                node.data.parent = junction.parentId;
            }
            node.data.tag = lane.id;
            data.push(JSON.parse(JSON.stringify(node)));

            return node.data.id;
        })

    };

    var addBottleneck = function(edge){
        var lane = edge.lane[0];
        var shape = lane.shape.split(' ');
        var end = shape[0];
        var coord = end.split(',');
        var junction = junctionsIndex[edge.from];
        var jx = junction.x;
        var jy = junction.y;

        var node = JSON.parse(JSON.stringify(defaults.cyNodeProps));
        node.position.x = parseInt(coord[0]);
        node.position.y =parseInt(coord[1]);
        node.data = JSON.parse(JSON.stringify(defaults.bottleneck));
        node.data.id = nextId();

        if (junction.hasOwnProperty('parentId')) {
            node.data.parent = junction.parentId;
        }
        node.data.tag = lane.id;
        data.push(JSON.parse(JSON.stringify(node)));

        return node.data.id;

    };

    var addCrriageway = function(edge){
        var lane = edge.lane[0];
        var shape = lane.shape.split(' ');
        var start = shape[0];
        var end = shape[shape.length - 1];
        var coord0 = start.split(',');
        var coord1 = end.split(',');
        var coord = [
            parseInt((parseInt(coord0[0])+parseInt(coord1[0]))/2),
            parseInt((parseInt(coord0[1])+parseInt(coord1[1]))/2)
        ];


        console.log(coord0, coord1, coord);
        var node = JSON.parse(JSON.stringify(defaults.cyNodeProps));
        node.position.x = parseInt((coord[0]) ) | 0;
        node.position.y = yMax - parseInt((coord[1])) | 0;
        node.data = JSON.parse(JSON.stringify(defaults.carriageway));
        node.data.id = nextId();
        node.data.tag = edge.id;
        data.push(JSON.parse(JSON.stringify(node)));

        return node.data.id;
    };


    var convertSumoEdge = function (edge){
        if(!Array.isArray(edge.lane)) {
            edge.lane = [edge.lane];
        }
        var sl = addStopLines(edge);
        var bn = addBottleneck(edge);
        var cw = addCrriageway(edge);

        adCyEdge(bn, cw, '100%');
        _.forEach(sl, function(sline, index){
            adCyEdge(cw, sline, parseInt(100/sl.length)+'%');
        });

    };

    var adCyEdge = function(source, target, portion){
        var cyEdge = JSON.parse(JSON.stringify(defaults.cyEdgeProps));
        cyEdge.data = JSON.parse(JSON.stringify(defaults.edge));
        cyEdge.data.id = nextId();
        cyEdge.data.source = source;
        cyEdge.data.target = target;
        cyEdge.data.portion = portion;
        data.push(JSON.parse(JSON.stringify(cyEdge)));

    };

    _.forEach(edges, function(edge, index){
        if (edge.hasOwnProperty('from') && edge.hasOwnProperty('to')) {
            convertSumoEdge(edge)
        }
    });

    require('child_process')
        .spawn('sh', ['save-curl.sh', '59644bd22894d905233d488f', JSON.stringify(data)], {stdio: 'inherit'});

});