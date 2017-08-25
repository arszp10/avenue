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
                'font-family': 'FontAwesome',
                'font-size': '14px',
                'font-weight':'normal',
                'min-zoomed-font-size':'8px'
            }
        },
        {
            selector: 'node[type="stopline"]',
            css: {
                'content': 'data(icon)',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#4665b7',//'#eee',
                'border-color': '#fff',
                'color': '#fff',// '#2e6da4',
                'border-width': 1.5,
                'font-family': 'Avenue',
                'font-size': '20px',
                'font-weight':'normal',
                'min-zoomed-font-size':'8px',
                'shape': 'roundrectangle'
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
            selector: 'node[type="crossRoad"]',
            css: {
                'font-family': 'Arial',
                'font-size': '14px'
            }
        },

        {
            selector: 'node[type="crossRoad"]:selected',
            css: {
                'background-color': '#2e6da4',
                'border-color': '#ffffff',
                'color': '#ffffff',
                'border-width': 2
            }
        },
        {
            selector: 'edge',
            css: {
                'arrow-scale': 1.3,
                'curve-style': 'bezier',
                'width': 1,
                'target-arrow-shape': 'triangle-backcurve',
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
            selector: 'edge.edge-in-crossroad',
            css: {
                //'line-style': 'dotted',
                'text-outline-color': '#999999',
                'line-color': '#999999',
                'target-arrow-color': '#999999'
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
            selector: 'edge:selected',
            css: {
                'width': 3,
                'line-color': '#333333',//'#cddc39', //'#2e6da4',
                'target-arrow-color':  '#333333',//'#cddc39', //'#2e6da4',
                'color': '#fff',
                'text-outline-color':  '#333333',//'#cddc39', //'#2e6da4'
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
        }
    ];
})(AvenueApp.Resources);
