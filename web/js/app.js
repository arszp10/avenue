

var app = {
    $cy: null,
    $source: null,
    cy: null,
    state: {
        clickMode: 'select-mode', // select, add-stopline, ... add-concurrent
        nodeIcon: ''
    },
    clipboard: null,
    buttons: {
        palette: {
            btnPanMode:      null,
            btnSelectMode:      null,
            btnAddStopline:     null,
            btnAddCarriageway:  null,
            btnAddFork:         null,
            btnAddMerge:        null,
            btnAddBottleneck:   null,
            btnAddConcurrent:   null
        },
        actions: {
            btnDeleteNode: null
        },
        align: {
            btnHorizontalAlign: null,
            btnVeerticalAlign: null
        },
        operate:{
            btnCopy: null,
            btnPaste: null
        },
        tabs:{
            btnShowNetwork: null,
            btnShowSource: null
        }

    },
    actions: {
        init: function(){
            var palette = app.buttons.palette;
            var actions = app.buttons.actions;
            var align = app.buttons.align;
            var operate = app.buttons.operate;
            var tabs = app.buttons.tabs;

            palette.btnSelectMode =      $('#btn-now-select-mode');
            palette.btnPanMode =         $('#btn-now-pan-mode');
            palette.btnAddStopline =     $('#btn-add-stopline');
            palette.btnAddCarriageway =  $('#btn-add-carriageway');
            palette.btnAddFork =         $('#btn-add-fork');
            palette.btnAddMerge =        $('#btn-add-merge');
            palette.btnAddBottleneck =   $('#btn-add-bottleneck');
            palette.btnAddConcurrent =   $('#btn-add-concurrent');

            actions.btnDeleteNode =      $('#btn-delete-node');

            align.btnHorizontalAlign =   $('#btn-horizontal-align');
            align.btnVerticalAlign =   $('#btn-vertical-align');

            operate.btnCopy = $('#btn-copy');
            operate.btnPaste = $('#btn-paste');

            tabs.btnShowNetwork = $('#btn-show-network');
            tabs.btbtnShowSource = $('#btn-show-source');

            $('div.palette').on('click', 'button', function(){
                var $this = $(this);
                $this.closest('.btn-group').find('.active').removeClass("active");
                $this.addClass("active");
                if ($this.attr('id') == palette.btnSelectMode.attr('id')) {
                    app.cy.boxSelectionEnabled(true);
                    app.cy.userPanningEnabled(false);
                }
                if ($this.attr('id') == palette.btnPanMode.attr('id')) {
                    app.cy.boxSelectionEnabled(false);
                    app.cy.userPanningEnabled(true);
                }
                app.state.clickMode = String($this.attr('id')).substring(8);
                app.state.nodeIcon = $this.text();
            });

            actions.btnDeleteNode.click(function(){
                app.cy.$(':selected').remove();
            });

            $(document).on('keyup', function(event){
                if (event.which == 46 || event.which == 8){
                    actions.btnDeleteNode.click();
                };
            })


            align.btnHorizontalAlign.click(function(){
                var nodes = app.cy.$('node:selected');
                if (nodes.length == 0) {
                    return;
                }
                app.cy.$('node:selected').position('y', nodes[0].position('y'));
            });

            align.btnVerticalAlign.click(function(){
                var nodes = app.cy.$('node:selected');
                if (nodes.length == 0) {
                    return;
                }
                app.cy.$('node:selected').position('x', nodes[0].position('x'));
            });


            operate.btnCopy.click(function(){
                app.clipboard = app.cy.$(':selected').clone();
            });

            operate.btnPaste.click(function(){
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

            tabs.btnShowNetwork.click(function(){
                tabs.btnShowNetwork.parent().siblings().removeClass('active');
                tabs.btnShowNetwork.parent().addClass('active');
                app.cy.elements().remove();
                app.cy.add(JSON.parse(editor.getValue()))
                app.$source.hide();
                app.$cy.show();
                $('div.left-panel').show();
            });

            tabs.btbtnShowSource.click(function(){
                tabs.btbtnShowSource.parent().siblings().removeClass('active');
                tabs.btbtnShowSource.parent().addClass('active');

                editor.setValue(JSON.stringify(app.cy.elements().jsons(), 4,' '));
                app.$source.show();
                app.$cy.hide();
                $('div.left-panel').hide();
            });


        },

        nextId: function(){
            var idNum = app.cy.nodes().size();
            return "ID" + idNum.toString();
        },

        _addNode:function(data, pos){
            var d = $.extend({}, data, {
                "resources": [],
                "properties": []
            }, {id: app.actions.nextId()});

            console.log(d);
            app.cy.add([{group: "nodes",
                data: d,
                renderedPosition: pos
            }]);
        },

        addNode: function(e){
            if (app.state.clickMode == 'select-mode' || app.state.clickMode == 'pan-mode') {
                return true;
            }
            if(e.cyTarget !== app.cy) {
                return
            }
            var idNum = app.cy.nodes().size();
            setID = idNum.toString();
            offset = app.$cy.offset();
            position = {
                x: e.originalEvent.pageX - offset.left,
                y: e.originalEvent.pageY - offset.top
            };
            app.actions._addNode({name:'', icon:app.state.nodeIcon}, position);

        }
    }
};

$(document).ready(function() {

    app.$cy = $("#cy");
    app.$source = $("#source");
    app.actions.init();
    app.$cy.cytoscape({
        boxSelectionEnabled:true,
        userPanningEnabled:false,
        elements: [],
        style: vizmap[0].style,
        showOverlay: false,
        minZoom: 0.1,
        maxZoom: 4.0,
        layout: {
            name: 'preset',
            fit: true
        },
        ready: function() {
            app.cy = this;
            app.cy.edgehandles({});
            app.cy.panzoom({});
            app.cy.on('tap', app.actions.addNode);
        }
    });

});
