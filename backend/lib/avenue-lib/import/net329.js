var fs          = require('fs');
var _           = require('lodash');
var defaults    = require('../settings.js');
var xml2js      = require('xml2js');
var parser      = new xml2js.Parser({
    mergeAttrs:true,
    explicitArray:false
});


var nextId = function(){
    return Math.random().toString(36).substr(2, 16);
};

var deepClone = function(obj){
    return JSON.parse(JSON.stringify(obj))
};

var vcType = {
    vcPrivate:      1,         /*!< Частный транспорт*/
    vcEmergency:    2,         /*!< Машины экстренных служб*/
    vcPassenger:    32,        /*!< Пассажирский транспорт*/
    vcBus:          256,       /*!< Автобус*/
    vcTruck:        2048,      /*!< Грузовик*/
    vcTram:         8192,      /*!< Трамвай*/
    vcMotorcycle:   131072,    /*!< Мотоцикл*/
    vcBicycle:      524288,    /*!< Велосипед*/
    vcPedestrian:   1048576,   /*!< Пешеходы*/
    vcTrolleybus:   8388608,   /*!< Троллейбус*/
    vcAll:          0x9A2923   /*!< Вcе */
};

var isMotorWay = function(lane){
    var allowed = parseInt(lane.Split[0].allowed)|0;
    return  ((!(allowed & vcType.vcPedestrian)) && allowed);
};

var isTramWayFunc = function(lane){
    var allowed = parseInt(lane.Split[0].allowed)|0;
    return !!(allowed & vcType.vcTram);
};


var checkPositionInRect = function (pos, bound){
    var coord = pos.split(',');
    var x = coord[0];
    var y = coord[1];
    if (x < bound.leftTop.x )     {return false}
    if (x > bound.rightBottom.x ) {return false}
    if (y < bound.leftTop.y )     {return false}
    if (y > bound.rightBottom.y ) {return false}
    return true;
};

var transformPosition = function (pos, bound){
    var coord = pos.split(',');
    var x = coord[0];
    var y = coord[1];
    if (x < bound.leftTop.x )     {x = bound.leftTop.x;}
    if (x > bound.rightBottom.x ) {x = bound.rightBottom.x;}
    if (y < bound.leftTop.y )     {x = bound.leftTop.y;}
    if (y > bound.rightBottom.y ) {x = bound.rightBottom.y;}

    return {
        x: (x - bound.leftTop.x) * 1000000 ,
        y: (bound.rightBottom.y - y) * 1000000
    }
};

module.exports = {
    convert: function(fileName, ready) {

        var xml = fs.readFileSync(fileName);
        parser.parseString(xml, function (err, result) {

            if (err) {
                ready(err, []);
                return;
            }

            var nodes       = result.Network.Node;
            var edges       = result.Network.Edge;
            var connections = result.Network.Connection;
            var crossWalks   = result.Network.CrossWalk;
            var data = [];


            var modelRect = function(nodes) {
                var x = [];
                var y = [];
                _.forEach(nodes, function(node){
                    var coord = node.pos.split(',');
                    x.push(coord[0]);
                    y.push(coord[1]);
                });

                return {
                    leftTop:{
                        x: _.min(x),
                        y: _.min(y)
                    },
                    rightBottom:{
                        x: _.max(x),
                        y: _.max(y)
                    }
                }
            };

            var bound       = modelRect(nodes);

            var adCyEdge = function(source, target, portion, isTramWay, isPedestrian){
                var cyEdge = deepClone(defaults.cyEdgeProps);
                cyEdge.data = deepClone(defaults.edge);
                cyEdge.data.id = nextId();
                cyEdge.data.source = source;
                cyEdge.data.target = target;
                cyEdge.data.portion = portion;
                if (isTramWay) {
                    cyEdge.data.tram = isTramWay;
                }
                if (isPedestrian) {
                    cyEdge.data.pedestrian = isPedestrian;
                    cyEdge.data.speed = 5;
                    cyEdge.data.distance = 20;
                }
                data.push(cyEdge);
            };

            var addCyNode = function(type, objectId, laneId, pos, isTramWay){
                var cynode  = deepClone(defaults.cyNodeProps);
                cynode.data = deepClone(defaults[type]);
                cynode.position = transformPosition(pos, bound);
                cynode.data.id = nextId();
                cynode.data.tag = objectId;
                cynode.data.laneId = laneId;
                cynode.data.capacity = 1800;
                cynode.data.avgIntensity = Math.floor(300);
                if (isTramWay) {
                    cynode.data.tram = isTramWay;
                }

                data.push(cynode);
                return cynode.data.id;
            };

            _.forEach(edges, function(edge){
                if (!_.isArray(edge.Lane)) {
                    edge.Lane = [edge.Lane];
                }
                _.forEach(edge.Lane, function(lane) {
                    if (!_.isArray(lane.Split)) {
                        lane.Split = [lane.Split];
                    }
                    var isTramWay = isTramWayFunc(lane);

                    if (   checkPositionInRect(lane.Stopline.pos, bound)
                        && checkPositionInRect(lane.Startline.pos, bound)
                        && (isMotorWay(lane) || isTramWay)
                    ) {
                        var target = addCyNode('stopline', lane.Stopline.id, lane.id, lane.Stopline.pos, isTramWay);
                        var source = addCyNode('bottleneck', lane.Startline.id, lane.id, lane.Startline.pos, isTramWay);
                        adCyEdge(source, target, '100%', isTramWay);
                    }
                });


            });

            _.forEach(connections, function(connection){
                var cto = connection.to;
                var cfrom = connection.from;
                var source = _.find(data, function(o) { return o.data.laneId == cfrom && o.data.type == 'stopline' });
                var target = _.find(data, function(o) { return o.data.laneId == cto && o.data.type == 'bottleneck' });
                if (source && target) {
                    var isTramWay = source.data.tram && target.data.tram;
                    adCyEdge(source.data.id, target.data.id, '100%', isTramWay);
                }
            });

            _.forEach(crossWalks, function(crossWalk){
                var target = addCyNode('pedestrian', crossWalk.id, null, crossWalk.pos1, false);
                var source = addCyNode('pedestrian', crossWalk.id, null, crossWalk.pos2, false);
                if (source && target) {
                    adCyEdge(source, target, '100', false, true);
                }
            });

            ready(err, data);

        });

    }

};

