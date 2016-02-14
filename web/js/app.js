var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.session.setMode("ace/mode/json");

var app = {
    $cy: null,
    $source: null,
    cy: null,
    state: {
        clickMode: 'select-mode', // select, add-stopline, ... add-concurrent
        nodeType: 'stopline',
        lastCalc: null
    },
    clipboard: null,
    panels: {
        leftPanel: 'div.left-panel'
    },
    inputs: {
        inputEdgeLabel: '#input-edge-label'
    },
    buttons: {
        btnPanMode:         '#btn-now-pan-mode',
        btnSelectMode:      '#btn-now-select-mode',
        btnPointsSelect:     '#btn-points-select',
        btnAddStopline:     '#btn-add-stopline',
        btnAddCarriageway:  '#btn-add-carriageway',
        btnAddPoint:        '#btn-add-point',
        btnAddBottleneck:   '#btn-add-bottleneck',
        btnAddConcurrent:   '#btn-add-concurrent',
        btnAddConcurrentMerge:   '#btn-add-concurrent-merge',
        btnGraphNode:       '#btn-graph-node',
        btnDeleteNode:      '#btn-delete-node',
        btnHorizontalAlign: '#btn-horizontal-align',
        btnVerticalAlign:   '#btn-vertical-align',
        btnCut:             '#btn-cut',
        btnCopy:            '#btn-copy',
        btnPaste:           '#btn-paste',
        btnShowNetwork:     '#btn-show-network',
        btnShowSource:      '#btn-show-source',
        btnToggleMap:       '#btn-toggle-map',
        btnGroupNodes:      '#btn-group-nodes'
    },
    actions: {
        init: function(){
            $.each(app.panels, function(i,v){app.panels[i] = $(v);});
            $.each(app.buttons, function(i,v){app.buttons[i] = $(v);});
            $.each(app.inputs, function(i,v){app.inputs[i] = $(v);});
            uievents.init();
        },

        nextId: function(){
            return Math.random().toString(36).substr(2, 16);
        },

        addNode:function(data, pos){
            var d = $.extend({}, data, {id: app.actions.nextId()});
            app.cy.add([{group: "nodes",
                data: d,
                renderedPosition: pos
            }]);
            return d.id;
        },

        tapToBackground: function(e){
            if(e.cyTarget !== app.cy) {
                return
            }
            app.inputs.inputEdgeLabel.blur();

            if (app.state.clickMode == 'select-mode' || app.state.clickMode == 'pan-mode') {
                return true;
            }
            var idNum = app.cy.nodes().size();
            setID = idNum.toString();
            offset = app.$cy.offset();
            position = {
                x: e.originalEvent.pageX - offset.left,
                y: e.originalEvent.pageY - offset.top
            };
            app.actions.addNode(settings[app.state.nodeType], position);
        },

        prepareCalcRequest: function (){
            var data = {
                nodes: {},
                edges: []
            };
            var elems = app.cy.elements();
            elems.forEach(function(v, i, a){
                if(v.isNode()){
                    data.nodes[v.data('id')] = v.data();
                };

                if(v.isEdge()){
                    data.edges.push(v.data());
                };
            });
            return data;
        }

    }
};

$(document).ready(function() {

    app.$cy = $("#cy");
    app.$source = $("#source");
    app.actions.init();
    app.$cy.cytoscape({
        boxSelectionEnabled:true,
        userPanningEnabled:false,
        elements: [],
        style: vizmap[0].style,
        showOverlay: false,
        minZoom: 0.1,
        maxZoom: 4.0,
        layout: {
            name: 'preset',
            fit: true
        },
        ready: function() {
            app.cy = this;
            app.cy.edgehandles({ });
            app.cy.panzoom({});
           // app.cy.navigator({  });
            app.cy.on('tap', app.actions.tapToBackground);

            app.cy.on('select', 'node', null, function(d,a){
                var s = app.cy.$('node:selected');
                if(s.length > 1) return;
                s = s[0];
                $.each(s.connectedEdges(), function(i,v){
                    if(v.source() == s){
                        v.addClass('edge-out-flow');
                    }
                    if(v.target() == s){
                        v.addClass('edge-in-flow');
                    }
                });
            });

            app.cy.on('unselect', 'node', null, function(d,a){
                var s = app.cy.$('edge');
                $.each(s, function(i,v){
                    v.removeClass('edge-in-flow');
                    v.removeClass('edge-out-flow');
                });
            });


            app.cy.on('click', 'edge:selected', null, function(e){
                $('body').toggleClass('show-edge-input');
                app.inputs.inputEdgeLabel.css(
                    {
                        top: e.originalEvent.clientY - 10,
                        left: e.originalEvent.clientX - 15
                    }).data("edge", e.cyTarget.data('id')).val(e.cyTarget.data('portion')).focus();
            });


            app.cy.on('add', 'edge', null, function(e){
                var edge = e.cyTarget.data();
                if(e.cyTarget.parallelEdges().length > 1) {
                    app.cy.$('#'+edge.id).remove();
                    return;
                };

                var target = app.cy.$('#'+edge.target);
                var source = app.cy.$('#'+edge.source);
                var targetEdges = app.cy.$('edge[target="'+edge.target+'"]');

                var isTargetConcurrent = (target.data('type') == 'concurrent' || target.data('type') == 'concurrentMerge');
                var isSourceConcurrent = (source.data('type') == 'concurrent' || source.data('type') == 'concurrentMerge');

                if(isTargetConcurrent &&  targetEdges.length > 2) {
                    app.cy.$('#'+edge.id).remove();
                    return;
                }

                var sourceEdges = app.cy.$('edge[source="'+edge.source+'"]');
                if( source.data('type') == 'concurrentMerge' &&  sourceEdges.length > 2) {
                    app.cy.$('#'+edge.id).remove();
                    return;
                }

                if(isSourceConcurrent &&  sourceEdges.length > 3) {
                    app.cy.$('#'+edge.id).remove();
                    return;
                }

                if(isTargetConcurrent){
                    var sec = app.cy.$('edge[target="'+edge.target+'"][^secondary]');
                    if (sec.length == 2) {
                        app.cy.$('#'+edge.id).data('secondary','true');
                    }
                }

                if(isSourceConcurrent){
                    var sec = app.cy.$('edge[source="'+edge.source+'"][^secondary]');
                    if (sec.length > 2) {
                        app.cy.$('#'+edge.id).data('secondary','true');
                    }
                }

            });



        }
    });


    $('.chart-panel').drag();



});
