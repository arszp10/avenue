(function(App){
    var controls  = App.Controls;
    var templates = App.Templates;
    var cy, traffic, api;
    var that;
    var routes = [];

    function Route(name, cycleTime){
        this.routeName = name || 'testRoute';
        this.cycleTime = cycleTime;
        this.points = [];
    };

    Route.prototype.addPoint = function(id, name, length, offset){
        this.points.push({
            id:      id,
            name:    name,
            length:  length,
            offset:  offset,
            forward: false,
            back:    false
        });
        return this;
    };

    Route.prototype.getPoint = function(id){
        var results = this.points.filter(function(a){ return a.id == id });
        return results.length > 0 ? results[0]: false;
    };

    App.Modules.routes = {
        injectDependencies: function (modules) {
            //cy      = modules.cytoscape;
            traffic = modules.traffic;
        },

        initModule: function () {
            that = this;
        },

        createRoute:function(name, cycleTime){
            var route = new Route(name, cycleTime);
            routes.push(route);
            return route;
        },

        getRoute: function(inx){
            return routes[inx];
        },

        filterNodes:function(cyRoutePath){
            var routeInfo = [];
            var route = cyRoutePath.nodes().jsons()
                .map(function(v){ return v.data })
                .filter(function(val){
                    return (val.type == 'stopline' && val.hasOwnProperty('parent')) || val.type == 'carriageway';
                });
            var prevCw = {
                length:100,
                routeTime: 0
            };

            for (var i=0; i< route.length; i++) {
                if (route[i].type == 'stopline') {
                    if ( prevCw !== false) {
                        routeInfo.push($.extend({},route[i], prevCw));
                        prevCw = false;
                    }
                }
                if (route[i].type == 'carriageway') {
                    if ( prevCw === false) {
                        prevCw = {
                            length:route[i].length,
                            routeTime: route[i].routeTime
                        }
                    } else {
                        prevCw.length+=route[i].length;
                        prevCw.routeTime+=route[i].routeTime;
                    }
                }
            }
            return routeInfo;
        },

        newPointNode:function(crossRoad, stopline){
            return {
                id: stopline.id,
                tag: stopline.tag,
                routeTime: stopline.routeTime,
                signals: traffic.signalDiagramData(crossRoad, stopline)
            };
        },

        deleteRoute:function(){},
        selectRoute:function(route){},
        drawRoute:function(data){

            var cycleTime = data.cycleTime;
            var totalRouteLenght = data.points.reduce(function(sum, point){return sum + point.length;} ,0);


            var baseHeight = totalRouteLenght;
            var margin = {top: 50, right: 50, bottom: 50, left: 50};
            var width = window.innerWidth - 400 - margin.left - margin.right;
            var height =  baseHeight - margin.top - margin.bottom;

            var y = d3.scale.linear().rangeRound([height, 0]);
            var y1 = d3.scale.linear().rangeRound([height, 0]);
            var y2 = d3.scale.ordinal().range([height, 0]).domain(['start','stop']);
            var x = d3.scale.linear().rangeRound([0, width]);

            y.domain([0, totalRouteLenght+100]);
            y1.domain([0, 0]);
            x.domain([0, cycleTime*3 ]);

            var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));
            var yAxis1 = d3.svg.axis().scale(y1).orient("left");
            var yAxis2 = d3.svg.axis().scale(y2).orient("right");

            var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.format(".2s"));
            var svg = d3.select("#diagram-panel").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0, " + height + ")")
                .call(xAxis)
                .append("text").style("text-anchor", "end")
                .attr("x", width)
                .attr("y", 40)
                .text("Time (s)");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0).attr("dy", -40)
                .style("text-anchor", "end")
                .text("Route length (m)");

            svg.append("g")
                .attr("class", "y1 axis")
                .attr("transform", "translate(" + x(cycleTime) + ",0)")
                .call(yAxis1)

            svg.append("g")
                .attr("class", "y1 axis")
                .attr("transform", "translate(" + x(2*cycleTime) + ",0)")
                .call(yAxis1)

            svg.append("g")
                .attr("class", "y2 axis")
                .attr("transform", "translate(" + (width) + ",0)")
                .call(yAxis2)

            var amber = svg.append("defs")
                .append("linearGradient")
                .attr("id", "amber")
                .attr("x1", "0%")
                .attr("y1", "45%")
                .attr("x2", "0%")
                .attr("y2", "55%")
                .attr("spreadMethod", "pad");

            amber.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#ff0")
                .attr("stop-opacity", 1);

            amber.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#f00")
                .attr("stop-opacity", 1);


            var blink = svg.append("defs")
                .append("linearGradient")
                .attr("id", "blink")
                .attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "100%")
                .attr("y2", "0%")
                .attr("spreadMethod", "pad");

            blink.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#080")
                .attr("stop-opacity", 1);

            blink.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#cfc")
                .attr("stop-opacity", 1);



            data.points.forEach(function(d) {
                var a = JSON.parse(JSON.stringify(d.forward.signals));
                var b = JSON.parse(JSON.stringify(d.forward.signals));
                var result = d.forward.signals.concat(a,b);

                result.reduce(function (sum, current) {
                    current.offset = sum;
                    return current.offset + current.length;
                }, 0);

                d.forward.signals = result;

                if (!d.back) return;

                var a = JSON.parse(JSON.stringify(d.back.signals));
                var b = JSON.parse(JSON.stringify(d.back.signals));
                var result = d.back.signals.concat(a,b);

                result.reduce(function (sum, current) {
                    current.offset = sum;
                    return current.offset + current.length;
                }, 0);

                d.back.signals = result;

            });

            data.points.reduce(function (sum, current) {
                var directionLag = 0;
                current.geoOffsetForward = current.length + sum -1;
                current.geoOffsetBack = current.length + sum + 15;
                return current.geoOffsetForward - directionLag;
            }, 0);


            var barf = svg.selectAll(".barf")
                .data(data.points).enter().append("g")
                .attr("class", "barf")
                .attr("transform", function(d) { return "translate(0," + y(d.geoOffsetForward) + ")"; })

            barf.selectAll("rect")
                .data(function(d) {
                    return d.forward.signals;
                })
                .enter().append("rect")
                .attr("height", 12)
                .attr("x", function(d) {  return x(d.offset); })
                .attr("width", function(d) { return x(d.length); })
                .style("fill", function(d) {
                    if (d.color == 'blink') return 'url(#blink)';
                    if (d.color == 'amber') return 'url(#amber)';
                    return d.color;
                });

            if (!data.points[0].back) return;

            var barb = svg.selectAll(".barb")
                .data(data.points).enter().append("g")
                .attr("class", "barb")
                .attr("transform", function(d) { return "translate(0," + y(d.geoOffsetBack) + ")"; })

            barb.selectAll("rect")
                .data(function(d) {
                    return d.back.signals;

                })
                .enter().append("rect")
                .attr("height", 12)
                .attr("x", function(d) {  return x(d.offset); })
                .attr("width", function(d) { return x(d.length); })
                .style("fill", function(d) {
                    if (d.color == 'blink') return 'url(#blink)';
                    if (d.color == 'amber') return 'url(#amber)';
                    return d.color;
                });
//        var dragStartX = 0;
//        var drag = d3.behavior.drag();


//                .call(drag.on('dragstart', function (d) {
//                        dragStartX = d3.event.sourceEvent.clientX;
//                        d3.select(this).style('opacity', 1);
//                    }))
//                .call(drag.on('dragend', function (d) {
//                        var dragDeltaX = d3.event.sourceEvent.clientX - dragStartX;
//                        d3.selectAll(".bar").style('opacity', 0.7);
//                    }))
//                .call(drag.on('drag', function (d) {}))


//        svg.append("polygon")       // attach a polygon
//                .attr("stroke", "black")
//                .style("opacity", .2)
//                .attr("fill", "green")
//                .attr("points", x(-10)+","+y(0)+", "+x(10)+","+y(0)+", "+x(30)+","+y(100)+", "+x(10)+","+y(100));  // x,y points
//
//        svg.append("polygon")       // attach a polygon
//                .attr("stroke", "black")
//                .style("opacity", .2)
//                .attr("fill", "blue")
//                .attr("points", x(20)+","+y(0)+", "+x(160)+","+y(0)+", "+x(140)+","+y(100)+", "+x(0)+","+y(100));  // x,y points
//
//    });

        }

    }
})(AvenueApp);