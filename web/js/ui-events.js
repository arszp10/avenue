var uievents = {
    init: function(){

        $(document).on('keyup', function(event){
            if (event.which == 46 || event.which == 8){
                app.buttons.btnDeleteNode.click();
            };

            if (event.which == 142 || event.which == 116){
                $('#btn-calc').click();
            };

        });

        app.buttons.btnPanMode.click(this.paletteClick);
        app.buttons.btnSelectMode.click(this.paletteClick);
        app.buttons.btnAddStopline.click(this.paletteClick);
        app.buttons.btnAddCarriageway.click(this.paletteClick);
        app.buttons.btnAddPoint.click(this.paletteClick);
        app.buttons.btnAddBottleneck.click(this.paletteClick);
        app.buttons.btnAddConcurrent.click(this.paletteClick);

        app.buttons.btnDeleteNode.click(function(){
            app.cy.$(':selected').remove();
        });

        app.buttons.btnGroupNodes.click(function(){
            var parentId = app.actions.addNode(settings.crossRoad);
            var data = app.cy.elements().jsons();

            $.each(data, function(inx, e){
               if (!(e.group =='nodes' && e.selected)) {
                   return;
               }
                e.data['parent'] = parentId;
            });
            app.cy.elements().remove();
            app.cy.add(data);
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
                } else {
                  //  delete elem.data.id;
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
            $.each(jsons, function(inx, elem){
               if(elem.group == 'edges') {
                   delete elem.data.id;
               }
               app.cy.add(elem);
            });
        });

        $(document).bind('copy', function(){app.buttons.btnCopy.click();});
        $(document).bind('paste', function(){app.buttons.btnPaste.click();});
        $(document).bind('cut', function(){app.buttons.btnCut.click();});


        app.buttons.btnShowNetwork.click(function(){
            app.buttons.btnShowNetwork.parent().siblings().removeClass('active');
            app.buttons.btnShowNetwork.parent().addClass('active');
            app.cy.elements().remove();
            app.cy.add(JSON.parse(editor.getValue()))
            app.$source.hide();
            app.$cy.show();
            app.panels.leftPanel.show();
            //app.panels.navigator.show();
            return false;
        });

        app.buttons.btnShowSource.click(function(){
            app.buttons.btnShowSource.parent().siblings().removeClass('active');
            app.buttons.btnShowSource.parent().addClass('active');

            editor.setValue(JSON.stringify(app.cy.elements().jsons(), 4,' '));
            app.$source.show();
            app.$cy.hide();
            app.panels.leftPanel.hide();
            //app.panels.navigator.hide();
            return false;
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
            var chartPanel = '<div class="chart-panel"><div class="chart-panel-head"><i class="fa fa-reorder fa-2x"></i><a class="btn-chart-close" href="#"><i class="fa fa-close fa-2x"></i></a></div>' +
                              '<div id="' + chartId +'" class="ct-chart"></div></div>';

            $('body > div #' + chartId).parent().remove();
            $('body > div').append(chartPanel);

            new Chartist.Line('#'+chartId, {
                labels: settings.chart.labels(app.state.lastCalc[id].cicleTime),
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
            event.stopPropagation();
        });

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
                    .removeClass('fa fa-circle-thin fa-exchange fa-filter fa-random fa-ellipsis-v')
                    .addClass($this.find('i').attr('class'));
                ;
        } else {
            $this.addClass("active");
        }

        console.log();
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
    }
};



/*

*/


