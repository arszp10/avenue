(function(app){
    app.Controls = {
        panels: {
            body:                   'body',
            cytoscape:              '#cy',
            leftPanel:              'div.left-panel',
            pointProperty:          '#panel-point-property',
            crossRoadModal:         '#crossroad-modal',
            coPlanModal:            '#co-plan-modal',
            tblPhasesBody:          '#crossroad-modal table.table-phases tbody',
            statusBar:              '#status-bar',
            nodeSearchResultlist:   '#node-search-result-list',
            nodeSearchInfo:         '#node-search-info'
        },
        labels: {
            labelMyAccountUsername: '#label-my-account-username'
        },
        inputs: {
            inputEdgeLabel:         '#input-edge-label',
            inputNodeType:          '#input-node-type',
            inputCrossroadOffset:   '#inputCrossroadOffset',
            inputCoPlanCycleTime:   '#inputCoPlanCycleTime',
            inputCoPlanName:        '#inputCoPlanName',
            inputCoPlanNotes:       '#inputCoPlanNotes',
            inputsNodeProperty:     'input.node-property',
            inputCrossroadName:     '#input-crossroad-name',
            inputNodeSearch:        '#input-node-search',
            inputNodeSearchForm:    '#input-node-search-form'
        },
        buttons: {
            btnPanMode:                 '#btn-now-pan-mode',
            btnSelectMode:              '#btn-now-select-mode',
            btnPointsSelect:            '#btn-points-select',
            btnAddStopline:             '#btn-add-stopline',
            btnAddCarriageway:          '#btn-add-carriageway',
            btnAddPoint:                '#btn-add-point',
            btnAddBottleneck:           '#btn-add-bottleneck',
            btnAddConcurrent:           '#btn-add-concurrent',
            btnAddConcurrentMerge:      '#btn-add-concurrent-merge',
            btnDeleteNode:              '#btn-delete-node',
            btnHorizontalAlign:         '#btn-horizontal-align',
            btnVerticalAlign:           '#btn-vertical-align',
            btnCut:                     '#btn-cut',
            btnCopy:                    '#btn-copy',
            btnPaste:                   '#btn-paste',
            btnShowNetwork:             '#btn-show-network',
            btnShowResults:             '#btn-show-results',
            btnShowRoutes:              '#btn-show-routes',
            btnToggleMap:               '#btn-toggle-map',
            btnGroupNodes:              '#btn-group-nodes',
            btnUngroupNodes:            '#btn-ungroup-nodes',
            btnCloseRightPanel:         '#btn-close-right-panel',
            btnCoPlanProperties:        '#btn-co-plan-properties',
            btnCoPlanSave:              '#btn-co-plan-save',
            btnsDirection:              'div.menu-directions button',
            btnsColorSelection:         '.drop-down-color a.label',
            btnNodeColorSelection:      '#btn-node-color-selection',
            btnsCrossFormPhasesCount:   '.table-phases th.ph-th',
            btnSaveCrossroadData :      '#btn-save-crossroad-data',
            btnCalc:                    '#btn-calc',
            btnsAddSampleItem:          '.add-sample-item',
            btnPointPropertyDone:       '#btn-point-property-done'
        }
    };
})(AvenueApp);

