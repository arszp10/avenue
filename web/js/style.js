var vizmap = [{
    "title": "default",
    "style": [
        {
            selector: 'node',
            css: {
                'content': 'data(icon)',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#ffffff',
                'border-color': '#999999',
                'color': '#2e6da4',
                'border-width': 0.5,
                'font-family': 'FontAwesome',
                'font-size': '14px',
                'font-weight':'normal'

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
            selector: 'node[type="bottleneck"]',
            css: {
                'transform': 'rotate(270deg)'
            }
        },

        {
            selector: 'edge',
            css: {
                'target-arrow-shape': 'triangle',
                'text-outline-color': '#999999',
                'font-size': '10px',
                'color': '#ffffff',
                'text-outline-width': 2,
                'edge-text-rotation': 'autorotate',
                'content': 'data(portion)'
            }
        },
        {
            selector: 'edge:selected',
            css: {
                'width': 2,
                'line-color': '#2e6da4',
                'target-arrow-color': '#2e6da4',
                'color': '#2e6da4'
            }
        },

        // some style for the ext

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
    ]
}];
