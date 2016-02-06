var vizmap = [{
    "title": "default",
    "style": [
        {
            selector: 'node',
            css: {
                'content': 'data(name)'
            }
        },
        {
            selector: 'node:selected',
            css: {
                'content': 'data(name)',
                'background-color': '#005599'
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
                'line-color': '#005599',
                'target-arrow-color': '#005599',
                'source-arrow-color': '#005599',
                'color': '#005599'
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
