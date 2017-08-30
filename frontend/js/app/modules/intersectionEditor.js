(function(App){

    var cy, editor, traffic, routes, api, that;
    var crossroad, program, stopLines, selectedOptimalCycleData;
    var cyCrossroad;
    var controls  = App.Controls;
    var templates = App.Templates;
    var settings  = App.Resources.Settings;
    var maxCountPhases = 12;
    var $addGreenEditableElement;



    function heatMapColorforValue(value){
        var h = (1.0 - value) * 240;
        return "hsl(" + h + ", 100%, 50%)";
    }


    App.Modules.intersectionEditor = {

        injectDependencies: function(modules) {
            cy        = modules.cytoscape;
            editor    = modules.editor;
            traffic   = modules.traffic;
            routes    = modules.routes;
            api       = modules.apiCalls;
            that = this;
        },

        initModule: function(){
            this.iniCrossroadEvents();
        },


        initCyCrossroadCopy: function (){
            var options   = settings.cyCrossroadCopy;
            options.style = App.Resources.CyCrossroadStyles;
            options.ready = function() { };
            options.container = controls.panels.cyCrossroadCopy[0];
            cyCrossroad = cytoscape(options);
            cyCrossroad.edgeBendEditing({undoable: false});

            cyCrossroad.on('select', 'node', function (e) {
                var s = cyCrossroad.$('node:selected');
                s = s[0];
                var original = cy.getElementById(s.data('id'));
                editor.showSideNodeInfo(original.data());
            });

            cyCrossroad.on('unselect', function () {
                controls.panels.body.removeClass('show-right-panel');
            });

            cyCrossroad.on('click', 'node:selected', function (e) {
                var type = e.target.data('type');
                //e.originalEvent.stopPropagation();
            });

        },

        stopLineSort: function (a, b) {
            if (a.data.tag > b.data.tag) {return 1;}
            if (a.data.tag < b.data.tag) {return -1;}
            return 0;
        },

        iniCrossroadEvents: function(){
            /**
             *  Crossroad modal events
             */
            if ($('#inputCrossroadOffset').length > 0) {
                controls.inputs.inputCrossroadOffset = $('#inputCrossroadOffset').slider({
                    max: 100, value: 0,
                    tooltip: 'always'
                }).on('slideStop', function(){
                    controls.inputs.inputCrossroadOffsetText
                        .val(controls.inputs.inputCrossroadOffset.slider('getValue'))
                        .trigger('change');
                });
            }

            controls.panels.body.on('mouseup', function(){
                that.toggleAddGreenPanel(false);
            });

            controls.panels.addGreenProperty.find('form').submit(function(e){
                e.preventDefault();
                e.stopPropagation();
                controls.buttons.btnAddGreenDone.click();
            });

            /**
             *  Node popup properies block related events
             */
            controls.panels.addGreenProperty.mouseup(function(e){ e.stopPropagation(); });

            $(document).on('click', 'a.btn-edit-add-green', function(e){
                e.preventDefault();
                if ($(this).attr('disabled')) {
                    return;
                }
                controls.panels.addGreenProperty
                    .css({ top: e.clientY + 17, left: e.clientX - 145});
                that.toggleAddGreenPanel(true);
                $addGreenEditableElement = $(this).find('span.add-green-value');
                controls.inputs.inputAddGreen.val($addGreenEditableElement.data('value'));
            });


            controls.buttons.btnAddGreenDone.click(function(){
                var value =  +parseInt(controls.inputs.inputAddGreen.val()) || 0;
                var text = value == 0 ? '' : '+' + value;
                $addGreenEditableElement.data('value', value).text(text);

                var stoplineId = $addGreenEditableElement.data('stopline');
                var phase = $addGreenEditableElement.data('phase') - 1;

                var cpi = crossroad.currentProgram;
                $.each(stopLines, function(inx, stopline){
                    if (stopline.data.id !== stoplineId) return;
                    stopLines[inx].data.additionalGreens[cpi][phase] = value;
                });

                that.toggleAddGreenPanel(false);
                that.renderDiagramTable(program);
            });


            controls.panels.crossRoadPanel.on('change', '.ph-td input[type="text"]', function(e){
                var inp = $(this);
                var phase = inp.data('phase') - 1;
                var field = inp.data('field');
                var val = field == 'tag'
                    ? inp.val()
                    : parseInt(inp.val()) | 0;
                program.phases[phase][field] = val;
                that.renderDiagramTable(program);
            });


            controls.panels.crossRoadPanel.on('click', function(e){
                cyCrossroad.$().unselect();
            });

            controls.panels.cyCrossroadCopy.on('click', function(e){
                e.stopPropagation();
                e.preventDefault();
            });

            controls.panels.crossRoadPanel.on('click', '.ph-td input[type="checkbox"]', function(e){
                var inp = $(this);
                var phase = inp.data('phase');
                var stoplineId = inp.data('stopline');
                var value = inp.prop('checked');
                var cpi = crossroad.currentProgram;

                $.each(stopLines, function(inx, stopline){
                    if (stopline.data.id !== stoplineId) return;
                    stopLines[inx].data.greenPhases[cpi][phase-1] = value;
                });

                that.renderDiagramTable(program);
                that.drawGreenFlows(phase);
            });


            controls.panels.crossRoadPanel.on('blur', '.ph-td input[type="text"]', function(e){
                cyCrossroad.$().removeClass('green');
            });

            controls.panels.crossRoadPanel.on('focus', '.ph-td input[type="text"]', function(e){
                var inp = $(this);
                var phase = inp.data('phase');
                that.drawGreenFlows(phase);

            });


            controls.inputs.inputCrossroadOffsetText.change(function(){
                var val = parseInt($(this).val())|0;
                if (val > program.cycleTime - 1) {
                    val = program.cycleTime - 1;
                }
                $(this).val(val);
                controls.inputs.inputCrossroadOffset.slider('setValue', val);
                program.offset = val;
            });


            controls.inputs.inputCrossroadPhasesOrder.change(function(){
                program.currentOrder = $(this).val();
                that.renderDisabledColsPhaseTable(program);
                that.renderDiagramTable(program)
            });


            controls.inputs.inputCrossroadProgram.change(function(){
                crossroad.currentProgram = $(this).val();
                program = crossroad.programs[crossroad.currentProgram];
                that.fillCycleInputsData(program);
                that.renderPhasesOrderList(program);
                that.renderPhaseTable(program);
                controls.inputs.inputCrossroadPhasesOrder.trigger('change');

            });


            controls.buttons.btnRemovePhasesOrder.click(function () {
                program.phasesOrders.splice(parseInt(program.currentOrder), 1);
                program.currentOrder = program.phasesOrders.length - 1;
                that.renderPhasesOrderList(program);
                controls.inputs.inputCrossroadPhasesOrder.trigger('change');
            });

            controls.inputs.formCreatePhaseOrder.submit(function (e) {
                e.preventDefault();
                e.stopPropagation();
                var name = controls.inputs.inputPhaseOrderName.val();
                var orderStr = controls.inputs.inputPhaseOrderOrder.val();
                var order = $.unique(
                    orderStr.split(',').map(function(o){
                        var orderItem = parseInt(o.trim()) | 0;
                        if (orderItem > maxCountPhases) {
                            orderItem = maxCountPhases;
                        }
                        if (orderItem < 1) {
                            orderItem = 1;
                        }
                        return orderItem;
                    }));

                if (name.length == 0 || order.length <=1){
                    return;
                }
                program.phasesOrders.push({
                    name: name,
                    order: order
                });
                program.currentOrder = program.phasesOrders.length - 1;
                that.renderPhasesOrderList(program);
                controls.inputs.inputCrossroadPhasesOrder.trigger('change');
                controls.inputs.inputPhaseOrderName.val('');
                controls.inputs.inputPhaseOrderOrder.val('');

                return false;
            });


            controls.buttons.btnRemoveProgram.click(function () {
                if (crossroad.programs.length == 1) {
                    return;
                }
                var current = parseInt(crossroad.currentProgram);
                crossroad.programs.splice(current, 1);
                that.stoplinesRemoveArrays(current);

                that.renderProgramsList(crossroad);
                controls.inputs.inputCrossroadProgram.val(0);
                controls.inputs.inputCrossroadProgram.trigger('change');
            });

            controls.inputs.formCreateProgram.submit(function (e) {
                e.preventDefault();
                e.stopPropagation();
                var name = controls.inputs.inputProgramName.val().trim();
                if (name.length == 0) {return}

                var newProg = JSON.parse(JSON.stringify(settings.programDefaults));
                    newProg.name = name;
                crossroad.programs.push(newProg);
                that.stoplinesAddDefaultArrays();

                controls.inputs.inputProgramName.val('');
                that.renderProgramsList(crossroad);
                controls.inputs.inputCrossroadProgram.val(crossroad.programs.length - 1);
                controls.inputs.inputCrossroadProgram.trigger('change');

            });


            controls.buttons.btnEditProgram.click(function (){
                controls.inputs.inputUpdateProgramName.val(program.name);
            });

            controls.inputs.formUpdateProgram.submit(function (e) {
                e.preventDefault();
                e.stopPropagation();
                var name = controls.inputs.inputUpdateProgramName.val().trim();
                if (name.length == 0) {return}
                controls.inputs.inputUpdateProgramName.val('');
                program.name = name;
                that.renderProgramsList(crossroad);
            });


            controls.buttons.btnSaveCrossroadData.click(function () {
                var nodeId = crossroad.id;
                crossroad.optimizeOff = controls.inputs.inputCrossroadOptiOff.prop('checked');
                crossroad.name = controls.inputs.inputCrossroadName.val();
                crossroad.label = program.name + ' (' + program.cycleTime + ')';
                cy.getElementById(nodeId).data(crossroad);
                $.each(stopLines, function(i, stopline){
                    cy.getElementById(stopline.data.id).data(stopline.data);
                });

                cyCrossroad.$().unselect();
                controls.buttons.btnModelSave.click();

                var currentRouteInx = routes.getSelected();
                if (currentRouteInx === false) {
                    return;
                }
                var route = routes.getRoute(currentRouteInx);
                    routes.drawRoute(route);
            });

            controls.inputs.inputCrossroadCycleLength.change(function(){
                var val = parseInt($(this).val()) | 0 ;
                var realValue = val > 500 ? 500 : val;
                $(this).val(realValue);
                program.cycleTime = realValue;
                that.renderDiagramTable(program);

                if (program.offset >= realValue) {
                    controls.inputs.inputCrossroadOffsetText
                        .val(0)
                        .trigger('change');
                }
                controls.inputs.inputCrossroadOffset
                    .slider('setAttribute', 'max', realValue - 1)
                    .slider('relayout');
            });


            controls.buttons.btnCycleAndPhaseRate.click(function(){
                if (program.graphData) {
                    that.showCycleGraphModal(true);
                    return;
                }

                that.refreshCycleGraphRequest();
                that.showCycleGraphModal(false);
            });

            controls.buttons.btnCycleLenghtRecalc.click(function(){
                that.refreshCycleGraphRequest();
                that.resetCycleGraphSvg();
            });


            controls.buttons.btnCycleLenghtApply.click(function(){
               if (!selectedOptimalCycleData)  return;
               var data = selectedOptimalCycleData;
               var orders = program.phasesOrders[program.currentOrder].order;

                data.phases.map(function(phase, inx){
                    var phaseNum = orders[inx];
                    var phaseInx = phaseNum - 1;
                        program.phases[phaseInx].length = phase.length;
                });

                controls.panels.cycleGraphModal.modal('hide');
                program.cycleTime = data.cycleTime;
                that.fillCrossroadFormData(crossroad);
            });

        },

        refreshCycleGraphRequest:function(){
            controls.buttons.btnSaveCrossroadData.click();
            var data = cy.avePrepareCalcRequestSingleCrossroad(crossroad.id);
            api.singleCrossroadCycle({data: data});
        },

        showCycleGraphModal: function(fromCache){
            if (!fromCache) {
                controls.panels.cycleGraphModal.modal('show');
                this.resetCycleGraphSvg();
                return;
            }
            if (program.graphData) {
                controls.panels.cycleGraphModal.modal('show');
                this.renderCycleGraphData(program.graphData);
            }
        },

        resetCycleGraphSvg: function() {
            controls.panels.cycleGraphSvg.empty();
            controls.panels.cycleDiagramLoader.removeClass('hidden');
            controls.panels.cycleGraphSvg.add('hidden');
            controls.panels.cycleDiagramLegend.empty();
            controls.buttons.btnCycleLenghtApply.addClass('hidden');
            selectedOptimalCycleData = null;
        },

        renderCycleGraphData: function(graphData){
            program.graphData = graphData;
            controls.panels.cycleGraphSvg.empty();
            controls.panels.cycleDiagramLoader.addClass('hidden');
            controls.panels.cycleGraphSvg.removeClass('hidden');
            controls.panels.cycleDiagramLegend.empty();
            controls.buttons.btnCycleLenghtApply.addClass('hidden');
            selectedOptimalCycleData = null;

            var svgMargin = {top: 20 , right:20, bottom: 20, left: 30};
            var step = graphData[0].phases.length;
            var data = graphData.map(function(cycleData){
                var start  = 0;
                cycleData.phases.map(function(ph){
                    ph.start = start;
                    ph.cycleTime = cycleData.cycleTime;
                    start += ph.length;
                });
                return cycleData;
            });

            var width = 870;
            var height = 450;
            var svg = d3.select("#cycle-diagram-svg").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + svgMargin.left + "," + svgMargin.top + ")");
            var hpad = svgMargin.left + svgMargin.right;
            var vpad = svgMargin.bottom + svgMargin.top;
            var mpad = 150;
            var x  = d3.scale.linear().rangeRound([0, width - hpad]);
            var y  = d3.scale.linear().rangeRound([height - vpad-mpad, 0]);
            var y1 = d3.scale.linear().rangeRound([height - vpad-mpad, 0]);
            var y3 = d3.scale.linear().rangeRound([height - vpad-mpad, 0]);
            var y2 = d3.scale.linear().rangeRound([height - mpad - vpad + 20, height - vpad ]);

            var line = d3.svg.line()
                .x(function(d) { return x(d.cycleTime); })
                .y(function(d) { return y(d.avgCycleSaturation); });
            var line1 = d3.svg.line()
                .x(function(d) { return x(d.cycleTime); })
                .y(function(d) { return y(1); });
            var line3 = d3.svg.line()
                .x(function(d) { return x(d.cycleTime); })
                .y(function(d) { return y3(d.sumDelay); });

            var line4 = d3.svg.line()
                .x(function(d) { return x(d.x); })
                .y(function(d) { return y(d.y); });

            x.domain(d3.extent(data, function(d) { return d.cycleTime; }));
            y.domain([0,3]);
            y1.domain([0,10]);
            y2.domain([0,100]);
            y3.domain(d3.extent(data, function(d) { return d.sumDelay; }));

            var yAxis   = d3.svg.axis().scale(y).orient("left");
            var yAxis1   = d3.svg.axis().scale(y1).orient("right").innerTickSize(-width+hpad);
            var yAxis3   = d3.svg.axis().scale(y3).orient("left");
            var yAxis2   = d3.svg.axis().scale(y2)
                .orient("left")
                .ticks(10)
                .tickFormat(function(d) { return d + "%"; });
            var xAxis   = d3.svg.axis().scale(x).orient("bottom").innerTickSize(-height+vpad+mpad);


            svg.append("g").attr("class", "y axis").call(yAxis)
                .style("font-size","11px");

            svg.append("g").attr("class", "y2 axis")
                .attr("transform", "translate(0,0)")
                .call(yAxis2)
                .style("font-size","8px");


            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("fill", "#ffeeee")
                .attr('fill-opacity', 1)
                .attr("x", function(d) { return x(d.cycleTime); })
                .attr("y", function(d) { return y1(d.sumCongestion); })
                .attr("width", Math.abs(x(step)-x(0)))
                .attr("height", function(d) { return height - mpad - vpad - y1(d.sumCongestion); });


            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 3)
                .attr("d", line);

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.0)
                .attr("d", line1);

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#999999")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 2.0)
                .attr("d", line3);


            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0, " + (height - vpad - mpad) + ")")
                .call(xAxis)
                .style("font-size","11px");

            svg.append("g").attr("class", "y1 axis")
                .attr("transform", "translate(" + (width - hpad) + ",0)")
                .call(yAxis1)
                .style("font-size","11px");
            svg.append("g").attr("class", "y3 axis")
                .attr("transform", "translate(" + (width - hpad) + ",0)")
                .call(yAxis3)
                .style("font-size","11px");

            data.pop();
            var bar = svg.selectAll("rect.phases")
                .data(data)
                .enter()
                .append("g")
                .attr("class", "phases")
                .on("click", function(){
                    var data = d3.select(this).data()[0];

                    selectedOptimalCycleData = data;
                    controls.panels.cycleDiagramLegend.html(templates.cycleGraphLegendTable(data))
                    controls.buttons.btnCycleLenghtApply.removeClass('hidden');

                    d3.select(this).selectAll('rect').style("stroke", "#000000");
                    svg.selectAll('path.vertical-red-selected').remove();
                    svg.append("path")
                        .datum([{x:data.cycleTime, y:-1.75},{x:data.cycleTime,y:3}])
                        .attr("class", "vertical-red-selected")
                        .attr("fill", "none")
                        .attr("stroke", "#800")
                        .attr("stroke-linejoin", "round")
                        .attr("stroke-linecap", "round")
                        .attr("stroke-width", 1.0)
                        .attr("d", line4);
                })

                .on("mouseenter", function(){
                    var data = d3.select(this).data()[0];
                    d3.select(this).selectAll('rect').style("stroke", "#000000");
                    svg.selectAll('path.vertical-red').remove();
                    svg.append("path")
                        .datum([{x:data.cycleTime, y:-1.75},{x:data.cycleTime,y:3}])
                        .attr("class", "vertical-red")
                        .attr("fill", "none")
                        .attr("stroke", "red")
                        .attr("stroke-linejoin", "round")
                        .attr("stroke-linecap", "round")
                        .attr("stroke-width", 1.0)
                        .attr("d", line4);
                })
                .on("mouseleave", function(){
                    svg.selectAll('path.vertical-red').remove();
                    d3.select(this).selectAll('rect').style("stroke", "#ffffff");
                    //console.log('leave',d3.select(this).data());
                })
                .style("cursor", "pointer")
                .style("text-anchor", "middle");

            var bar1 = bar.selectAll(".phases-bars")
                    .data(function(d) { return d.phases;}).enter()
                    .append("g")
                    .attr("class", "phases-bars");


            bar1.append("rect")
                .style("stroke", "#ffffff")
                //.attr('fill-opacity', 0.1)
                .attr("fill", function(d) {
                    return heatMapColorforValue(d.saturation/1.6);
                })
                .attr('fill-opacity', 1)
                .style("stroke-width", 1)
                .attr('class', 'phases')
                .attr("height", function(d) {
                    return y2((100*d.length/d.cycleTime)) - y2(0);
                })
                .attr("x", function(d) { return x(d.cycleTime); })
                .attr("y", function(d) { return y2(100*d.start/d.cycleTime); })
                .attr("width", Math.abs(x(step-1)-x(0)));

            if (step >=3) {
                bar1.append("text")
                    .style('fill', function(d){
                        if (y2((100*d.length/d.cycleTime)) - y2(0) < 10) return "transparent";
                        return '#222222';
                    })
                    .attr("x",   function(d) { return x(d.cycleTime + (step-1)/2); })
                    .attr("y",   function(d) { return y2(100*(d.start + d.length/2+2)/d.cycleTime); })
                    .text(function(d) { return d.length +''; })
            }


        },

        fillCrossroadFormData: function(crossroad){
            program = crossroad.programs[crossroad.currentProgram];
            controls.inputs.inputCrossroadName.val(crossroad.name);
            controls.inputs.inputCrossroadOptiOff.prop('checked', crossroad.optimizeOff);


            /* fill programs list */
            this.renderProgramsList(crossroad);

            /* fill cycle time & offset */
            this.fillCycleInputsData(program);

            /* fill phases order list */
            this.renderPhasesOrderList(program);

            /* add & fill phases table*/
            this.renderPhaseTable(program);

            this.renderDiagramTable(program);
        },

        fillCycleInputsData: function(program){
            controls.inputs.inputCrossroadCycleLength.val(program.cycleTime).trigger('change');
            controls.inputs.inputCrossroadOffsetText.val(program.offset).trigger('change');
        },

        renderProgramsList: function(crossroad){
            controls.inputs.inputCrossroadProgram.empty();
            $.each(crossroad.programs, function(key, program){
                controls.inputs.inputCrossroadProgram
                    .append($("<option></option>")
                        .attr("value", key)
                        .text(program.name));
            });
            controls.inputs.inputCrossroadProgram.val(crossroad.currentProgram);
        },

        renderPhasesOrderList: function(program){
            controls.inputs.inputCrossroadPhasesOrder.empty();
            $.each(program.phasesOrders, function(key, order){
                controls.inputs.inputCrossroadPhasesOrder
                    .append($("<option></option>")
                        .attr("value", key)
                        .text(order.name + ': ' + order.order.join(', ')));
            });
            controls.inputs.inputCrossroadPhasesOrder.val(program.currentOrder);
        },

        renderPhaseTable:function(program, order){
            this.addDefaultsToPhasesList(program);
            this.addDefaultsToStoplines();

            controls.panels.tblPhasesBody.empty();
            controls.panels.tblPhasesBody.append(templates.crossRoadTablePhaseRow(program.phases));
            controls.panels.tblPhasesBody.append(templates.crossRoadTableTabRow());
            $.each(stopLines, function(i, stopline){
                controls.panels.tblPhasesBody.append(templates.crossRoadTableCheckRow(stopline.data, crossroad));
            });
            controls.panels.tblPhasesBody.append(templates.crossRoadTableTabRow());

            this.renderDisabledColsPhaseTable(program, order);
        },

        renderDisabledColsPhaseTable: function(program, order){
            controls.panels.tblPhasesBody
                .find('.ph-td input')
                    .prop('disabled', true);
            controls.panels.tblPhasesBody
                .find('.ph-td a')
                    .attr('disabled', 'disabled');
            var phCurrentOrder = order !== undefined ? order : program.currentOrder;
            if (phCurrentOrder < 0 || phCurrentOrder == null) {
                return;
            }
            var phOrder = program.phasesOrders[phCurrentOrder];
            $.each(phOrder.order, function(inx, phaseNum){
                controls.panels.tblPhasesBody
                    .find('.ph-col-'+phaseNum+' input')
                        .prop('disabled', false);
                controls.panels.tblPhasesBody
                    .find('.ph-col-'+phaseNum+' a')
                        .removeAttr('disabled');
            });

        },

        renderDiagramTable: function(program, order) {
            controls.panels.tblDiagramsBody.empty();
            var sumPhasesTime = this.getPhasesSummaryTime();

            if (program.cycleTime < sumPhasesTime) {
                controls.panels.tblDiagramsBody.append(templates.crossRoadTableDiagramErrorRow());
                return;
            }

            controls.panels.tblDiagramsBody.append(
                templates.crossRoadTableDiagramRulerRow({
                    cycleTime: program.cycleTime,
                    signals: traffic.signalDiagramPhases(crossroad, program, order)
                })
            );
            var intertactOrder = App.State.currentModel.intertactOrder;
            $.each(stopLines, function(i, stopline){
                controls.panels.tblDiagramsBody.append(templates.crossRoadTableDiagramRow(
                    stopline.data,
                    {
                        cycleTime: program.cycleTime,
                        signals: traffic.signalDiagramData1(intertactOrder, crossroad, program, stopline.data, order, true)
                    }
                ));
            });

            if (program.cycleTime != sumPhasesTime) {
                controls.panels.tblDiagramsBody.append(templates.crossRoadTableTabRow());
                controls.panels.tblDiagramsBody.append(templates.crossRoadTableDiagramErrorRow());
            }
        },

        showCrossroadModal: function(node){
            crossroad = $.extend({}, JSON.parse(JSON.stringify(settings.crossRoad)), JSON.parse(JSON.stringify(node)));
            stopLines = cy.aveGetCrossroadStoplines(node.id);
            stopLines.sort(this.stopLineSort);

            if (!node.hasOwnProperty('programs')) {
                crossroad.currentProgram = 0;
                var newProg = JSON.parse(JSON.stringify(settings.emptyProgram));
                newProg.cycleTime = crossroad.cycleTime;
                newProg.offset = crossroad.offset;
                newProg.phases = JSON.parse(JSON.stringify(crossroad.phases));
                crossroad.programs.push(newProg);
                delete crossroad.cycleTime;
                delete crossroad.offset;
                delete crossroad.phases;
                this.stoplinesOldConvert();
            }

            this.fillCrossroadFormData(crossroad);

            controls.panels.body.removeClass('show-right-panel');
            editor.bottomTabSwitch(controls.buttons.btnShowCrossroad);

            controls.inputs.inputCrossroadOffset.slider('relayout');
            var data = cy.aveSelectedCrossroadNodes(crossroad.id);

            that.initCyCrossroadCopy();
            cyCrossroad.$().remove();
            cyCrossroad.add(data).unselect();
            cyCrossroad.fit(0);

        },

        getGreenStoplines:function(phaseNum){
            return stopLines.filter(function(stopline){
                return stopline.data.greenPhases[crossroad.currentProgram][phaseNum - 1] && true;

            }).map(function(stopline){
                return stopline.data.id
            })

        },


        drawGreenFlows:function(phase){
            cyCrossroad.$().removeClass('green');
            var stoplineIds = that.getGreenStoplines(phase);

            stoplineIds.map(function(slId){
                cyCrossroad.$('#'+slId).addClass('green')
                    .outgoers('node[type!="stopline"], edge').addClass('green')
                    .outgoers('node[type!="stopline"], edge').addClass('green')
                    .outgoers('node[type!="stopline"], edge').addClass('green')
                    //.outgoers('node[type!="stopline"], edge').addClass('green')
            });

            $.each(cyCrossroad.$('node[type="concurrent"]'), function(inx, concurent){
                var inPrimary = concurent.incomers('edge[^secondary].green');
                if (inPrimary.length == 0) {
                    concurent.outgoers('edge[^secondary].green').removeClass('green')
                        .outgoers('node[type!="stopline"], edge').addClass('green')
                        .outgoers('node[type!="stopline"], edge').addClass('green')
                        .outgoers('node[type!="stopline"], edge').addClass('green');
                }

                var inSecondary = concurent.incomers('edge[secondary].green');
                if (inSecondary.length == 0) {
                    concurent.outgoers('edge[secondary].green').removeClass('green')
                        .outgoers('node[type!="stopline"], edge').addClass('green')
                        .outgoers('node[type!="stopline"], edge').addClass('green')
                        .outgoers('node[type!="stopline"], edge').addClass('green');
                }
            });
        },

        addDefaultsToPhasesList: function(program){
            var emptyPhase = JSON.parse(JSON.stringify(settings.emptyPhase));
            for (var i = 1; i<= maxCountPhases; i++){
                if (program.phases[i - 1] == undefined){
                    program.phases[i - 1] = $.extend({}, emptyPhase);
                    program.phases[i - 1].tag = 'ph' + i;
                } else {
                    program.phases[i - 1] = $.extend({}, emptyPhase, program.phases[i - 1]);
                    if (!program.phases[i - 1].tag) {
                        program.phases[i - 1].tag = 'ph' + i;
                    }
                }
            }
        },

        addDefaultsToStoplines: function(){

            $.each(crossroad.programs, function(inx){
                $.each(stopLines, function(i, stopline){
                    for (var i = 0; i< maxCountPhases; i++){
                        if (!stopline.data.additionalGreens[inx][i]) {
                            stopline.data.additionalGreens[inx][i] = 0;
                        }
                        if (!stopline.data.greenPhases[inx][i]) {
                            stopline.data.greenPhases[inx][i] = false;
                        }
                    }
                });
            });
        },

        toggleAddGreenPanel: function(show){
            controls.panels.body.toggleClass('show-panel-add-green', show);
        },

        getPhasesSummaryTime:function(){
            if (program.currentOrder < 0 || program.currentOrder == null) {
                return 0;
            }
            var order = program.phasesOrders[program.currentOrder].order;
            var sum = 0;
            order.map(function(phaseNum){
                sum += program.phases[phaseNum - 1].length;
            });
            return sum;
        },

        stoplinesAddDefaultArrays:function(){
            $.each(stopLines, function(i, stopline){
                stopline.data.additionalGreens.push([0,0]);
                stopline.data.greenPhases.push([false, false]);
            });

        },

        stoplinesRemoveArrays:function(inx){
            $.each(stopLines, function(i, stopline){
                stopline.data.additionalGreens.splice(inx,1);
                stopline.data.greenPhases.splice(inx,1);
            });
        },

        stoplinesOldConvert:function(){
            $.each(stopLines, function(i, stopline){
                if (!stopline.data.additionalGreens) {
                    stopline.data.additionalGreens = JSON.parse(JSON.stringify(settings.stopline.additionalGreens));
                }
                if (!Array.isArray(stopline.data.additionalGreens[0])){
                    stopline.data.additionalGreens = [stopline.data.additionalGreens];
                }
                if (!Array.isArray(stopline.data.greenPhases[0])){
                    stopline.data.greenPhases = [stopline.data.greenPhases];
                }
            });

        },

        showCrossRoadNodeInfo: function(node, step) {
            controls.panels.crossroadNodeInfoPanel.empty();

            node.constantIntensity =  cy.aveConstantIntensity(node);

            controls.panels.crossroadNodeInfoPanel.append(
                templates.nodeCommonProps(node)
            );

            var errors = App.State.lastErrors.filter(function(val){
                return val.node ==  node.id;
            });

            if (errors.length > 0) {
                controls.panels.crossroadNodeInfoPanel.append(
                    templates.validationErrors(editor.flattenErrors(errors))
                );
            }

            var results = App.State.lastModelingResult.filter(function(val){
                return val.id == node.id;
            });

            if (results.length == 0) {
                return;
            }

            controls.panels.crossroadNodeInfoPanel.append(
                templates.nodeModelingResults(results[0])
            );

            controls.panels.crossroadNodeInfoPanel.append(templates.chartPanel());

            var ctx = document.getElementById("chart-panel").getContext("2d");
            var data = {
                labels: settings.chart.labels(node.cycleTime),
                datasets: [
                    settings.chart.queueFunc(results[0].queueFunc),
                    settings.chart.flowIn(results[0].inFlow),
                    settings.chart.flowOut(results[0].outFlow)
                ]
            };
            var myLineChart = new Chart(ctx).Line(data, settings.chart.common);
            var intertactOrder = App.State.currentModel.intertactOrder;
            if (node.type == 'stopline' && node.hasOwnProperty('parent')){
                var stopline = node;
                controls.panels.crossroadNodeInfoPanel.append(
                    templates.signalBar({
                        cycleTime: node.cycleTime,
                        signals: traffic.signalDiagramData1(intertactOrder, crossroad, program, stopline)
                    })
                );
            }
        },

        getCrossroad: function(){
            return crossroad;
        }

    };

})(AvenueApp);

