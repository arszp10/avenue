var _ = require('lodash');
var validate = require('validate.js');
var utils       = require('./utils/utils')();
var settings    = require('./settings');

var objects = {
    stopline:       require('./i-model/stop-line'),
    carriageway:    require('./i-model/carriageway'),
    bottleneck:     require('./i-model/bottleneck'),
    concurrent:     require('./i-model/competitor'),
    concurrentMerge:require('./i-model/competitor-merge'),
    point:          require('./i-model/point'),
    crossRoad:      require('./i-model/crossroad')
};


var headerConstraints        = require('./constraints/header');
var nodeConstraints          = require('./constraints/node');
var edgeConstraints          = require('./constraints/edge');
var carriagewayConstraints   = require('./constraints/carriageway');
var concurrentConstraints   = require('./constraints/concurrent');
var crossroadConstraints     = require('./constraints/cross-road');
var phasesConstraints        = require('./constraints/phase-data');
var stoplineConstraints      = require('./constraints/stopline');
var extraConstraints         = require('./constraints/parametrized');

_.assign(validate.validators, require('./validators/custom'));

module.exports = {
    _errors : [],
    _network : {},
    _indexMap: [],
    _crIndexMap: {},
    _crStopLines: {},

    _getNode: function (id) {
        return this._network[this._indexMap[id]];
    },

    _setNodeProperty: function (id, prop, value) {
        this._network[this._indexMap[id]][prop] = value;
    },

    _pushToNodeProperty: function (id, prop, value) {
        if (!this._network[this._indexMap[id]].hasOwnProperty(prop)){
            this._network[this._indexMap[id]][prop] = [value];
        } else {
            this._network[this._indexMap[id]][prop].push(value);
        }
    },

    _traceRoute: function(nodes, w, trace){
        var that = this;
        _.forEach(nodes, function(id){
            var node = that._getNode(id);
            var nextWeight =  w + 1;

            // if a loop
            if (trace.indexOf(id) > -1) {
                return;
            }

            if (node.weight < nextWeight) {
                that._setNodeProperty(id, 'weight', nextWeight);
                if (node.hasOwnProperty('to')) {
                    var clone = trace.slice(0);
                    clone.push(id);
                    that._traceRoute(node.to, nextWeight, clone);
                }
            }
        });
    },

    _prepareNetwork: function(request){
        this._network = request;
        this._indexMap = {};

        var network = this._network;
        var indexMap = this._indexMap;

        var that = this;

        _.forEach(network, function(v, i){
            indexMap[v.id] = i;
            v['weight'] = 0;
        });

        _.forEach(network, function(v){
            if (v.type == 'stopline' && v.hasOwnProperty('parent')) {
                v.intervals = that._redIntervals(v, that._getNode(v.parent));
                if (!that._crStopLines.hasOwnProperty(v.parent)) {
                    that._crStopLines[v.parent] = [v.id];
                } else {
                    that._crStopLines[v.parent].push(v.id);
                }
            }

            if (v.hasOwnProperty('edges')) {
                v.edges.map(function(e){
                    that._pushToNodeProperty(e.target, 'from', e.source);
                    that._pushToNodeProperty(e.source, 'to', e.target);
                }, this);
            }
        });

        var outterNodes = [];
        _.forEach(network, function(v){
            if (!v.hasOwnProperty('edges') && v.type != 'crossRoad') {
                outterNodes.push(v.id);
            }
        });

        if (outterNodes.length == 0) {
            outterNodes.push(network[0].id);
        }

        this._traceRoute(outterNodes, 0, []);
        network.sort(function (a, b) { return a.weight - b.weight;});

        _.forEach(network, function(v, i){
            indexMap[v.id] = i;
            if (v.type == 'crossRoad') {
                that._crIndexMap[v.id] = i;
            }
            network[i] = new objects[v.type](v, network, indexMap);
        });

        this._network = network;
        this._indexMap = indexMap;

    },

    _calc: function(n){
        var sum = 0;
        for (var i = 0; i < n; i++) {
            _.forEach(this._network, function(v){
                v.calc();
                if (i == n-1){
                    sum += v.hasOwnProperty('delay')
                        ? parseFloat(v['delay'])
                        : 0;
                }
            });
        }
        return sum;
    },

    _optimizePhases: function(cr){
        var that = this;
        var maxSatEl = _.maxBy(cr.phases, 'saturation');
        var minSatEl = _.minBy(cr.phases, 'saturation');
        if (maxSatEl.saturation - minSatEl.saturation < 0.11) {
            return;
        }
        var maxInx = cr.phases.indexOf(maxSatEl);
        var minInx = cr.phases.indexOf(minSatEl);
        var sumSat = maxSatEl.saturation + minSatEl.saturation;
        var sumLen = parseInt(maxSatEl.length) + parseInt(minSatEl.length);
        var dMax = Math.round(sumLen * maxSatEl.saturation/sumSat);
        var dMin = Math.round(sumLen * minSatEl.saturation/sumSat);
        if (dMin < parseInt(minSatEl.minLength)) {
            dMin = parseInt(minSatEl.minLength);
            dMax = sumLen - dMin;
        }
        maxSatEl.length = dMax;
        minSatEl.length = dMin;
        _.forEach(this._crStopLines[cr.id], function(id){
            var sl = that._getNode(id);
            sl.resetIntervals(that._redIntervals(sl, cr));
        });
    },

    _optimize: function(){
        var cycleLength = this._network[0].cycleLength;
        var steps = settings.offsetOptimizationSteps(cycleLength);
        var that = this;
        var cr;
        var offsets = [0,0,0];
        var delays = [0.0,0.0,0.0];
        var mi = 0;
        var offset = 0;
        //
        //var start = process.hrtime();
        //
        //var elapsed_time = function(note){
        //    var precision = 3; // 3 decimal places
        //    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
        //    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
        //    start = process.hrtime(); // reset the timer
        //};

        _.forEach(steps, function(step, istep){
            _.forEach(that._crIndexMap, function(inx){
                cr = that._network[inx];
                offset = cr.offset;
                offsets = [
                    offset,
                    (offset + step) % cycleLength,
                    (offset + cycleLength - step) % cycleLength
                ];

                for(var i = 0; i < 3; i++) {
                    cr.offset = offsets[i];
                    delays[i] = that._calc(1);
                }
                mi = that._minIndexOfArray3(delays);
                cr.offset = offsets[mi];
            });
        });
    },

    _minIndexOfArray3: function(a){
        if (a[0] < a[1]) {
            if (a[0] < a[2]) { return 0;}
            return 2;
        } else {
            if (a[1] < a[2]) { return 1;}
            return 2;
        }
    },

    _sumDelay: function(items, prop){
        return items.reduce( function(a, b){
            return b.hasOwnProperty(prop)
                ? a + parseFloat(b[prop])
                : a;
        }, 0);
    },

    _validate: function(node, constraints, type, parentId){
        var err = validate(node, constraints, {format: 'flat'});
        if (err === undefined) {
            return true;
        }
        var nodeId = '';
        switch (type) {
            case "edge" :
                nodeId = node.target;
                break;
            case "phase" :
                nodeId = parentId;
                break;
            default:
                nodeId = node.id;
        }
        this._errors.push({
            node: nodeId,
            errors: err
        });
        return false;
    },

    _signalDiagramData: function(stopLine, crossRoad){
        var i = 0, icolor = '', inext = 0, goff = 0;
        var diagram = [];
        var phCount =  crossRoad.phases.length;
        var interTact = settings.interTact;
        var prevGoff = 0;
        for (i = 0; i < phCount; i++){
            crossRoad.phases[i].saturation = 0;
            icolor = stopLine.greenPhases[i] ? 'green' : 'red';
            goff = stopLine.greenPhases[i]
                ? parseInt(stopLine.greenOffset2)
                : parseInt(stopLine.greenOffset1);
            inext = (i + 1) % phCount;
            if (stopLine.greenPhases[i] === stopLine.greenPhases[inext]) {
                diagram.push({
                    color : icolor,
                    length : parseInt(crossRoad.phases[i].length)
                });
                continue;
            }
            diagram.push({
                color : icolor,
                length : parseInt(crossRoad.phases[i].length) - interTact[icolor].length + prevGoff + goff
            });
            diagram = diagram.concat(interTact[icolor].signals);
            prevGoff = -goff;
        }
        diagram[0].length += prevGoff;
        return diagram;
    },

    _redIntervals: function(stopLine, crossRoad){
        var diagram = this._signalDiagramData (stopLine, crossRoad);
        var intervals = [];
        var s = 0, i = 0;
        _.forEach(diagram, function(v){
            if (v.color == 'amber') {
                intervals.push([s, i + v.length-1]);
            }
            if (v.color == 'yellow') {
                s = i-1;
            }
            i += v.length;
        });

        var lastInterval = ( diagram[0].color == diagram[diagram.length-1].color && diagram[0].color == 'red') ||
            ( diagram[0].color == 'red' && diagram[diagram.length-1].color == 'yellow');

        if (lastInterval) {
            intervals.push([s, i-1]);
        }
        return intervals;
    },

    optimizePhases: function(request){
        if (request == undefined || request.length == 0) {
            return [];
        }

        var that = this;
        var cr;
        this._prepareNetwork(request);
        this._calc(3);

        _.forEach(that._crIndexMap, function(inx){
            cr = that._network[inx];
            that._optimizePhases(cr);
        });

        this._calc(3);
        //this._optimize();
        return this._network.map(function(v){
            return v.json();
        });
    },

    optimize: function(request){
        if (request == undefined || request.length == 0) {
            return [];
        }

        this._prepareNetwork(request);
        //this._calc(3);
        this._optimize();
        var a = this._network.map(function(v){
            return v.json();
        });

        return a;

    },

    recalculate: function(request){
        if (request == undefined || request.length == 0) {
            return [];
        }

        this._prepareNetwork(request);
        this._calc(5);

        return this._network.map(function(v){
            return v.json();
        });

    },

    validate : function(data) {
        var parents = {};
        var parentsIds = [];
        var targetIds = [];
        var sourcesPortionSum = {};
        this._errors = [];

        if (validate.isEmpty(data)) {return this._errors;}

        /* First iteration  */
        data.map(function(v, inx){
            if (! this._validate(v, headerConstraints)) {
                return;
            };
            var res = false;
            switch (v.type) {
                case "crossRoad":
                    res = this._validate(v, crossroadConstraints);
                    if (res) {
                        v.phases.map(function(a){
                            this._validate(a, phasesConstraints, 'phase', v.id);
                        }, this);
                        parents[v.id] = inx;
                        parentsIds.push(v.id);
                    }
                    break;
                case "carriageway":
                    this._validate(v, carriagewayConstraints);
                    this._validate(v, nodeConstraints);
                    break;
                case "stopline":
                    this._validate(v, stoplineConstraints);
                    this._validate(v, nodeConstraints);
                    break;
                case "concurrent":
                case "concurrentMerge":
                    this._validate(v, concurrentConstraints);
                default:
                    this._validate(v, nodeConstraints);
            }
            if (v.hasOwnProperty('edges') && v.edges.length > 0) {
                v.edges.map(function(v) {

                    if (!this._validate(v, edgeConstraints, 'edge')) {
                        return
                    };

                    if (v.hasOwnProperty('secondary')) {
                        return;
                    }

                    if (!sourcesPortionSum.hasOwnProperty(v.source)) {
                        sourcesPortionSum[v.source] = parseInt(v.portion);
                    } else {
                        sourcesPortionSum[v.source] += parseInt(v.portion);
                    }

                }, this);
            }
            if (this._errors.length === 0) {
                targetIds.push(v.id);
            }
        }, this);

        /* Extra iteration  */
        if (this._errors.length === 0) {
            data.map(function(v, inx){
                if (sourcesPortionSum.hasOwnProperty(v.id) && v.type != 'concurrent') {
                    this._validate(v, extraConstraints.sumOfOutterEdges(sourcesPortionSum[v.id]));
                }
                if (v.type == 'stopline' && v.hasOwnProperty('parent')) {
                    var constr = extraConstraints.stoplineExtra(parentsIds, data[parents[v.parent]].phases.lenght);
                    this._validate(v, constr);
                    return;
                }
                if (v.hasOwnProperty('edges') && v.edges.length > 0) {
                    v.edges.map(function(v) {
                        var constr = extraConstraints.edgeExtra(targetIds);
                        this._validate(v, constr, 'edge');
                    }, this);
                    return;
                }
            }, this);
        }

        return  this._errors;
    }

};


