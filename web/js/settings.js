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
               labels.push(i%5 == 0?i:null);
           }
           return labels;
       },
       defaults: {
           low: 0,
           showArea: true,
           width: '596px',
           height: '369px',
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
        tag: '',
        cycleTime: 100
    },

    stopline: {
        icon: '\u0051',
        type: 'stopline',
        tag: '',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600,
        greenOffset1:6,
        greenOffset2:0,
        intervals: '[[0,20], [40,55]]'
    },
    carriageway:{
        icon:'\uf0ec',
        type: 'carriageway',
        tag: '',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600,
        routeTime: 20,
        length: 300,
        dispersion: 0.5
    },
    point: {
        icon: '\uf276',
        type: 'point',
        tag: '',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600
    },
    bottleneck: {
        icon: '\uf0b0',
        type: 'bottleneck',
        tag: '',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 2000
    },
    concurrent: {
        icon: '\uf074',
        type: 'concurrent',
        tag: '',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600
    },
    concurrentMerge: {
        icon: '\uf126',
        type: 'concurrentMerge',
        tag: '',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600
    }
};
