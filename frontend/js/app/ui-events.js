var uievents = {
    init: function(){
        var cookie = JSON.parse($.cookie('_avenue').substr(2));
        $('.chart-panel').drag();

        $('input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_minimal-blue'
        });

        $(document).on('keyup', function(event){
            if (event.which == 46 || event.which == 8){
                app.buttons.btnDeleteNode.click();
            };

            if (event.which == 142 || event.which == 116){
                $('#btn-calc').click();
            };
        });

        $(document).on('keyup', 'input', function(e){
            e.stopPropagation();
        });

        app.labels.labelMyAccountUsername.text(cookie.fullName);

        $(document).on('click', 'button.btn-stop-line, button.btn-edit-node', function(e){
            var nodeId = $(this).closest('tr').data('id');
            var target = app.cy.$('#'+nodeId);
            app.actions.showNodePopup(target, e.clientX, e.clientY);
        });


        $(document).on('click', 'button.btn-pan-tonode', function(e){
            var nodeId = $(this).closest('tr').data('id');
            app.cy.fit(app.cy.$('#'+nodeId), 250);
            app.cy.$('#'+nodeId).select();
        });


        app.buttons.btnPanMode.click(this.paletteClick);
        app.buttons.btnSelectMode.click(this.paletteClick);
        app.buttons.btnAddStopline.click(this.paletteClick);
        app.buttons.btnAddCarriageway.click(this.paletteClick);
        app.buttons.btnAddPoint.click(this.paletteClick);
        app.buttons.btnAddBottleneck.click(this.paletteClick);
        app.buttons.btnAddConcurrent.click(this.paletteClick);
        app.buttons.btnAddConcurrentMerge.click(this.paletteClick);

        app.buttons.listItemAddSample.click(function(){
            var key = $(this).data('key');
            if(!networkSamples.hasOwnProperty(key)) {
                return;
            }
            app.cy.add(networkSamples[key]);
        });

        app.buttons.btnDeleteNode.click(function(){
            app.cy.$(':selected').remove();
        });

        app.buttons.btnGroupNodes.click(function(){
            var selected = app.cy.$('node:selected');
            if (selected.length == 0) {
                return;
            }
            var parentId = app.actions.addNode(settings.crossRoad);
            var nodes = selected.jsons();
            var edges = selected.neighborhood('edge').jsons();

            var nodes = app.cy.$(':selected').jsons();
            $.each(nodes, function(inx, e){
                e.data['parent'] = parentId;
            });
            selected.remove();
            app.cy.add(nodes);
            app.cy.add(edges);
            app.cy.$("node:selected[parent][type='crossRoad']").remove();
        });

        app.buttons.btnUngroupNodes.click(function(){
            var selected = app.cy.$('node:selected[^parent] node');
            if (selected.length == 0) {
                return;
            }
            var nodes = selected.jsons();
            var edges = selected.neighborhood('edge')
                .removeClass('edge-in-crossroad')
                .jsons();
            var parent;

            $.each(nodes, function(inx, e){
                parent = nodes[inx].data['parent'];
                delete nodes[inx].data['parent'];
            });

            app.cy.$('#'+parent).remove();
            app.cy.add(nodes);
            app.cy.add(edges);
        });

        app.buttons.btnHorizontalAlign.click(function(){
            var nodes = app.cy.$('node:selected');
            if (nodes.length == 0) {
                return;
            }
            app.cy.$('node:selected').position('y', nodes[0].position('y'));
        });

        app.buttons.btnVerticalAlign.click(function(){
            var nodes = app.cy.$('node:selected');
            if (nodes.length == 0) {
                return;
            }
            app.cy.$('node:selected').position('x', nodes[0].position('x'));
        });

        app.buttons.btnCut.click(function() {
            app.buttons.btnCopy.click();
            app.cy.$(':selected').remove();
        });

        app.buttons.btnCopy.click(function(){
            var jsons = app.cy.$(':selected').jsons();
            var ids = [];
            $.each(jsons, function(inx, elem){
                if(elem.group == 'nodes') {
                    ids.push(elem.data.id);
                }
            });
            var stringify = JSON.stringify(jsons);
            var ids = JSON.stringify(ids);
            localStorage.clear();
            localStorage.setItem('copied-graph', stringify);
            localStorage.setItem('copied-ids', ids);
        });

        app.buttons.btnPaste.click(function(){
            var ids = JSON.parse(localStorage.getItem('copied-ids'));
            var stringify = localStorage.getItem('copied-graph');
            app.cy.$(':selected').unselect();
            $.each(ids, function(inx, elem){
                stringify = stringify.split(elem).join(app.actions.nextId())
            });
            var jsons = JSON.parse(stringify);
            if (!jsons) {
                return;
            }
            var i = jsons.length;
            while(i--){
               if(jsons[i].group != 'edges') {
                 continue;
               }
               delete jsons[i].data.id;
            }
            app.cy.add(jsons);
        });

        $(document).bind('copy', function(){app.buttons.btnCopy.click();});
        $(document).bind('paste', function(){app.buttons.btnPaste.click();});
        $(document).bind('cut', function(){app.buttons.btnCut.click();});

        app.buttons.btnShowNetwork.click(function(){
            //app.cy.elements().remove();
            //app.cy.add(JSON.parse(editor.getValue()))
            uievents.bottomTabClick($(this));
        });

        //app.buttons.btnShowSource.click(function(){
        //    //editor.setValue(JSON.stringify(app.cy.elements().jsons(), 4,' '));
        //    uievents.bottomTabClick($(this));
        //});

        app.buttons.btnShowResults.click(function(){
            uievents.bottomTabClick($(this));
        });
        app.buttons.btnShowRoutes.click(function(){
            uievents.bottomTabClick($(this));
        });

        app.buttons.btnToggleMap.click(function(){
            var th = app.buttons.btnToggleMap;
                th.toggleClass('active');
            var navigator = $('div.cytoscape-navigator');
            if (th.hasClass('active')){
                navigator.show();
            } else {
                navigator.hide();
            }
        });


        app.buttons.btnGraphNode.click(function(){
            if (app.cy.$('node:selected').length == 0){
                return;
            }
            var selected = app.cy.$('node:selected')[0];
            var id = selected.data('id');
            var chartId = 'ct-chart-' + id;
            var chartPanel = htmlTemplates.chartPanel(chartId);

            $('body > div #' + chartId).parent().remove(chartId);
            $('body > div').append(chartPanel);

            new Chartist.Line('#'+chartId, {
                labels: settings.chart.labels(app.state.lastCalc[id].cycleTime),
                series: [
                    app.state.lastCalc[id].inFlow,
                    app.state.lastCalc[id].outFlow
                ]
            }, settings.chart.defaults );

            $('.chart-panel').drag();
        });


        app.inputs.inputEdgeLabel.blur(function(){
            $('body').removeClass('show-edge-input');
        });

        app.inputs.inputEdgeLabel.change(function(){
            var id = $(this).data('edge');
            app.cy.$('#'+id).data('portion',parseInt($(this).val()))
        });

        app.inputs.inputEdgeLabel.on('keyup', function(event){
            if (event.which == 13){
                app.inputs.inputEdgeLabel.blur();
            }
        });

        app.buttons.btnCloseRightPanel.click(function(){
            $('body').toggleClass('show-right-panel');
            app.inputs.inputNodeSearch.val('');

        });

        $('body').on('mouseup', function(){
            $('body').removeClass('show-panel-point-property');
        });

        app.panels.pointProperty.mouseup(function(e){
            e.stopPropagation();
        });

        app.inputs.inputsNodeProperty.on('change',function(){
            var th = $(this);
            var id = app.panels.pointProperty.data('node');
            var val = th.val();
            if(th.data('key') == 'intervals') {
                val = JSON.parse(val);
            }
            app.cy.$('#'+id).data(th.data('key'), val);
        });


        app.buttons.btnsDirection.on('click',function(){
            var id = app.panels.pointProperty.data('node');
            var icon = window.getComputedStyle($('i', this)[0], ':before').getPropertyValue('content');
            icon = icon.substring(1,2);
            app.cy.$('#'+id).data('icon', icon);
        });


        app.buttons.btnNodeColorSelection.on('changeColor',function(e, color){
            $(this)
                .removeClass('btn-default btn-primary btn-info btn-success btn-danger btn-warning')
                .addClass(color);
        });

        app.buttons.btnsColorSelection.on('click',function(){
            var id = app.panels.pointProperty.data('node');
            var color = $(this).data('color');
            app.cy.$('#'+id).data('color', color);
            app.buttons.btnNodeColorSelection.trigger('changeColor', ['btn-'+color]);

        });

        app.inputs.inputCrossroadOffset = $('#inputCrossroadOffset').slider({
            max:100,
            value: 0,
            tooltip: 'always'
        });

        app.panels.crossRoadModal.on('shown.bs.modal', function () {
            app.inputs.inputCrossroadOffset.slider('relayout');
        });

        app.buttons.btnCoPlanProperties.click(function(){
            var cp = app.coordinationPlan;
            app.inputs.inputCoPlanCycleTime.val(cp.cycleTime);
            app.inputs.inputCoPlanName.val(cp.name);
            app.inputs.inputCoPlanNotes.val(cp.notes);
            app.panels.coPlanModal.modal('show');
        });

        app.buttons.btnCoPlanSave.click(function(){
            app.coordinationPlan.cycleTime = app.inputs.inputCoPlanCycleTime.val();
            app.coordinationPlan.name = app.inputs.inputCoPlanName.val();
            app.coordinationPlan.notes = app.inputs.inputCoPlanNotes.val();
            app.panels.coPlanModal.modal('hide');
            app.actions.setCycleTime(app.coordinationPlan.cycleTime);
        });

        app.buttons.btnsCrossFormPhasesCount.click(function(){
           var cols = $(this).data('cols');
           app.buttons.btnsCrossFormPhasesCount.removeClass('ph-selected');
           $(this).addClass('ph-selected');
           app.panels.tblPhasesBody.find('input[type="text"]').prop('disabled', true);
           app.panels.tblPhasesBody.find('input[type="checkbox"]').iCheck('disable');
           cols.map(function(v){
               app.panels.tblPhasesBody.find('.ph-col-'+v+' input[type="text"]').prop('disabled', false);
               app.panels.tblPhasesBody.find('.ph-col-'+v+' input[type="checkbox"]').iCheck('enable');
           }) ;
        });

        app.buttons.btnSaveCrossroadData.click(function(){
            var nodeId = app.panels.crossRoadModal.data('id');
            app.cy.$('#'+nodeId).data('name', app.inputs.inputCrossroadName.val());
            app.cy.$('#'+nodeId).data('offset', app.inputs.inputCrossroadOffset.slider('getValue'));

            var phasesCount = app.panels.crossRoadModal.find('.ph-selected').data('count');
            var phases = [];
            var tag = 0;
            var pLength = 0;
            var maxLength = 0;
            for(var i = 1; i<=phasesCount; i++){
                tag = app.panels.tblPhasesBody.find('input#ph-tag-'+i).val();
                pLength = app.panels.tblPhasesBody.find('input#ph-length-'+i).val();
                maxLength = app.panels.tblPhasesBody.find('input#ph-max-length-'+i).val();
                phases.push({
                    tag: tag,
                    length: pLength ? parseInt(pLength) : 0,
                    minLength: maxLength ? parseInt(maxLength): 0
                });
            }
            app.cy.$('#'+nodeId).data('phases', phases);
            app.panels.tblPhasesBody.find('tr.stop-line-row').each(function(){
                var $tr = $(this);
                var green = [];
                var inputs = $tr.find('td.ph-td:lt('+phases.length+') input[type="checkbox"]');
                for(var i=0; i<phases.length; i++){
                    green.push(inputs[i].checked);
                }
                app.cy.$('#'+$tr.data('id')).data('greenPhases', green);
            });
            app.panels.crossRoadModal.modal('hide');
        });


        app.buttons.btnCalc.click(function(){
            var data = app.actions.prepareCalcRequest();
            var $icon = $(this).find('i.fa');
                $icon.addClass('fa-spin');
            app.cy.nodes().removeClass('has-error');
            var jqxhr = $.post("/api/model/recalculate", {data: data}, null, 'json')
                .done(function(d) {

                    if (d.result) {
                        app.state.lastModelingResult = [];
                        app.state.lastErrors = [];
                    } else {
                        app.state.lastModelingResult = [];
                        app.state.lastErrors = d.data;
                        d.data.map(function(v){
                            app.cy.$('#'+v.node).addClass('has-error');
                        });
                    }
                    $.notify(d.message, {
                        position: 'top center',
                        className : d.result ? "success" : "error"
                    });
                })
                .fail(function() {

                    console.log("API request error!");
                }).always(function() {
                    $icon.removeClass('fa-spin');
                });
        });

        app.inputs.inputNodeSearchForm.submit(function(e){
            var text = app.inputs.inputNodeSearch.val();
            var limit = 20;
            var foundNodes = text.length == 0
                ? app.cy.elements('node').jsons().slice(0, limit)
                : app.cy.$("node[tag *= '" + text + "'], node[name *= '" + text + "']").jsons().slice(0, limit);
            app.panels.nodeSearchResultlist.empty();
            app.panels.nodeSearchInfo.empty();
            $('body').addClass('show-right-panel');
            if (foundNodes.length > 0){
                $.each(foundNodes, function(inx, node){
                    if (node.data.hasOwnProperty('parent') && node.data.type !== 'crossRoad') {
                        node.data.name =  app.cy.$('#' + node.data.parent).data('name');
                    }
                    app.panels.nodeSearchResultlist.append(
                        htmlTemplates.nodeSearchListItem(node.data)
                    );
                });
            } else {
                app.panels.nodeSearchResultlist.append(
                    htmlTemplates.nodeSearchListNotFound(text)
                );
            }
            return false;
        });


        $(document).on('click', '.node-list-item', function(event){
            uievents.showNodeInformation(app.cy.$('#'+$(this).data('id')).data());
        });


    },

    flatternErrors: function(errors){
        var err = errors.map(function(val){
           return val. errors;
        });
        var flattern = [].concat.apply([], err);
        return flattern;
    },

    showNodeInformation(node) {
        app.panels.nodeSearchResultlist.empty();
        app.panels.nodeSearchInfo.empty();
        $('body').addClass('show-right-panel');
        if (node.hasOwnProperty('parent') && node.type !== 'crossRoad') {
            node.name =  app.cy.$('#' + node.parent).data('name');
        }

        app.panels.nodeSearchResultlist.append(
            htmlTemplates.nodeSearchListItem(node, 'single')
        );
        app.panels.nodeSearchInfo.append(
            htmlTemplates.nodeCommonProps(node)
        );
        app.panels.nodeSearchInfo.append(
            htmlTemplates.locateEditButtons(node)
        );

        var errors = app.state.lastErrors.filter(function(val){
           return val.node ==  node.id;
        });
        if (errors.length > 0) {
            app.panels.nodeSearchInfo.append(
                htmlTemplates.validationErrors(this.flatternErrors(errors))
            );
        }
        //app.panels.nodeSearchResultlist.append(
        //    htmlTemplates.nodeModelingResults(node)
        //);

        //if (node.type == 'stopline' && node.hasOwnProperty('parent')){
        //    app.panels.nodeSearchResultlist.append(
        //        htmlTemplates.signalBar({
        //            cycleTime: app.coordinationPlan.cycleTime,
        //            signals: cyevents.signalDiagramData(node)
        //        })
        //    );
        //}

    },

    paletteClick: function(){
        var $this = $(this);
        $this.closest('.btn-group').find('.active').removeClass("active");
        if($this.prop('tagName') == 'A') {
            $this.closest('ul').find('li.active').removeClass("active");
            $this.parent().addClass("active");
            var btn = $this.closest('ul').prev();
                btn.addClass("active");
                btn.find('i')
                    .removeClass('fa fa-map-pin fa-circle-thin fa-exchange fa-filter fa-random fa-ellipsis-v fa-code-fork')
                    .addClass($this.find('i').attr('class'));
                ;
        } else {
            $this.addClass("active");
        }

        if ($this.attr('id') == app.buttons.btnSelectMode.attr('id')) {
            app.cy.boxSelectionEnabled(true);
            app.cy.userPanningEnabled(false);
        }
        if ($this.attr('id') == app.buttons.btnPanMode.attr('id')) {
            app.cy.boxSelectionEnabled(false);
            app.cy.userPanningEnabled(true);
        }
        app.state.clickMode = String($this.attr('id')).substring(8);
        app.state.nodeType = $this.data('type');
    },

    bottomTabClick: function(tab){
       tab.parent().siblings().removeClass('active');
       tab.parent().addClass('active');
       $("body")
           .removeClass('show-network show-routes show-results show-source')
           .addClass(tab.data('rel'))
    }
};



/*

*/


