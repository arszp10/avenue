var cyevents = {
    innerCrossEdges: function(edge){
        var target = app.cy.$('#' + edge.data().target);
        var source = app.cy.$('#' + edge.data().source);
        if (
            target.data().hasOwnProperty('parent')
            && target.data('parent') == source.data('parent')) {
            edge.addClass('edge-in-crossroad');
        }
    },

    edgeCalcPortion: function(edge, source){
        if (edge.data('portion')!== undefined && edge.data('portion') > 0) {
            return;
        }
        var sourceEdges = app.cy.$('edge[source="' + edge.data('source') + '"]');
        var sum = 0, p = 0;
        sourceEdges.map(function(e){
           if (e.hasClass('edgehandles-ghost-edge')) {return;}
           p = e.data('portion');
           sum += p== undefined ? 0 : p;
        });
        var avgIntensity = source.data('avgIntensity');
        sum = sum >= avgIntensity ? 0 : avgIntensity - sum;
        edge.data('portion', sum);
    },



    signalDiagramData: function(node){
        var stopLine = node;
        var crossRoad = app.cy.$('#'+stopLine.parent).data();

        var i = 0, icolor = '', inext = 0, goff = 0;
        var diagram = [];
        var phCount =  crossRoad.phases.length;
        var interTact = settings.interTact;
        var prevGoff = 0;
        for (i = 0; i < phCount; i++){
            icolor = stopLine.greenPhases[i] ? 'green' : 'red';
            goff = stopLine.greenPhases[i] ? parseInt(stopLine.greenOffset2) : parseInt(stopLine.greenOffset1);
            inext = (i + 1) % phCount;
            if (stopLine.greenPhases[i] === stopLine.greenPhases[inext]) {
                diagram.push({
                    color : icolor,
                    length : crossRoad.phases[i].length
                });
                continue;
            }
            diagram.push({
                color : icolor,
                length : crossRoad.phases[i].length - interTact[icolor].length + prevGoff + goff
            });
            diagram = diagram.concat(interTact[icolor].signals);
            prevGoff = -goff;
        }
        diagram[0].length += prevGoff;
        return this.offsetDiagram(diagram, crossRoad.offset, crossRoad.cycleTime);
    },

    offsetDiagram: function(diagram, offset, cycle){
        if (offset == 0) {
            return diagram;
        }
        var backOffset = cycle - offset - 1;
        var sum = 0;
        var l = diagram.length;
        var i = 0;
        var head = [];
        var tail = [];
        while (i < l){
            sum += diagram[i].length
            if (backOffset > sum ) {
                head.push(diagram[i]);
            } else {
                if (tail.length == 0) {
                    var icolor = diagram[i].color;
                    var ilen = diagram[i].length ;
                    head.push({
                        color : icolor,
                        length : ilen - (sum - backOffset) + 1
                    });
                    tail.push({
                        color : icolor,
                        length : sum - backOffset - 1
                    });
                    i++;
                    continue;
                }
                tail.push(diagram[i]);
            }
            i++;
        }
        return tail.concat(head);
    },

    redIntervals: function(diagram){
        var intervals = [];
        var s = 0, i = 0;
        diagram.forEach(function(v){
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

    init: function() {
        app.cy.on('tap', app.actions.tapToBackground);

        app.cy.on('select', 'node', null, function (d, a) {
            var s = app.cy.$('node:selected');
            if (s.length > 1) return;
            s = s[0];
            $.each(s.connectedEdges(), function (i, v) {
                if (v.source() == s) {
                    v.addClass('edge-out-flow');
                }
                if (v.target() == s) {
                    v.addClass('edge-in-flow');
                }
            });


            uievents.showNodeInformation(s.data());


        });

        app.cy.on('unselect', 'node', null, function (d, a) {
            var s = app.cy.$('edge');
            $.each(s, function (i, v) {
                v.removeClass('edge-in-flow');
                v.removeClass('edge-out-flow');
            });
        });

        app.cy.on('unselect', function () {
            $('body').removeClass('show-right-panel');
        });


        app.cy.on('click', 'edge:selected', null, function (e) {
            $('body').toggleClass('show-edge-input');
            app.inputs.inputEdgeLabel.css(
                {
                    top: e.originalEvent.clientY - 10,
                    left: e.originalEvent.clientX - 15
                }).data("edge", e.cyTarget.data('id')).val(e.cyTarget.data('portion')).focus();
        });


        app.cy.on('click', 'node:selected', null, function (e) {
            var type = e.cyTarget.data('type');

            if (['select-mode','pan-mode'].indexOf(app.state.clickMode) == -1 ) {
                return;
            }

            if (type == 'crossRoad') {
                app.actions.showCrossroadModal(e.cyTarget);
                return;
            }

            app.actions.showNodePopup(e.cyTarget, e.originalEvent.clientX, e.originalEvent.clientY );
            e.originalEvent.stopPropagation();
        });


        app.cy.on('add', 'node', null, function (e) {
            e.cyTarget.data('cycleTime', app.coordinationPlan.cycleTime);
        });

        app.cy.on('add', 'edge', null, function (e) {
            var edge = e.cyTarget.data();
            if (e.cyTarget.parallelEdges().length > 1) {
                app.cy.$('#' + edge.id).remove();
                return;
            }
            cyevents.innerCrossEdges(e.cyTarget);

            var target = app.cy.$('#' + edge.target);
            var source = app.cy.$('#' + edge.source);

            if (target.data('type') == 'crossRoad' || source.data('type') == 'crossRoad') {
                app.cy.$('#' + edge.id).remove();
                return;
            }

            var targetEdges = app.cy.$('edge[target="' + edge.target + '"]');
            var isTargetConcurrent = (target.data('type') == 'concurrent' || target.data('type') == 'concurrentMerge');
            var isSourceConcurrent = (source.data('type') == 'concurrent' || source.data('type') == 'concurrentMerge');

            if (isTargetConcurrent && targetEdges.length > 2) {
                app.cy.$('#' + edge.id).remove();
                return;
            }

            var sourceEdges = app.cy.$('edge[source="' + edge.source + '"]');
            if (source.data('type') == 'concurrentMerge' && sourceEdges.length > 2) {
                app.cy.$('#' + edge.id).remove();
                return;
            }

            if (isSourceConcurrent && sourceEdges.length > 3) {
                app.cy.$('#' + edge.id).remove();
                return;
            }

            if (isTargetConcurrent) {
                var sec = app.cy.$('edge[target="' + edge.target + '"][^secondary]');
                if (sec.length == 2) {
                    app.cy.$('#' + edge.id).data('secondary', 'true');
                }
            }

            if (isSourceConcurrent) {
                var sec = app.cy.$('edge[source="' + edge.source + '"][^secondary]');
                if (sec.length > 2) {
                    app.cy.$('#' + edge.id).data('secondary', 'true');
                }
            }

            cyevents.edgeCalcPortion(e.cyTarget, source);

        });
    }
};
