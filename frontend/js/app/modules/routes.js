(function(App){
    var cy, traffic;
    var that;

    var svgMargin = {top: 50, right: 200, bottom: 50, left: 50};
    var routeDirections = ['forward', 'back'];

    function Route(name, forwardOnly){
        this.routeName = name || 'testRoute';
        this.forwardOnly = forwardOnly;
        this.points = [];
        this.forward = [];
        this.back = [];
    };

    Route.prototype.select = function() {

        return this;
    };

    Route.prototype.addPoints = function(data) {
        if (!data) {return this; }
        data.forEach(function(node){
            this.addPoint(node.parent);
        }, this);
        return this;
    };

    Route.prototype.addLines = function(data, direction) {
        if (!data) {return this; }
        data.forEach(function(node){
            this.getPoint(node.parent)[direction] = this.newPointLine(node);
        }, this);

        if (data.length == 0) {return this; }
        this[direction].push(data[0].id);
        this[direction].push(data[data.length - 1].id);
        return this;
    };

    Route.prototype.addPoint = function(id){
        this.points.push({
            id:      id,
            forward: false,
            back:    false
        });
        return this;
    };

    Route.prototype.newPointLine =  function(node){
        return {
            id: node.id,
            carriages: node.carriages
        };
        return this;
    };

    Route.prototype.getPoint = function(id){
        var results = this.points.filter(function(a){ return a.id == id });
        return results.length > 0 ? results[0]: false;
    };


    var prepareD3SvgDefs = function(svg){
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
            .attr("stop-color", "#f00")
            .attr("stop-opacity", 1);

        amber.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#ff0")
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

    };
    var drawBarLine = function(route, bar, direction, x, cycleTime){
        if (route.forwardOnly && direction == 'back') {return;};
        bar.selectAll("rect." + direction)
            .data(function(d) { return d[direction].signals; }).enter()
            .append("rect")
            .attr('class',direction)
            .attr("height", 11)
            .attr("x",      function(d) { return x(d.offset - 3*cycleTime); })
            .attr("y",     direction == 'forward'? 1 : -13)
            .attr("width",  function(d) { return x(d.length)  >= 0 ? x(d.length) : 0; })
            .style("fill",  function(d) {
                if (d.color == 'blink') return 'url(#blink)';
                if (d.color == 'amber') return 'url(#amber)';
                return d.color;
            });
    };


    App.Modules.routes = {
        injectDependencies: function (modules) {
            cy      = modules.cytoscape;
            traffic = modules.traffic;
        },

        initModule: function () {
            that = this;
        },

        createRoute:function(name, forwardOnly){
            var route = new Route(name, forwardOnly);
            App.State.currentModel.routes.push(route);
            return route;
        },

        getRoute: function(inx){
            return App.State.currentModel.routes[inx];
        },

        filterNodes: function(cyRoutePath){
            var routeInfo = [];
            var route = cyRoutePath.nodes().jsons()
                .map(function(v){ return v.data })
                .filter(function(val){
                    return (val.type == 'stopline' && val.hasOwnProperty('parent')) || val.type == 'carriageway';
                });
            var prevCw = {
                carriages: []
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
                            carriages: [route[i].id]
                        }
                    } else {
                        prevCw.carriages.push(route[i].id);
                    }
                }
            }
            return routeInfo;
        },

        expandRoute: function(data){
            var route = JSON.parse(JSON.stringify(data));

            route.points.forEach(function(point) {

                point.length = point.forward.hasOwnProperty('carriages')
                    ? point.forward.carriages.reduce(function (sum, cwId) {
                        return sum + cy.getElementById(cwId).data('length');
                      }, 0)
                    : 0;

                routeDirections.forEach(function(direction){
                    if (! point[direction]) return;

                    var stopline  = cy.getElementById(point[direction].id).data();
                    var crossroad = cy.getElementById(point.id).data();
                    point.name = crossroad.name;
                    point[direction].tag = stopline.tag;
                    point[direction].routeTime =  point[direction].hasOwnProperty('carriages')
                        ? point[direction].carriages.reduce(function (sum, cwId) {
                                return sum + cy.getElementById(cwId).data('routeTime');
                            }, 0)
                        : 0;

                    point[direction].signals = traffic.signalDiagramData(crossroad, stopline);
                    var signalsString = JSON.stringify(point[direction].signals);
                    var a1 = JSON.parse(signalsString);
                    var a2 = JSON.parse(signalsString);
                    var a3 = JSON.parse(signalsString);
                    var a4 = JSON.parse(signalsString);
                    var a5 = JSON.parse(signalsString);
                    var a6 = JSON.parse(signalsString);
                    var a7 = JSON.parse(signalsString);
                    var a8 = JSON.parse(signalsString);

                    var result = point[direction].signals.concat(a1,a2,a3,a4,a5,a6,a7,a8);

                    result.reduce(function (sum, current) {
                        current.offset = sum;
                        return current.offset + current.length;
                    }, 0);

                    point[direction].isGreenMoment = traffic.greenRedArray(point[direction].signals);
                    point[direction].signals = result;
                });

            });

            route.points[0].length = 100;

            route.points.reduce(function (sum, current) {
                var directionLag = 0;
                current.geoOffset = current.length + sum;
                current.forwardGeoOffset = current.geoOffset  - 1;
                current.backGeoOffset = current.geoOffset + 15;
                return current.geoOffset;
            }, 0);
            return route;
        },

        deleteRoute:function(){},

        greenLine: function(cycleTime, route, direction, callback){
            if (route.forwardOnly && direction == 'back') {return;};
            for(var i=0; i < route.points.length - 1; i++){
                var sl1 = route.points[i];
                var sl2 = route.points[i + 1];
                var state = 'end-block';
                var tpr = direction == 'forward' ? sl2[direction].routeTime : - sl1[direction].routeTime;
                var y1 = sl1.geoOffset;
                var y2 = sl2.geoOffset;

                var points = [{x:0,y:y1},{x:0,y:y2},{x:0,y:y2},{x:0,y:y1}];
                for(var j=0; j< cycleTime * 5; j++){
                    var bothPointIsGreen = sl1[direction].isGreenMoment[j % cycleTime] && sl2[direction].isGreenMoment[(j + tpr)% cycleTime];
                    if (state == 'end-block') {
                        if (bothPointIsGreen) {
                            state = 'start-block';
                            points[0].x = (j - cycleTime);
                            points[1].x = (j + tpr - cycleTime);
                        }
                    }

                    if (state == 'start-block') {
                        if (!bothPointIsGreen) {
                            state = 'end-block';
                            points[2].x = (j + tpr - cycleTime);
                            points[3].x = (j - cycleTime);
                            callback(points);
                        }
                    }
                }

            }
        },

        drawRoute:function(data){
            var route = this.expandRoute(data);
            var cycleTime = App.State.currentModel.cycleTime;
            var totalRouteLenght = route.points.reduce(function(sum, point){return sum + point.length;} ,0);

            var width  = window.innerWidth - 150 - svgMargin.left - svgMargin.right;
            var height = totalRouteLenght - svgMargin.top - svgMargin.bottom;

            var x = d3.scale.linear().rangeRound([0, width]);
            var y = d3.scale.linear().rangeRound([height, 0]);
            var y1 = d3.scale.linear().rangeRound([height, 0]);

            y.domain([0, totalRouteLenght + 100]);
            y1.domain([0, 0]);
            x.domain([0, cycleTime * 3 ]);


            var rrange = route.points.map(function(v){return y(v.geoOffset)});
            var rlabels = route.points.map(function(v){return v.name});
            rrange.unshift(totalRouteLenght - 100);
            rrange.push(0);
            rlabels.unshift('');
            rlabels.push('');

            var y2 = d3.scale.ordinal().range(rrange).domain(rlabels);

            var lrange = [];
            var llabels = [];

            route.points.map(function(v){
                lrange.push(y(v.forwardGeoOffset - 6));
                lrange.push(y(v.backGeoOffset - 6));
                llabels.push(v.forward.tag);
                llabels.push(v.back.tag);
            });

            lrange.unshift(totalRouteLenght - 100);
            lrange.push(0);
            llabels.unshift('');
            llabels.push('');

            var y3 = d3.scale.ordinal().range(lrange).domain(llabels);

            var yAxis   = d3.svg.axis().scale(y).orient("right").tickFormat(d3.format(".2s"));
            var yAxis0  = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));
            var yAxis1  = d3.svg.axis().scale(y1).orient("left");
            var yAxis2  = d3.svg.axis().scale(y2).orient("right");
            var yAxis3  = d3.svg.axis().scale(y3).orient("left");
            var xAxis   = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.format(".2s"));


            d3.select("svg").remove();
            var svg = d3.select("#diagram-panel").append("svg")
                .attr("width", width + svgMargin.left + svgMargin.right)
                .attr("height", height + svgMargin.top + svgMargin.bottom)
                .append("g")
                .attr("transform", "translate(" + svgMargin.left + "," + svgMargin.top + ")");

            // add main axis
            svg.append("g").attr("class", "x axis").attr("transform", "translate(0, " + height + ")").call(xAxis)
                .append("text").style("text-anchor", "end").attr("x", width).attr("y", 40).text("Time (s)");

            svg.append("g").attr("class", "y axis").call(yAxis);
            svg.append("g") .attr("class", "y2 axis")
                .attr("transform", "translate(" + (width) + ",0)").call(yAxis0);

            svg.append("g").attr("class", "y1 axis")
                .attr("transform", "translate(" + x(cycleTime) + ",0)").call(yAxis1);

            svg.append("g").attr("class", "y1 axis")
                .attr("transform", "translate(" + x(2 * cycleTime) + ",0)").call(yAxis1);


            // add defs for amber & flashed green
            prepareD3SvgDefs(svg);

            // Draw green-lines
            routeDirections.forEach(function(direction) {
                this.greenLine(cycleTime, route, direction, function (points) {
                    svg.append("polygon")
                        .attr("class", "green-line") // attach a polygon
                        .attr("stroke", "black")
                        .style("opacity", .1)
                        .attr("fill", direction == 'forward' ? "green" : "blue")
                        .attr("points", x(points[0].x) + "," + y(points[0].y) + ", "
                        + x(points[1].x) + "," + y(points[1].y) + ", "
                        + x(points[2].x) + "," + y(points[2].y) + ", "
                        + x(points[3].x) + "," + y(points[3].y));  // x,y points
                });
            }, this);


            // drag behavior
            var start = 0;
            var drag = d3.behavior.drag()
                .origin(Object)
                .on("dragstart", function() {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    start = d3.event.sourceEvent.clientX;
                    d3.select(this)
                        .attr("cursor","move")
                        .attr("opacity","0.5");
                })
                .on("drag", function(){
                    var stop = d3.event.sourceEvent.clientX;
                    d3.select(this).attr("transform", function(d) {
                        return "translate("+(stop-start)+"," + y(d.forwardGeoOffset) + ")";
                    })
                })
                .on("dragend", function() {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    var stop = d3.event.sourceEvent.clientX;
                    var b = d3.select(this).attr("opacity","0.5");
                    var pointId = b.data()[0].id;
                    var o = cy.getElementById(pointId).data('offset');
                    var newOffset = (o + Math.round(cycleTime*(stop-start)/ x(cycleTime)) + cycleTime) % cycleTime;
                    cy.getElementById(pointId).data('offset', newOffset);

                    // redraw graphic on dragend event
                    that.drawRoute(data);
                });

            // add bar groups
            var bar = svg.selectAll('.bar')
                .data(route.points).enter().append("g")
                .attr("class", function(d) { return 'bar ' + 'bar-' + d.id})
                .attr("x", 0)
                .attr("transform", function(d) { return "translate(0," + y(d.forwardGeoOffset) + ")"; })
                .call(drag)
                .on("mouseenter", function(){ d3.select(this).attr("cursor","pointer"); })
                .on("mouseleave", function(){ d3.select(this).attr("cursor","default"); })
                ;

            drawBarLine(route, bar, 'forward', x, cycleTime);
            drawBarLine(route, bar, 'back',  x, cycleTime);

            // clearing border effects & additional labeled axis
            svg.append("rect")
                .attr("x", -50)
                .attr("y", 0)
                .attr("width", 50)
                .attr("height", height)
                .style("fill","#eee");

            svg.append("rect")
                .attr("x", width + 1)
                .attr("y", 0)
                .attr("width", 550)
                .attr("height", height)
                .style("fill","#eee");

            svg.append("g") .attr("class", "y2 axis")
                .attr("transform", "translate(" + (width) + ",0)").call(yAxis2);

            svg.append("g") .attr("class", "y3 axis").call(yAxis3);

        }

    }
})(AvenueApp);