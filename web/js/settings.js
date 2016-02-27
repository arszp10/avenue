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
        icon:'',
        type:'crossRoad',
        cycleTime: 100
    },

    stopline: {
        //icon:'\uf142',
        icon:'\u0051',
        type:'stopline',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600,
        intervals: [
            {s:0, f:29, length: 30}
        ]
    },
    carriageway:{
        icon:'\uf0ec',
        type:'carriageway',
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
        icon:'\uf276',
        type:'point',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600
    },
    bottleneck: {
        icon:'\uf0b0',
        type:'bottleneck',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 2000
    },
    concurrent: {
        icon:'\uf074',
        type:'concurrent',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600
    },
    concurrentMerge: {
        icon:'\uf126',
        type:'concurrentMerge',
        cycleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600
    }
};
