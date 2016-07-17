(function(App){
    App.Templates = {
        crossRoadTablePhaseRow: function(data){
            var disAttr = '';
            var row0 = '', row1 = '', row2 = '';
            var l0, l1,l2;
            for (var i = 1; i<= 8; i++){
                disAttr = '';
                if (data[i-1] === undefined) {
                    disAttr = 'disabled';
                    l0 = ''; l1 = ''; l2 = '';
                } else {
                    l0 = data[i-1].tag;
                    l1 = data[i-1].length;
                    l2 = data[i-1].minLength;
                }
                row0 = row0 + '<td class="ph-td ph-col-' + i + '"><input type="text" id="ph-tag-' + i + '" class="form-control input-sm" '+disAttr+' value="'+l0+'"></td>';
                row1 = row1 + '<td class="ph-td ph-col-' + i + '"><input type="text" id="ph-length-' + i + '" class="form-control input-sm" '+disAttr+' value="'+l1+'"></td>';
                row2 = row2 + '<td class="ph-td ph-col-' + i + '"><input type="text" id="ph-max-length-' + i + '" class="form-control input-sm" '+disAttr+' value="'+l2+'"></td>';
            }
            var s =
                '<tr><td class="col-sm-2 text-right"><label>Tag:</label></td>' + row0 + '</tr>' +
                '<tr><td class="col-sm-2 text-right"><label>Length:</label></td>' + row1 + '</tr>' +
                '<tr><td class="col-sm-2 text-right"><label>Minimal:</label></td>' +  row2 + '</tr>';
            return s;
        },
        crossRoadTableCheckRow: function(data){
            var checkboxAttr = '';
            var s = '<tr class="stop-line-row" data-id="' + data.id + '">' +
                '<td class="col-sm-2 text-right">' +
                '<button type="button" class="btn btn-sm btn-stop-line btn-' + data.color + '"><span class="stop-line-icon">' + data.icon + '</span>&nbsp;' + data.tag + '</button></td>';
            for (var i = 1; i<= 8; i++){
                checkboxAttr = '';
                if (data.greenPhases[i-1] === true) {
                    checkboxAttr = 'checked';
                }
                if (data.greenPhases[i-1] === undefined) {
                    checkboxAttr = 'disabled';
                }
                s = s + '<td class="ph-td ph-col-' + i + '"><input type="checkbox" '+checkboxAttr+'></td>';
            }
            s = s + '</tr>';
            return s;
        },
        crossRoadSignalBars:    function(data){
            var cycleLength = data.cycleLength;
            var s = '';
            data.bars.forEach(function(v){
                v.cycleLength = cycleLength;
                s += '<tr><td class="stop-line-td-label text-'+ v.node.color +'"><span class="stop-line-icon">' + v.node.icon + '</span> '+v.node.tag +'&nbsp;</td>';
                s += '<td>'+ this.signalBar(v, 'signals-bulk clearfix')+'</td></tr>';

            }, this);
            return '<h4>Diagrams</h4>' +
                '<table><tbody>' + s + '</tbody></table><hr>';
        },
        signalBar :             function(data, cls){
            var w = 0.5;
            var className = cls == undefined ? '' : cls;
            var s = '<div class="signal-bar ' + className + '">';
            data.signals.forEach(function(v){
                w = 100* v.length/data.cycleLength;
                s +='<div class="signal signal-' + v.color + '" style="width:'+ w +'%"></div>';
            })
            s += '</div>';
            return s;
        },
        chartPanel:             function(id){
            return '<canvas id="chart-panel" width="320" height="200"></canvas>';
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

            if (data.type != 'intersection') {
                grayType = '<div class="node-type">' + data.type + '</div>';
                icon     = data.icon;
                tag      = data.tag.length == 0 ? 'no-name' : data.tag;
                name     = data.name == undefined ? '(no parent)' : data.name;
            } else {
                icon = '<i class="fa fa-object-group"></i>';
                tag  = 'intersection';
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
            return '<table class="table table-condensed">' +
                '<tbody><tr>' +
                '    <td>Phases count</td>' +
                '    <td class="text-right">' + data.phases.length + '</td><td class="measure-unit"></td>' +
                '</tr><tr>' +
                '    <td>Offset</td>' +
                '    <td class="text-right">' + data.offset + '</td><td class="measure-unit">sec</td>' +
                '</tr></tbody>' +
                '</table>';
        },
        nodeCommonProps:        function(data){
            var sign = data.constantFlowRate > 0 ? '+' : '';
            var className = 'text-default';
            if (data.constantFlowRate > 0) { className = 'text-success';}
            if (data.constantFlowRate < 0) { className = 'text-danger';}

            return '<table class="table table-condensed table-striped">' +
                '<tbody><tr>' +
                '    <td>Saturation flow rate</td>' +
                '    <td class="text-right">' + data.saturationFlowRate + '</td><td class="measure-unit">v/h</td>' +
                '</tr><tr>' +
                '    <td>Flow rate</td>' +
                '    <td class="text-right">' + data.flowRate + '</td><td class="measure-unit">v/h</td>' +
                '</tr><tr>' +
                '    <td>Constant flow rate</td>' +
                '    <td class="text-right"><span class="'+className+'">' + sign + data.constantFlowRate + '</span></td><td class="measure-unit">v/h</td>' +
                '</tr></tbody>' +
                '</table>';
        },
        locateEditButtons:      function(data) {
            var cls = (data.type !== 'intersection') ? 'btn-edit-node' : 'btn-edit-cross-road';
            return '<table><tr data-id="' + data.id + '"><td>' +
                '<button class="btn btn-default btn-pan-tonode"><i class="fa fa-crosshairs"></i> Locate</button>&nbsp;&nbsp;' +
                '<button class="btn btn-default ' + cls + '"><i class="fa fa-edit"></i> Edit <span class="caret"></span></button>' +
                '</td></tr></table>';
        },
        validationErrors:       function(data){
            var str = '';
            data.map(function(v){
                str += '<li><i class="fa fa-warning"></i> &nbsp;' + v + '</li>';
            });
            return '<hr><h4>Validation errors</h4>' +
                '<ul class="node-error-list">' + str + '</ul>';
        },
        nodeModelingResults:    function(data){
            var con = data.isCongestion
                ? '<i class="fa fa-exclamation-circle text-danger"></i>'
                : '<i class="fa fa-check-circle text-success"></i>';

            var no = data.isCongestion ? '<span class="text-danger">C': '<span class="text-success">No c';
            return '<hr><h4>Simulation results</h4>' +
                '<table class="table table-condensed table-striped"><tbody>' +
                '    <tr>' +
                '        <td>Delay</td><td class="text-right">'+data.delay.toFixed(2)+'</td><td class="measure-unit">v*h/h</td>' +
                '    </tr><tr>' +
                '        <td>Max queue</td><td class="text-right">'+data.maxQueue.toFixed(2)+'</td><td class="measure-unit">vehicle</td>' +
                '    </tr><tr>' +
                '        <td>Green saturation</td><td class="text-right">'+data.greenSaturation.toFixed(2)+'</td><td class="measure-unit">%</td>' +
                '    </tr><tr>' +
                '        <td>Sum I/O flow</td><td class="text-right">'+data.sumInFlow.toFixed(2)+' / '+data.sumOutFlow.toFixed(2)+'</td><td class="measure-unit">vehicle</td>' +
                '    </tr><tr>' +
                '        <td>' + no + 'ongestion</span></td><td class="text-right">'+con+'</td><td class="measure-unit"></td>' +
                '    </tr></tbody>' +
                '</table>';
        },
        sumDelayStatus:         function(delay){
            return '&sum; delay<sub><i>i</i></sub> = <strong class="text-primary">'+delay.toFixed(2)+'</strong>&nbsp;<span class="text-muted">v*h/h</span>';
        },


        modelRowMenu:function(data){
         return '<div class="btn-group">' +
                '<a type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                '    <i class="fa fa-ellipsis-v"></i>' +
                '</a>' +
                '<ul class="dropdown-menu">' +
                '<li><a href="/app/'+data._id+'"><i class="fa fa-folder-open-o fa-fw"></i> &nbsp;Open</a></li>' +
                '<li><a href="/app/'+data._id+'" target="_blank"><i class="fa fa-folder-open fa-fw"></i> &nbsp;Open in new Tab</a></li>' +
                '<li><a href="#" class="btn-model-remove"><i class="fa fa-trash-o fa-fw"></i> &nbsp;Remove</a></li>' +
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
                '    <td class="cycle-time-col text-right">' + data.cycleLength + ' <span>(sec)</span></td>'+
                '    <td class="property-col  text-right">' + data.crossCount + ' <span>(cross)</span> &nbsp;&nbsp; ' + data.nodeCount + ' <span>(nodes)</span></td>'+
                '    <td class="time-col text-right">' + new Date(data.updatedAt).toLocaleString() + '</td>'+
                '</tr>';
        },

        routesDropDouwnList: function(data){
            return data.map(function(route, inx){
                return '<li><a type="button" href="#" class="choose-route-link" data-inx="'+inx+'">'+route.routeName+'</a></li>';
            }).join('');
        }


    }
})(AvenueApp);


