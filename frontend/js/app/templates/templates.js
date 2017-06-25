(function(App){
    App.Templates = {
        crossRoadTablePhaseRow: function(data){
            var disAttr = '';
            var row0 = '', row1 = '', row2 = '', row3 = '';
            var l0, l1,l2, l3;
            for (var i = 1; i<= 8; i++){
                disAttr = '';
                if (data[i-1] === undefined) {
                    disAttr = 'disabled';
                    l0 = ''; l1 = ''; l2 = ''; l3 ='';
                } else {
                    l0 = data[i-1].tag;
                    l1 = data[i-1].length;
                    l2 = data[i-1].minLength;
                    l3 = data[i-1].intertact === undefined ? '' : data[i-1].intertact;
                }
                row0 = row0 + '<td class="ph-td ph-col-' + i + '"><input type="text" id="ph-tag-' + i + '" class="form-control input-sm" '+disAttr+' value="'+l0+'"></td>';
                row1 = row1 + '<td class="ph-td ph-col-' + i + '"><input type="text" id="ph-length-' + i + '" class="form-control input-sm" '+disAttr+' value="'+l1+'"></td>';
                row2 = row2 + '<td class="ph-td ph-col-' + i + '"><input type="text" id="ph-max-length-' + i + '" class="form-control input-sm" '+disAttr+' value="'+l2+'"></td>';
                row3 = row3 + '<td class="ph-td ph-col-' + i + '"><input type="text" id="ph-intertact-' + i + '" class="form-control input-sm" '+disAttr+' value="'+l3+'"></td>';
            }
            var s =
                '<tr><td class="col-sm-2 text-right"><label>Tag:</label></td>' + row0 + '</tr>' +
                '<tr><td class="col-sm-2 text-right"><label>Length:</label></td>' + row1 + '</tr>' +
                '<tr><td class="col-sm-2 text-right"><label>Minimal:</label></td>' +  row2 + '</tr>' +
                '<tr><td class="col-sm-2 text-right"><label>Intertact:</label></td>' +  row3 + '</tr>';
            return s;
        },
        crossRoadTableCheckRow: function(data){
            var checkboxAttr = '';
            var link = '';
            var addGreen = '';
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

                if (!data.hasOwnProperty('additionalGreens') || !data.additionalGreens[i-1] || data.additionalGreens[i-1] == 0) {
                    addGreen = '<span id="add-green-' + data.id + '-' + (i-1) + '" class="add-green-value" data-value="0"></span>';
                } else {
                    var value = parseInt(data.additionalGreens[i-1]);
                    addGreen = '<span id="add-green-' + data.id + '-' + (i-1) + '" class="add-green-value" data-value="'+value+'">+'+value+'</span>';
                }

                link = '&nbsp;<a href="#" class="btn-edit-add-green" '+checkboxAttr+'>'+addGreen+'&nbsp;<span class="caret"></span></a>';
                s = s + '<td class="ph-td ph-col-' + i + ' ph-col-checkbox"><input type="checkbox" '+checkboxAttr+'>' + link + '</td>';
            }
            s = s + '</tr>';
            return s;
        },
        crossRoadSignalBars:    function(data){
            var cycleTime = data.cycleTime;
            var s = '';
            data.bars.forEach(function(v){
                v.cycleTime = cycleTime;
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
                w = 100* v.length/data.cycleTime;
                s +='<div class="signal signal-' + v.color + '" style="width:'+ w +'%"></div>';
            });
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
            var sign = data.constantIntensity > 0 ? '+' : '';
            var className = 'text-default';
            if (data.constantIntensity > 0) { className = 'text-success';}
            if (data.constantIntensity < 0) { className = 'text-danger';}

            return '<table class="table table-condensed table-striped">' +
                '<tbody><tr>' +
                '    <td>Capacity</td>' +
                '    <td class="text-right">' + data.capacity + '</td><td class="measure-unit">v/h</td>' +
                '</tr><tr>' +
                '    <td>Intensity</td>' +
                '    <td class="text-right">' + data.avgIntensity + '</td><td class="measure-unit">v/h</td>' +
                '</tr><tr>' +
                '    <td>Constant comp. of intensity</td>' +
                '    <td class="text-right"><span class="'+className+'">' + sign + data.constantIntensity + '</span></td><td class="measure-unit">v/h</td>' +
                '</tr></tbody>' +
                '</table>';
        },
        locateEditButtons:      function(data) {
            var cls = (data.type !== 'crossRoad') ? 'btn-edit-node' : 'btn-edit-cross-road';
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

            var queueLimit = data.queueLimit
                ? data.queueLimit.toFixed(2) + ' / '
                : 'unlimited / ';

            var no = data.isCongestion ? '<span class="text-danger">C': '<span class="text-success">No c';
            return '<hr><h4>Modeling results</h4>' +
                '<table class="table table-condensed table-striped"><tbody>' +
                '    <tr>' +
                '        <td>Delay</td><td class="text-right">'+data.delay.toFixed(2)+'</td><td class="measure-unit">veh*sec</td>' +
                '    </tr><tr>' +
                '        <td>Green saturation</td><td class="text-right">'+data.greenSaturation.toFixed(2)+'</td><td class="measure-unit">%</td>' +
                '    </tr><tr>' +
                '        <td>Limit / Max. queue</td><td class="text-right">'+ queueLimit + data.maxQueue.toFixed(2) +'</td><td class="measure-unit">vehicle</td>' +
                '    </tr><tr>' +
                '        <td>Sum I/O flow</td><td class="text-right">'+data.sumInFlow.toFixed(2)+' / '+data.sumOutFlow.toFixed(2)+'</td><td class="measure-unit">vehicle</td>' +
                '    </tr><tr>' +
                '        <td>' + no + 'ongestion</span></td><td class="text-right">'+con+'</td><td class="measure-unit"></td>' +
                '    </tr></tbody>' +
                '</table>';
        },
        sumDelayStatus:         function(delay){
            return '&sum; delay<sub><i>i</i></sub> = <strong class="text-primary">'+delay.toFixed(2)+'</strong>&nbsp;<span class="text-muted">veh*sec</span>';
        },


        modelRowMenu:function(data){
         return '<div class="btn-group">' +
                '<a type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                '    <i class="fa fa-cog"></i>' +
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

            return '<h4>Edit selected nodes ('+totalSelected+')</h4>' +
            '<form class="form-horizontal">' +
                '<table class="table table-condensed table-striped table-multi-edit">' +
                '<tbody><tr>' +
                '    <td>Capacity</td>' +
                '    <td class="text-right"><input type="text" class="form-control input-multi-edit" id="input-node-capacity-multi" placeholder="Exm. 1800"></td>' +
                '    <td class="measure-unit">v/h</td>' +
                '</tr><tr>' +
                '    <td>Intensity</td>' +
                '    <td class="text-right"><input type="text" class="form-control input-multi-edit" id="input-node-intensity-multi" placeholder="Exm. 900"></td>' +
                '    <td class="measure-unit">v/h</td>' +
                '</tr><tr>' +
                '    <td>Queue limit</td>' +
                '    <td class="text-right"><input type="text" class="form-control input-multi-edit" id="input-node-queue-limit-multi" placeholder="Exm. 10"></td>' +
                '    <td class="measure-unit">veh</td>' +
                '</tr><tr>' +
                '    <td>Weight</td>' +
                '    <td class="text-right"><input type="text" class="form-control input-multi-edit" id="input-node-weight-limit-multi" placeholder="Exm. 10"></td>' +
                '    <td class="measure-unit">unit</td>' +
                '</tr></tbody>' +
                '</table>' +
                '<button class="btn btn-primary btn-multi-edit-update" type="submit"><i class="fa fa-check"></i> Update</button>' +
            '</form>';
        }


    }
})(AvenueApp);


