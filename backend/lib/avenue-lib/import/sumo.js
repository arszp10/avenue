var fs          = require('fs');
var _           = require('lodash');
var defaults    = require('../settings.js');
var xml2js      = require('xml2js');
var parser      = new xml2js.Parser({
    mergeAttrs:true,
    explicitArray:false
});

var allowedEdgeType = [undefined, 'highway.primary', 'highway.primary_link', 'highway.secondary_link', 'highway.secondary'];//, 'highway.tertiary', 'highway.tertiary_link'];
var allowedJunctionType = ['traffic_light'];

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
    var jx = 0, jy = 0;
    if (junction) {
        jx =  parseInt(junction.x) * zm;
        jy = ym - parseInt(junction.y) * zm;
    }
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

            var yMax = 0;
            if (result.net.location) {
                var bound   = result.net.location.convBoundary.split(',');
                yMax        = parseInt(bound[bound.length - 1]) * zoomMap;
            }

            var edges       = result.net.edge;
            var connections = result.net.connection;
            var junctions   = result.net.junction;

            var nodesIndexStart = {};
            var nodesIndexEnd   = {};
            var usedParentsIndex = {};
            var junctionsIndex  = {};
            var nodesIndexStartOutEdges = {};
            var data = [];

            var adCyEdge = function(source, target, portion){
                var cyEdge = deepClone(defaults.cyEdgeProps);
                cyEdge.data = deepClone(defaults.edge);
                cyEdge.data.id = nextId();
                cyEdge.data.source = source;
                cyEdge.data.target = target;
                cyEdge.data.portion = portion;
                data.push(cyEdge);
            };

            var addStopLine = function(edge, lane){
                var junction = junctionsIndex[edge.to];
                var node  = deepClone(defaults.cyNodeProps);

                if (junction && junction.type == 'traffic_light') {
                    node.data = deepClone(defaults.stopline);
                } else {
                    node.data = deepClone(defaults.point);
                }

                node.position = transformPosition(lane.shape, 'last', junction, yMax, zoomMap, zoomIntersection);
                node.data.id = nextId();
                if (junction && junction.hasOwnProperty('parentId')) {
                    node.data.parent = junction.parentId;
                    usedParentsIndex[junction.parentId] = true;
                }

                if (junction && junction.type !== 'traffic_light') {
                    node.data.greenPhases = [true, true];
                }

                node.data.tag = lane.id;
                node.data.capacity = 1800;
                node.data.avgIntensity = Math.floor(300);

                if (junction && junction.type == 'traffic_light') {
                    node.data.intervals = [[0, 1]];
                }
                data.push(node);

                nodesIndexStart[lane.id] = node.data.id;
                return node.data.id;
            };

            var addBottleneck = function(edge, lane){
                var junction = junctionsIndex[edge.from];
                var node    = deepClone(defaults.cyNodeProps);
                node.data     = deepClone(defaults.bottleneck);
                node.position = transformPosition(lane.shape, 0, junction, yMax, zoomMap, zoomIntersection);
                node.data.id  = nextId();
                if (junction && junction.hasOwnProperty('parentId')) {
                    node.data.parent = junction.parentId;
                    usedParentsIndex[junction.parentId] = true;
                }
                node.data.tag = lane.id;
                node.data.capacity = 1800 * lane.length;
                data.push(node);
                nodesIndexEnd[lane.id] = node.data.id;
                return node.data.id;

            };

            var addCrriageway = function(edge, lane){
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
                node.data.capacity = 1800 * lane.length;
                node.data.routeTime = Math.floor(parseFloat(lane.length)/parseFloat(lane.speed));
                node.data.length = parseInt(lane.length);
                data.push(node);

                return node.data.id;
            };

            var addCrossRoad = function(junction){
                if (allowedJunctionType.indexOf(junction.type) < 0) {
                    return;
                }
                var paretnId =  nextId();
                junction.parentId = paretnId;

                var node  = deepClone(defaults.cyNodeProps);
                var crossRoadData = defaults.crossRoad;
                crossRoadData.programs = new Array(defaults.programDefaults);
                crossRoadData.currentProgram = 0;
                node.data = deepClone(crossRoadData);
                node.position.x = parseInt(junction.x) * zoomMap;
                node.position.y = yMax - parseInt(junction.y) * zoomMap;
                node.data.id = paretnId;
                node.data.name = junction.id;

                data.push(node);
                junctionsIndex[junction.id] = junction;
            };

            var convertSumoEdge = function (edge){
                if(!Array.isArray(edge.lane)) {
                    edge.lane = [edge.lane];
                }

                if (allowedEdgeType.indexOf(edge.type) < 0) {
                    return;
                }

                _.forEach(edge.lane, function(lane, index){
                    var sl = addStopLine(edge, lane);
                    var bn = addBottleneck(edge, lane);
                    adCyEdge(bn, sl, '100%');
                });


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
                    adCyEdge(
                        nodesIndexStart[from],
                        nodesIndexEnd[to],
                        '100%'
                    );
                }

            });


            data = data.filter(function(node){
                if (node.group == 'edges') return true;
                if (node.data.type !== 'crossRoad') return true;
                return usedParentsIndex.hasOwnProperty(node.data.id);
            });

            //console.log(data);

            ready(err, data);

        });

    }


}

