var app = {
    $cy: null,
    $source: null,
    cy: null,
    coordinationPlan:{

    },
    state: {
        clickMode: 'select-mode', // select, add-stopline, ... add-concurrent
        nodeType: 'stopline',
        lastModelingResult: [],
        lastErrors: []
    },
    panels: {
        leftPanel: 'div.left-panel',
        pointProperty: '#panel-point-property',
        crossRoadModal: '#crossroad-modal',
        coPlanModal: '#co-plan-modal',
        tblPhasesBody: '#crossroad-modal table.table-phases tbody',
        statusBar: '#status-bar',
        nodeSearchResultlist: '#node-search-result-list',
        nodeSearchInfo: '#node-search-info'
    },
    labels: {
        labelMyAccountUsername: '#label-my-account-username'
    },
    inputs: {
        inputEdgeLabel: '#input-edge-label',
        inputNodeType :'#input-node-type',
        inputCrossroadOffset: "#inputCrossroadOffset",
        inputCoPlanCycleTime: '#inputCoPlanCycleTime',
        inputCoPlanName: '#inputCoPlanName',
        inputCoPlanNotes: '#inputCoPlanNotes',
        inputsNodeProperty: 'input.node-property',
        inputCrossroadName: '#input-crossroad-name',
        inputNodeSearch: '#input-node-search',
        inputNodeSearchForm: '#input-node-search-form'
    },
    buttons: {
        btnPanMode:           '#btn-now-pan-mode',
        btnSelectMode:        '#btn-now-select-mode',
        btnPointsSelect:      '#btn-points-select',
        btnAddStopline:       '#btn-add-stopline',
        btnAddCarriageway:    '#btn-add-carriageway',
        btnAddPoint:          '#btn-add-point',
        btnAddBottleneck:     '#btn-add-bottleneck',
        btnAddConcurrent:     '#btn-add-concurrent',
        btnAddConcurrentMerge:'#btn-add-concurrent-merge',
        btnDeleteNode:        '#btn-delete-node',
        btnHorizontalAlign:   '#btn-horizontal-align',
        btnVerticalAlign:     '#btn-vertical-align',
        btnCut:               '#btn-cut',
        btnCopy:              '#btn-copy',
        btnPaste:             '#btn-paste',
        btnShowNetwork:       '#btn-show-network',
        btnShowResults:       '#btn-show-results',
        btnShowRoutes:        '#btn-show-routes',
        btnToggleMap:         '#btn-toggle-map',
        btnGroupNodes:        '#btn-group-nodes',
        btnUngroupNodes:      '#btn-ungroup-nodes',
        listItemAddSample:    '.add-sample-item',
        btnCloseRightPanel:   '#btn-close-right-panel',
        btnCoPlanProperties:  '#btn-co-plan-properties',
        btnCoPlanSave:        '#btn-co-plan-save',
        btnsDirection:        'div.menu-directions button',
        btnsColorSelection:   '.drop-down-color a.label',
        btnNodeColorSelection:'#btn-node-color-selection',
        btnsCrossFormPhasesCount: '.table-phases th.ph-th',
        btnSaveCrossroadData : '#btn-save-crossroad-data',
        btnCalc:             '#btn-calc'
    },
    actions: {
        init: function(){
            $.each(app.panels, function(i,v){app.panels[i] = $(v);});
            $.each(app.buttons, function(i,v){app.buttons[i] = $(v);});
            $.each(app.inputs, function(i,v){app.inputs[i] = $(v);});
            $.each(app.labels, function(i,v){app.labels[i] = $(v);});
            uievents.init();
            app.coordinationPlan = settings.coordinationPlan;
        },

        setCycleTime: function(Tc){
            app.cy.$('node')
                .data('cycleTime', Tc)
            ;
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
            var map = [];
            var edges = {};
            var elems = app.cy.edges();
            elems.forEach(function(v, i, a){
                if(! v.isEdge()){
                    return
                };
                if (! edges.hasOwnProperty(v.data('target'))) {
                    edges[v.data('target')] = [];
                };
                edges[v.data('target')].push(v.data());
            });

            elems = app.cy.nodes();
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

        showCrossroadModal: function(node){
            var stopLines = app.cy.$('node[parent="'+node.data('id')+'"][type="stopline"]');
            app.panels.crossRoadModal.data('id',node.data('id'));
            app.panels.tblPhasesBody.find('tr').remove();
            app.panels.tblPhasesBody.append(htmlTemplates.crossRoadTablePhaseRow(node.data('phases')));
            $.each(stopLines, function(i,v){
                app.panels.tblPhasesBody.append(htmlTemplates.crossRoadTableCheckRow(v.data()));
                app.panels.tblPhasesBody.find('input[type="checkbox"]').iCheck({
                    checkboxClass: 'icheckbox_minimal-blue'
                });
            });
            app.inputs.inputCrossroadName.val(node.data('name'));
            app.inputs.inputCrossroadOffset.slider('setAttribute', 'max', app.coordinationPlan.cycleTime - 1);
            app.inputs.inputCrossroadOffset.slider('setValue', node.data('offset'));
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
            app.inputs.inputsNodeProperty.each(function(i, v){
                var $v = $(v);
                var data = target.data($v.data('key'));
                if ($v.data('key') == 'intervals') {
                    data = JSON.stringify(data);
                }
                $v.val(data);
            });

            var color = target.data('color') == undefined ? 'btn-primary' : 'btn-' + target.data('color');
            app.buttons.btnNodeColorSelection.trigger('changeColor', [color]);

            if (target.data('type') == 'stopline'){
                app.panels.pointProperty.find('.is-stopLine').show();
                if (target.data('parent') == undefined) {
                    app.panels.pointProperty.find('.out-crossroad').show();
                    app.panels.pointProperty.find('.in-crossroad').hide();
                } else {
                    app.panels.pointProperty.find('.out-crossroad').hide();
                    app.panels.pointProperty.find('.in-crossroad').show();
                }
            } else {
                app.panels.pointProperty.find('.is-stopLine').hide();
            }

            if (target.data('type') == 'carriageway'){
                app.panels.pointProperty.find('.is-carriageway').show();
            } else {
                app.panels.pointProperty.find('.is-carriageway').hide();
            }
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
    };
    app.$cy.cytoscape(options);


});

