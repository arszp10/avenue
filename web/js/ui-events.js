var uievents = {
    init: function(){

        $(document).on('keyup', function(event){
            if (event.which == 46 || event.which == 8){
                app.buttons.btnDeleteNode.click();
            };
        });

        app.buttons.btnPanMode.click(this.paletteClick);
        app.buttons.btnSelectMode.click(this.paletteClick);
        app.buttons.btnAddStopline.click(this.paletteClick);
        app.buttons.btnAddCarriageway.click(this.paletteClick);
        app.buttons.btnAddFork.click(this.paletteClick);
        app.buttons.btnAddMerge.click(this.paletteClick);
        app.buttons.btnAddBottleneck.click(this.paletteClick);
        app.buttons.btnAddConcurrent.click(this.paletteClick);

        app.buttons.btnDeleteNode.click(function(){
            app.cy.$(':selected').remove();
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

        app.buttons.btnCopy.click(function(){
            app.clipboard = app.cy.$(':selected').clone();
        });

        app.buttons.btnPaste.click(function(){
            if (app.clipboard == null) {
                return;
            }

            $.each($.extend({},app.clipboard), function(inx, elem){
                if(elem.isNode()) {
                    var pos = {
                        x: elem.position('x') + 10,
                        y: elem.position('y') + 10
                    };
                    app.actions._addNode(elem.data(), pos);
                } else {

                    app.cy.add(elem.data('id', app.cy.edges().size().toString()));
                }
            });
        });

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
                labels: settings.chart.labels(app.state.lastCalc[id].flow.cicleTime),
                series: [
                    app.state.lastCalc[id].flow.inFlow,
                    app.state.lastCalc[id].flow.outFlow
                ]
            }, settings.chart.defaults );

            $('.chart-panel').drag();
        });


    },
    paletteClick: function(){
        var $this = $(this);
        $this.closest('.btn-group').find('.active').removeClass("active");
        $this.addClass("active");
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


