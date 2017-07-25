(function(App){

    var cy, editor, traffic, that;
    var cyCrossroad;
    var controls  = App.Controls;
    var templates = App.Templates;
    var settings  = App.Resources.Settings;



    App.Modules.intersectionEditor = {

        injectDependencies: function(modules) {
            cy        = modules.cytoscape;
            editor    = modules.editor;
            traffic   = modules.traffic;
            that = this;
        },

        initModule: function(){

            this.iniCrossroadEvents();
            //$(document).ready(
            //    function(){
            //
            //    }
            //)

        },


        initCyCrossroadCopy: function (){
            var options   = settings.cyCrossroadCopy;
            options.style = App.Resources.CyCrossroadStyles;
            options.ready = function() { };
            options.container = controls.panels.cyCrossroadCopy[0];
            cyCrossroad = cytoscape(options);
            cyCrossroad.on('tap', function(e){});
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
                    controls.panels.tblPhasesBody.find('.ph-col-' + v + ' a.btn-edit-add-green').attr('disabled', false);
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
                var intertact = 0;
                for (var i = 1; i <= phasesCount; i++) {
                    tag = tblPhasesBody.find('input#ph-tag-' + i).val();
                    pLength = tblPhasesBody.find('input#ph-length-' + i).val();
                    maxLength = tblPhasesBody.find('input#ph-max-length-' + i).val();
                    intertact = tblPhasesBody.find('input#ph-intertact-' + i).val();
                    phases.push({
                        tag: tag,
                        length: pLength ? parseInt(pLength) : 0,
                        minLength: maxLength ? parseInt(maxLength) : 0,
                        intertact: intertact ? parseInt(intertact) : 0
                    });
                }
                cy.getElementById(nodeId).data('name', controls.inputs.inputCrossroadName.val());
                cy.getElementById(nodeId).data('offset', controls.inputs.inputCrossroadOffset.slider('getValue'));
                cy.getElementById(nodeId).data('phases', phases);

                tblPhasesBody.find('tr.stop-line-row').each(function () {
                    var $tr = $(this);
                    var greenPhases = [];
                    var additionalGreens = [];

                    var inputs = $tr.find('td.ph-td:lt(' + phases.length + ') input[type="checkbox"]');

                    var addGreen = $tr.find('td.ph-td:lt(' + phases.length + ') a.btn-edit-add-green span.add-green-value');
                    for (var i = 0; i < phases.length; i++) {
                        greenPhases.push(inputs[i].checked);
                        additionalGreens.push($(addGreen[i]).data('value'));
                    }
                    cy.getElementById($tr.data('id'))
                        .data('greenPhases', greenPhases)
                        .data('additionalGreens', additionalGreens);
                    ;
                });
                controls.panels.crossRoadModal.modal('hide');
            });

        },

        showCrossroadModal: function(node){
            var stopLines = cy.aveGetCrossroadStoplines(node.id);
                stopLines.sort(this.stopLineSort);
            var phasesCntButtons = controls.buttons.btnsCrossFormPhasesCount;
            controls.panels.crossRoadModal.data('id', node.id);

            phasesCntButtons.removeClass('ph-selected');
            controls.panels.crossRoadModal
                .find('[data-count='+node.phases.length+']')
                .addClass('ph-selected');

            controls.panels.tblPhasesBody.find('tr').remove();
            controls.panels.tblPhasesBody.append(templates.crossRoadTablePhaseRow(node.phases));

            controls.panels.tblPhasesBody.append(templates.crossRoadTableTabRow());

            $.each(stopLines, function(i,v){
                controls.panels.tblPhasesBody.append(templates.crossRoadTableCheckRow(v.data));
            });

            controls.panels.tblPhasesBody.append(templates.crossRoadTableTabRow());

            $.each(stopLines, function(i,v){
                controls.panels.tblPhasesBody.append(templates.crossRoadTableDiagramRow(
                    v.data,
                    {
                        cycleTime: node.cycleTime,
                        node: v.data,
                        signals: traffic.signalDiagramData(node, v.data)
                    }
                ));
            });

            controls.inputs.inputCrossroadName.val(node.name);

            controls.inputs.inputCrossroadCycleLength.val(node.cycleTime);
            controls.inputs.inputCrossroadCycleLength.change(function(){
                var val = parseInt($(this).val()) | 0 ;
                $(this).val(val > 500 ? 500 : val);
            });


            controls.inputs.inputCrossroadOffsetText.val(node.offset);
            var mySlider = controls.inputs.inputCrossroadOffset.slider('setAttribute', 'max', node.cycleTime - 1);
                mySlider.slider('setValue', node.offset);

            mySlider.on('slideStop', function(){
                controls.inputs.inputCrossroadOffsetText.val(mySlider.slider('getValue'));
            });

            controls.inputs.inputCrossroadOffsetText.change(function(){
                var val = parseInt($(this).val())|0;
                if (val > node.cycleTime - 1) {
                    val = node.cycleTime - 1;
                }
                $(this).val(val);
                mySlider.slider('setValue', val);
            });

            controls.panels.crossRoadModal.on('shown.bs.modal', function (e) {
                var data = cy.aveSelectedCrossroadNodes(node.id);
                that.initCyCrossroadCopy();
                cyCrossroad.$().remove();
                cyCrossroad.add(data);
                cyCrossroad.fit(0);
            });

            controls.panels.crossRoadModal.modal('show');
        },


    };

})(AvenueApp);

