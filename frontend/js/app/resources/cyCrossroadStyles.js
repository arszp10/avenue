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
                'font-family': 'FontAwesome',
                'font-size': '4px',
                'font-weight':'normal',
                'min-zoomed-font-size':'8px',
                'width':'8px',
                'height':'8px'
            }
        },
        {
            selector: 'node[type="stopline"]',
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
            selector: 'node[type="stopline"]:selected',
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
                'line-style': 'dotted',
                'target-arrow-shape': 'triangle',
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
                //'curve-style': 'unbundled-bezier',
                //'control-point-distances': '20',
                //'control-point-weights': '0.5'

            }
        },


        {
            selector: 'edge.green',
            css: {
                'line-style': 'solid',
                'width': 8,
                'line-color': '#4caf50', //'#2e6da4',
                'target-arrow-color': '#4caf50', //'#2e6da4',
                'color': '#fff',
                'text-outline-color': '#4caf50', //'#2e6da4'
                'min-zoomed-font-size':'8px',
                'text-outline-width': 2,
                'opacity':1
            }
        }

    ];
})(AvenueApp.Resources);
