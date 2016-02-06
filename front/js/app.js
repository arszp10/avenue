var state = {
    select: true
}

$(document).ready(function() {

    $(".btn-group > .btn").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
    });

    $(".btn-select-mode").click(function(){
        state.select = true;
    });
    $(".btn-add-mode").click(function(){
        state.select = false;
    });

    var $cy = $("#cy");
    console.log('document');
    $cy.cytoscape({
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
            var cy = this;

            cy.edgehandles({
                // options go here
            });

            cy.panzoom({
                // options here...
            });

            cy.on('tap', function(e) {
                if (state.select) {
                    return true;
                }
                if(e.cyTarget === cy) {
                    var idNum = cy.nodes().size();
                    setID = idNum.toString();
                    offset = $cy.offset();
                    position = {
                        x: e.originalEvent.pageX - offset.left,
                        y: e.originalEvent.pageY - offset.top
                    };
                    cy.add([{group: "nodes",
                        data: {"id": "n" + setID,
                            "resources": [],
                            "properties": []
                        },
                        renderedPosition: {x: position.x,
                            y: position.y
                        },
                    }]); // cy.add
                } // cyTarget === cy
            }); // cy.on
        }
    });

});
