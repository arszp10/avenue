(function(app){
    app.Controls = {
        panels: {
            body:                   'body',
            cytoscape:              '#cy',
            leftPanel:              'div.left-panel',
            pointProperty:          '#panel-point-property',
            addGreenProperty:        '#add-green-property',
            crossRoadModal:         '#crossroad-modal',
            coPlanModal:            '#co-plan-modal',
            tblPhasesBody:          '#crossroad-modal table.table-phases tbody',
            statusBar:              '#status-bar',
            nodeSearchResultlist:   '#node-search-result-list',
            nodeSearchInfo:         '#node-search-info',
            welcomePanel:           '#welcome-panel',
            modelListPanel:         '#model-list-panel',
            modelListTable:         '#model-list-result > tbody',
            modelPagesStat:         '#model-pages-stat',
            routesDropDownButton:   '#routes-list-button-panel',
            routesDropDownList:     '#routes-dropdown-list'
        },
        labels: {
            labelMyAccountUsername: '#label-my-account-username',
            labelWelcomeUsername:   '#label-welcome-username',
            labelModelPagesStart:   '#label-model-pages-start',
            labelModelPagesFinish:   '#label-model-pages-finish',
            labelModelPagesTotal:   '#label-model-pages-total',
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
            inputNodeSearchForm:    '#input-node-search-form',
            inputModelSearch:        '#input-model-search',
            inputModelSearchForm:    '#input-model-search-form',
            inputRouteName:          '#input-route-name'
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
            btnModelSave:               '#btn-model-save',
            btnCalc:                    '#btn-calc',
            btnOffsetsOptimize:         '#btn-offsets-optimize',
            btnPhasesOptimize:         '#btn-phases-optimize',
            btnsAddSampleItem:          '.add-sample-item',
            btnPointPropertyDone:       '#btn-point-property-done',
            btnAddGreenDone:            '#btn-add-green-done',
            btnCreateNewModel:          '.btn-create-new-model',
            btnModelOrderDown:          '#btn-model-order-down',
            btnModelOrderUp:            '#btn-model-order-up',
            btnsModelOrder:             '.btn-model-order',
            btnModePagePrev:            '#btn-model-page-prev',
            btnModePageNext:            '#btn-model-page-next',
            btnAddRoute:                '#btn-add-route',
            btnCreateRoute:             '#btn-create-route',
            btnDeleteRoute:             '#btn-delete-route'
        }
    };
})(AvenueApp);

