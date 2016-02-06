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
                'target-arrow-shape': 'triangle'
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
