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
                'font-size': '12px'

            }
        },
        {
            selector: '$node > node',
            css: {
                'padding-top': '10px',
                'padding-left': '10px',
                'padding-bottom': '10px',
                'padding-right': '10px',
                'text-valign': 'top',
                'text-halign': 'center',
                'background-color': '#f5fff5'
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
                'target-arrow-color': 'red'
            }
        },

        {
            selector: 'edge.edge-out-flow',
            css: {
                'line-color': '#00B000',
                'target-arrow-color': '#00B000'
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
