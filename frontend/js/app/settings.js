var settings = {
    cytoscape: {
        hideEdgesOnViewport: true,
        hideLabelsOnViewport: true,
        textureOnViewport: true,
        pixelRatio: 1,
        motionBlur: true,
        boxSelectionEnabled:true,
        userPanningEnabled:false,
        elements: [],
        showOverlay: false,
        minZoom: 0.1,
        maxZoom: 4.0,
        layout: {
            name: 'preset',
            fit: true
        }
    },

    chart: {
       labels: function(cT){
           var labels = [];
           for (var i = 0; i < cT; i++) {
               labels.push(i%5 == 0?i:'');
           }
           return labels;
       },
       defaults: {
           low: 0,
           showArea: true,
           width: '320px',
           height: '200px',
           showPoint: false,
           lineSmooth: false,
           axisX: {
               low:0,
               high: 100,
               showGrid: false,
               showLabel: true
           }
       }
    },

    coordinationPlan: {
        cycleTime: 100,
        name: 'The Coordination plan',
        notes: '...'
    },

    crossRoad: {
        icon: '',
        type: 'crossRoad',
        name: '',
        cycleTime: 100,
        offset: 10,
        phases: [
            {
                tag: 'ph-1',
                length: 50,
                minLength: 15
            },
            {
                tag: 'ph-2',
                length: 50,
                minLength: 15
            }
        ]
    },

    stopline: {
        icon: '\u0051',
        type: 'stopline',
        tag: '',
        color: 'primary',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 1800,
        greenOffset1:0,
        greenOffset2:0,
        intervals: [[0,20], [40,55]],
        greenPhases: [true, false]
    },

    carriageway:{
        icon:'\uf0ec',
        type: 'carriageway',
        tag: '',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 1800,
        routeTime: 20,
        length: 300,
        dispersion: 0.5
    },
    point: {
        icon: '\uf276',
        type: 'point',
        tag: '',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 1800
    },
    bottleneck: {
        icon: '\uf0b0',
        type: 'bottleneck',
        tag: '',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 2000
    },
    concurrent: {
        icon: '\uf074',
        type: 'concurrent',
        tag: '',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 1800
    },
    concurrentMerge: {
        icon: '\uf126',
        type: 'concurrentMerge',
        tag: '',
        cycleTime: 100,
        avgIntensity: 900,
        capacity: 1800
    },
    interTact: {
        red: {
            length : 6,
            signals : [
                {
                    color: 'red',
                    length: 3
                },
                {
                    color: 'amber',
                    length: 3
                }
            ]
        },
        green: {
            length : 6,
            signals : [
                {
                    color: 'blink',
                    length: 3
                },
                {
                    color: 'yellow',
                    length: 3
                }
            ]
        }
    }


};
