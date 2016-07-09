(function(App){
    var controls  = App.Controls;
    var templates = App.Templates;
    var settings  = App.Resources.Settings;
    var samples   = App.Resources.Samples;
    var cy, traffic, api;
    var routes;
    var that;


   App.Modules.editor = {
        injectDependencies: function(modules) {
            cy        = modules.cytoscape;
            traffic   = modules.traffic;
            api       = modules.apiCalls;
            routes    = modules.routes;
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
            this.initCheckBoxes(controls.panels.body);
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

            controls.buttons.btnHorizontalAlign.click(function () { cy.aveAlignSelected('y'); });
            controls.buttons.btnVerticalAlign.click(function () { cy.aveAlignSelected('x'); });

            controls.buttons.btnDeleteNode.click(function () {
                cy.$(':selected').remove();
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

        },

        initTopPanelEvents: function(){
            var cookie = JSON.parse($.cookie('_avenue').substr(2));
            controls.labels.labelMyAccountUsername.text(cookie.fullName);

            controls.buttons.btnsAddSampleItem.click(function(){
                cy.avePaste([], samples[$(this).data('key')]);
            });

            controls.buttons.btnCalc.click(function () {
                var data = cy.avePrepareCalcRequest();
                var $icon = $(this).find('i.fa');
                    $icon.addClass('fa-spin');
                cy.nodes().removeClass('has-error');
                api.modelExecute({data: data}, $icon);
            });

            controls.buttons.btnOffsetsOptimize.click(function () {
                var data = cy.avePrepareCalcRequest();
                var $icon = controls.buttons.btnCalc.find('i.fa');
                $icon.addClass('fa-spin');
                cy.nodes().removeClass('has-error');
                api.offsetsOptimize({data: data}, $icon);
            });

            controls.buttons.btnPhasesOptimize.click(function () {
                var data = cy.avePrepareCalcRequest();
                var $icon = controls.buttons.btnCalc.find('i.fa');
                $icon.addClass('fa-spin');
                cy.nodes().removeClass('has-error');
                api.phasesOptimize({data: data}, $icon);
            });


            controls.buttons.btnModelSave.click(function () {
                var $icon = $(this).find('i.fa');
                $icon.addClass('fa-spinner fa-spin');
                $icon.removeClass('fa-save');
                api.saveModel(App.State.modelId, {
                    data: {
                        content: cy.elements().jsons(),
                        name: App.State.currentModel.name,
                        routes: JSON.parse(JSON.stringify(App.State.currentModel.routes))||[],
                        notes: App.State.currentModel.notes,
                        nodeCount: cy.nodes().length,
                        crossCount: cy.$('[type="crossRoad"]').length,
                        cycleTime: App.State.currentModel.cycleTime
                    }
                }, $icon);
            });


            controls.buttons.btnAddRoute.click(function () {
                controls.inputs.inputRouteName.val('');
            });

            controls.buttons.btnCreateRoute.click(function () {
                var routeName = controls.inputs.inputRouteName.val();
                if (routeName.length  == 0) {
                    $.notify(
                        "Please enter a route name",
                        { position: 'top center', className: "error" }
                    );
                    return;
                }
                var selected = cy.$('node[type="stopline"]:selected');
                if (!(selected.length == 2 || selected.length == 4)){
                    $.notify(
                        "The number of selected stop lines should be equal 2 or 4",
                        { position: 'top center', className: "error" }
                    );
                    return;
                }
                var parents = selected.map(function(node){
                    return node.data('parent')
                });

                var unique = $.unique(parents);
                if (unique.length != 2) {
                    $.notify(
                        "The number of selected crossroads should be equal 2",
                        { position: 'top center', className: "error" }
                    );
                    return;
                }

                var cyRoutesNodes = cy.aveBuildRoutes(selected);
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
                routes.drawRoute(route);
            });


            $(document).on('click', 'a.choose-route-link', function(){
               var inx = $(this).data('inx');
               var route = routes.getRoute(inx);
               var str1 = '#' + route.forward.join(', #');
               var str2 = route.back != undefined && route.back.length > 0 ? ', #'+route.back.join(', #') : '';
               cy.aveBuildRoutes(cy.$(str1 + str2));
               routes.drawRoute(route);
            });

        },

        initBottomPanelEvents: function(){
            controls.buttons.btnShowNetwork.on('click', that.bottomTabSwitch);
            controls.buttons.btnShowResults.on('click', that.bottomTabSwitch);
            controls.buttons.btnShowRoutes.on('click', that.bottomTabSwitch);
        },

        initRightPanelEvents: function(){
            $(document).on('click', 'button.btn-stop-line, button.btn-edit-node', function(e){
                var nodeId = $(this).closest('tr').data('id');
                var target = cy.getElementById(nodeId).data();
                that.showNodePopup(target, e.clientX, e.clientY);
            });

            $(document).on('click', 'button.btn-edit-cross-road', function(e){
                var nodeId = $(this).closest('tr').data('id');
                var target = cy.getElementById(nodeId).data();
                that.showCrossroadModal(target);
            });

            $(document).on('click', 'button.btn-pan-tonode', function(e){
                var nodeId = $(this).closest('tr').data('id');
                var el = cy.getElementById(nodeId);
                cy.fit(el, 250);
                el.select();
            });

            $(document).on('click', '.node-list-item', function(event){
                that.showSideNodeInfo(cy.getElementById($(this).data('id')).data());
            });

            controls.buttons.btnCloseRightPanel.click(function () {
                controls.panels.body.toggleClass('show-right-panel');
                controls.inputs.inputNodeSearch.val('');
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
                cy.getElementById(id).data('portion', parseInt($(this).val()))
            });
            controls.inputs.inputEdgeLabel.on('keyup', function (event) {
                if (event.which == 13) {
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

            /**
             *  Coordination plan modal events
             */
            controls.buttons.btnCoPlanProperties.click(function () {
                var cp = App.State.currentModel;
                controls.inputs.inputCoPlanCycleTime.val(cp.cycleTime);
                controls.inputs.inputCoPlanName.val(cp.name);
                controls.inputs.inputCoPlanNotes.val(cp.notes);
                controls.panels.coPlanModal.modal('show');
            });
            controls.buttons.btnCoPlanSave.click(function () {
                App.State.currentModel.cycleTime = controls.inputs.inputCoPlanCycleTime.val();
                App.State.currentModel.name = controls.inputs.inputCoPlanName.val();
                App.State.currentModel.notes = controls.inputs.inputCoPlanNotes.val();
                cy.aveSetCycleTime(App.State.currentModel.cycleTime);
                controls.panels.coPlanModal.modal('hide');
            });

            /**
             *  Crossroad modal events
             */
            controls.inputs.inputCrossroadOffset = $('#inputCrossroadOffset').slider({
                max: 100,
                value: 0,
                tooltip: 'always'
            });
            controls.panels.crossRoadModal.on('shown.bs.modal', function () {
                controls.inputs.inputCrossroadOffset.slider('relayout');
            });
            controls.buttons.btnsCrossFormPhasesCount.click(function () {
                var cols = $(this).data('cols');
                controls.buttons.btnsCrossFormPhasesCount.removeClass('ph-selected');
                $(this).addClass('ph-selected');
                controls.panels.tblPhasesBody.find('input[type="text"]').prop('disabled', true);
                controls.panels.tblPhasesBody.find('input[type="checkbox"]').iCheck('disable');
                cols.map(function (v) {
                    controls.panels.tblPhasesBody.find('.ph-col-' + v + ' input[type="text"]').prop('disabled', false);
                    controls.panels.tblPhasesBody.find('.ph-col-' + v + ' input[type="checkbox"]').iCheck('enable');
                });
            });
            controls.buttons.btnSaveCrossroadData.click(function () {
                var nodeId = controls.panels.crossRoadModal.data('id');

                var tblPhasesBody = controls.panels.tblPhasesBody;
                var phasesCount = controls.panels.crossRoadModal.find('.ph-selected').data('count');
                var phases = [];
                var tag = 0;
                var pLength = 0;
                var maxLength = 0;
                for (var i = 1; i <= phasesCount; i++) {
                    tag = tblPhasesBody.find('input#ph-tag-' + i).val();
                    pLength = tblPhasesBody.find('input#ph-length-' + i).val();
                    maxLength = tblPhasesBody.find('input#ph-max-length-' + i).val();
                    phases.push({
                        tag: tag,
                        length: pLength ? parseInt(pLength) : 0,
                        minLength: maxLength ? parseInt(maxLength) : 0
                    });
                }
                cy.getElementById(nodeId).data('name', controls.inputs.inputCrossroadName.val());
                cy.getElementById(nodeId).data('offset', controls.inputs.inputCrossroadOffset.slider('getValue'));
                cy.getElementById(nodeId).data('phases', phases);

                tblPhasesBody.find('tr.stop-line-row').each(function () {
                    var $tr = $(this);
                    var green = [];
                    var inputs = $tr.find('td.ph-td:lt(' + phases.length + ') input[type="checkbox"]');
                    for (var i = 0; i < phases.length; i++) {
                        green.push(inputs[i].checked);
                    }
                    cy.getElementById($tr.data('id')).data('greenPhases', green);
                });
                controls.panels.crossRoadModal.modal('hide');
            });

        },


        initCheckBoxes: function($el) {
            $el.find('input[type="checkbox"]').iCheck({ checkboxClass: 'icheckbox_minimal-blue' });
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
            this.toggleNodePopupPanel();
            controls.panels.pointProperty.css(
                {
                    top: y + 10,
                    left: x - 135
                }).data("node", target.id);
            controls.inputs.inputNodeType.text(target.type);
            controls.inputs.inputsNodeProperty.each(function(i, v){
                var $v = $(v);
                var data = target[$v.data('key')];
                if ($v.data('key') == 'intervals') {
                    data = JSON.stringify(data);
                }
                $v.val(data);
            });

            var color = target.color == undefined ? 'btn-primary' : 'btn-' + target.color;
            controls.buttons.btnNodeColorSelection.trigger('changeColor', [color]);

            if (target.type == 'stopline'){
                controls.panels.pointProperty.find('.is-stopLine').show();
                if (target.parent == undefined) {
                    controls.panels.pointProperty.find('.out-crossroad').show();
                    controls.panels.pointProperty.find('.in-crossroad').hide();
                } else {
                    controls.panels.pointProperty.find('.out-crossroad').hide();
                    controls.panels.pointProperty.find('.in-crossroad').show();
                }
            } else {
                controls.panels.pointProperty.find('.is-stopLine').hide();
            }

            if (target.type == 'carriageway'){
                controls.panels.pointProperty.find('.is-carriageway').show();
            } else {
                controls.panels.pointProperty.find('.is-carriageway').hide();
            }

            if (target.type == 'concurrent' ||target.type == 'concurrentMerge'){
                controls.panels.pointProperty.find('.is-concurrent').show();
            } else {
                controls.panels.pointProperty.find('.is-concurrent').hide();
            }

        },
        showCrossroadModal: function(node){
            var stopLines = cy.aveGetCrossroadStoplines(node.id);
            var phasesCntButtons = controls.buttons.btnsCrossFormPhasesCount;
            controls.panels.crossRoadModal.data('id', node.id);

            phasesCntButtons.removeClass('ph-selected');
            controls.panels.crossRoadModal
                .find('[data-count='+node.phases.length+']')
                .addClass('ph-selected');

            controls.panels.tblPhasesBody.find('tr').remove();
            controls.panels.tblPhasesBody.append(templates.crossRoadTablePhaseRow(node.phases));
            $.each(stopLines, function(i,v){
                controls.panels.tblPhasesBody.append(templates.crossRoadTableCheckRow(v.data()));
                that.initCheckBoxes(controls.panels.tblPhasesBody);
            });
            controls.inputs.inputCrossroadName.val(node.name);
            controls.inputs.inputCrossroadOffset.slider('setAttribute', 'max', node.cycleTime - 1);
            controls.inputs.inputCrossroadOffset.slider('setValue', node.offset);
            controls.panels.crossRoadModal.modal('show');
        },
        showSideNodeInfo: function(node) {
            controls.panels.nodeSearchResultlist.empty();
            controls.panels.nodeSearchInfo.empty();
            controls.panels.body.addClass('show-right-panel');

            if (node.hasOwnProperty('parent') && node.type !== 'crossRoad') {
                node.name =  cy.getElementById(node.parent).data('name');
            }
            node.constantIntensity =  cy.aveConstantIntensity(node);
            controls.panels.nodeSearchResultlist.append(
                templates.nodeSearchListItem(node, 'single')
            );

            if (node.type == 'crossRoad') {
                controls.panels.nodeSearchInfo.append(
                    templates.nodeCrossRoadProps(node)
                );
            } else {
                controls.panels.nodeSearchInfo.append(
                    templates.nodeCommonProps(node)
                );
                controls.panels.nodeSearchInfo.append(
                    templates.locateEditButtons(node)
                );
            }

            var errors = App.State.lastErrors.filter(function(val){
                return val.node ==  node.id;
            });

            if (errors.length > 0) {
                controls.panels.nodeSearchInfo.append(
                    templates.validationErrors(this.flattenErrors(errors))
                );
            }

            if (node.type == 'crossRoad') {
                var stopLines = cy.aveGetCrossroadStoplines(node.id);
                var dataBars = [];
                $.each(stopLines, function(i,v){
                    dataBars.push({
                        node: v.data(),
                        signals: traffic.signalDiagramData(node, v.data())
                    });
                });

                controls.panels.nodeSearchInfo.append(
                    templates.crossRoadSignalBars({
                        cycleTime: node.cycleTime,
                        bars: dataBars
                    })
                );

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
            var data = {
                labels: settings.chart.labels(node.cycleTime),
                datasets: [
                    settings.chart.flowIn(results[0].inFlow),
                    settings.chart.flowOut(results[0].outFlow)
                ]
            };
            var myLineChart = new Chart(ctx).Line(data, settings.chart.common);

            if (node.type == 'stopline' && node.hasOwnProperty('parent')){
                controls.panels.nodeSearchInfo.append(
                    templates.signalBar({
                        cycleTime: node.cycleTime,
                        signals: traffic.signalDiagramData(cy.getElementById(node.parent).data(), node)
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
                .removeClass('fa fa-genderless fa-circle-thin fa-exchange fa-filter fa-random fa-ellipsis-v fa-code-fork')
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
        bottomTabSwitch: function(){
            var tab = $(this);
            tab.parent().siblings().removeClass('active');
            tab.parent().addClass('active');
            controls.panels.body
                .removeClass('show-files show-network show-routes show-results show-source')
                .addClass(tab.data('rel'))
        }
    }

})(AvenueApp);
