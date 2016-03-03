var htmlTemplates = {
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
    chartPanel: function(data){
        return '<div class="chart-panel visible-network">' +
            '<div class="chart-panel-head">' +
                '<i class="fa fa-reorder fa-2x"></i>' +
                '<a class="btn-chart-close" href="#"><i class="fa fa-close fa-2x"></i></a>' +
            '</div>' +
            '<div id="' + data + '" class="ct-chart"></div></div>';
    }

};