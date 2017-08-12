(function(App){
    var locale;
    var __ ;
    var maxCountPhases = 12;
    var settings  = App.Resources.Settings;

    App.Templates = {
        injectDependencies: function(modules) {
            locale  = modules.locale;
            __ = locale.localize;
        },
        crossRoadTablePhaseRow: function(data){
            var disAttr = '';
            var row0 = '', row1 = '', row2 = '', row3 = '';
            for (var i = 1; i<= maxCountPhases; i++){
                var phase = data[i - 1];
                row0 = row0 + '<td class="ph-td ph-col-' + i + '"><input type="text" data-field="tag" data-phase="' + i + '" class="form-control input-sm" '+disAttr+' value="'+phase.tag+'"></td>';
                row2 = row2 + '<td class="ph-td ph-col-' + i + '"><input type="text" data-field="minLength" data-phase="' + i + '" class="form-control input-sm" '+disAttr+' value="'+phase.minLength+'"></td>';
                row1 = row1 + '<td class="ph-td ph-col-' + i + '"><input type="text" data-field="length" data-phase="' + i + '" class="form-control input-sm" '+disAttr+' value="'+phase.length+'"></td>';
                row3 = row3 + '<td class="ph-td ph-col-' + i + '"><input type="text" data-field="intertact" data-phase="' + i + '" class="form-control input-sm" '+disAttr+' value="'+phase.intertact+'"></td>';
            }
            var s =
                '<tr><td class="ph-col-0"><label>' + __('interval-tag') + '</label></td>' + row0 + '</tr>' +
                '<tr><td class="ph-col-0"><label>' + __('interval-minimal') + '</label></td>' +  row2 + '</tr>' +
                '<tr><td class="ph-col-0"><label>' + __('interval-length') + '</label></td>' + row1 + '</tr>' +
                '<tr><td class="ph-col-0"><label>' + __('interval-intertact') + '</label></td>' +  row3 + '</tr>'
               ;
            return s;
        },


        crossRoadTableCheckRow: function(data, crossroad){
            var checkboxAttr = '';
            var link = '';
            var addGreen = '';
            var cpi = crossroad.currentProgram;
            var s = '<tr class="stop-line-row" data-id="' + data.id + '">' +
                '<td class="ph-col-0">' +
                '<button type="button" class="btn btn-sm btn-stop-line btn-default">' +
                '<span class="stop-line-icon">' + data.icon + '</span>&nbsp;' + data.tag + '</button></td>';

            for (var i = 1; i<= maxCountPhases; i++){
                checkboxAttr = '';

                if (data.greenPhases[cpi][i-1] === true) {
                    checkboxAttr = 'checked';
                }

                if (!data.hasOwnProperty('additionalGreens') || !data.additionalGreens[cpi][i-1] || data.additionalGreens[cpi][i-1] == 0) {
                    addGreen = '<span class="add-green-value" data-stopline="' + data.id + '" data-phase="' + i + '"  data-value="0"></span>';
                } else {
                    var value = parseInt(data.additionalGreens[cpi][i-1]);
                    addGreen = '<span class="add-green-value" data-stopline="' + data.id + '" data-phase="' + i + '"  data-value="'+value+'">+'+value+'</span>';
                }

                link = '&nbsp;<a href="#" class="btn-edit-add-green" ' + checkboxAttr + '>' + addGreen + '&nbsp;<span class="caret"></span></a>';
                s = s +
                    '<td class="ph-td ph-col-' + i + ' ph-col-checkbox" '+checkboxAttr+'>' +
                    '<input type="checkbox" data-stopline="' + data.id + '" data-phase="' + i + '" '+checkboxAttr+'>' +
                    link + '</td>';
            }
            s = s + '</tr>';
            return s;
        },


        crossRoadTableDiagramRow: function(data, diagram){
            var s = '<tr class="stop-line-diagram-row" data-id="' + data.id + '">' +
                '<td class="ph-col-0 ph-col-stop-line-label">' + '<span class="stop-line-icon text-'+ data.color + '">' + data.icon + '</span>&nbsp;' + data.tag + '</td>' +
                '<td colspan="12">' +  this.signalBar(diagram, 'signals-bulk clearfix') + '</td></tr>';
            return s;
        },

        crossRoadTableDiagramRulerRow: function(diagram){
            return '<tr><td class="ph-col-0"></td><td colspan="12">' +  this.signalBar(diagram, 'signals-bulk clearfix') + '</td></tr>';
        },


        crossRoadTableTabRow: function(data) {
            return  '<tr><td colspan="13" class="td-hr"></td></tr>';
        },

        crossRoadTableDiagramErrorRow: function() {
            return  '<tr><td class="ph-col-0"></td><td colspan="12"><div class="alert alert-warning" role="alert">Длительность цикла и сумма длительностей фаз не равны!</div></td></tr>';
        },


        crossRoadPropsDiagramRow: function(diagram){
            return '<tr class="stop-line-diagram-row"><td>' +  this.signalBar(diagram, 'signals-bulk clearfix') + '</td></tr>';
        },

        crossRoadPropsSignalBars:    function(s){
            return '<h4>' + __('crossroad-diagrams') + '</h4>' +
                '<table width="100%" border="0" cellpadding="0" cellspacing="0" class="table table-phases" id="crossroad-props-table-diagrams">' +
                '<tbody>'+s+'</tbody>' +
                '</table>';
        },

        signalBar : function(data, cls){
            var w = 0.5;
            var className = cls == undefined ? '' : cls;
            var s = '<div class="signal-bar ' + className + '">';
            data.signals.forEach(function(v){
                var shortClass = v.length < 3 ? ' short' : '';
                w = 99.5 * v.length/data.cycleTime;
                s +='<div class="signal signal-' + v.color + shortClass + '" style="width:'+ w +'%"> ' +
                    (v.hasOwnProperty('label') ? v.label : (v.length)) +
                    ' </div>';
            });
            s += '</div>';
            return s;
        },

        chartPanel:             function(id){
            return '<canvas id="chart-panel" width="300" height="200"></canvas>';
        },
        nodeSearchListNotFound: function(data){
            return '<div class="node-search-not-found">' +
                '<i class="fa fa-search fa-3x"></i>' +
                '<div class="no-search-results">' +
                'No search results found' +
                '<p>«' + data + '»</p>' +
                '</div>' +
                '</div>';
        },
        nodeSearchListItem:     function(data, single){
            var c = data.color == undefined ? 'primary' : data.color;
            var singleClass = single == undefined ? '' : single;
            var icon = '';
            var tag = '';
            var name = '...';
            var grayType = '';

            if (data.type != 'crossRoad') {
                grayType = '    <div class="node-type">'+data.type+'</div>';
                icon = data.icon;
                tag = data.tag.length == 0 ? 'no-name' : data.tag;
                name =  data.name == undefined ? '(no parent)' : data.name;
            } else {
                icon = '<i class="fa fa-object-group"></i>';
                tag = 'crossroad';
                name =  data.name;
            }

            return  '<div class="node-list-item clearfix '+singleClass+'" data-id="' + data.id + '">' +
                '    <div class="node-avatar '+data.type+' text-' + c + '">' + icon + '</div>' +
                grayType +
                '    <div class="node-tag text-' + c + '">' + tag + '</div>' +
                '    <div class="node-parent-name">' + name + '</div>' +
                '</div>';
        },
        nodeCrossRoadProps:     function(data){
            var program = data.programs[data.currentProgram];
            var order = program.phasesOrders[program.currentOrder];
            return '<h4>' + __('crossroad-props') + '</h4>'+
                '<table class="table table-condensed  table-striped"><tbody>' +
                '<tr><td>' + __('name') + '</td>' +
                '    <td class="text-right">' + data.name + '</td><td class="measure-unit"></td></tr>' +

                '<tr><td>' + __('program') + '</td>' +
                '    <td class="text-right">' + program.name + '</td><td class="measure-unit"></td></tr>' +

                '<tr><td>' + __('offset') + '</td>' +
                '    <td class="text-right">' + program.offset + '</td><td class="measure-unit">' + __('sec') + '</td></tr>' +

                '<tr><td>' + __('phases-order') + '</td>' +
                '    <td class="text-right">' + order.name + ': ' + order.order.join(', ') + '</td><td class="measure-unit"></td></tr>' +

                '</tbody></table>';
        },
        nodeCommonProps:        function(data){
            var weight = data.weight == undefined ? 1 : data.weight ;
            var sign = data.constantIntensity > 0 ? '+' : '';
            var className = 'text-default';
            if (data.constantIntensity > 0) { className = 'text-success';}
            if (data.constantIntensity < 0) { className = 'text-danger';}

            return '<h4>' + __('node-props') + (data.tag ? (' ['+data.tag+']') : '') + '</h4>' +
                '<table class="table table-condensed table-striped"><tbody>' +
                '<tr><td>' + __('type') + '</td><td class="text-right">' + data.type + '</td><td class="measure-unit"></td></tr>' +
                '<tr><td>' + __('cycle-time') + '</td><td class="text-right">' + data.cycleTime + '</td><td class="measure-unit">' + __('sec') + '</td></tr>' +
                '<tr><td>' + __('full-capacity') + '</td><td class="text-right">' + data.capacity + '</td><td class="measure-unit">' + __('v_h') + '</td></tr>' +
                '<tr><td>' + __('full-intensity') + '</td><td class="text-right">' + data.avgIntensity + '</td><td class="measure-unit">' + __('v_h') + '</td></tr>' +
                '<tr><td>' + __('capacity-rate') + '</td><td class="text-right">' + (100*data.avgIntensity/data.capacity).toFixed(2) + '</td><td class="measure-unit">%</td></tr>' +
                '<tr><td>' + __('constant-comp-intensity') + '</td><td class="text-right"><span class="'+className+'">' + sign + data.constantIntensity + '</span></td><td class="measure-unit">' + __('v_h') + '</td></tr>' +
                '<tr><td>' + __('weight') + '</td><td class="text-right">' + weight + '</td><td class="measure-unit">' + __('unit') + '</td></tr>' +
                '</tbody></table>';
        },
        locateEditButtons:      function(data) {
            var cls = (data.type !== 'crossRoad') ? 'btn-edit-node' : 'btn-edit-cross-road';
            return '<hr><table><tr data-id="' + data.id + '"><td>' +
                '<button class="btn btn-default btn-pan-tonode"><i class="fa fa-crosshairs"></i> '+__('locate')+'</button>&nbsp;&nbsp;' +
                '<button class="btn btn-default ' + cls + '"><i class="fa fa-edit"></i> '+__('edit')+' <span class="caret"></span></button>' +
                '</td></tr></table>';
        },
        validationErrors:       function(data){
            var str = '';
            data.map(function(v){
                str += '<li><i class="fa fa-warning"></i> &nbsp;' + v + '</li>';
            });
            return '<hr><h4>' + __('validation-errors') + '</h4>' +
                '<ul class="node-error-list">' + str + '</ul>';
        },
        nodeModelingResults:    function(data){
            var con = data.isCongestion
                ? '<i class="fa fa-exclamation-circle text-danger"></i>'
                : '<i class="fa fa-check-circle text-success"></i>';

            var queueLimit = data.queueLimit
                ? data.queueLimit.toFixed(2) + ' / '
                : '- / ';

            var no = data.isCongestion ? '<span class="text-danger">' + __('congestion') : '<span class="text-success">' + __('no-congestion');
            return '<h4>' + __('modeling-results') + '</h4>' +
                '<table class="table table-condensed table-striped"><tbody>' +
                '    <tr><td>' + __('delay-model') + '</td><td class="text-right">'+data.delay.toFixed(2)+'</td><td class="measure-unit">' + __('veh_sec') + '</td></tr>' +
                '    <tr><td>' + __('delay') + '</td><td class="text-right">'+data.delayPerHour.toFixed(2)+'</td><td class="measure-unit">' + __('veh_h_h') + '</td></tr>' +
                '    <tr><td>' + __('delay-oversaturation') + '</td><td class="text-right">'+data.overSaturationDelay.toFixed(2)+'</td><td class="measure-unit">' + __('veh_h_h') + '</td></tr>' +
                '    <tr><td>' + __('green-saturation') + '</td><td class="text-right">'+data.greenSaturation.toFixed(2)+'</td><td class="measure-unit">%</td></tr>' +
                '    <tr><td>' + __('limit-max-queue') + '</td><td class="text-right">'+ queueLimit + data.maxQueue.toFixed(2) +'</td><td class="measure-unit">' + __('vehicle') + '</td></tr>' +
                '    <tr><td>' + __('sum-io-flow') + '</td><td class="text-right">'+data.sumInFlow.toFixed(2)+' / '+data.sumOutFlow.toFixed(2)+'</td><td class="measure-unit">' + __('vehicle') + '</td></tr>' +
                '    <tr><td>' + no + '</span></td><td class="text-right">'+con+'</td><td class="measure-unit"></td></tr>' +
                '</tbody></table>';
        },

        sumDelayStatus:         function(data, singleCrossroad){
            var descrSymbol = singleCrossroad ? '&#8983;' : '<sub>&sum;</sub>';
            return '<div class="summary-delay-info">' +
            ''+descrSymbol+'&nbsp;<i class="fa fa-car"></i><i class="fa fa-signal"></i>' +
            '    <strong class="text-primary">' + data.sumQueue.toFixed(0) + '</strong>' +
            '    <span class="text-muted">' + __('vehicle') + '</span>&nbsp;&nbsp;&nbsp;&nbsp;' +
            ''+descrSymbol+'&nbsp;<i class="fa fa-car"></i><i class="fa fa-hourglass-end"></i>' +
            '    <strong class="text-primary">'+data.sumDelay.toFixed(2)+'</strong>' +
            '    <span class="text-muted">' + __('veh_sec') + '</span> ' +
            '    / <strong class="text-primary">'+data.sumDelayPerHour.toFixed(2)+'</strong>' +
            '    <span class="text-muted">' + __('veh_h_h') + '</span> ' +
            '    / <strong class="text-primary">'+data.overSaturationDelay.toFixed(2)+'</strong>' +
            '    <span class="text-muted">' + __('veh_h_h') + '</span>' +
            '</div>';
        },


        modelRowMenu:function(data){
         return '<div class="btn-group">' +
                '<a type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                '    <i class="fa fa-cog"></i>' +
                '</a>' +
                '<ul class="dropdown-menu">' +
                '<li><a href="/app/'+data._id+'"><i class="fa fa-folder-open-o fa-fw"></i> &nbsp;'+__('open')+'</a></li>' +
                '<li><a href="/app/'+data._id+'" target="_blank"><i class="fa fa-folder-open fa-fw"></i> &nbsp;'+__('open-in-new-tab')+'</a></li>' +
                '<li><a href="#" class="btn-model-remove"><i class="fa fa-trash-o fa-fw"></i> &nbsp;'+__('remove')+'</a></li>' +
                //'<li><a href="#"><i class="fa fa-copy fa-fw"></i> &nbsp;Copy</a></li>' +
                //'<li><a href="#"><i class="fa fa-info fa-fw"></i> &nbsp;Model info</a></li>' +
                '</ul>' +
                '</div>';
        },

        modelEmptyListRow: function(state){
            return ' <tr>'+
                '    <td class="model-name-col text-center"> Model with name <span class="label label-default">' + state.text+ '</span> not found! </td>'+
                '</tr>';
        },

        modelListRow: function(data, state){
            var name =  data.name;
            if (state.text.length > 2) {
                name = name.replace(state.text, '<span class="label label-default">'+state.text+'</span>');
            }
            return ' <tr data-id="' + data._id + '">' +
                '    <td class="actions-col">'+ this.modelRowMenu(data) + '</td>'+
                '    <td class="model-name-col"><a href="/app/'+data._id+'">' + name + '</a></td>'+
                '    <td class="cycle-time-col text-right">' + data.cycleTime + ' <span>(sec)</span></td>'+
                '    <td class="property-col  text-right">' + data.crossCount + ' <span>(cross)</span> &nbsp;&nbsp; ' + data.nodeCount + ' <span>(nodes)</span></td>'+
                '    <td class="time-col text-right">' + new Date(data.updatedAt).toLocaleString() + '</td>'+
                '</tr>';
        },

        routesDropDouwnList: function(data){
            return data.map(function(route, inx){
                return '<li><a type="button" href="#" class="choose-route-link" data-inx="'+inx+'">'+route.routeName+'</a></li>';
            }).join('');
        },

        multiNodeEditForm: function(totalSelected){

            return '<h4>'+__('edit-selected-nodes')+' ('+totalSelected+')</h4>' +
            '<form class="form-horizontal" id="form-update-common-props">' +
                '<table class="table table-condensed table-striped table-multi-edit">' +
                '<tbody><tr>' +
                '    <td>'+__('full-capacity')+'</td>' +
                '    <td class="text-right"><input type="text" class="form-control input-multi-edit" id="input-node-capacity-multi" data-key="capacity" placeholder="1800"></td>' +
                '    <td class="measure-unit">'+__('v_h')+'</td>' +
                '</tr><tr>' +
                '    <td>'+__('full-intensity')+'</td>' +
                '    <td class="text-right"><input type="text" class="form-control input-multi-edit" id="input-node-intensity-multi" data-key="avgIntensity" placeholder="900"></td>' +
                '    <td class="measure-unit">'+__('v_h')+'</td>' +
                '</tr><tr>' +
                '    <td>'+__('queue-limit')+'</td>' +
                '    <td class="text-right"><input type="text" class="form-control input-multi-edit" id="input-node-queue-limit-multi" data-key="queueLimit" placeholder="10"></td>' +
                '    <td class="measure-unit">'+__('vehicle')+'</td>' +
                '</tr><tr>' +
                '    <td>'+__('weight')+'</td>' +
                '    <td class="text-right"><input type="text" class="form-control input-multi-edit" id="input-node-weight-limit-multi" data-key="weight" placeholder="10"></td>' +
                '    <td class="measure-unit">'+__('unit')+'</td>' +
                '</tr></tbody>' +
                '</table>' +
                '<button class="btn btn-primary btn-multi-edit-update" type="submit"><i class="fa fa-check"></i> '+__('update')+'</button>' +
            '</form>';
        },

        cycleGraphLegendTable: function(data){

            var row1 = '<td>Цикл</td>';
            var row2 = '<td>'+ data.cycleTime +'</td>';
            var row3 = '<td>'+ data.avgCycleSaturation.toFixed(3) +'</td>';

            data.phases.map(function(phase){
                row1 += '<td>'+ phase.tag +'</td>';
                row2 += '<td>'+ phase.length +'</td>';
                row3 += '<td>'+ phase.saturation.toFixed(3) +'</td>';
            });

            return  '<table class="table table-condensed table-striped table-cycle-graph-legend">' +
                '<tbody>' +
                '<tr><th>Название</th>'+row1+'</tr>' +
                '<tr><th>Длительность</th>'+row2+'</tr>' +
                '<tr><th>Мах. насыщенность</th>'+row3+'</tr>' +
                '</tbody>' +
                '</table>';
        }

    }
})(AvenueApp);


