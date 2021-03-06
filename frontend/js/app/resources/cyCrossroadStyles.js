(function(Resources){
    Resources.CyCrossroadStyles = [
        {
            selector: 'node',
            css: {
                'content': 'data(icon)',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#ffffff',
                'border-color': '#999',
                'color': '#fff',
                'border-width': 0.5,
                'font-size': '6px',
                'font-family': 'Avenue',
                'font-weight':'normal',
                'min-zoomed-font-size':'8px',
                'width':'8px',
                'height':'8px'
            }
        },
        {
            selector: 'node[type="stopline"], node[type="pedestrian"]',
            css: {
                'content': 'data(icon)',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#fff',//'#eee',
                'border-color': '#888',
                'color': '#888',// '#2e6da4',
                'border-width': 1.5,
                'font-family': 'Avenue',
                'font-size': '20px',
                'font-weight':'normal',
                'min-zoomed-font-size':'8px',
                'shape': 'roundrectangle',
                'width':'30px',
                'height':'30px'
            }
        },

        {
            selector: 'node.green',
            css: {
                'content': 'data(icon)',
                'background-color': '#4caf50',
                'border-color': '#ffffff',
                'color': '#ffffff',
                'border-width': 2
            }
        },

        {
            selector: 'node:selected',
            css: {
                'border-color': '#333333',
                'color': '#333333',
                'background-color': '#eeeeee',
                'border-width': 3
            }
        },


        {
            selector: 'edge',
            css: {
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle-backcurve',
                'line-style': 'dotted',
                'text-outline-color': '#fff',
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'font-size': '14px',
                'color': '#ffffff',
                'text-outline-width': 0,
                'edge-text-rotation': 'autorotate',
                'content': 'data(portion)',
                'min-zoomed-font-size':'28px',
                'width': 2,
                'opacity':0.5
            }
        },


        {
            selector: 'edge.green',
            css: {
                'arrow-scale': 0.8,
                'line-style': 'solid',
                'width': 'data(flowWidth)',
                'line-color': 'data(hmcv)',
                'target-arrow-color': 'data(hmcv)',
                'target-arrow-shape': 'triangle',
                'color': '#fff',
                'text-outline-color': 'data(hmcv)',
                'min-zoomed-font-size':'8px',
                'text-outline-width': 2,
                'opacity':1
            }
        },

        {
            selector: 'edge[secondary="true"]',
            css: {
                'line-style': 'dashed'
            }
        },

        {
            selector: 'edge[pedestrian]',
            css: {
                'target-arrow-shape': 'triangle',
                'source-arrow-shape': 'none',
                'target-arrow-color': '#888888',
                'text-outline-color': '#ffffff',
                'arrow-scale': 0.2,
                'width': 20,
                'line-style': 'dashed',
                'line-color': '#888888'
            }
        },

        {
            selector: 'edge[pedestrian].green',
            css: {
                'target-arrow-color': '#4caf50',
                'text-outline-color': '#4caf50',
                'color': '#fff',
                'line-color': '#4caf50'
            }
        }
    ];
})(AvenueApp.Resources);
