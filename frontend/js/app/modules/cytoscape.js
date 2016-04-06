(function(App){

    var controls  = App.Controls;
    var settings  = App.Resources.Settings;
    var cy        = App.Modules.cytoscape;
    var editor        = App.Modules.editor;

    var onTapToBackground = function(e){
        if(e.cyTarget !== cy) { return }
        controls.inputs.inputEdgeLabel.blur();

        if (App.State.clickMode == 'select-mode' || App.State.clickMode == 'pan-mode') {
            return true;
        }
        var offset = controls.panels.cytoscape.offset();
        var position = {
            x: e.originalEvent.pageX - offset.left,
            y: e.originalEvent.pageY - offset.top
        };
        cy.aveAddNode(settings[App.State.nodeType], position);
    };

    var markInnerCrossEdge = function(edge){
        var target = cy.$('#' + edge.data().target);
        var source = cy.$('#' + edge.data().source);
        if (
            target.data().hasOwnProperty('parent')
            && target.data('parent') == source.data('parent')) {
            edge.addClass('edge-in-crossroad');
        }
    };

    var setEdgePortion = function(edge, source){
        if (edge.data('portion')!== undefined && edge.data('portion') > 0) {
            return;
        }
        var sourceEdges = cy.aveGetSourceEdges(edge.data('source'));
        var sum = 0, p = 0;
        sourceEdges.map(function(e){
            if (e.hasClass('edgehandles-ghost-edge')) {return;}
            p = e.data('portion');
            sum += p== undefined ? 0 : p;
        });
        var avgIntensity = source.data('avgIntensity');
        sum = sum >= avgIntensity ? 0 : avgIntensity - sum;
        edge.data('portion', sum);
    };

    var initCytoscapeEvents = function() {
        cy.on('tap', onTapToBackground);

        cy.on('select', 'node', null, function (d, a) {
            var s = cy.$('node:selected');
            if (s.length > 1) return;
            s = s[0];
            $.each(s.connectedEdges(), function (i, v) {
                if (v.source() == s) { v.addClass('edge-out-flow'); }
                if (v.target() == s) { v.addClass('edge-in-flow'); }
            });
            editor.showSideNodeInfo(s.data());
        });

        cy.on('unselect', 'node', null, function (d, a) {
            var s = cy.$('edge');
            $.each(s, function (i, v) {
                v.removeClass('edge-in-flow');
                v.removeClass('edge-out-flow');
            });
        });

        cy.on('unselect', function () {
            controls.panels.body.removeClass('show-right-panel');
        });

        cy.on('click', 'edge:selected', null, function (e) {
            controls.panels.body.toggleClass('show-edge-input');
            controls.inputs.inputEdgeLabel.css(
                {
                    top: e.originalEvent.clientY - 10,
                    left: e.originalEvent.clientX - 15
                }).data("edge", e.cyTarget.data('id')).val(e.cyTarget.data('portion')).focus();
        });

        cy.on('click', 'node:selected', null, function (e) {
            var type = e.cyTarget.data('type');

            if (['select-mode','pan-mode'].indexOf(App.State.clickMode) == -1 ) {
                return;
            }

            if (type == 'crossRoad') {
                editor.showCrossroadModal(e.cyTarget.data());
                return;
            }

            editor.showNodePopup(e.cyTarget.data(), e.originalEvent.clientX, e.originalEvent.clientY );
            e.originalEvent.stopPropagation();
        });

        cy.on('add', 'node', null, function (e) {
            e.cyTarget.data('cycleTime', App.State.coordinationPlan.cycleTime);
        });

        cy.on('add', 'edge', null, function (e) {
            var edge = e.cyTarget.data();
            if (e.cyTarget.parallelEdges().length > 1) {
                cy.getElementById(edge.id).remove();
                return;
            };

            markInnerCrossEdge(e.cyTarget);

            var target = cy.getElementById(edge.target);
            var source = cy.getElementById(edge.source);

            if (target.data('type') == 'crossRoad' || source.data('type') == 'crossRoad') {
                cy.getElementById(edge.id).remove();
                return;
            }

            var targetEdges = cy.$('edge[target="' + edge.target + '"]');
            var isTargetConcurrent = (target.data('type') == 'concurrent' || target.data('type') == 'concurrentMerge');
            var isSourceConcurrent = (source.data('type') == 'concurrent' || source.data('type') == 'concurrentMerge');

            if (isTargetConcurrent && targetEdges.length > 2) {
                cy.getElementById(edge.id).remove();
                return;
            }

            var sourceEdges = cy.$('edge[source="' + edge.source + '"]');
            if (source.data('type') == 'concurrentMerge' && sourceEdges.length > 2) {
                cy.getElementById(edge.id).remove();
                return;
            }

            if (isSourceConcurrent && sourceEdges.length > 3) {
                cy.getElementById(edge.id).remove();
                return;
            }

            if (isTargetConcurrent) {
                var sec = cy.$('edge[target="' + edge.target + '"][^secondary]');
                if (sec.length == 2) {
                    cy.getElementById(edge.id).data('secondary', 'true');
                }
            }

            if (isSourceConcurrent) {
                var sec = cy.$('edge[source="' + edge.source + '"][^secondary]');
                if (sec.length > 2) {
                    cy.getElementById(edge.id).data('secondary', 'true');
                }
            }

            setEdgePortion(e.cyTarget, source);

        });
    };


    App.Modules.cytoscape =  {
        injectDependencies: function(modules) {
            cy  = modules.cytoscape;
            editor  = modules.editor;
        },
        initModule: function(){
            //cy = this;
            initCytoscapeEvents();
        },

        aveSetCycleTime: function(t){
            this.$('node').data('cycleTime', t);
        },
        aveNextId: function(){
            return Math.random().toString(36).substr(2, 16);
        },
        aveAddNode:function(data, pos){
            var d = $.extend({}, data, {id: this.aveNextId()});
            this.add([{group: "nodes",
                data: d,
                renderedPosition: pos
            }]);
            return d.id;
        },
        aveCopy:function(){
            var jsons = this.$(':selected').jsons();
            var ids = [];
            $.each(jsons, function (inx, elem) {
                if (elem.group == 'nodes') {
                    ids.push(elem.data.id);
                }
            });
            return {
                ids: JSON.stringify(ids),
                data: JSON.stringify(jsons)
            }
        },
        avePaste:function(ids, data){
            var stringify = data;
            this.$(':selected').unselect();
            $.each(ids, function (inx, elem) {
                stringify = stringify.split(elem).join(cy.aveNextId())
            });
            var jsons = JSON.parse(stringify);
            if (!jsons) {
                return;
            }
            var i = jsons.length;
            while (i--) {
                if (jsons[i].group != 'edges') {
                    continue;
                }
                delete jsons[i].data.id;
            }
            this.add(jsons);
        },
        aveGroupNodes: function(){
            var selected = this.$('node:selected');
            if (selected.length == 0) {
                return;
            }
            var parentId = this.aveAddNode(settings.crossRoad);
            var nodes = selected.jsons();
            var edges = selected.neighborhood('edge').jsons();

            var nodes = this.$(':selected').jsons();
            $.each(nodes, function (inx, e) {
                e.data['parent'] = parentId;
            });
            selected.remove();
            this.add(nodes);
            this.add(edges);
            this.$("node:selected[parent][type='crossRoad']").remove();
        },
        aveUngroupNodes: function(){
            var selected = this.$('node:selected[^parent] node');
            if (selected.length == 0) {
                return;
            }
            var nodes = selected.jsons();
            var edges = selected.neighborhood('edge')
                .removeClass('edge-in-crossroad')
                .jsons();
            var parent;

            $.each(nodes, function (inx, e) {
                parent = nodes[inx].data['parent'];
                delete nodes[inx].data['parent'];
            });
            this.getElementById(parent).remove();
            this.add(nodes);
            this.add(edges);
        },
        avePrepareCalcRequest: function (){
            var map = [];
            var edges = {};
            var elems = this.edges();
            elems.forEach(function(v, i, a){
                if(! v.isEdge()){
                    return
                };
                if (! edges.hasOwnProperty(v.data('target'))) {
                    edges[v.data('target')] = [];
                };
                edges[v.data('target')].push(v.data());
            });

            elems = this.nodes();
            elems.forEach(function(v, i, a){
                var item = {};
                if(! v.isNode()){
                    return
                }
                item = v.data();
                item.edges = edges[v.data('id')];
                map.push(item);
            });
            return map;
        },
        aveAlignSelected: function (direction) {
            var nodes = this.$('node:selected');
            if (nodes.length == 0) {
                return;
            }
            this.$('node:selected').position(direction, nodes[0].position(direction));
        },
        aveGetSourceEdges : function(id){
            return this.$('edge[source="' + id + '"]');
        },
        aveGetCrossroadStoplines: function(id) {
            return this.$('node[parent="' + id + '"][type="stopline"]');
        },
        aveConstantIntensity: function(node){
            var sum = 0;
            $.each(this.$('edge[target="' + node.id + '"]'), function(inx, n){
                sum += parseInt(n.data('portion'));
            });
            return node.avgIntensity - sum;
        }
    };


})(AvenueApp);

