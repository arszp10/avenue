(function(App){

    var controls  = App.Controls;
    var settings  = App.Resources.Settings;
    var cy,map;
    var routes;
    var traffic;
    var editor, intersectionEditor;
    var api;
    var that;

    var onTapToBackground = function(e){
        if(e.target !== cy.$('edge:selected')[0]) {
            controls.inputs.inputEdgeLabel.blur();
        }
        if(e.target !== cy) {
            return
        }
        cy.$().removeClass('green');
        if (App.State.clickMode == 'select-mode' || App.State.clickMode == 'pan-mode') {
            return true;
        }
        var offset = controls.panels.cytoscape.offset();
        var position = {
            x: e.originalEvent.pageX - offset.left,
            y: e.originalEvent.pageY - offset.top
        };
        var node = JSON.parse(JSON.stringify(settings[App.State.nodeType]));
        node.avgIntensity = App.State.currentModel.defaultIntensity;
        node.capacity = App.State.currentModel.defaultCapacity;
        cy.aveAddNode(node, position);
    };

    var setEdgePortion = function(edge, source){
        if (edge.data('portion')!== undefined && edge.data('portion')) {
            return;
        }
        var avgIntensity = source.data('avgIntensity');
        var sum = cy.aveNodeSumOutgoingFlow(source.data('id'));
        sum = sum >= avgIntensity ? 0 : avgIntensity - sum;
        edge.data('portion', sum);
    };

    var initCytoscapeEvents = function() {

        cy.on('free', 'node', function (e) {
            if (!e.target.hasParent()) return;
            cy.aveRecalcEdgesLengths(e.target.data('parent'));
        });

        cy.on('cxttap', 'node', function (e) {
            if (e.target.isCrossRoad()) {
                return;
            }
            e.target.select();
            editor.showNodePopup(e.target, e.originalEvent.clientX, e.originalEvent.clientY );
        });

        cy.on('tap', onTapToBackground);

        cy.on('select', 'node', function (e) {
            var s = cy.$('node:selected');

            $.each(s,function(inx, si){
                $.each(si.connectedEdges(), function (i, v) {
                    if (v.source() == si) { v.addClass('edge-out-flow'); }
                    if (v.target() == si) { v.addClass('edge-in-flow'); }
                });
            });

            if (s.length > 1) {
                editor.showSideMultiNodeEditor(s.length);
            } else if (s.length > 0) {
                editor.showSideNodeInfo(s[0].data());
            }
        });

        cy.on('unselect', 'node', function (e) {
            var s = cy.$('edge');
            $.each(s, function (i, v) {
                v.removeClass('edge-in-flow');
                v.removeClass('edge-out-flow');
            });
        });

        cy.on('unselect', function () {
            controls.panels.body.removeClass('show-right-panel');
        });

        cy.on('click', 'edge:selected', function (e) {
            controls.panels.body.toggleClass('show-edge-input');
            controls.inputs.inputEdgeLabel.css({
                    top: e.originalEvent.clientY - 10,
                    left: e.originalEvent.clientX - 15
                })
                .data("edge", e.target.data('id'))
                .val(e.target.data('portion'))
                .focus()
                .select();
        });

        cy.on('click', 'node:selected', function (e) {
            if (e.target.isCrossRoad()) {
                intersectionEditor.showCrossroadModal(e.target.data());
                return;
            }
            e.originalEvent.stopPropagation();
        });

        cy.on('add', 'node', function (e) {
            e.target.data('cycleTime', App.State.currentModel.cycleTime);
        });

        cy.on('add', 'edge', function (e) {
            var cyEdge = e.target;
            var edge = cyEdge.data();
            if (cyEdge.parallelEdges().length > 1) {
                cy.getElementById(edge.id).remove();
                return;
            };

            var target = cy.getElementById(edge.target);
            var source = cy.getElementById(edge.source);

            if ( target.data('parent')  == source.data('parent') && target.hasParent()) {
                cyEdge.data('parent', target.data('parent')) ;
            }

            if ( target.isCarriageway() || source.isCarriageway()) {
                cyEdge.addClass('carriageway-edge');
            }

            if (target.isCrossRoad() || source.isCrossRoad()) {
                cy.getElementById(edge.id).remove();
                return;
            }

            var targetEdges = cy.$('edge[target="' + edge.target + '"]');
            var isTargetConcurrent = target.isConcurrentCommon();
            var isSourceConcurrent = source.isConcurrentCommon();
            var isTargetPedestrian = target.isPedestrian();
            var isSourcePedestrian = source.isPedestrian();
            var isTargetConflict = target.isConcurrent();
            var isSourceConflict = source.isConcurrent();
            var isTargetUndefined = (target.data('type') === undefined);

            if (isTargetConcurrent && targetEdges.length > 2) {
                cy.getElementById(edge.id).remove();
                return;
            }

            var sourceEdges = cy.$('edge[source="' + edge.source + '"]');
            var targetEdges = cy.$('edge[target="' + edge.target + '"]');

            if (source.isConcurrentMerge() && sourceEdges.length > 2) {
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

            if (isSourcePedestrian) {
                if (!(isTargetConflict || isTargetPedestrian||isTargetUndefined)) {
                    cy.getElementById(edge.id).remove();
                    return;
                }
            }

            if (isTargetPedestrian) {
                if (!(isSourceConflict || isSourcePedestrian)) {
                    cy.getElementById(edge.id).remove();
                    return;
                }
            }

            if (isSourcePedestrian && sourceEdges.length > 2) {
                cy.getElementById(edge.id).remove();
                return;
            }

            if (isTargetPedestrian && targetEdges.length > 1) {
                cy.getElementById(edge.id).remove();
                return;
            }

            if ( isTargetPedestrian || isSourcePedestrian ) {
                cyEdge.data('pedestrian', true);
            }

            edge = cyEdge.data();
            var defults;
            if (edge.pedestrian) {
                defults = JSON.parse(JSON.stringify(settings.pedEdge));
            } else if(target.hasParent()){
                defults = JSON.parse(JSON.stringify(settings.crossEdge));
                cy.aveRecalcEdgesLengths(target.data('parent'));
            } else {
                defults = JSON.parse(JSON.stringify(settings.vehEdge));
            }

            edge = $.extend({}, defults, edge);
            if ( target.isCarriageway() || source.isCarriageway()) {
                edge.speed = 0;
                edge.distance = 0;
            }
            cyEdge.data(edge);
            setEdgePortion(cyEdge, source);

        });

        cy.on('viewport', function(e){
            editor.toggleNodePopupPanel(false);
            if (!App.State.currentModel.anchored) {
                return;
            }
            var pos = cy.aveScaleCyToArcGis();
            map.mapSetExtentAndScale(pos);
        });
    };


    var initParent = function (ready){
        var options   = settings.cytoscape;
        options.container = controls.panels.cytoscape;
        options.style = App.Resources.CyStyles;
        options.ready = function() {

            cy = $.extend(this, that);
            cy.edgehandles({});
            cy.panzoom({});
            cy.edgeBendEditing({undoable: true});
            cy.ur = cy.undoRedo({});
            cy.ur.action("deleteEles",
                function deleteEles(eles){return eles.remove();},
                function restoreEles(eles){return eles.restore();}
            );

            cy.collection().__proto__.hasParent = function(){
                return this.data('parent') ? true : false;
            };

            cy.collection().__proto__.isCrossRoad = function(){
                return this.data('type') == 'crossRoad';
            };
            cy.collection().__proto__.isStopline = function(){
                return this.data('type') == 'stopline';
            };
            cy.collection().__proto__.isPedestrian = function(){
                return this.data('type') == 'pedestrian';
            };
            cy.collection().__proto__.isStoppable = function(){
                return this.data('type') == 'stopline' || this.data('type') == 'pedestrian';
            };
            cy.collection().__proto__.isConcurrentCommon = function(){
                return this.data('type') == 'concurrentMerge' || this.data('type') == 'concurrent';
            };
            cy.collection().__proto__.isConcurrent = function(){
                return this.data('type') == 'concurrent';
            };
            cy.collection().__proto__.isConcurrentMerge = function(){
                return this.data('type') == 'concurrentMerge';
            };

            cy.collection().__proto__.isCarriageway = function(){
                return this.data('type') == 'carriageway';
            };

            cy.collection().__proto__.isPoint = function(){
                return this.data('type') == 'point';
            };

            cy.collection().__proto__.isBottleneck = function(){
                return this.data('type') == 'bottleneck';
            };

            ready();
        };

        cytoscape(options);


    };

    App.Modules.cytoscape =  {
        injectDependencies: function(modules) {
            editor  = modules.editor;
            api     = modules.apiCalls;
            routes  = modules.routes;
            traffic = modules.traffic;
            map = modules.map;
            intersectionEditor = modules.intersectionEditor;
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
            this.$('node').data('cycleTime', t);
        },
        aveNextId: function(){
            return Math.random().toString(36).substr(2, 16);
        },
        aveAddNode:function(data, pos){
            var d = $.extend({}, data, {id: this.aveNextId()});
            //cy.add(
            //    [{group: "nodes",
            //        data: d,
            //        renderedPosition: pos
            //    }]
            //);
            cy.ur.do('add', [{group: "nodes",
                data: d,
                renderedPosition: pos
            }]);
            return d.id;
        },
        aveSelectedCrossroadNodes: function(id){
            var nodes = this.$('node[parent="'+id+'"]');
            var edges = nodes.edgesWith(nodes);
            return nodes.union(edges).jsons();
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
            var crossRoadData = JSON.parse(JSON.stringify(settings.crossRoad));
                crossRoadData.programs.push(JSON.parse(JSON.stringify(settings.programDefaults)));
                crossRoadData.currentProgram = 0;

            var parentId = this.aveAddNode(crossRoadData);
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
            var edges = selected.neighborhood('edge').jsons();
            var parent;

            $.each(nodes, function (inx, e) {
                parent = nodes[inx].data['parent'];
                delete nodes[inx].data['parent'];
            });
            this.getElementById(parent).remove();
            this.add(nodes);
            this.add(edges);
        },

        aveGetCurrentProgramPhases: function(node){
            if (!node.isCrossRoad()) {
                return false;
            }
            var crossRoad = node.data();
            var program = crossRoad.programs[crossRoad.currentProgram];
            var phases = program.phases;
            var currentOrder = program.currentOrder;
            var order = program.phasesOrders[currentOrder].order;
            return {
                offset:program.offset,
                cycleTime: program.cycleTime,
                phases: order.map(function(phNum){
                    return phases[phNum-1];
                })
            }
        },

        aveGetCurrentProgramGreens: function(array, parent){
            var crossRoad = this.getElementById(parent).data();
            var program = crossRoad.programs[crossRoad.currentProgram];
            var currentOrder = program.currentOrder;
            var order = program.phasesOrders[currentOrder].order;

            return order.map(function(phNum){
                return array[phNum-1];
            })
        },


        aveSetCycleTimeToAllNodes: function (){
            function setToOrphanNeighborhood(node, cycleTime){
                $.each(node.neighborhood('node[^parent]'), function(i, v){
                    if (v.data('cycleTime') == cycleTime) return;
                    v.data('cycleTime', cycleTime);
                    setToOrphanNeighborhood(v, cycleTime);
                });
            };
            this.nodes().data('cycleTime', App.State.currentModel.cycleTime);
            $.each(this.$("node[type='crossRoad']"),function(inx, node){
                var cycleTime = node.data().programs[node.data().currentProgram].cycleTime;
                $.each(node.children(), function(i, child){
                    setToOrphanNeighborhood(child, cycleTime);
                });
                node.children().data('cycleTime', cycleTime);
            });
        },

        avePrepareCalcRequestSingleCrossroad: function (id){
            var nodes = this.$('node[parent="'+id+'"], #' + id);
            var edges = nodes.edgesWith(nodes);
            return this.avePrepareCalcRequestBase(edges, nodes);
        },

        avePrepareCalcRequest: function (){
            return this.avePrepareCalcRequestBase(this.edges(), this.nodes());
        },

        avePrepareCalcRequestBase: function (edges, nodes){
            this.aveSetCycleTimeToAllNodes();
            var map = [];
            var groupedEdges = {};
            edges.forEach(function(v, i, a){
                if(! v.isEdge()){
                    return
                };
                var target = v.data('target');
                if (! groupedEdges.hasOwnProperty(target)) {
                    groupedEdges[target] = [];
                };
                groupedEdges[target].push(v.data());
            });
            nodes.forEach(function(v, i, a){
                if(! v.isNode()){
                    return
                }
                var item = JSON.parse(JSON.stringify(v.data()));
                delete item.tag;
                delete item.color;
                delete item.constantIntensity;
                delete item.icon;
                delete item.greenOffset1;
                delete item.greenOffset2;
                if (!v.isCrossRoad()) {
                    item.edges = groupedEdges[v.data('id')];
                    if (v.isStoppable() && item.parent) {
                        var programInx = cy.getElementById(item.parent).data('currentProgram');
                        item.greenPhases = cy.aveGetCurrentProgramGreens(item.greenPhases[programInx], item.parent);
                        item.additionalGreens = cy.aveGetCurrentProgramGreens(item.additionalGreens[programInx], item.parent);
                    }
                } else {
                    var program = JSON.parse(JSON.stringify(cy.aveGetCurrentProgramPhases(v)));
                    item.itertactOrder = App.State.currentModel.intertactOrder;
                    item.offset = program.offset;
                    item.cycleTime = program.cycleTime;
                    item.phases = program.phases;
                    delete item.programs;
                    delete item.currentProgram;
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
            nodes.position(direction, nodes[0].position(direction));
        },

        aveGetCrossroadStoplines: function(id, disableFilter) {
            return this.getElementById(id)
               .children('[type="stopline"], [type="pedestrian"]')
               .filter(function(ele){
                    return ele.outgoers('edge').length > 0 || disableFilter == true;
               })
               .jsons();
        },

        aveNodeSumOutgoingFlow:function(nodeId){
            return this.aveNodeSumEdgesFlow(nodeId, 'outgoers');
        },

        aveNodeSumIncomingFlow:function(nodeId){
            return this.aveNodeSumEdgesFlow(nodeId, 'incomers');
        },

        aveNodeSumEdgesFlow:function(nodeId, direction){
            var sum = 0;
            cy.getElementById(nodeId)[direction]('edge')
                .forEach(function(edge){
                    if (edge.hasClass('edgehandles-ghost-edge')) {return;}
                    sum += cy.aveGetEdgeFlowByPortion(edge);
                });
            return sum;
        },


        aveConstantIntensity: function(nodeId){
            var node = cy.getElementById(nodeId).data();
            var sum = cy.aveNodeSumIncomingFlow(nodeId);
            return node.avgIntensity - sum;
        },

        aveBuildRoutes: function(selectedNodes){
            var cyRoutes = [];
            selectedNodes.forEach(function(node1){
                if (!node1.isStopline()) return;
                var data1 = node1.data();

                selectedNodes.forEach(function(node2){
                    if (!node2.isStopline()) return;
                    var data2 = node2.data();
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

        },

        aveScaleCyToArcGis:function(){
            var cybe = cy.cyBaseExtent;
            var arcbe = cy.mapExtent;
            if (!cybe || !arcbe || !arcbe.xmin || !arcbe.xmax || !arcbe.ymin || !arcbe.ymax) {
                return false;
            }

            var cye = cy.extent();
            var cyxC = (cybe.x2 - cybe.x1)/(cye.x2 - cye.x1);
            var cyyC = (cybe.y2 - cybe.y1)/(cye.y2 - cye.y1);
            var dx = {
                lx: (arcbe.xmax - arcbe.xmin)/cyxC/2,
                ly: (arcbe.ymax - arcbe.ymin)/cyyC/2
            };
            var cyBaseCenter = {
                x: (cybe.x2 + cybe.x1)/2,
                y: (cybe.y2 + cybe.y1)/2,
            };
            var arcBaseCenter = {
                x: (arcbe.xmax + arcbe.xmin)/2,
                y: (arcbe.ymax + arcbe.ymin)/2
            };
            var cyCurrentCenter = {
                x: (cye.x2 + cye.x1)/2,
                y: (cye.y2 + cye.y1)/2
            };
            var arcCurrentCenter = {
                x: arcBaseCenter.x + (cyCurrentCenter.x - cyBaseCenter.x)*cy.xC,
                y: arcBaseCenter.y - (cyCurrentCenter.y - cyBaseCenter.y)*cy.yC
            };
            var arce = {
                xmin: arcCurrentCenter.x - dx.lx,
                ymin: arcCurrentCenter.y - dx.ly,
                xmax: arcCurrentCenter.x + dx.lx,
                ymax: arcCurrentCenter.y + dx.ly,
                spatialReference: {
                    wkid: 102100
                }
            };
            return {
                mapExtent : arce,
                mapScale : cy.mapScale/cyxC
            };

        },
        aveGetExtents: function(){
            return {
                cySize: {
                  width:cy.width(),
                  height:cy.height()
                },
                cyZoom: cy.cyZoom,
                cyExtent: cy.cyBaseExtent,
                mapExtent: cy.mapExtent,
                mapScale: cy.mapScale,
                xC: cy.xC,
                yC: cy.yC
            }
        },
        aveSetBaseExtent:function(){
            var  cye = cy.extent();

            cy.cyBaseExtent = JSON.parse(JSON.stringify(cye));
            cy.cyZoom = cy.zoom();

            var  ve = map.validExtent(map.MapView.extent);
            cy.mapScale     = map.MapView.scale;

            cy.mapExtent    = JSON.parse(JSON.stringify(ve));
            cy.xC = (ve.xmax - ve.xmin)/(cye.x2 - cye.x1);
            cy.yC = (ve.ymax - ve.ymin)/(cye.y2 - cye.y1);

        },


       aveRecalcEdgesLengths: function(id){
            var crNode = cy.getElementById(id);
            var nw = crNode.width(), nh = crNode.height();
            var gw = crNode.data('width'), gh = crNode.data('height');
            var nodeDiagonal = Math.sqrt(nw*nw + nh*nh);
            var geoDiagonal = Math.sqrt(gw*gw + gh*gh);
            var scale = geoDiagonal/nodeDiagonal;
            var nodes = crNode.children('node');
            var edges = nodes.edgesWith(nodes);
            edges.forEach(function(edge){
                var sp = edge.source().position();
                var tp = edge.target().position();
                var d = Math.round(scale * Math.sqrt(Math.pow(sp.x - tp.x , 2) + Math.pow(sp.y - tp.y, 2)));
                edge.data('distance', d);
            })
        },

        aveGetEdgeFlowByPortion: function(edge){
            var source = edge.source();
            var portion = new String(edge.data('portion'));
            return (portion.indexOf('%') > 0)
                ? Math.round(source.data('avgIntensity') * parseInt(portion)/100)
                : parseInt(portion)|0;
        },

        aveGreenSaturationRender:function(){

            var width = 8;
            var saturationNode = 0.88;
            var allNodes = cy.$('node');
            var max = allNodes.max(function(el){
                return el.data('avgIntensity');
            });
            var maxFlow = max.value;

            cy.$('node').forEach(function(node){

                var nodeSimulationData = App.State.getSimulationData(node.data('id'));

                if (nodeSimulationData) {
                    if (!node.isStoppable() && nodeSimulationData.maxQueue > 1)
                        saturationNode = 2;
                    else {
                        if (nodeSimulationData.maxQueue > nodeSimulationData.queueLimit && nodeSimulationData.queueLimit > 0) {
                            saturationNode = 2;
                        } else {
                            saturationNode = (nodeSimulationData.greenSaturation|0) / 100 + (nodeSimulationData.sumInFlow / nodeSimulationData.sumOutFlow - 1);
                        }
                    }
                }

                node.data('hmcv', traffic.heatMapColorForValue2(saturationNode));
                node.addClass('green');

                var edges = node.incomers('edge');
                edges.forEach(function(edge, inx){
                    var flowValue = cy.aveGetEdgeFlowByPortion(edge);
                    edge.data('flowWidth', traffic.arrowWidthByFlow(flowValue, maxFlow));
                    edge.data('hmcv',      traffic.heatMapColorForValue2(saturationNode));
                    edge.addClass('green');
                });
            })
        }


    };


})(AvenueApp);

