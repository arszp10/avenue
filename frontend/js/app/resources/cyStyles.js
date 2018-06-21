(function(Resources){
    Resources.CyStyles = [
        {
            selector: 'node',
            css: {
                'content': 'data(icon)',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#ffffff',
                'border-color': '#777777',
                'color': '#2e6da4',
                'border-width': 0.5,
                'font-family': 'Avenue',
                'font-size': '20px',
                'font-weight':'normal',
                'min-zoomed-font-size':'8px'
            }
        },
        {
            selector: 'node[type="stopline"], node[type="pedestrian"]',
            css: {
                'content': 'data(icon)',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#4665b7',//'#eee',
                'border-color': '#fff',
                'color': '#fff',// '#2e6da4',
                'border-width': 1.5,
                'font-family': 'Avenue',
                'font-size': '22px',
                'font-weight':'normal',
                'min-zoomed-font-size':'8px',
                'shape': 'roundrectangle'
            }
        },

        {
            selector: 'node[tram]',
            css: {
                'content': 'data(icon)',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#777777',//'#eee',
                'border-color': '#333',
                'color': '#333',// '#2e6da4',
                'border-width': 1.5,
                'font-family': 'Avenue',
                'font-size': '22px'
            }
        },

        {
            selector: '$node > node',
            css: {
                'label': 'data(label)',
                'padding-top': '15px',
                'padding-left': '15px',
                'padding-bottom': '15px',
                'padding-right': '15px',
                'text-valign': 'top',
                'text-halign': 'center',
                'border-color': '#777777',
                'border-width': 0,
                'background-color': '#ffffff',
                'font-family': 'Arial',
                'shape': 'roundrectangle',
                'background-opacity': 0.6,
                'color': '#ffffff'
            }
        },
        {
            selector: '.has-error',
            css: {
                'border-color': '#d9534f',
                'color': '#d9534f',
                'background-color': '#fff',
                'border-width': 2.5
            }
        },
        {
            selector: 'node:selected',
            css: {
                'content': 'data(icon)',
                'background-color': '#333333',//'#cddc39',
                'border-color': '#ffffff',
                'color': '#ffffff',
                'border-width': 2
            }
        },
        {
            selector: 'node.has-error:selected',
            css: {
                'content': 'data(icon)',
                'background-color': '#d9534f',
                'border-color': '#ffffff',
                'color': '#ffffff',
                'border-width': 2
            }
        },
        {
            selector: '$node:selected > node',
            css: {
                'label': 'data(label)',
                'color': '#ffffff'
            }
        },

        {
            selector: 'node.green',
            css: {
                'content': 'data(icon)',
                //'background-color': '#4caf50',
                'background-color': 'data(hmcv)',//,'#4caf50', //'#2e6da4',
                'border-color': '#ffffff',
                'color': '#ffffff',
                'border-width': 2
            }
        },

        {
            selector: 'node[type="crossRoad"]',
            css: {
                'background-opacity': 0.3,
                'background-color': '#000',
                'font-family': 'Arial',
                'font-size': '14px'
            }
        },

        {
            selector: 'node[type="crossRoad"]:selected',
            css: {

                'background-color': '#000',
                'border-color': '#2e6da4',
                'color': '#ffffff',
                'border-width': 5
            }
        },
        {
            selector: 'edge',
            css: {
                'arrow-scale': 1.3,
                'curve-style': 'bezier',
                'width': 2,
                'target-arrow-shape': 'circle',
                'text-outline-color': '#999999',
                'line-color': '#999999',
                'target-arrow-color': '#999999',
                'font-size': '10px',
                'color': '#ffffff',
                'text-outline-width': 2,
                'edge-text-rotation': 'autorotate',
                'content': 'data(portion)',
                'min-zoomed-font-size':'8px'
            }
        },

        {
            selector: 'edge.carriageway-edge',
            css: {
                'target-arrow-shape': 'triangle-backcurve'
            }
        },
        {
            selector: 'edge[secondary="true"]',
            css: {
                'line-style': 'dashed',
                'text-outline-color': '#999999',
                'line-color': '#999999',
                'target-arrow-color': '#999999'
            }
        },

        {
            selector: 'edge[pedestrian]',
            css: {
                'target-arrow-shape': 'circle',
                'source-arrow-shape': 'none',
                'target-arrow-color': '#4665b7',
                //'target-arrow-color': '#999999',
                'arrow-scale': 0.2,
                'width': 20,
                'line-style': 'dashed',
                'text-outline-color': '#999999',
                'line-color': '#999999'
            }
        },

        {
            selector: 'edge[tram]',
            css: {
                'target-arrow-shape': 'circle',
                'source-arrow-shape': 'none',
                'target-arrow-color': '#333333',
                //'target-arrow-color': '#999999',
                'arrow-scale': 0.2,
                'width': 10,
                'line-style': 'dotted',
                'text-outline-color': '#333333',
                'line-color': '#333333'
            }
        },

        //{
        //    selector: 'edge[pedestrian].edge-in-crossroad',
        //    css: {
        //        'source-arrow-shape': 'circle'
        //    }
        //},

        {
            selector: 'edge:selected',
            css: {
                'width': 3,
                'line-color': '#333333',//'#cddc39', //'#2e6da4',
                'target-arrow-color':  '#333333',//'#cddc39', //'#2e6da4',
                'color': '#fff',
                'text-outline-color':  '#333333'//'#cddc39', //'#2e6da4'
            }
        },

        {
            selector: 'edge[pedestrian]:selected',
            css: {
                'width': 20,
                'text-outline-color': '#333333',
                'line-color': '#333333'
            }
        },

        {
            selector: 'edge.edge-in-flow',
            css: {
                'width': 3,
                'line-color': '#333333',
                'target-arrow-color': '#333333',
                'text-outline-color': '#333333'
            }
        },
        {
            selector: 'edge.edge-out-flow',
            css: {
                'width': 3,
                'line-color': '#337AB7',
                'target-arrow-color': '#337AB7',
                'text-outline-color': '#337AB7'
            }
        },


        {
            selector: 'edge[pedestrian].edge-out-flow, edge[pedestrian].edge-in-flow',
            css: {
                'width': 20
            }
        },


        {
            selector: '.edgehandles-hover',
            css: {
                'background-color': 'red'
            }
        },
        {
            selector: '.edgehandles-source',
            css: {
                'border-width': 2,
                'border-color': 'red'
            }
        },
        {
            selector: '.edgehandles-target',
            css: {
                'border-width': 2,
                'border-color': 'red'
            }
        },
        {
            selector: '.edgehandles-preview, .edgehandles-ghost-edge',
            css: {
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red'
            }
        },

        {
            selector: 'edge.green',
            css: {
                'arrow-scale': 0.7,
                'line-style': 'solid',
                'width': 'data(flowWidth)',
                'line-color': 'data(hmcv)',//,'#4caf50', //'#2e6da4',
                'target-arrow-color': 'data(hmcv)',//'#4caf50', //'#2e6da4',
                'target-arrow-shape': 'triangle',
                'color': '#fff',
                'text-outline-color': 'data(hmcv)',//'#4caf50', //'#2e6da4'
                'min-zoomed-font-size':'8px',
                'text-outline-width': 2,
                'opacity':1
            }
        },

        {
            selector: 'edge[pedestrian].green',
            css: {
                'arrow-scale': 0.2,
                'width': 20,
                'line-style': 'dashed',
                'target-arrow-color': '#4caf50',
                'color': '#fff',
                'text-outline-color': '#4caf50', //'#2e6da4'
                'line-color': '#4caf50'
            }
        },
        {
            selector: 'edge[secondary].green',
            css: {
                'line-style': 'dashed'
            }
        }

    ];
})(AvenueApp.Resources);
