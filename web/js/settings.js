var settings = {
    chart:{
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
    } ,

    crossRoad: {
        icon:'Cross Road',
        type:'crossRoad',
        cicleTime: 100
    },

    stopline: {
        icon:'\uf178\uf142',
        type:'stopline',
        cicleTime: 100,
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
        cicleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600,
        routeTime: 20,
        length: 300,
        dispersion: 0.5
    },
    point: {
        icon:'\uf1db',
        type:'point',
        cicleTime: 100,
        inFlow: [],
        outFlow: []
    },
    bottleneck: {
        icon:'\uf0b0',
        type:'bottleneck',
        cicleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 2000
    },
    concurrent: {
        icon:'\uf074',
        type:'concurrent',
        cicleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600
    }
};
