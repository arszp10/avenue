(function(app){
    app.Controls = {
        panels: {
            body:                   'body',
            cytoscape:              '#cy',
            mapBack:                '#mapBack',
            leftPanel:              'div.left-panel',
            pointProperty:          '#panel-point-property',
            addGreenProperty:       '#add-green-property',
            crossRoadPanel:         '#crossroad-panel',
            coPlanModal:            '#co-plan-modal',
            cycleGraphModal :       '#cycle-graph-modal',
            cycleGraphSvg:          "#cycle-diagram-svg",
            cycleDiagramLoader:     '#cycle-diagram-loader',
            cycleDiagramLegend:     '#cycle-diagram-legend',
            incomingFlowDataTable:  '#incoming-flow-data-table tbody',
            rowWithBtnIncomingData: '#row-with-btn-incoming-data',
            tblPhasesBody:          '#crossroad-panel #table-phases tbody',
            tblDiagramsBody:        '#crossroad-panel #crossroad-table-diagrams tbody',
            tblDiagrams:            '#crossroad-table-diagrams',
            statusBar:              '#status-bar',
            nodeSearchResultlist:   '#node-search-result-list',
            nodeSearchInfo:         '#node-search-info',
            welcomePanel:           '#welcome-panel',
            modelListPanel:         '#model-list-panel',
            modelListTable:         '#model-list-result > tbody',
            modelPagesStat:         '#model-pages-stat',
            routesDropDownButton:   '#routes-list-button-panel',
            routesDropDownList:     '#routes-dropdown-list',
            importModal:            '#import-modal',
            cyCrossroadCopy:        '#cy-crossroad-copy',
            crossRoadDelayBar:      '#crossRoadDelayBar'
        },
        labels: {
            labelMyAccountUsername: '#label-my-account-username',
            labelWelcomeUsername:   '#label-welcome-username',
            labelModelPagesStart:   '#label-model-pages-start',
            labelModelPagesFinish:   '#label-model-pages-finish',
            labelModelPagesTotal:   '#label-model-pages-total',
            labelIncomingEdgesCount: '#label-incoming-edges-count'
        },
        inputs: {
            inputEdgeLabel:         '#input-edge-label',
            inputNodeType:          '#input-node-type',
            inputCrossroadOffset:   '#inputCrossroadOffset',
            inputCrossroadWidth:    '#inputCrossroadWidth',
            inputCrossroadHeight:   '#inputCrossroadHeight',
            inputCrossroadVehicleSpeed:'#inputCrossroadVehicleSpeed',
            inputCrossroadPedestrianSpeed:'#inputCrossroadPedestrianSpeed',
            inputCoPlanCycleTime:   '#inputCoPlanCycleTime',
            inputCoPlanName:        '#inputCoPlanName',
            inputCoIntertactOrder:  '#inputCoIntertactOrder',
            inputCoNodeDefaultIntensity:  '#inputCoNodeDefaultIntensity',
            inputCoNodeDefaultCapacity:  '#inputCoNodeDefaultCapacity',

            inputCoPlanNotes:       '#inputCoPlanNotes',
            inputsNodeProperty:     'input.node-property',
            inputCrossroadName:     '#input-crossroad-name',
            inputNodeSearch:        '#input-node-search',
            inputNodeSearchForm:    '#input-node-search-form',
            inputModelSearch:       '#input-model-search',
            inputModelSearchForm:   '#input-model-search-form',
            inputRouteName:         '#input-route-name',
            inputAddGreen:          '#input-add-green',
            inputApiKey:            '#input-api-key',
            inputApiSecret:         '#input-api-secret',
            formCreateRoute:        '#form-create-route',
            formImportFile:         '#import-file-form',
            formCreatePhaseOrder:   '#formCreatePhaseOrder',
            formCreateProgram:      '#formCreateProgram',
            formUpdateProgram:      '#formUpdateProgram',
            inputPhaseOrderName:    '#inputPhaseOrderName',
            inputPhaseOrderOrder:   '#inputPhaseOrderOrder',
            inputImportFile:        '#inputImportFile',
            inputImportModelType:   '#inputImportModelType',
            inputZoomIntersection:  '#inputZoomIntersection',
            inputZoomMap:           '#inputZoomMap',
            inputArcgisScale:       '#input-arcgis-scale',
            inputCrossroadProgram:  '#inputCrossroadProgram',
            inputCrossroadPhasesOrder: '#inputCrossroadPhasesOrder',
            inputCrossroadCycleLength: '#inputCrossroadCycleLength',
            inputCrossroadOffsetText: '#inputCrossroadOffsetText',
            inputProgramName:       '#inputProgramName',
            inputUpdateProgramName: '#inputUpdateProgramName',
            inputCrossroadOptiOff:  '#inputCrossroadOptiOff',
            inputNodeIntensity: '#input-node-intensity',
            inputCycleNumberDraw: '#input-cycle-number-draw'

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
            btnAddPedestrian:           '#btn-add-pedestrian',
            btnDeleteNode:              '#btn-delete-node',
            btnHorizontalAlign:         '#btn-horizontal-align',
            btnVerticalAlign:           '#btn-vertical-align',
            btnCut:                     '#btn-cut',
            btnCopy:                    '#btn-copy',
            btnPaste:                   '#btn-paste',
            btnUndo:                    '#btn-undo',
            btnShowNetwork:             '#btn-show-network',
            btnShowResults:             '#btn-show-results',
            btnShowRoutes:              '#btn-show-routes',
            btnShowCrossroad:           '#btn-show-crossroad',
            btnShowMap:                 '#btn-show-map',
            btnToggleMap:               '#btn-toggle-map',
            btnGroupNodes:              '#btn-group-nodes',
            btnUngroupNodes:            '#btn-ungroup-nodes',
            btnCloseRightPanel:         '#btn-close-right-panel',
            btnExpandRightPanel:        '#btn-expand-right-panel',
            btnCollapseRightPanel:      '#btn-collapse-right-panel',
            btnCoPlanProperties:        '#btn-co-plan-properties',
            btnCoPlanSave:              '#btn-co-plan-save',
            btnsDirection:              'div.menu-directions button',
            btnsColorSelection:         '.drop-down-color a.label',
            btnNodeColorSelection:      '#btn-node-color-selection',
            btnsCrossFormPhasesCount:   '.table-phases th.ph-th',
            btnSaveCrossroadData :      '#btn-save-crossroad-data',
            btnModelSave:               '#btn-model-save',
            btnModelDownload:           '#btn-model-download',
            btnCalc:                    '#btn-calc',
            btnOffsetsOptimize:         '#btn-offsets-optimize',
            btnSaturationDraw:          '#btn-saturation-draw',
            btnPhasesOptimize:          '#btn-phases-optimize',
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
            btnDeleteRoute:             '#btn-delete-route',
            btnBackToModel:             '#btn-back-to-model',
            btnGoImportModel:           '#btn-go-import-model',
            btnArcgisSetExtent:         '#btn-arcgis-set-extent',
            btnArcgisSwitch:            '#btn-arcgis-switch',
            btnShowVehicleTraces:       '#btn-show-vehicle-traces',
            btnShowVehicleTracesForward:'#btn-show-vehicle-traces-forward',
            btnShowVehicleTracesBack:   '#btn-show-vehicle-traces-back',
            btnRemovePhasesOrder:       '#btnRemovePhasesOrder',
            btnCreatePhaseOrder:        '#btnCreatePhaseOrder',
            btnCreateProgram:           '#btnCreateProgram',
            btnRemoveProgram:           '#btnRemoveProgram',
            btnEditProgram:             '#btnEditProgram',
            btnPlusZoomRoute:           '#btnPlusZoomRoute',
            btnMinusZoomRoute:          '#btnMinusZoomRoute',
            btnSsaveCrossroadData:      '#btnSsaveCrossroadData',
            btnCycleAndPhaseRate:       '#btn-cycle-and-phase-rate',
            btnCycleLenghtRecalc:       '#btn-cycle-lenght-recalc',
            btnCycleLenghtApply:        '#btn-cycle-lenght-apply',
            btnShowIncomingData:        '#btn-show-incoming-data',
            btnRecalcEdgesLengths:      '#btnRecalcEdgesLengths',
            btnSumIncomingFlow:         '#btn-sum-incoming-flow'
        }
    };
})(AvenueApp);

