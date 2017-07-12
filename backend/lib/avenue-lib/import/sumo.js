var fs = require('fs');
var _  = require('lodash');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({mergeAttrs:true, explicitArray:false});

var defaults  = require('../settings.js');



var nextId = function(){
    return Math.random().toString(36).substr(2, 16);
};


module.exports = {
    convert: function(fileName, zoomMap, zoomIntersection, ready) {
        var data = [];
        var xml = fs.readFileSync(fileName);

        parser.parseString(xml, function (err, result) {
            if (err) {
                ready(err, []);
                return;
            }

            var bound = result.net.location.convBoundary.split(',');
            var yMax = parseInt(bound[bound.length - 1])*zoomMap;
            var edges = result.net.edge;
            var connections = result.net.connection;
            var nodesIndexStart = {};
            var nodesIndexEnd = {};
            var junctionsIndex = {};
            var data = [];
            var junctions = result.net.junction;
            _.forEach(junctions, function(junction, index){
                if (junction.type=='priority' || junction.type=='traffic_light' || junction.type=='dead_end'){
                    //if (junction.type=='traffic_light') {
                    var paretnId =  nextId();
                    junctions[index].parentId = paretnId;

                    var jx = parseInt(junction.x)*zoomMap;
                    var jy = yMax - parseInt(junction.y)*zoomMap;

                    var node = JSON.parse(JSON.stringify(defaults.cyNodeProps));
                    node.position.x = jx ;
                    node.position.y = jy ;
                    node.data = JSON.parse(JSON.stringify(defaults.crossRoad));
                    node.data.id = paretnId;
                    node.data.name = junction.id;

                    data.push(JSON.parse(JSON.stringify(node)));
                    junctionsIndex[junction.id] = junction;
                }

                //}

            });
            var addStopLines = function(edge){
                return edge.lane.map(function(lane){
                    var shape = lane.shape.split(' ');
                    var end = shape[shape.length - 1];
                    var coord = end.split(',');
                    var junction = junctionsIndex[edge.to];
                    var jx = parseInt(junction.x)*zoomMap;
                    var jy = yMax - parseInt(junction.y)*zoomMap;

                    var node = JSON.parse(JSON.stringify(defaults.cyNodeProps));
                    node.position.x = parseInt(coord[0])*zoomMap;
                    node.position.y = yMax - parseInt(coord[1])*zoomMap;

                    node.position.x = (node.position.x - jx)*zoomIntersection +jx ;
                    node.position.y = (node.position.y - jy)*zoomIntersection +jy ;
                    node.data = JSON.parse(JSON.stringify(defaults.stopline));
                    node.data.id = nextId();
                    if (junction.hasOwnProperty('parentId')) {
                        node.data.parent = junction.parentId;
                    }
                    node.data.tag = lane.id;
                    data.push(JSON.parse(JSON.stringify(node)));
                    nodesIndexStart[lane.id] = node.data.id;
                    return node.data.id;
                })

            };
            var addBottleneck = function(edge){
                var lane = edge.lane[edge.lane.length - 1 ];
                var shape = lane.shape.split(' ');
                var end = shape[0];
                var coord = end.split(',');
                var junction = junctionsIndex[edge.from];
                var jx = parseInt(junction.x)*zoomMap;
                var jy = yMax - parseInt(junction.y)*zoomMap;

                var node = JSON.parse(JSON.stringify(defaults.cyNodeProps));
                node.position.x = parseInt(coord[0])*zoomMap;
                node.position.y = yMax - parseInt(coord[1])*zoomMap;
                node.position.x = (node.position.x - jx)*zoomIntersection +jx ;
                node.position.y = (node.position.y - jy)*zoomIntersection +jy ;

                node.data = JSON.parse(JSON.stringify(defaults.bottleneck));
                node.data.id = nextId();

                if (junction.hasOwnProperty('parentId')) {
                    node.data.parent = junction.parentId;
                }
                node.data.tag = lane.id;
                data.push(JSON.parse(JSON.stringify(node)));
                nodesIndexEnd[lane.id] = node.data.id;
                return node.data.id;

            };
            var addCrriageway = function(edge){
                var lane = edge.lane[edge.lane.length - 1];
                var shape = lane.shape.split(' ');
                var start = shape[0];
                var end = shape[shape.length - 1];
                var coord0 = start.split(',');
                var coord1 = end.split(',');

                var junctionFrom = junctionsIndex[edge.from];
                var jxf = parseInt(junctionFrom.x)*zoomMap;
                var jyf = yMax - parseInt(junctionFrom.y)*zoomMap;

                var junctionTo = junctionsIndex[edge.to];
                var jxt = parseInt(junctionTo.x)*zoomMap;
                var jyt = yMax - parseInt(junctionTo.y)*zoomMap;

                coord0[0] = parseInt(coord0[0])*zoomMap;
                coord0[1] = yMax - parseInt(coord0[1])*zoomMap;
                coord0[0] = (coord0[0] - jxf)*zoomIntersection +jxf ;
                coord0[1] = (coord0[1] - jyf)*zoomIntersection +jyf ;

                coord1[0] = parseInt(coord1[0])*zoomMap;
                coord1[1] = yMax - parseInt(coord1[1])*zoomMap;
                coord1[0] = (coord1[0] - jxt)*zoomIntersection +jxt ;
                coord1[1] = (coord1[1] - jyt)*zoomIntersection +jyt ;


                var coord = [
                    parseInt(((coord0[0])+(coord1[0]))/2),
                    parseInt(((coord0[1])+(coord1[1]))/2)
                ];

                var node = JSON.parse(JSON.stringify(defaults.cyNodeProps));
                node.position.x = ((coord[0]) ) | 0;
                node.position.y = ((coord[1])) | 0;

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

                var type = edge.type;
                var allowed = [undefined, 'highway.primary', 'highway.primary_link', 'highway.residential', 'highway.secondary'];//, 'highway.tertiary', 'highway.tertiary_link'];

                if (allowed.indexOf(edge.type) < 0) {
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
            _.forEach(connections, function(conn, index){
                var from = conn.from + '_' + conn.fromLane;
                var to = conn.to + '_' + conn.toLane;

                if (nodesIndexStart.hasOwnProperty(from) && nodesIndexEnd.hasOwnProperty(to)){
                    adCyEdge(nodesIndexStart[from], nodesIndexEnd[to], '100%');
                };

            });
            ready(err, data);

        });

    }
};

