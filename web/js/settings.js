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
        icon:'Sl',
        type:'stopline',
        cicleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600,
        divisionRates: [1],
        intervals: [
            {s:0, f:29, length: 30}
        ]
    },
    carriageway:{
        icon:'Cw',
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
    fork: {
        icon:'Fr',
        type:'fork',
        cicleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600,
        divisionRates: [0.3, 0.7]
    },
    merge: {
        icon:'Mr',
        type:'Merge',
        cicleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600,
    },
    bottleneck: {
        icon:'Bn',
        type:'bottleneck',
        cicleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 2000
    },
    concurrent: {
        icon:'Cn',
        type:'concurrent',
        cicleTime: 100,
        inFlow: [],
        outFlow: [],
        avgIntensity: 1800,
        capacity: 3600
    }
};
