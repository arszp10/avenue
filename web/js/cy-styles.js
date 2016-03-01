var cystyles = [
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
        selector: 'node[color="danger"]',
        css: {
            'color': '#d9534f'
        }
    },
    {
        selector: 'node[color="success"]',
        css: {
            'color': '#5cb85c'
        }
    },
    {
        selector: 'node[color="info"]',
        css: {
            'color': '#5bc0de'
        }
    },
    {
        selector: 'node[color="default"]',
        css: {
            'color': '#777'
        }
    },
    {
        selector: 'node[color="warning"]',
        css: {
            'color': '#f0ad4e'
        }
    },
    {
        selector: 'node[color="primary"]',
        css: {
            'color': '#337ab7'
        }
    },
    {
        selector: '$node > node',
        css: {
            'shape':'roundrectangle',
            'padding-top': '15px',
            'padding-left': '15px',
            'padding-bottom': '15px',
            'padding-right': '15px',
            'border-radius': '5px',
            'text-valign': 'center',
            'text-halign': 'center',
            'border-color': '#777777',
            'background-color': '#ffffff',
            'font-family': 'Arial'
        }
    },

    {
        selector: 'node:selected',
        css: {
            'content': 'data(icon)',
            'background-color': '#2e6da4',
            'border-color': '#ffffff',
            'color': '#ffffff',
            'border-width': 2
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
        selector: 'edge',
        css: {
            'target-arrow-shape': 'triangle',
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
            'line-style': 'dotted',
            'text-outline-color': '#cccccc',
            'line-color': '#cccccc',
            'target-arrow-color': '#cccccc'
        }
    },

    {
        selector: 'edge[secondary="true"]',
        css: {
            'line-style': 'dashed',
            'text-outline-color': '#cccccc',
            'line-color': '#cccccc',
            'target-arrow-color': '#cccccc'
        }
    },

    {
        selector: 'edge:selected',
        css: {
            'width': 2,
            'line-color': '#2e6da4',
            'target-arrow-color': '#2e6da4',
            'color': '#ffffff',
            'text-outline-color': '#2e6da4'
        }
    },

    {
        selector: 'edge.edge-in-flow',
        css: {
            'line-color': 'red',
            'target-arrow-color': 'red',
            'text-outline-color': 'red'
        }
    },

    {
        selector: 'edge.edge-out-flow',
        css: {
            'line-color': '#00B000',
            'target-arrow-color': '#00B000',
            'text-outline-color': '#00B000'
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
