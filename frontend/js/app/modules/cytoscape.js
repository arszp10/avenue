(function(App){

    var controls  = App.Controls;
    var settings  = App.Resources.Settings;
    var cy;
    var routes;
    var traffic;
    var editor;
    var api;
    var that;

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
            edge.addClass('edge-in-intersection');
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
        var flowRate = source.data('flowRate');
        sum = sum >= flowRate ? 0 : flowRate - sum;
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

            if (type == 'intersection') {
                editor.showCrossroadModal(e.cyTarget.data());
                return;
            }

            editor.showNodePopup(e.cyTarget.data(), e.originalEvent.clientX, e.originalEvent.clientY );
            e.originalEvent.stopPropagation();
        });

        cy.on('add', 'node', null, function (e) {
            e.cyTarget.data('cycleLength', App.State.currentModel.cycleLength);
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

            if (target.data('type') == 'intersection' || source.data('type') == 'intersection') {
                cy.getElementById(edge.id).remove();
                return;
            }

            var targetEdges = cy.$('edge[target="' + edge.target + '"]');
            var isTargetConcurrent = (target.data('type') == 'conflictingApproach' || target.data('type') == 'entranceRamp');
            var isSourceConcurrent = (source.data('type') == 'conflictingApproach' || source.data('type') == 'entranceRamp');

            if (isTargetConcurrent && targetEdges.length > 2) {
                cy.getElementById(edge.id).remove();
                return;
            }

            var sourceEdges = cy.$('edge[source="' + edge.source + '"]');
            if (source.data('type') == 'entranceRamp' && sourceEdges.length > 2) {
                cy.getElementById(edge.id).remove();
                return;
            }

            if (isSourceConcurrent && sourceEdges.length > 3) {
                cy.getElementById(edge.id).remove();
                return;
            }

            if (isTargetConcurrent) {
                var sec = cy.$('edge[target="' + edge.target + '"][^secondary]');
                if (sec.length == 2 || edge.secondary) {
                    cy.getElementById(edge.id).data('secondary', 'true');
                }
            }

            if (isSourceConcurrent) {
                var sec = cy.$('edge[source="' + edge.source + '"][^secondary]');
                if (sec.length > 2 || edge.secondary) {
                    cy.getElementById(edge.id).data('secondary', 'true');
                }
            }

            setEdgePortion(e.cyTarget, source);

        });
    };

    var initParent = function (ready){
        var options   = settings.cytoscape;
        options.style = App.Resources.CyStyles;
        options.ready = function() {
            cy = $.extend(this, that);

            cy.edgehandles({ });
            cy.panzoom({});
            ready();
        };
        controls.panels.cytoscape.cytoscape(options);
    };



    App.Modules.cytoscape =  {
        injectDependencies: function(modules) {
            editor  = modules.editor;
            api     = modules.apiCalls;
            routes  = modules.routes;
            traffic = modules.traffic;
        },
        initModule: function(){
            if (! controls.panels.cytoscape.length) {
                return;
            }
            that = this;
            initParent(function(){
                App.Modules.cytoscape = cy;
                App.linkModules();
                initCytoscapeEvents();
                App.State.modelId = window.location.pathname.split('/').pop();;
                api.getModel(App.State.modelId);
            });
        },

        aveSetCycleTime: function(t){
            this.$('node').data('cycleLength', t);
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
            var parentId = this.aveAddNode(settings.intersection);
            var nodes = selected.jsons();
            var edges = selected.neighborhood('edge').jsons();

            var nodes = this.$(':selected').jsons();
            $.each(nodes, function (inx, e) {
                e.data['parent'] = parentId;
            });
            selected.remove();
            this.add(nodes);
            this.add(edges);
            this.$("node:selected[parent][type='intersection']").remove();
        },
        aveUngroupNodes: function(){
            var selected = this.$('node:selected[^parent] node');
            if (selected.length == 0) {
                return;
            }
            var nodes = selected.jsons();
            var edges = selected.neighborhood('edge')
                .removeClass('edge-in-intersection')
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
                var edgeData = v.data();
                delete  edgeData.id;
                edges[v.data('target')].push(edgeData);
            });

            elems = this.nodes();
            elems.forEach(function(v, i, a){
                var item = {};
                if(! v.isNode()){
                    return
                }
                item = v.data();
                if (edges[v.data('id')]) {
                    item.edges = edges[v.data('id')];
                }
                delete item.icon;
                delete item.color;
                delete item.constantFlowRate;

                if (item.type == 'stopline' && !item.hasOwnProperty('parent')) {
                    delete item.greenPhases;
                    delete item.greenOffset1;
                    delete item.greenOffset2;
                }
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
        aveConstantFlowRate: function(node){
            var sum = 0;
            $.each(this.$('edge[target="' + node.id + '"]'), function(inx, n){
                sum += parseInt(n.data('portion'));
            });
            return node.flowRate - sum;
        },

        aveBuildRoutes: function(selectedNodes){
            var cyRoutes = [];
            selectedNodes.forEach(function(node1){
               var data1 = node1.data();
               if (data1.type != 'stopline') return;

                selectedNodes.forEach(function(node2){
                    var data2 = node2.data();
                    if (data2.type != 'stopline') return;
                    if (data1.id == data2.id) return;
                    if (data1.parent == data2.parent) return;

                    var aStar = cy.elements().aStar({
                        root: '#'+data1.id,
                        goal: '#'+data2.id,
                        directed:true
                    });
                    if (aStar.path) {
                        if (aStar.path[0].data('parent') == aStar.path[aStar.path.length -1].data('parent')) return;
                        cyRoutes.push(aStar.path);
                    }
               });
            });

            var result = cyRoutes.length > 2 ? cyRoutes.slice(0,2) : cyRoutes;
            this.$(":selected").unselect();
            result.forEach(function(r){  r.select(); });
            return result;

        }
    };









})(AvenueApp);

