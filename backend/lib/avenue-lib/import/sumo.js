var fs          = require('fs');
var _           = require('lodash');
var defaults    = require('../settings.js');
var xml2js      = require('xml2js');
var parser      = new xml2js.Parser({
    mergeAttrs:true,
    explicitArray:false
});

var allowedEdgeType = [undefined, 'highway.primary', 'highway.primary_link', 'highway.residential', 'highway.secondary'];//, 'highway.tertiary', 'highway.tertiary_link'];
var allowedJunctionType = ['priority', 'traffic_light', 'dead_end'];

var nextId = function(){
    return Math.random().toString(36).substr(2, 16);
};

var deepClone = function(obj){
    return JSON.parse(JSON.stringify(obj))
};

var transformPosition = function (shape, inx, junction, ym, zm, zi){
    var shapeArr = shape.split(' ');
    var index = inx === 'last' ? shapeArr.length - 1 : inx;
    var shapeItem = shapeArr[index];
    var coord = shapeItem.split(',');
    var jx =  parseInt(junction.x) * zm;
    var jy = ym - parseInt(junction.y) * zm;
    var x = parseInt(coord[0]) * zm;
    var y = ym - parseInt(coord[1]) * zm;
    return {
        x: (x - jx) * zi +jx ,
        y: (y - jy) * zi +jy
    }
};


module.exports = {
    convert: function(fileName, zoomMap, zoomIntersection, ready) {

        var xml = fs.readFileSync(fileName);
        parser.parseString(xml, function (err, result) {
            if (err) {
                ready(err, []);
                return;
            }

            var bound       = result.net.location.convBoundary.split(',');
            var yMax        = parseInt(bound[bound.length - 1]) * zoomMap;
            var edges       = result.net.edge;
            var connections = result.net.connection;
            var junctions   = result.net.junction;

            var nodesIndexStart = {};
            var nodesIndexEnd   = {};
            var junctionsIndex  = {};
            var nodesIndexStartOutEdges = {};
            var data = [];


            var addCrossRoad = function(junction){
                if (allowedJunctionType.indexOf(junction.type) < 0) {
                    return;
                }
                var paretnId =  nextId();
                junction.parentId = paretnId;

                var node  = deepClone(defaults.cyNodeProps);
                node.data = deepClone(defaults.crossRoad);
                node.position.x = parseInt(junction.x) * zoomMap;
                node.position.y = yMax - parseInt(junction.y) * zoomMap;
                node.data.id = paretnId;
                node.data.name = junction.id;

                data.push(node);
                junctionsIndex[junction.id] = junction;
            };

            var addStopLines = function(edge){
                return edge.lane.map(function(lane){
                    var junction = junctionsIndex[edge.to];
                    var node  = deepClone(defaults.cyNodeProps);
                    node.data = deepClone(defaults.stopline);
                    node.position = transformPosition(lane.shape, 'last', junction, yMax, zoomMap, zoomIntersection);
                    node.data.id = nextId();
                    if (junction.hasOwnProperty('parentId')) {
                        node.data.parent = junction.parentId;
                    }

                    if (junction.type !== 'traffic_light') {
                        node.data.greenPhases = [true, true];
                    }

                    node.data.tag = lane.id;
                    node.data.capacity = 1800;
                    node.data.avgIntensity = Math.floor(900/edge.lane.length);
                    data.push(node);

                    nodesIndexStart[lane.id] = node.data.id;
                    return node.data.id;
                })

            };

            var addBottleneck = function(edge){
                var lane = edge.lane[edge.lane.length - 1 ];
                var junction = junctionsIndex[edge.from];

                var node = deepClone(defaults.cyNodeProps);
                node.data = deepClone(defaults.bottleneck);
                node.position = transformPosition(lane.shape, 0, junction, yMax, zoomMap, zoomIntersection);
                node.data.id = nextId();
                if (junction.hasOwnProperty('parentId')) {
                    node.data.parent = junction.parentId;
                }
                node.data.tag = lane.id;
                node.data.capacity = 1800 * edge.lane.length;
                data.push(node);
                nodesIndexEnd[lane.id] = node.data.id;
                return node.data.id;

            };

            var addCrriageway = function(edge){
                var lane = edge.lane[edge.lane.length - 1];
                var junctionFrom = junctionsIndex[edge.from];
                var junctionTo = junctionsIndex[edge.to];

                var a =  transformPosition(lane.shape, 0, junctionFrom, yMax, zoomMap, zoomIntersection);
                var b =  transformPosition(lane.shape, 'last', junctionTo, yMax, zoomMap, zoomIntersection);

                var node = deepClone(defaults.cyNodeProps);
                node.data = deepClone(defaults.carriageway);
                node.position = {
                    x: parseInt((a.x+b.x)/2),
                    y: parseInt((a.y+b.y)/2)
                };

                node.data.id = nextId();
                node.data.tag = edge.id;
                node.data.capacity = 1800 * edge.lane.length;
                node.data.routeTime = Math.floor(parseFloat(lane.length)/parseFloat(lane.speed));
                node.data.length = parseInt(lane.length),
                data.push(node);

                return node.data.id;
            };

            var convertSumoEdge = function (edge){
                if(!Array.isArray(edge.lane)) {
                    edge.lane = [edge.lane];
                }

                if (allowedEdgeType.indexOf(edge.type) < 0) {
                    return;
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
                var cyEdge = deepClone(defaults.cyEdgeProps);
                cyEdge.data = deepClone(defaults.edge);
                cyEdge.data.id = nextId();
                cyEdge.data.source = source;
                cyEdge.data.target = target;
                cyEdge.data.portion = portion;
                data.push(cyEdge);
            };


            _.forEach(junctions, function(junction){
                addCrossRoad(junction);
            });

            _.forEach(edges, function(edge){
                if (edge.hasOwnProperty('from') && edge.hasOwnProperty('to')) {
                    convertSumoEdge(edge)
                }
            });

            _.forEach(connections, function(conn){
                var from = conn.from + '_' + conn.fromLane;
                var to = conn.to + '_' + conn.toLane;
                if (nodesIndexStart.hasOwnProperty(from) && nodesIndexEnd.hasOwnProperty(to)){
                    if (!nodesIndexStartOutEdges.hasOwnProperty(from)){
                        nodesIndexStartOutEdges[from] = 1;
                    }  else {
                        nodesIndexStartOutEdges[from] = nodesIndexStartOutEdges[from] + 1;
                    }
                }
            });



            _.forEach(connections, function(conn){
                var from = conn.from + '_' + conn.fromLane;
                var to = conn.to + '_' + conn.toLane;

                if (nodesIndexStart.hasOwnProperty(from) && nodesIndexEnd.hasOwnProperty(to)){
                    adCyEdge(
                        nodesIndexStart[from],
                        nodesIndexEnd[to],
                        parseInt(100 / nodesIndexStartOutEdges[from]) + '%'
                    );
                }

            });

            ready(err, data);

        });

    }
};

