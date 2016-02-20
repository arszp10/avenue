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
    panels: {
        leftPanel: 'div.left-panel',
        pointProperty: '#panel-point-property',
        crossRoadModal: '#crossroad-modal'
    },
    inputs: {
        inputEdgeLabel: '#input-edge-label',
        inputNodeIntensity :'#input-node-intensity',
        inputNodeCapacity :'#input-node-capacity',
        inputNodeType :'#input-node-type'
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
        btnGroupNodes:      '#btn-group-nodes',
        btnUngroupNodes:      '#btn-ungroup-nodes',
        listItemAddSample:    '.add-sample-item',
        btnSlideRightPanel:   '#btn-slide-right-panel'
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
        },

        showCrossroadModal: function(){
            app.panels.crossRoadModal.modal('show');

        },

        showNodePopup: function(target, x, y){
            $('body').toggleClass('show-panel-point-property');
            app.panels.pointProperty.css(
                {
                    top: y + 10,
                    left: x - 135
                }).data("node", target.data('id'));
            app.inputs.inputNodeType.text(target.data('type'));
            app.inputs.inputNodeIntensity.val(target.data('avgIntensity')).focus();
            app.inputs.inputNodeCapacity.val(target.data('capacity'));
        }
    }
};

$(document).ready(function() {

    app.$cy = $("#cy");
    app.$source = $("#source");
    app.actions.init();

    var options = settings.cytoscape;
    options.style = cystyles;
    options.ready = function() {
        app.cy = this;
        app.cy.edgehandles({ });
        app.cy.panzoom({});
        cyevents.init();
    }
    app.$cy.cytoscape(options);


});
