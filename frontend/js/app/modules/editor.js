(function(App){
    var controls  = App.Controls;
    var templates = App.Templates;
    var settings  = App.Resources.Settings;
    var samples   = App.Resources.Samples;
    var cy, traffic, api, map, intersectionEditor,locale;
    var routes;
    var that;

   App.Modules.editor = {
        xC:0,
        yC:0,
        injectDependencies: function(modules) {
            cy        = modules.cytoscape;
            traffic   = modules.traffic;
            api       = modules.apiCalls;
            routes    = modules.routes;
            map       = modules.map;
            locale   = modules.locale;
            intersectionEditor = modules.intersectionEditor;
        },
        initModule: function(){
            that = this;
            this.initDocumentEvents();
            this.initLeftPanelEvents();
            this.initTopPanelEvents();
            this.initBottomPanelEvents();
            this.initRightPanelEvents();
            this.initWidgetsEvents();

        },

        initDocumentEvents: function(){
            //this.initCheckBoxes(controls.panels.body);
            controls.panels.body.on('mouseup', function(){
                that.toggleNodePopupPanel(false);
            });

            $(document).on('keyup', function(event){
                if (event.which == 46 || event.which == 8){
                    controls.buttons.btnDeleteNode.click();
                }

                if (event.which == 142 || event.which == 116){
                    controls.buttons.btnCalc.click();
                }
            });


            document.addEventListener('keydown', function (e){
                if (e.ctrlKey && e.which == '90') {
                    cy.undoRedo().undo();
                }
                else if (e.ctrlKey && e.which == '89') {
                    cy.undoRedo().redo();
                }
            }, true );

            $(document).on('keyup', 'input', function(e){ e.stopPropagation(); });

            $(document).bind('copy', function(){controls.buttons.btnCopy.click();});
            $(document).bind('paste', function(){controls.buttons.btnPaste.click();});
            $(document).bind('cut', function(){controls.buttons.btnCut.click();});

        },

        initLeftPanelEvents: function(){
            controls.buttons.btnPanMode.on('click', this.cySelectionMode);
            controls.buttons.btnSelectMode.on('click', this.cySelectionMode);

            controls.buttons.btnAddStopline.on('click', this.nodesAddMode);
            controls.buttons.btnAddCarriageway.on('click', this.nodesAddMode);
            controls.buttons.btnAddPoint.on('click', this.nodesAddMode);
            controls.buttons.btnAddBottleneck.on('click', this.nodesAddMode);
            controls.buttons.btnAddConcurrent.on('click', this.nodesAddMode);
            controls.buttons.btnAddConcurrentMerge.on('click', this.nodesAddMode);
            controls.buttons.btnAddPedestrian.on('click', this.nodesAddMode);

            controls.buttons.btnHorizontalAlign.click(function () { cy.aveAlignSelected('y'); });
            controls.buttons.btnVerticalAlign.click(function () { cy.aveAlignSelected('x'); });

            controls.buttons.btnDeleteNode.click(function () {
                //cy.$(':selected').remove();

                var selecteds = cy.$(":selected");
                cy.ur.do("deleteEles", selecteds);

                cy.trigger('unselect');
                that.toggleNodePopupPanel(false);
            });

            controls.buttons.btnGroupNodes.click(function () { cy.aveGroupNodes(); });
            controls.buttons.btnUngroupNodes.click(function () { cy.aveUngroupNodes() });

            controls.buttons.btnCut.click(function () {
                controls.buttons.btnCopy.click();
                controls.buttons.btnDeleteNode.click();
            });
            controls.buttons.btnCopy.click(function () {
                var result = cy.aveCopy();
                localStorage.clear();
                localStorage.setItem('copied-graph', result.data);
                localStorage.setItem('copied-ids', result.ids);
            });
            controls.buttons.btnPaste.click(function () {
                var ids = JSON.parse(localStorage.getItem('copied-ids'));
                var data = localStorage.getItem('copied-graph');
                cy.avePaste(ids, data);
            });

            controls.buttons.btnUndo.click(function () {
                cy.undoRedo().undo();
            });




            $(document).on('change', 'input.input-incoming-data', function(e){
                var edgeId = $(this).data('id');
                var field = $(this).data('field');
                var value = field !== 'portion'
                    ? parseInt($(this).val())|0
                    : that.parseIntOrPercent($(this).val());
                var cyEdge = cy.getElementById(edgeId);
                cyEdge.data(field, value);
                $(this).val(value);
            });


        },

        initTopPanelEvents: function(){

            try {
                var cookie = JSON.parse($.cookie('_avenue').substr(2));
            } catch (e) {
                window.location = '/sign-out';
                return;
            }
            controls.labels.labelMyAccountUsername.text(cookie.fullName);
            controls.inputs.inputApiKey.val(cookie.apiKey);
            controls.inputs.inputApiSecret.val(cookie.apiSecret);

            controls.buttons.btnsAddSampleItem.click(function(){
                cy.avePaste([], samples[$(this).data('key')]);
            });


            var prepareEditorViewBeforeCalc = function(){
                var $icon = controls.buttons.btnCalc.find('i.fa');
                $icon.addClass('fa-spin');
                cy.nodes().removeClass('has-error');
                cy.$(':selected').unselect();
                cy.trigger('unselect');
                return $icon;
            };

            controls.buttons.btnCalc.click(function () {
                var $icon = prepareEditorViewBeforeCalc();
                var data;
                var singleCrossroad;
                if (controls.panels.body.hasClass('show-crossroad')) {
                    controls.buttons.btnSaveCrossroadData.click();
                    data = cy.avePrepareCalcRequestSingleCrossroad(
                        intersectionEditor.getCrossroad().id
                    );
                    singleCrossroad = true;
                } else {
                    data = cy.avePrepareCalcRequest();
                    singleCrossroad = false;
                }

                api.modelExecute({data: data}, {
                    icon: $icon,
                    singleCrossroad: singleCrossroad
                });
            });

            controls.buttons.btnOffsetsOptimize.click(function () {
                var $icon = prepareEditorViewBeforeCalc();
                var data = cy.avePrepareCalcRequest();
                api.offsetsOptimize({data: data}, {
                    icon: $icon,
                    singleCrossroad: false
                });
            });

            controls.buttons.btnPhasesOptimize.click(function () {
                var $icon = prepareEditorViewBeforeCalc();
                var data = cy.avePrepareCalcRequest();
                api.phasesOptimize({data: data}, $icon);
            });


            controls.buttons.btnArcgisSetExtent.click(function () {
                var button = $(this);
                var icon = button.find('i');
                button.toggleClass('active');
                icon.toggleClass('fa-rotate-90');
                if (button.hasClass('active')){
                   cy.aveSetBaseExtent();
                    App.State.currentModel.anchored = true;
                } else {
                    App.State.currentModel.anchored = false;
                }

            });


            controls.buttons.btnArcgisSwitch.click(function () {
                var button = $(this);
                var icon = button.find('i.fa-ban');
                button.toggleClass('active');

                if (button.hasClass('active')){
                    icon.addClass('hidden');
                    controls.panels.cytoscape.addClass('screen-1');
                    controls.panels.mapBack.removeClass('visible-map');
                    App.State.currentModel.showMapInBackground = true;
                } else {
                    icon.removeClass('hidden');
                    controls.panels.cytoscape.removeClass('screen-1');
                    controls.panels.mapBack.addClass('visible-map');
                    App.State.currentModel.showMapInBackground = false;
                }
            });


            controls.buttons.btnModelDownload.click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                api.downloadModel(App.State.modelId);
            });

            controls.buttons.btnModelSave.click(function () {
                if (!$(this).is(':visible')) return;

                var $icon = $(this).find('i.fa');
                $icon.addClass('fa-spinner fa-spin');
                $icon.removeClass('fa-save');

                cy.aveSetBaseExtent();
                api.saveModel(App.State.modelId, {
                    data: {
                        content: cy.elements().jsons(),
                        name: App.State.currentModel.name,
                        routes: JSON.parse(JSON.stringify(App.State.currentModel.routes))||[],
                        notes: App.State.currentModel.notes,
                        nodeCount: cy.nodes().length,
                        crossCount: cy.$('[type="crossRoad"]').length,
                        cycleTime: App.State.currentModel.cycleTime,
                        position: cy.aveGetExtents(),
                        anchored: App.State.currentModel.anchored,
                        showMapInBackground: App.State.currentModel.showMapInBackground,
                        intertactOrder: App.State.currentModel.intertactOrder,
                        defaultIntensity: App.State.currentModel.defaultIntensity,
                        defaultCapacity: App.State.currentModel.defaultCapacity

                    }
                }, $icon);
            });

            controls.buttons.btnAddRoute.click(function () {
                controls.inputs.inputRouteName.val('');
            });

            controls.inputs.formCreateRoute.submit(function (e) {
                e.stopPropagation();
                e.preventDefault();

                var routeName = controls.inputs.inputRouteName.val();
                if (routeName.length  == 0) {
                    $.notify(
                        "Please enter a route name", { position: 'top right', className: "error" }
                    );
                    return;
                }
                var selected = cy.$('node[type="stopline"]:selected');
                if (!(selected.length == 2 || selected.length == 4)){
                    $.notify(
                        "The number of selected stop lines should be equal 2 or 4", { position: 'top right', className: "error" }
                    );
                    return;
                }
                var parents = selected.map(function(node){
                    return node.data('parent')
                });

                var unique = $.unique(parents);
                if (unique.length != 2) {
                    $.notify(
                        "The number of selected crossroads should be equal 2", { position: 'top right', className: "error" }
                    );
                    return;
                }

                var cyRoutesNodes = cy.aveBuildRoutes(selected);
                if (!cyRoutesNodes || cyRoutesNodes.length == 0) {
                    $.notify(
                        "Sorry, the route cannot be built",
                        { position: 'top right', className: "error" }
                    );
                    return false;
                }
                var forward = routes.filterNodes(cyRoutesNodes[0]);
                var back    = cyRoutesNodes.length > 1
                    ? routes.filterNodes(cyRoutesNodes[1])
                    : [];

                var route = routes.createRoute(routeName, back.length == 0)
                    .addPoints(forward)
                    .addLines(forward, 'forward')
                    .addLines(back , 'back')
                ;
                that.renderRoutesDropDown();
                console.log(route);
                routes.drawRoute(route);

                return false;
            });

            controls.buttons.btnDeleteRoute.click(function () {
                var inx = routes.getSelected();
                routes.deleteRoute(inx);
                that.renderRoutesDropDown();
            });

            controls.buttons.btnBackToModel.click(function(){
                controls.buttons.btnShowNetwork.click();
            });

            $(document).on('click', 'a.choose-route-link', function(){
               var inx = $(this).data('inx');
               var route = routes.getRoute(inx);
               var str1 = '#' + route.forward.join(', #');
               var str2 = route.back != undefined && route.back.length > 0 ? ', #'+route.back.join(', #') : '';
               cy.aveBuildRoutes(cy.$(str1 + str2));
               routes.drawRoute(route);
               routes.selectRoute(inx);
            });



        },

        initBottomPanelEvents: function(){
            controls.buttons.btnShowNetwork.on('click', function(){
                that.bottomTabSwitch.call(this);
            });

            controls.buttons.btnShowCrossroad.on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
            });

            controls.buttons.btnShowMap.on('click', function(){
                that.bottomTabSwitch.call(this);
                map.showWidgets();
            });

            controls.buttons.btnShowRoutes.on('click', function(){
                that.bottomTabSwitch.call(this);
                var inx = routes.getSelected();
                if (inx === false) {
                    return;
                }
                var route = routes.getRoute(inx);
                routes.drawRoute(route);
            });
        },

        initRightPanelEvents: function(){
            $(document).on('click', 'button.btn-stop-line, button.btn-edit-node', function(e){
                var nodeId = $(this).closest('tr').data('id');
                var target = cy.getElementById(nodeId);
                that.showNodePopup(target, e.clientX, e.clientY);
            });

            $(document).on('click', 'button.btn-edit-cross-road', function(e){
                var nodeId = $(this).closest('tr').data('id');
                var target = cy.getElementById(nodeId).data();
                intersectionEditor.showCrossroadModal(target);
            });

            $(document).on('click', 'button.btn-pan-tonode', function(e){
                var nodeId = $(this).closest('tr').data('id');
                var el = cy.getElementById(nodeId);
                cy.fit(el, 250);
                el.select();
            });

            $(document).on('click', '.node-list-item', function(event){
                that.showSideNodeInfo(cy.getElementById(
                    $(this).data('id')).data()
                );
            });

            controls.buttons.btnCloseRightPanel.click(function () {
                controls.panels.body.toggleClass('show-right-panel');
                controls.inputs.inputNodeSearch.val('');
            });

            controls.buttons.btnExpandRightPanel.click(function () {
                controls.panels.body.removeClass('collapse-right-panel');
                controls.panels.body.addClass('show-right-panel');
            });

            controls.buttons.btnCollapseRightPanel.click(function () {
                controls.panels.body.addClass('collapse-right-panel');
            });


            controls.inputs.inputNodeSearchForm.submit(function (e) {
                var text = controls.inputs.inputNodeSearch.val();
                var limit = 20;
                var foundNodes = text.length == 0
                    ? cy.elements('node').jsons().slice(0, limit)
                    : cy.$("node[tag *= '" + text + "'], node[name *= '" + text + "']").jsons().slice(0, limit);
                controls.panels.nodeSearchResultlist.empty();
                controls.panels.nodeSearchInfo.empty();
                controls.panels.body.addClass('show-right-panel');
                if (foundNodes.length > 0) {
                    $.each(foundNodes, function (inx, node) {
                        if (node.data.hasOwnProperty('parent') && node.data.type !== 'crossRoad') {
                            node.data.name = cy.$('#' + node.data.parent).data('name');
                        }
                        controls.panels.nodeSearchResultlist.append(
                            templates.nodeSearchListItem(node.data)
                        );
                    });
                } else {
                    controls.panels.nodeSearchResultlist.append(
                        templates.nodeSearchListNotFound(text)
                    );
                }
                return false;
            });

            $(document).on('submit', 'form#form-update-common-props', function(e){
                e.stopPropagation();
                e.preventDefault();
                $('.input-multi-edit').each(function(i, obj){
                    var $th = $(obj);
                    var val = parseInt($th.val()) | 0;
                        if (val != 0) {
                        $.each(cy.$('node:selected'), function (inx, node) {
                            if (node.data['type'] == 'crossRoad') { return; }
                            node.data($th.data('key'), val);
                        });
                    }
                });
                cy.$(':selected').unselect();
                cy.trigger('unselect');
                return false
            });

        },

        initWidgetsEvents: function() {
            /**
             *  Edge input events
             */
            controls.inputs.inputEdgeLabel.blur(function () {
                controls.panels.body.removeClass('show-edge-input');
            });
            controls.inputs.inputEdgeLabel.change(function () {
                var id = $(this).data('edge');
                var value = that.parseIntOrPercent($(this).val());
                var edge = cy.getElementById(id);
                edge.data('portion', value);

                var target = edge.target();
                var source = edge.source();
                var concurrent = target.data('type') == 'concurrent'
                    ? target : source ;

                if (target.data('type') == 'concurrent' || source.data('type') == 'concurrent') {
                    var isSecondary = !!edge.data('secondary');
                    var filter = isSecondary
                        ? 'edge[secondary]'
                        : 'edge[^secondary]';
                    concurrent.neighborhood(filter).forEach(function(ed){
                        ed.data('portion', value);
                    });
                }
            });


            controls.inputs.inputEdgeLabel.on('keyup', function (event) {
                if (event.which == 13 || event.which == 27) {
                    controls.inputs.inputEdgeLabel.blur();
                }
            });


            /**
             *  Node popup properies block related events
             */
            controls.panels.pointProperty.mouseup(function(e){ e.stopPropagation(); });
            controls.inputs.inputsNodeProperty.on('change', function () {
                var th = $(this);
                var id = controls.panels.pointProperty.data('node');
                var val = th.val();
                if (th.data('key') == 'intervals') { val = JSON.parse(val); }
                cy.getElementById(id).data(th.data('key'), val);
            });
            controls.buttons.btnsDirection.on('click', function () {
                var id = controls.panels.pointProperty.data('node');
                var icon = window.getComputedStyle($('i', this)[0], ':before').getPropertyValue('content');
                cy.getElementById(id).data('icon', icon.substring(1, 2));
            });
            controls.buttons.btnNodeColorSelection.on('changeColor', function (e, color) {
                $(this)
                    .removeClass('btn-default btn-primary btn-info btn-success btn-danger btn-warning')
                    .addClass(color);
            });
            controls.buttons.btnsColorSelection.on('click', function () {
                var id = controls.panels.pointProperty.data('node');
                var color = $(this).data('color');
                cy.getElementById(id).data('color', color);
                controls.buttons.btnNodeColorSelection.trigger('changeColor', ['btn-' + color]);

            });
            controls.buttons.btnPointPropertyDone.click(function(){
                that.toggleNodePopupPanel(false);
            });

            controls.buttons.btnSumIncomingFlow.click(function(e){
                e.preventDefault();
                e.stopPropagation();
                var id = controls.panels.pointProperty.data('node');
                var sum = 0;
                var incomers = cy.getElementById(id).incomers('edge');
                incomers.forEach(function(ele){
                    var p = ele.data('portion') + '';
                    var lastChar = p.slice(-1);
                    var val = lastChar === '%'
                        ? Math.round(ele.source().data('avgIntensity') * parseInt(p) / 100)
                        : parseInt(p)|0;
                    sum +=val;
                });
                if (incomers.length > 0) {
                    controls.inputs.inputNodeIntensity.val(sum).trigger('change');
                }
            });


            /**
             *  Coordination plan modal events
             */
            controls.buttons.btnCoPlanProperties.click(function () {
                var cp = App.State.currentModel;
                controls.inputs.inputCoPlanCycleTime.val(cp.cycleTime);
                controls.inputs.inputCoPlanName.val(cp.name);
                controls.inputs.inputCoPlanNotes.val(cp.notes);
                controls.inputs.inputCoIntertactOrder.val(cp.intertactOrder);
                controls.inputs.inputCoNodeDefaultIntensity.val(cp.defaultIntensity);
                controls.inputs.inputCoNodeDefaultCapacity.val(cp.defaultCapacity);
                controls.panels.coPlanModal.modal('show');
            });
            controls.buttons.btnCoPlanSave.click(function () {
                App.State.currentModel.cycleTime = controls.inputs.inputCoPlanCycleTime.val();
                App.State.currentModel.name = controls.inputs.inputCoPlanName.val();
                App.State.currentModel.notes = controls.inputs.inputCoPlanNotes.val();

                App.State.currentModel.intertactOrder = controls.inputs.inputCoIntertactOrder.val();
                App.State.currentModel.defaultIntensity = controls.inputs.inputCoNodeDefaultIntensity.val();
                App.State.currentModel.defaultCapacity = controls.inputs.inputCoNodeDefaultCapacity.val();

                cy.aveSetCycleTime(App.State.currentModel.cycleTime);
                controls.panels.coPlanModal.modal('hide');
                controls.buttons.btnModelSave.click();
            });

        },
       

        parseIntOrPercent: function(value){
            var lastChar = value.slice(-1);
            if (lastChar === '%') {
                value = value.substring(0, value.length - 1);
            }
            value = parseInt(value);
            value = isNaN(value) ? 0 : value;

            if (lastChar === '%') {
                if (value > 100) {
                    value = 100;
                }
                value = value + '%';
            }
            return value;
        },

        toggleNodePopupPanel: function(show){
            controls.panels.body.toggleClass('show-panel-point-property', show);
        },

        renderRoutesDropDown: function(){
            var routes = App.State.currentModel.routes;
            if (routes.length == 0) {
                controls.panels.routesDropDownButton.addClass('hidden');
            } else {
                controls.panels.routesDropDownButton.removeClass('hidden');
                controls.panels.routesDropDownList.html(
                    templates.routesDropDouwnList(routes)
                );
            }
        },
        flattenErrors: function(errors){
            var err = errors.map(function(val){
                return val. errors;
            });
            var flattern = [].concat.apply([], err);
            return flattern;
        },
        showNodePopup: function(target, x, y){
            var node = target.data();
            this.toggleNodePopupPanel();
            controls.panels.pointProperty.css(
                {
                    top: y + 10,
                    left: x - 145
                }).data("node", node.id);
            controls.inputs.inputNodeType.text(node.type);
            controls.inputs.inputsNodeProperty.each(function(i, v){
                var $v = $(v);
                var data = node[$v.data('key')];
                if ($v.data('key') == 'intervals') {
                    data = JSON.stringify(data);
                }
                $v.val(data);
            });
            var edgesTarget = target
                .connectedEdges('[target="' + node.id + '"]')
                .filter(function(edge){
                    return !edge.hasClass('carriageway-edge');
                });
            controls.labels.labelIncomingEdgesCount.text(edgesTarget.length);
            controls.panels.rowWithBtnIncomingData.toggle(edgesTarget.length > 0);

            var incomers = cy.getElementById(node.id).incomers('node');
            var sources = {};
            $.each(incomers, function(inx, node){
                var data = node.data();
                sources[data.id] = data;
            });

            if (edgesTarget.length > 0) {
                controls.panels.incomingFlowDataTable.html(
                    templates.incomingEdgesDataTable(edgesTarget.jsons(), sources)
                );
            }

            var color = node.color == undefined ? 'btn-primary' : 'btn-' + node.color;
            controls.buttons.btnNodeColorSelection.trigger('changeColor', [color]);

            if (node.type == 'stopline' ||  node.type == 'pedestrian'){
                controls.panels.pointProperty.find('.is-stopLine').show();
                if (node.parent == undefined) {
                    controls.panels.pointProperty.find('.out-crossroad').show();
                    controls.panels.pointProperty.find('.in-crossroad').hide();
                } else {
                    controls.panels.pointProperty.find('.out-crossroad').hide();
                    controls.panels.pointProperty.find('.in-crossroad').show();
                }
            } else {
                controls.panels.pointProperty.find('.is-stopLine').hide();
            }

            if (node.type == 'pedestrian'){
                controls.panels.pointProperty.find('.direction-icon-row').hide();
            }
            if (node.type == 'stopline'){
                controls.panels.pointProperty.find('.direction-icon-row').show();
            }

            if (node.type == 'carriageway'){
                controls.panels.pointProperty.find('.is-carriageway').show();
            } else {
                controls.panels.pointProperty.find('.is-carriageway').hide();
            }

            if (node.type == 'concurrent' ||node.type == 'concurrentMerge'){
                controls.panels.pointProperty.find('.is-concurrent').show();
            } else {
                controls.panels.pointProperty.find('.is-concurrent').hide();
            }

            var localeKey = node.type == 'pedestrian' ? 'p_h' : 'v_h';
            controls.panels.pointProperty.find('span[locale="v_h"]').text(locale.localize(localeKey));

            if (node.type == 'concurrent'){
                var hasPedestrian = target.connectedEdges('[pedestrian]').length > 0;
                if (hasPedestrian) {
                    controls.panels.pointProperty.find('span[locale="v_h"].primary').text(locale.localize('p_h'));
                }
            }

        },

        showSideMultiNodeEditor: function(totalSelected){
            controls.panels.nodeSearchResultlist.empty();
            controls.panels.nodeSearchInfo.empty();
            controls.panels.body.addClass('show-right-panel');
            controls.panels.nodeSearchInfo.append(
                templates.multiNodeEditForm(totalSelected)
            );
        },
        showSideNodeInfo: function(node) {
            controls.panels.nodeSearchResultlist.empty();
            controls.panels.nodeSearchInfo.empty();
            controls.panels.body.addClass('show-right-panel');

            if (node.hasOwnProperty('parent') && node.type !== 'crossRoad') {
                node.name =  cy.getElementById(node.parent).data('name');
            }
            node.constantIntensity =  cy.aveConstantIntensity(node);
            //controls.panels.nodeSearchResultlist.append(
            //    templates.nodeSearchListItem(node, 'single')
            //);

            if (node.type == 'crossRoad') {
                controls.panels.nodeSearchInfo.append(
                    templates.nodeCrossRoadProps(node)
                );
            } else {
                controls.panels.nodeSearchInfo.append(
                    templates.nodeCommonProps(node)
                );
                //controls.panels.nodeSearchInfo.append(
                //    templates.locateEditButtons(node)
                //);
            }

            var errors = App.State.lastErrors.filter(function(val){
                return val.node ==  node.id;
            });

            if (errors.length > 0) {
                controls.panels.nodeSearchInfo.append(
                    templates.validationErrors(this.flattenErrors(errors))
                );
            }

            if (node.type == 'crossRoad' && errors.length == 0) {
                var stopLines = cy.aveGetCrossroadStoplines(node.id);
                stopLines.sort(intersectionEditor.stopLineSort);
                var intertactOrder = App.State.currentModel.intertactOrder;
                var program = node.programs[node.currentProgram];
                var order = program.phasesOrders[program.currentOrder];
                var rows = templates.crossRoadPropsDiagramRow({
                    cycleTime: program.cycleTime,
                    signals: traffic.signalDiagramPhases(node, program, undefined)
                });
                $.each(stopLines, function(i, stopline){
                    rows += templates.crossRoadPropsDiagramRow({
                        cycleTime: program.cycleTime,
                        signals: traffic.signalDiagramData1(intertactOrder, node, program, stopline.data, undefined, true)
                    });
                });
                controls.panels.nodeSearchInfo.append(templates.crossRoadPropsSignalBars(rows));

                controls.panels.nodeSearchInfo.append(
                    templates.locateEditButtons(node)
                );
                return;
            }

            var results = App.State.lastModelingResult.filter(function(val){
                return val.id == node.id;
            });

            if (results.length == 0) {
                return;
            }

            controls.panels.nodeSearchInfo.append(
                templates.nodeModelingResults(results[0])
            );

            controls.panels.nodeSearchInfo.append(templates.chartPanel());

            var ctx = document.getElementById("chart-panel").getContext("2d");
            var datasets = [];

            if (node.type == 'stopline') {
                datasets.push(settings.chart.queueFunc(results[0].queueFunc));
            }
            datasets.push(settings.chart.flowIn(results[0].inFlow));
            datasets.push(settings.chart.flowOut(results[0].outFlow));

            if (node.type == 'bottleneck') {
                cy.getElementById(node.id).incomers('node').map(function(carriageway, index){
                    var results1 = App.State.lastModelingResult.filter(function(val){
                        var cwbId = node.id + '_cwb_' + index;
                        return val.id == cwbId;
                    });
                    if (results1.length > 0) {
                        datasets.push(settings.chart.flowInColorIndex(results1[0].outFlow, index));
                    }
                    return ;
                });
            }

            var data = {
                labels: settings.chart.labels(node.cycleTime),
                datasets: datasets
            };
            var myLineChart = new Chart(ctx).Line(data, settings.chart.common);

            if ((node.type == 'stopline'|| node.type == 'pedestrian' || node.type == 'bottleneck') && node.hasOwnProperty('parent')){

                var crossroad = cy.getElementById(node.parent).data();
                var program = crossroad.programs[crossroad.currentProgram];
                var intertactOrder = App.State.currentModel.intertactOrder;
                var stopline = node;
                controls.panels.nodeSearchInfo.append(
                    templates.signalBar({
                        cycleTime: node.cycleTime,
                        signals:
                            node.type !== 'bottleneck'
                                ? traffic.signalDiagramData1(intertactOrder, crossroad, program, stopline)
                                : traffic.signalDiagramDataPhasesOnly(crossroad)
                    })
                );
            }
        },
        nodesAddMode: function(){
            var $this = $(this);
            $this.closest('.btn-group').find('.active').removeClass("active");
            $this.closest('ul').find('li.active').removeClass("active");
            $this.parent().addClass("active");
            var btn = $this.closest('ul').prev();
            btn.addClass("active");

            btn.find('i')
                .removeClass('av-node av-traffic-light av-road-1 av-bottleneck-sign-3 av-shuffle av-join fa-fw av-pedestrian')
                .addClass($this.find('i').attr('class'));
            App.State.nodeType = $this.data('type');
            App.State.clickMode = String($this.attr('id')).substring(8);
        },

        cySelectionMode:function(){
            var $this = $(this);
            $this.closest('.btn-group').find('.active').removeClass("active");
            $this.addClass("active");
            if ($this.attr('id') == controls.buttons.btnSelectMode.attr('id')) {
                cy.boxSelectionEnabled(true);
                cy.userPanningEnabled(false);
            }
            if ($this.attr('id') == controls.buttons.btnPanMode.attr('id')) {
                cy.boxSelectionEnabled(false);
                cy.userPanningEnabled(true);
            }
            App.State.clickMode = String($this.attr('id')).substring(8);
        },

        bottomTabSwitch: function(tabLink){

            var tab = tabLink !== undefined ? tabLink : $(this);
            tab.parent().siblings().removeClass('active');
            tab.parent().addClass('active');

            var isCrossroadTab = controls.buttons.btnShowCrossroad == tab;
            controls.buttons.btnShowCrossroad.parent().toggleClass('hidden', !isCrossroadTab);

            controls.panels.body
                .removeClass('show-files show-network show-routes show-results show-source show-map show-crossroad')
                .addClass(tab.data('rel'));

            window.dispatchEvent(new Event('resize'));
            map.hideWidgets();
            //условно!!! добавить условие не забыть
            cy.trigger('viewport');
        }
    }

})(AvenueApp);
