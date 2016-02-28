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
        });

        app.cy.on('unselect', 'node', null, function (d, a) {
            var s = app.cy.$('edge');
            $.each(s, function (i, v) {
                v.removeClass('edge-in-flow');
                v.removeClass('edge-out-flow');
            });
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

            if (['select-mode','pan-mode'].indexOf(app.state.clickMode) == -1
                || type == 'point' ) {
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

        });
    }
};
